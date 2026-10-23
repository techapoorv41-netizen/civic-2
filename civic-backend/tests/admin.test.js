const request = require("supertest");
const app = require("../src/app");
const { setupTestDB } = require("./setup");
const User = require("../src/modules/users/entities/User.model");
const RefreshToken = require("../src/modules/auth/entities/RefreshToken.model");
const AuditLog = require("../src/modules/admin/entities/AuditLog.model");
const OfficialProfile = require("../src/modules/officials/entities/OfficialProfile.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../src/config/env");

describe("Admin & Audit Module", () => {
  setupTestDB();

  let adminUser1, adminToken1;
  let adminUser2, adminToken2;
  let citizenUser, citizenToken;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash("Password123", 10);

    adminUser1 = await User.create({
      name: "Admin One",
      email: "admin1@admintest.com",
      passwordHash,
      role: "admin",
    });

    adminUser2 = await User.create({
      name: "Admin Two",
      email: "admin2@admintest.com",
      passwordHash,
      role: "admin",
    });

    citizenUser = await User.create({
      name: "Citizen Mark",
      email: "mark@admintest.com",
      passwordHash,
      role: "citizen",
    });

    adminToken1 = jwt.sign({ id: adminUser1._id.toString(), role: "admin" }, env.JWT_SECRET);
    adminToken2 = jwt.sign({ id: adminUser2._id.toString(), role: "admin" }, env.JWT_SECRET);
    citizenToken = jwt.sign({ id: citizenUser._id.toString(), role: "citizen" }, env.JWT_SECRET);
  });

  it("PATCH /admin/users/:id/block - blocks user, revokes refresh tokens, and logs audit", async () => {
    // Create an active refresh token for citizen
    await RefreshToken.create({
      userId: citizenUser._id,
      tokenHash: "fake_token_hash_12345",
      expiresAt: new Date(Date.now() + 86400000),
    });

    const res = await request(app)
      .patch(`/api/v1/admin/users/${citizenUser._id}/block`)
      .set("Authorization", `Bearer ${adminToken1}`)
      .send({ reason: "Repeated spam violations" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isBlocked).toBe(true);
    expect(res.body.data.blockedReason).toBe("Repeated spam violations");

    // Check refresh tokens revoked
    const activeTokens = await RefreshToken.find({ userId: citizenUser._id, revokedAt: null });
    expect(activeTokens.length).toBe(0);

    // Check audit log
    const audit = await AuditLog.findOne({
      action: "USER_BLOCKED",
      targetId: citizenUser._id.toString(),
    });
    expect(audit).toBeDefined();
    expect(audit.actorId.toString()).toBe(adminUser1._id.toString());
    expect(audit.metadata.reason).toBe("Repeated spam violations");
  });

  it("PATCH /admin/users/:id/block - prevents admin from blocking self", async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${adminUser1._id}/block`)
      .set("Authorization", `Bearer ${adminToken1}`)
      .send({ reason: "Test self block" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PATCH /admin/users/:id/block - prevents admin from blocking another admin", async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${adminUser2._id}/block`)
      .set("Authorization", `Bearer ${adminToken1}`)
      .send({ reason: "Test peer admin block" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PATCH /admin/users/:id/unblock - successfully unblocks user and logs audit", async () => {
    await User.findByIdAndUpdate(citizenUser._id, {
      isBlocked: true,
      blockedReason: "Old reason",
      blockedAt: new Date(),
    });

    const res = await request(app)
      .patch(`/api/v1/admin/users/${citizenUser._id}/unblock`)
      .set("Authorization", `Bearer ${adminToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isBlocked).toBe(false);
    expect(res.body.data.blockedReason).toBeNull();

    // Verify audit log
    const audit = await AuditLog.findOne({
      action: "USER_UNBLOCKED",
      targetId: citizenUser._id.toString(),
    });
    expect(audit).toBeDefined();
  });

  it("PATCH /admin/users/:id/block - non-admin is rejected with 403 FORBIDDEN", async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${adminUser1._id}/block`)
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ reason: "Hacking" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("GET /admin/actions - lists audit logs with filters and pagination (newest first)", async () => {
    await AuditLog.create([
      { actorId: adminUser1._id, action: "USER_BLOCKED", targetType: "User", targetId: citizenUser._id.toString() },
      { actorId: adminUser1._id, action: "OFFICIAL_VERIFIED", targetType: "OfficialProfile", targetId: "prof123" },
    ]);

    const res = await request(app)
      .get("/api/v1/admin/actions?action=USER_BLOCKED")
      .set("Authorization", `Bearer ${adminToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].action).toBe("USER_BLOCKED");
    expect(res.body.meta.total).toBe(1);
  });

  it("GET /admin/stats - returns user counts and pending officials", async () => {
    await OfficialProfile.create({
      userId: citizenUser._id,
      department: "Roads",
      isVerified: false,
    });

    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${adminToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.users).toBeDefined();
    expect(res.body.data.users.admins).toBe(2);
    expect(res.body.data.users.citizens).toBe(1);
    expect(res.body.data.officials.pending).toBe(1);
  });
});
