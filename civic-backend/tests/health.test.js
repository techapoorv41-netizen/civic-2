const request = require("supertest");
const app = require("../src/app");
const { setupTestDB } = require("./setup");

describe("Health & Foundation Endpoints", () => {
  setupTestDB();

  it("GET /health returns 200 with database status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("healthy");
    expect(res.body.data.database.connected).toBe(true);
    expect(res.body.data.liveness).toBe("alive");
    expect(res.body.data.readiness).toBe("ready");
  });

  it("GET /health/liveness returns 200 indicating process is running", async () => {
    const res = await request(app).get("/health/liveness");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("alive");
  });

  it("GET /health/readiness returns 200 when database is connected", async () => {
    const res = await request(app).get("/health/readiness");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ready");
    expect(res.body.data.database.connected).toBe(true);
  });

  it("GET unhandled route returns 404 NOT_FOUND in standard error shape", async () => {
    const res = await request(app).get("/api/v1/non-existent-route");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toContain("Route 'GET /api/v1/non-existent-route' not found");
  });
});
