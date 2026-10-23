const request = require("supertest");
const app = require("../src/app");
const { setupTestDB } = require("./setup");
const User = require("../src/modules/users/entities/User.model");
const OfficialProfile = require("../src/modules/officials/entities/OfficialProfile.model");
const AuditLog = require("../src/modules/admin/entities/AuditLog.model");
const Notification = require("../src/modules/notifications/entities/Notification.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../src/config/env");

describe("Officials Module", () => {
  setupTestDB();

  let adminUser, adminToken;
  let officialUser1, officialToken1;
  let officialUser2, officialToken2;
  let citizenUser, citizenToken;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash("Password123", 10);

    adminUser = await User.create({
      name: "Admin Officer",
      email: "admin@officialtest.com",
      passwordHash,
      role: "admin",
    });

    officialUser1 = await User.create({
      name: "Official John",
      email: "john@officialtest.com",
      passwordHash,
      role: "official",
    });

    officialUser2 = await User.create({
      name: "Official Jane",
      email: "jane@officialtest.com",
      passwordHash,
      role: "official",
    });

    citizenUser = await User.create({
      name: "Citizen Mark",
      email: "mark@officialtest.com",
      passwordHash,
      role: "citizen",
    });

    adminToken = jwt.sign({ id: adminUser._id.toString(), role: "admin" }, env.JWT_SECRET);
    officialToken1 = jwt.sign({ id: officialUser1._id.toString(), role: "official" }, env.JWT_SECRET);
    officialToken2 = jwt.sign({ id: officialUser2._id.toString(), role: "official" }, env.JWT_SECRET);
    citizenToken = jwt.sign({ id: citizenUser._id.toString(), role: "citizen" }, env.JWT_SECRET);
  });

  it("POST /officials - official successfully creates profile", async () => {
    const res = await request(app)
      .post("/api/v1/officials")
      .set("Authorization", `Bearer ${officialToken1}`)
      .send({
        department: "Sanitation & Waste",
        designation: "Chief Inspector",
        employeeId: "SAN-1001",
        area: "Sector 5",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.userId).toBe(officialUser1._id.toString());
    expect(res.body.data.department).toBe("Sanitation & Waste");
    expect(res.body.data.isVerified).toBe(false);
  });

  it("POST /officials - rejects duplicate profile for same user with 409 CONFLICT", async () => {
    await request(app)
      .post("/api/v1/officials")
      .set("Authorization", `Bearer ${officialToken1}`)
      .send({ department: "Sanitation" });

    const res = await request(app)
      .post("/api/v1/officials")
      .set("Authorization", `Bearer ${officialToken1}`)
      .send({ department: "Roads" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("POST /officials - citizen is forbidden from creating official profile", async () => {
    const res = await request(app)
      .post("/api/v1/officials")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ department: "Water" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("GET /officials - admin lists officials with D12 id and userId", async () => {
    const profile = await OfficialProfile.create({
      userId: officialUser1._id,
      department: "Roads",
      isVerified: true,
    });

    const res = await request(app)
      .get("/api/v1/officials?isVerified=true")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(profile._id.toString());
    expect(res.body.data[0].userId).toBe(officialUser1._id.toString());
  });

  it("GET /officials/:id - owner and admin can view profile, citizen is forbidden", async () => {
    const profile = await OfficialProfile.create({
      userId: officialUser1._id,
      department: "Roads",
    });

    // Owner access
    const resOwner = await request(app)
      .get(`/api/v1/officials/${profile._id}`)
      .set("Authorization", `Bearer ${officialToken1}`);
    expect(resOwner.status).toBe(200);
    expect(resOwner.body.data.department).toBe("Roads");

    // Admin access
    const resAdmin = await request(app)
      .get(`/api/v1/officials/${profile._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(resAdmin.status).toBe(200);

    // Unrelated citizen access
    const resCitizen = await request(app)
      .get(`/api/v1/officials/${profile._id}`)
      .set("Authorization", `Bearer ${citizenToken}`);
    expect(resCitizen.status).toBe(403);
  });

  it("PATCH /officials/:id/verify - admin verifies profile, creating audit record and notification", async () => {
    const profile = await OfficialProfile.create({
      userId: officialUser1._id,
      department: "Electricity",
      isVerified: false,
    });

    const res = await request(app)
      .patch(`/api/v1/officials/${profile._id}/verify`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isVerified).toBe(true);
    expect(res.body.data.verifiedBy).toBe(adminUser._id.toString());

    // Verify audit record created
    const audit = await AuditLog.findOne({
      targetId: profile._id.toString(),
      action: "OFFICIAL_VERIFIED",
    });
    expect(audit).toBeDefined();
    expect(audit.actorId.toString()).toBe(adminUser._id.toString());

    // Verify notification created
    const notif = await Notification.findOne({
      userId: officialUser1._id,
      type: "OFFICIAL_VERIFIED",
    });
    expect(notif).toBeDefined();
    expect(notif.message).toContain("verified");
  });

  it("PATCH /officials/:id/verify - rejects repeated verification with 409 CONFLICT", async () => {
    const profile = await OfficialProfile.create({
      userId: officialUser1._id,
      department: "Electricity",
      isVerified: true,
      verifiedAt: new Date(),
    });

    const res = await request(app)
      .patch(`/api/v1/officials/${profile._id}/verify`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });
});
