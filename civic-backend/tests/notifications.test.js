const request = require("supertest");
const app = require("../src/app");
const { setupTestDB } = require("./setup");
const User = require("../src/modules/users/entities/User.model");
const Notification = require("../src/modules/notifications/entities/Notification.model");
const NotificationService = require("../src/shared/contracts/notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../src/config/env");

describe("Notifications Module & Central Service", () => {
  setupTestDB();

  let adminUser, adminToken;
  let citizenUser1, citizenToken1;
  let citizenUser2, citizenToken2;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash("Password123", 10);

    adminUser = await User.create({
      name: "Admin User",
      email: "admin@notif.com",
      passwordHash,
      role: "admin",
    });

    citizenUser1 = await User.create({
      name: "Citizen 1",
      email: "citizen1@notif.com",
      passwordHash,
      role: "citizen",
    });

    citizenUser2 = await User.create({
      name: "Citizen 2",
      email: "citizen2@notif.com",
      passwordHash,
      role: "citizen",
    });

    adminToken = jwt.sign({ id: adminUser._id.toString(), role: "admin" }, env.JWT_SECRET);
    citizenToken1 = jwt.sign({ id: citizenUser1._id.toString(), role: "citizen" }, env.JWT_SECRET);
    citizenToken2 = jwt.sign({ id: citizenUser2._id.toString(), role: "citizen" }, env.JWT_SECRET);
  });

  it("GET /notifications - lists only authenticated user notifications with unreadCount in meta", async () => {
    // 2 notifications for citizen1 (1 unread, 1 read)
    await Notification.create([
      { userId: citizenUser1._id, type: "ISSUE_VERIFIED", message: "Your issue is verified", isRead: false },
      { userId: citizenUser1._id, type: "COMMENT_ADDED", message: "Comment on your issue", isRead: true },
      // 1 notification for citizen2
      { userId: citizenUser2._id, type: "ISSUE_CREATED", message: "Issue created", isRead: false },
    ]);

    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${citizenToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.unreadCount).toBe(1);
  });

  it("PATCH /notifications/:id/read - marks single notification as read", async () => {
    const notif = await Notification.create({
      userId: citizenUser1._id,
      type: "ISSUE_VERIFIED",
      message: "Unread notif",
      isRead: false,
    });

    const res = await request(app)
      .patch(`/api/v1/notifications/${notif._id}/read`)
      .set("Authorization", `Bearer ${citizenToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
    expect(res.body.data.readAt).toBeDefined();
  });

  it("PATCH /notifications/:id/read - rejects other user's notification with 404 NOT_FOUND", async () => {
    const notif = await Notification.create({
      userId: citizenUser1._id,
      type: "ISSUE_VERIFIED",
      message: "Citizen 1 notif",
      isRead: false,
    });

    // Citizen 2 tries to read Citizen 1's notification
    const res = await request(app)
      .patch(`/api/v1/notifications/${notif._id}/read`)
      .set("Authorization", `Bearer ${citizenToken2}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("PATCH /notifications/read-all - marks all unread notifications of user as read", async () => {
    await Notification.create([
      { userId: citizenUser1._id, type: "ISSUE_VERIFIED", message: "Msg 1", isRead: false },
      { userId: citizenUser1._id, type: "ISSUE_ASSIGNED", message: "Msg 2", isRead: false },
    ]);

    const res = await request(app)
      .patch("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${citizenToken1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.modifiedCount).toBe(2);

    const remainingUnread = await Notification.countDocuments({
      userId: citizenUser1._id,
      isRead: false,
    });
    expect(remainingUnread).toBe(0);
  });

  it("NotificationService.notify() - correctly resolves recipient rules for ISSUE_CREATED", async () => {
    // ISSUE_CREATED should dispatch to all active admins
    await NotificationService.notify({
      type: "ISSUE_CREATED",
      message: "New issue submitted",
    });

    const adminNotifs = await Notification.find({ userId: adminUser._id });
    expect(adminNotifs.length).toBe(1);
    expect(adminNotifs[0].message).toBe("New issue submitted");
  });
});
