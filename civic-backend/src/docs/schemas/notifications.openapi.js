module.exports = {
  "/notifications": {
    get: {
      tags: ["Notifications"],
      summary: "Get notifications for authenticated user",
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "isRead", in: "query", schema: { type: "boolean" } },
        { name: "type", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
      ],
      responses: {
        200: { description: "Paginated notifications with unreadCount in meta" },
        401: { description: "Unauthorized" },
      },
    },
  },
  "/notifications/read-all": {
    patch: {
      tags: ["Notifications"],
      summary: "Mark all notifications as read",
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Modified count of updated notifications" },
      },
    },
  },
  "/notifications/{id}/read": {
    patch: {
      tags: ["Notifications"],
      summary: "Mark single notification as read",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Notification marked as read" },
        404: { description: "Notification not found or belongs to another user" },
      },
    },
  },
};
