module.exports = {
  "/admin/users/{id}/block": {
    patch: {
      tags: ["Admin"],
      summary: "Block a user account",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["reason"],
              properties: {
                reason: { type: "string", minLength: 3, example: "Spamming reports" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User blocked, refresh tokens revoked, audit logged" },
        403: { description: "Admin access required" },
        404: { description: "User not found" },
        409: { description: "User already blocked" },
        422: { description: "Cannot block self or another admin" },
      },
    },
  },
  "/admin/users/{id}/unblock": {
    patch: {
      tags: ["Admin"],
      summary: "Unblock a user account",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "User unblocked and audit logged" },
        403: { description: "Admin access required" },
        404: { description: "User not found" },
        409: { description: "User is not currently blocked" },
      },
    },
  },
  "/admin/actions": {
    get: {
      tags: ["Admin"],
      summary: "Get audit action log",
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "action", in: "query", schema: { type: "string" } },
        { name: "actorId", in: "query", schema: { type: "string" } },
        { name: "targetType", in: "query", schema: { type: "string" } },
        { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
      ],
      responses: {
        200: { description: "Paginated audit records (newest first)" },
        403: { description: "Admin access required" },
      },
    },
  },
  "/admin/stats": {
    get: {
      tags: ["Admin"],
      summary: "Get platform statistics for dashboard",
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "User, official, and issue statistics" },
        403: { description: "Admin access required" },
      },
    },
  },
};
