const request = require("supertest");
const app = require("../src/app");
const { setupTestDB } = require("./setup");
const User = require("../src/modules/users/entities/User.model");
const OfficialProfile = require("../src/modules/officials/entities/OfficialProfile.model");
const Category = require("../src/modules/categories/entities/Category.model");
const Issue = require("../src/modules/issues/entities/Issue.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../src/config/env");

describe("Issues, Assignments, Categories, Attachments & AI Modules", () => {
  setupTestDB();

  let adminUser, adminToken;
  let citizenUser, citizenToken;
  let officialUser, officialToken, officialProfile;
  let testCategory;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash("Password123", 10);

    adminUser = await User.create({
      name: "Admin User",
      email: "admin@civictest.org",
      passwordHash,
      role: "admin",
    });
    adminToken = jwt.sign({ id: adminUser._id.toString(), role: "admin" }, env.JWT_SECRET);

    citizenUser = await User.create({
      name: "Citizen John",
      email: "citizen@civictest.org",
      passwordHash,
      role: "citizen",
    });
    citizenToken = jwt.sign({ id: citizenUser._id.toString(), role: "citizen" }, env.JWT_SECRET);

    officialUser = await User.create({
      name: "Officer Smith",
      email: "official@civictest.org",
      passwordHash,
      role: "official",
    });
    officialToken = jwt.sign({ id: officialUser._id.toString(), role: "official" }, env.JWT_SECRET);

    officialProfile = await OfficialProfile.create({
      userId: officialUser._id,
      department: "Roads",
      designation: "Lead Inspector",
      isVerified: true,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
    });

    testCategory = await Category.create({
      name: "Roads & Infrastructure",
      description: "Potholes and road repairs",
      isActive: true,
    });
  });

  describe("Categories Module", () => {
    it("GET /categories - public access returns active categories", async () => {
      const res = await request(app).get("/api/v1/categories");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toBe("Roads & Infrastructure");
    });

    it("POST /categories - admin creates category and rejects duplicate with 409 CONFLICT", async () => {
      const createRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Water Supply", description: "Water pipe leaks" });

      expect(createRes.status).toBe(201);
      expect(createRes.body.data.name).toBe("Water Supply");

      // Duplicate name
      const dupRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Water Supply" });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.error.code).toBe("CONFLICT");
    });
  });

  describe("Issues Module Lifecycle", () => {
    let createdIssueId;

    it("POST /issues - citizen creates an issue with pending status", async () => {
      const res = await request(app)
        .post("/api/v1/issues")
        .set("Authorization", `Bearer ${citizenToken}`)
        .send({
          title: "Deep pothole near City Center",
          description: "Dangerous pothole causing severe hazard to vehicles.",
          category: testCategory._id.toString(),
          locationAddress: "Main Street, Sector 5",
          latitude: 28.6139,
          longitude: 77.209,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe("pending");
      expect(res.body.data.verifiedByAdmin).toBe(false);
      expect(res.body.data.reportedBy.id).toBe(citizenUser._id.toString());
      createdIssueId = res.body.data.id;
    });

    it("GET /issues - enforces D11 role-based visibility while allowing all query", async () => {
      // Create issue by citizenUser
      const issue1 = await Issue.create({
        title: "Pothole A",
        description: "Desc A",
        reportedBy: citizenUser._id,
        category: testCategory._id,
        categoryName: testCategory.name,
        status: "pending",
      });

      // Citizen view defaults to own issues
      const citizenRes = await request(app)
        .get("/api/v1/issues")
        .set("Authorization", `Bearer ${citizenToken}`);

      expect(citizenRes.status).toBe(200);
      expect(citizenRes.body.data.length).toBe(1);
      expect(citizenRes.body.data[0].id).toBe(issue1._id.toString());

      // Admin sees all issues
      const adminRes = await request(app)
        .get("/api/v1/issues")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("State Machine: Rejects invalid transition (pending -> resolved) with 409 INVALID_STATUS_TRANSITION", async () => {
      const issue = await Issue.create({
        title: "Pending Issue",
        description: "Cannot jump directly to resolved",
        reportedBy: citizenUser._id,
        status: "pending",
      });

      const res = await request(app)
        .patch(`/api/v1/issues/${issue._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "resolved" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("PATCH /issues/:id/verify - admin verifies issue", async () => {
      const issue = await Issue.create({
        title: "Unverified Issue",
        description: "Awaiting admin verification",
        reportedBy: citizenUser._id,
        status: "pending",
      });

      const res = await request(app)
        .patch(`/api/v1/issues/${issue._id}/verify`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("verified");
      expect(res.body.data.verifiedByAdmin).toBe(true);
    });
  });

  describe("Assignment & Resolution Flow", () => {
    let verifiedIssue;

    beforeEach(async () => {
      verifiedIssue = await Issue.create({
        title: "Verified Issue For Official",
        description: "Ready for departmental dispatch",
        reportedBy: citizenUser._id,
        status: "verified",
        verifiedByAdmin: true,
      });
    });

    it("POST /issues/:issueId/assign - admin assigns issue to official (D12: officialId is user ID)", async () => {
      const res = await request(app)
        .post(`/api/v1/issues/${verifiedIssue._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          officialId: officialUser._id.toString(),
          remarks: "Please inspect immediately",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe("assigned");
      expect(res.body.data.officialId).toBe(officialUser._id.toString());

      // Verify issue record updated
      const updatedIssue = await Issue.findById(verifiedIssue._id);
      expect(updatedIssue.assignedTo.toString()).toBe(officialUser._id.toString());
    });

    it("Full lifecycle: official accepts assignment (-> in_progress) then completes (-> resolved)", async () => {
      // 1. Assign to official
      const assignRes = await request(app)
        .post(`/api/v1/issues/${verifiedIssue._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ officialId: officialUser._id.toString() });

      const assignmentId = assignRes.body.data.id;

      // 2. Official lists their assignments
      const mineRes = await request(app)
        .get("/api/v1/assignments/mine")
        .set("Authorization", `Bearer ${officialToken}`);

      expect(mineRes.status).toBe(200);
      expect(mineRes.body.data.length).toBe(1);
      expect(mineRes.body.data[0].id).toBe(assignmentId);

      // 3. Official accepts assignment
      const acceptRes = await request(app)
        .patch(`/api/v1/assignments/${assignmentId}/accept`)
        .set("Authorization", `Bearer ${officialToken}`);

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.status).toBe("accepted");

      // Verify issue transitioned to in_progress
      const inProgIssue = await Issue.findById(verifiedIssue._id);
      expect(inProgIssue.status).toBe("in_progress");

      // 4. Official completes assignment
      const completeRes = await request(app)
        .patch(`/api/v1/assignments/${assignmentId}/complete`)
        .set("Authorization", `Bearer ${officialToken}`)
        .send({ remarks: "Pothole filled and sealed with asphalt" });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.status).toBe("completed");

      // Verify issue transitioned to resolved
      const resolvedIssue = await Issue.findById(verifiedIssue._id);
      expect(resolvedIssue.status).toBe("resolved");
    });
  });

  describe("Attachments Module", () => {
    it("POST /issues/:issueId/attachments - uploads file and updates issue images", async () => {
      const issue = await Issue.create({
        title: "Issue with Photo",
        description: "Checking attachment upload",
        reportedBy: citizenUser._id,
        status: "pending",
        images: [],
      });

      const validPngBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );

      const res = await request(app)
        .post(`/api/v1/issues/${issue._id}/attachments`)
        .set("Authorization", `Bearer ${citizenToken}`)
        .attach("file", validPngBuffer, "pothole.png");

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.fileUrl).toBeDefined();

      // Check GET /issues/:issueId/attachments
      const listRes = await request(app).get(`/api/v1/issues/${issue._id}/attachments`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.data[0].id).toBe(res.body.data.id);
    });
  });

  describe("AI Module & D15 Contract Compliance", () => {
    let issue;

    beforeEach(async () => {
      issue = await Issue.create({
        title: "Major water pipeline rupture flooding street",
        description: "Fresh water pipe broken opposite Central School.",
        categoryName: "Water Supply",
        reportedBy: citizenUser._id,
        status: "pending",
      });
    });

    it("GET /issues/:issueId/ai-analysis - returns 200 with data: null when no analysis exists (D15 rule)", async () => {
      const res = await request(app).get(`/api/v1/issues/${issue._id}/ai-analysis`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });

    it("POST /issues/:issueId/ai-analysis - generates analysis and persists record", async () => {
      const res = await request(app)
        .post(`/api/v1/issues/${issue._id}/ai-analysis`)
        .set("Authorization", `Bearer ${citizenToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.severityScore).toBeDefined();
      expect(res.body.data.predictedCategory).toBeDefined();

      // Subsequent GET returns the generated analysis
      const getRes = await request(app).get(`/api/v1/issues/${issue._id}/ai-analysis`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe(res.body.data.id);
    });

    it("POST /issues/:issueId/ai-responses - generates AI bot response and logs history", async () => {
      const botRes = await request(app)
        .post(`/api/v1/issues/${issue._id}/ai-responses`)
        .set("Authorization", `Bearer ${citizenToken}`)
        .send({ prompt: "What is the expected resolution timeline?" });

      expect(botRes.status).toBe(200);
      expect(botRes.body.success).toBe(true);
      expect(botRes.body.data.response).toBeDefined();
      expect(botRes.body.data.prompt).toBe("What is the expected resolution timeline?");

      // Retrieve bot interaction history
      const historyRes = await request(app).get(`/api/v1/issues/${issue._id}/ai-responses`);
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.length).toBe(1);
    });
  });
});
