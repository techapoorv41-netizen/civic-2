const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const { setupTestDB } = require("./setup");
const env = require("../src/config/env");
const User = require("../src/modules/users/entities/User.model");
const OfficialProfile = require("../src/modules/officials/entities/OfficialProfile.model");
const Issue = require("../src/modules/issues/entities/Issue.model");
const Category = require("../src/modules/categories/entities/Category.model");
const IssueAssignment = require("../src/modules/assignments/entities/IssueAssignment.model");
const IssueAttachment = require("../src/modules/attachments/entities/IssueAttachment.model");
const { ROLES } = require("../src/shared/constants/roles");

const VALID_PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

describe("Comprehensive Security & Negative API Tests", () => {
  setupTestDB();

  let citizenToken, otherCitizenToken, adminToken, officialToken;
  let citizenUser, otherCitizenUser, adminUser, officialUser;
  let testCategory, testIssue;

  beforeEach(async () => {
    // Register citizen 1
    const resC1 = await request(app).post("/api/v1/auth/register").send({
      name: "Citizen One",
      email: "citizen1@test.com",
      password: "Password123!",
      phone: "+919876543210",
      role: "citizen",
    });
    citizenToken = resC1.body.data.accessToken;
    citizenUser = resC1.body.data.user;

    // Register citizen 2
    const resC2 = await request(app).post("/api/v1/auth/register").send({
      name: "Citizen Two",
      email: "citizen2@test.com",
      password: "Password123!",
      phone: "+919876543211",
      role: "citizen",
    });
    otherCitizenToken = resC2.body.data.accessToken;
    otherCitizenUser = resC2.body.data.user;

    // Register official
    const resOff = await request(app).post("/api/v1/auth/register").send({
      name: "Official Inspector",
      email: "inspector@test.com",
      password: "Password123!",
      phone: "+919876543212",
      role: "official",
    });
    officialToken = resOff.body.data.accessToken;
    officialUser = resOff.body.data.user;

    // Seed admin
    adminUser = await User.create({
      name: "Super Admin",
      email: "admin@test.com",
      passwordHash: await bcrypt.hash("AdminPass123!", 10),
      role: ROLES.ADMIN,
      isBlocked: false,
    });
    adminToken = jwt.sign({ sub: adminUser._id, role: ROLES.ADMIN }, env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Create Category
    testCategory = await Category.create({
      name: "Road Safety",
      description: "Road hazards and potholes",
      isActive: true,
    });

    // Create Issue
    testIssue = await Issue.create({
      title: "Dangerous Sinkhole",
      description: "Huge sinkhole opened near highway intersection",
      reportedBy: citizenUser.id,
      category: testCategory._id,
      categoryName: testCategory.name,
      status: "pending",
      location: {
        address: "Highway 24",
        lat: 28.5355,
        lng: 77.391,
      },
    });
  });

  describe("Authentication Negative Paths", () => {
    it("Rejects malformed Authorization header with 401 UNAUTHORIZED", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "InvalidHeaderFormat");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("Rejects tampered JWT token signature with 401 UNAUTHORIZED", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${citizenToken}tampered`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("Rejects invalid refresh token string with 401 UNAUTHORIZED", async () => {
      const res = await request(app).post("/api/v1/auth/refresh").send({
        refreshToken: "completely-nonexistent-token-hash-123",
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("Validation & ObjectId Negative Paths", () => {
    it("Rejects invalid MongoDB ObjectId in path parameters with 422 VALIDATION_ERROR", async () => {
      const res = await request(app)
        .get("/api/v1/issues/not-a-valid-object-id")
        .set("Authorization", `Bearer ${citizenToken}`);
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("Rejects creation with title shorter than minimum 3 characters", async () => {
      const res = await request(app)
        .post("/api/v1/issues")
        .set("Authorization", `Bearer ${citizenToken}`)
        .send({
          title: "No",
          description: "This description is long enough but title is too short",
          category: testCategory.name,
        });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Image Upload & Security Layers", () => {
    it("Rejects fake image extension with non-image bytes (Layer 3 magic bytes check)", async () => {
      const fakeExeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00FakePEHeaderExecutingCode");
      const res = await request(app)
        .post(`/api/v1/issues/${testIssue._id}/attachments`)
        .set("Authorization", `Bearer ${citizenToken}`)
        .attach("file", fakeExeBuffer, "malicious.jpg");

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.message).toMatch(/valid/i);
    });

    it("Rejects stranger from uploading attachments to another citizen's issue with 403 FORBIDDEN", async () => {
      const res = await request(app)
        .post(`/api/v1/issues/${testIssue._id}/attachments`)
        .set("Authorization", `Bearer ${otherCitizenToken}`)
        .attach("file", VALID_PNG_BUFFER, "pothole.png");

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("Enforces max 5 attachments per issue with 409 CONFLICT on the 6th upload", async () => {
      // Seed 5 attachments
      for (let i = 0; i < 5; i++) {
        await IssueAttachment.create({
          issueId: testIssue._id,
          uploadedBy: citizenUser.id,
          url: `http://storage/test-${i}.png`,
          fileUrl: `http://storage/test-${i}.png`,
          storageKey: `key-${i}`,
          fileType: "image",
        });
      }

      const res = await request(app)
        .post(`/api/v1/issues/${testIssue._id}/attachments`)
        .set("Authorization", `Bearer ${citizenToken}`)
        .attach("file", VALID_PNG_BUFFER, "pothole.png");

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
      expect(res.body.error.message).toMatch(/max 5/i);
    });
  });

  describe("Assignment Workflow Negative Paths", () => {
    it("Rejects assigning an unverified pending issue with 409 INVALID_STATUS_TRANSITION", async () => {
      await OfficialProfile.create({
        userId: officialUser.id,
        department: "Roads",
        designation: "Inspector",
        isVerified: true,
      });

      const res = await request(app)
        .post(`/api/v1/issues/${testIssue._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ officialId: officialUser.id });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("Rejects assigning issue to an unverified official with 422 VALIDATION_ERROR", async () => {
      testIssue.status = "verified";
      testIssue.verifiedByAdmin = true;
      await testIssue.save();

      // Official profile is NOT verified
      await OfficialProfile.create({
        userId: officialUser.id,
        department: "Roads",
        designation: "Inspector",
        isVerified: false,
      });

      const res = await request(app)
        .post(`/api/v1/issues/${testIssue._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ officialId: officialUser.id });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("Rejects concurrent/duplicate active assignment on same issue with 409 CONFLICT", async () => {
      testIssue.status = "verified";
      testIssue.verifiedByAdmin = true;
      await testIssue.save();

      await OfficialProfile.create({
        userId: officialUser.id,
        department: "Roads",
        designation: "Inspector",
        isVerified: true,
      });

      // First assignment succeeds
      const firstRes = await request(app)
        .post(`/api/v1/issues/${testIssue._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ officialId: officialUser.id });
      expect(firstRes.status).toBe(201);

      // Second duplicate assignment on same issue while first is active fails with 409
      const secondRes = await request(app)
        .post(`/api/v1/issues/${testIssue._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ officialId: officialUser.id });
      expect(secondRes.status).toBe(409);
      expect(secondRes.body.error.code).toBe("CONFLICT");
    });
  });

  describe("Cross-User Authorization & Security", () => {
    it("Prevents non-participant from reading comments on another citizen's pending issue with 403", async () => {
      const res = await request(app)
        .get(`/api/v1/issues/${testIssue._id}/comments`)
        .set("Authorization", `Bearer ${otherCitizenToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("Returns 404 NOT_FOUND when attempting to mark someone else's notification as read", async () => {
      const Notification = require("../src/modules/notifications/entities/Notification.model");
      const notif = await Notification.create({
        userId: citizenUser.id,
        type: "ISSUE_CREATED",
        message: "Your issue was reported",
        issueId: testIssue._id,
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${notif._id}/read`)
        .set("Authorization", `Bearer ${otherCitizenToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("Prevents admin from blocking themselves with 403 or 422", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${adminUser._id}/block`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Accidental self block" });

      expect([403, 422]).toContain(res.status);
    });
  });
});
