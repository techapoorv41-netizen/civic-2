const request = require("supertest");
const app = require("../src/app");
const { setupTestDB } = require("./setup");
const User = require("../src/modules/users/entities/User.model");
const Notification = require("../src/modules/notifications/entities/Notification.model");
const IssueLookup = require("../src/shared/contracts/issueLookup");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../src/config/env");

describe("Comments Module", () => {
  setupTestDB();

  let adminUser, adminToken;
  let reporterUser, reporterToken;
  let officialUser, officialToken;
  let unrelatedUser, unrelatedToken;
  const mockIssueId = "60c72b2f9b1d8b2bad000001";

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash("Password123", 10);

    adminUser = await User.create({
      name: "Admin",
      email: "admin@comm.com",
      passwordHash,
      role: "admin",
    });

    reporterUser = await User.create({
      name: "Reporter Citizen",
      email: "reporter@comm.com",
      passwordHash,
      role: "citizen",
    });

    officialUser = await User.create({
      name: "Assigned Official",
      email: "official@comm.com",
      passwordHash,
      role: "official",
    });

    unrelatedUser = await User.create({
      name: "Unrelated Citizen",
      email: "unrelated@comm.com",
      passwordHash,
      role: "citizen",
    });

    adminToken = jwt.sign({ id: adminUser._id.toString(), role: "admin" }, env.JWT_SECRET);
    reporterToken = jwt.sign({ id: reporterUser._id.toString(), role: "citizen" }, env.JWT_SECRET);
    officialToken = jwt.sign({ id: officialUser._id.toString(), role: "official" }, env.JWT_SECRET);
    unrelatedToken = jwt.sign({ id: unrelatedUser._id.toString(), role: "citizen" }, env.JWT_SECRET);

    // Mock IssueLookup contract
    IssueLookup.setMockHandler(async (id) => {
      if (id === mockIssueId) {
        return {
          id: mockIssueId,
          reporterId: reporterUser._id.toString(),
          assignedOfficialId: officialUser._id.toString(),
          status: "in_progress",
        };
      }
      return null;
    });
  });

  afterEach(() => {
    IssueLookup.setMockHandler(null);
  });

  it("POST /issues/:issueId/comments - reporter can post comment and notify assigned official", async () => {
    const res = await request(app)
      .post(`/api/v1/issues/${mockIssueId}/comments`)
      .set("Authorization", `Bearer ${reporterToken}`)
      .send({ message: "Work has begun on this issue, thank you." });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe("Work has begun on this issue, thank you.");
    expect(res.body.data.author.id).toBe(reporterUser._id.toString());
    expect(res.body.data.author.name).toBe("Reporter Citizen");

    // Notification created for assigned official, excluding author
    const notifs = await Notification.find({ issueId: mockIssueId });
    expect(notifs.length).toBe(1);
    expect(notifs[0].userId.toString()).toBe(officialUser._id.toString());
  });

  it("POST /issues/:issueId/comments - assigned official can post comment", async () => {
    const res = await request(app)
      .post(`/api/v1/issues/${mockIssueId}/comments`)
      .set("Authorization", `Bearer ${officialToken}`)
      .send({ message: "Inspection scheduled for 10am tomorrow." });

    expect(res.status).toBe(201);
    expect(res.body.data.author.id).toBe(officialUser._id.toString());
  });

  it("POST /issues/:issueId/comments - unrelated user receives 403 FORBIDDEN", async () => {
    const res = await request(app)
      .post(`/api/v1/issues/${mockIssueId}/comments`)
      .set("Authorization", `Bearer ${unrelatedToken}`)
      .send({ message: "Trying to comment on another citizen's issue." });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("POST /issues/:issueId/comments - non-existent issue returns 404 NOT_FOUND", async () => {
    const res = await request(app)
      .post("/api/v1/issues/60c72b2f9b1d8b2bad999999/comments")
      .set("Authorization", `Bearer ${reporterToken}`)
      .send({ message: "Valid comment" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("POST /issues/:issueId/comments - empty or oversized message returns 422 VALIDATION_ERROR", async () => {
    // Empty message
    const emptyRes = await request(app)
      .post(`/api/v1/issues/${mockIssueId}/comments`)
      .set("Authorization", `Bearer ${reporterToken}`)
      .send({ message: "" });
    expect(emptyRes.status).toBe(422);

    // Oversized (>1000 characters)
    const longMessage = "a".repeat(1001);
    const longRes = await request(app)
      .post(`/api/v1/issues/${mockIssueId}/comments`)
      .set("Authorization", `Bearer ${reporterToken}`)
      .send({ message: longMessage });
    expect(longRes.status).toBe(422);
  });

  it("GET /issues/:issueId/comments - returns comments in chronological order with pagination", async () => {
    // Add two comments
    await request(app)
      .post(`/api/v1/issues/${mockIssueId}/comments`)
      .set("Authorization", `Bearer ${reporterToken}`)
      .send({ message: "First message" });

    await request(app)
      .post(`/api/v1/issues/${mockIssueId}/comments`)
      .set("Authorization", `Bearer ${officialToken}`)
      .send({ message: "Second message" });

    const res = await request(app)
      .get(`/api/v1/issues/${mockIssueId}/comments?page=1&limit=10`)
      .set("Authorization", `Bearer ${reporterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].message).toBe("First message");
    expect(res.body.data[1].message).toBe("Second message");
    expect(res.body.meta.total).toBe(2);
  });
});
