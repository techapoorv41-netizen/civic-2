const request = require("supertest");
const app = require("../src/app");
const { setupTestDB } = require("./setup");
const User = require("../src/modules/users/entities/User.model");
const OfficialProfile = require("../src/modules/officials/entities/OfficialProfile.model");
const RefreshToken = require("../src/modules/auth/entities/RefreshToken.model");

describe("Authentication Module", () => {
  setupTestDB();

  const validCitizen = {
    name: "Citizen One",
    email: "citizen1@example.com",
    password: "Password123",
    phone: "1234567890",
    role: "citizen",
  };

  it("POST /auth/register - successfully registers citizen and returns tokens", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(validCitizen);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(validCitizen.email.toLowerCase());
    expect(res.body.data.user.role).toBe("citizen");
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.id).toBeDefined();
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    // Verify token hash in DB
    const storedTokens = await RefreshToken.find({ userId: res.body.data.user.id });
    expect(storedTokens.length).toBe(1);
    expect(storedTokens[0].tokenHash).toBeDefined();
  });

  it("POST /auth/register - rejects duplicate email with 409 CONFLICT", async () => {
    await request(app).post("/api/v1/auth/register").send(validCitizen);

    const res = await request(app).post("/api/v1/auth/register").send(validCitizen);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("POST /auth/register - rejects admin registration with 422 VALIDATION_ERROR", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validCitizen, email: "tryadmin@example.com", role: "admin" });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /auth/register - rejects weak password without numbers", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validCitizen, email: "weak@example.com", password: "onlyletters" });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /auth/login - successful login updates lastLoginAt", async () => {
    await request(app).post("/api/v1/auth/register").send(validCitizen);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: validCitizen.email,
      password: validCitizen.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validCitizen.email.toLowerCase());
    expect(res.body.data.user.lastLoginAt).toBeDefined();
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("POST /auth/login - returns same 401 INVALID_CREDENTIALS for wrong password or non-existent email", async () => {
    await request(app).post("/api/v1/auth/register").send(validCitizen);

    // Non-existent email
    const res1 = await request(app).post("/api/v1/auth/login").send({
      email: "nobody@example.com",
      password: "Password123",
    });
    expect(res1.status).toBe(401);
    expect(res1.body.error.code).toBe("INVALID_CREDENTIALS");

    // Wrong password
    const res2 = await request(app).post("/api/v1/auth/login").send({
      email: validCitizen.email,
      password: "WrongPassword999",
    });
    expect(res2.status).toBe(401);
    expect(res2.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(res1.body.error.message).toBe(res2.body.error.message);
  });

  it("POST /auth/login - rejects blocked user with 403 USER_BLOCKED", async () => {
    const regRes = await request(app).post("/api/v1/auth/register").send(validCitizen);
    const userId = regRes.body.data.user.id;

    await User.findByIdAndUpdate(userId, { isBlocked: true, blockedReason: "Violation" });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: validCitizen.email,
      password: validCitizen.password,
    });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("USER_BLOCKED");
  });

  it("POST /auth/refresh - rotates refresh token and revokes previous", async () => {
    const regRes = await request(app).post("/api/v1/auth/register").send(validCitizen);
    const oldRefreshToken = regRes.body.data.refreshToken;

    const res = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: oldRefreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(oldRefreshToken);

    // Old token must be marked revoked in DB
    const oldHash = require("../src/modules/auth/services/auth.service").hashToken(oldRefreshToken);
    const oldDoc = await RefreshToken.findOne({ tokenHash: oldHash });
    expect(oldDoc.revokedAt).not.toBeNull();
  });

  it("POST /auth/refresh - detects reuse of revoked refresh token and revokes all user sessions", async () => {
    const regRes = await request(app).post("/api/v1/auth/register").send(validCitizen);
    const initialToken = regRes.body.data.refreshToken;
    const userId = regRes.body.data.user.id;

    // First rotation (valid)
    const refresh1 = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: initialToken,
    });
    expect(refresh1.status).toBe(200);

    // Attacker tries to replay the old initialToken!
    const replayRes = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: initialToken,
    });
    expect(replayRes.status).toBe(401);
    expect(replayRes.body.error.message).toContain("Revoked refresh token reuse detected");

    // All tokens for this user must now be revoked
    const activeTokens = await RefreshToken.find({ userId, revokedAt: null });
    expect(activeTokens.length).toBe(0);
  });

  it("POST /auth/logout - revokes refresh token and returns 200", async () => {
    const regRes = await request(app).post("/api/v1/auth/register").send(validCitizen);
    const { accessToken, refreshToken } = regRes.body.data;

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const hash = require("../src/modules/auth/services/auth.service").hashToken(refreshToken);
    const doc = await RefreshToken.findOne({ tokenHash: hash });
    expect(doc.revokedAt).not.toBeNull();
  });

  it("GET /auth/me - returns 401 UNAUTHORIZED when no token is provided", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /auth/me - returns current user profile with isVerified for official", async () => {
    const regRes = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validCitizen, email: "officer@example.com", role: "official" });
    const { accessToken, user } = regRes.body.data;

    // Create verified profile
    await OfficialProfile.create({
      userId: user.id,
      department: "Roads",
      isVerified: true,
    });

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("officer@example.com");
    expect(res.body.data.user.role).toBe("official");
    expect(res.body.data.user.isVerified).toBe(true);
  });
});
