const request = require("supertest");
const app = require("../src/app");
const { setupTestDB } = require("./setup");
const User = require("../src/modules/users/entities/User.model");
const bcrypt = require("bcryptjs");

describe("Users Module", () => {
  setupTestDB();

  let adminUser, adminToken;
  let citizenUser1, citizenToken1;
  let citizenUser2, citizenToken2;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash("Password123", 10);

    adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      passwordHash,
      role: "admin",
    });

    citizenUser1 = await User.create({
      name: "Citizen Alpha",
      email: "alpha@test.com",
      passwordHash,
      phone: "1111111111",
      role: "citizen",
    });

    citizenUser2 = await User.create({
      name: "Citizen Beta",
      email: "beta@test.com",
      passwordHash,
      phone: "2222222222",
      role: "citizen",
    });

    const jwt = require("jsonwebtoken");
    const env = require("../src/config/env");
    adminToken = jwt.sign({ id: adminUser._id.toString(), role: "admin" }, env.JWT_SECRET);
    citizenToken1 = jwt.sign({ id: citizenUser1._id.toString(), role: "citizen" }, env.JWT_SECRET);
    citizenToken2 = jwt.sign({ id: citizenUser2._id.toString(), role: "citizen" }, env.JWT_SECRET);
  });

  it("GET /users/:id - own profile returns full profile", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${citizenUser1._id}`)
      .set("Authorization", `Bearer ${citizenToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(citizenUser1._id.toString());
    expect(res.body.data.email).toBe("alpha@test.com");
    expect(res.body.data.phone).toBe("1111111111");
  });

  it("GET /users/:id - admin can view full profile of any user", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${citizenUser1._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("alpha@test.com");
    expect(res.body.data.phone).toBe("1111111111");
  });

  it("GET /users/:id - restricted visibility for other users (only id, name, role)", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${citizenUser1._id}`)
      .set("Authorization", `Bearer ${citizenToken2}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(citizenUser1._id.toString());
    expect(res.body.data.name).toBe("Citizen Alpha");
    expect(res.body.data.role).toBe("citizen");
    expect(res.body.data.email).toBeUndefined();
    expect(res.body.data.phone).toBeUndefined();
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("PATCH /users/me - successfully updates name and phone", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${citizenToken1}`)
      .send({ name: "Updated Alpha", phone: "9999999999" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Alpha");
    expect(res.body.data.phone).toBe("9999999999");
  });

  it("PATCH /users/me - rejects email, role, or unknown fields with 422 VALIDATION_ERROR", async () => {
    // Attempt to change role
    const resRole = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${citizenToken1}`)
      .send({ role: "admin" });

    expect(resRole.status).toBe(422);
    expect(resRole.body.error.code).toBe("VALIDATION_ERROR");

    // Attempt to change email
    const resEmail = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${citizenToken1}`)
      .send({ email: "hacked@test.com" });

    expect(resEmail.status).toBe(422);
    expect(resEmail.body.error.code).toBe("VALIDATION_ERROR");

    // Attempt to send unknown field
    const resUnknown = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${citizenToken1}`)
      .send({ isBlocked: false, maliciousField: "test" });

    expect(resUnknown.status).toBe(422);
    expect(resUnknown.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /users - admin can list users with filters and pagination", async () => {
    const res = await request(app)
      .get("/api/v1/users?role=citizen&page=1&limit=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(10);
  });

  it("GET /users - citizen is denied access with 403 FORBIDDEN", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${citizenToken1}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });
});
