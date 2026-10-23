module.exports = {
  "/users/me": {
    patch: {
      tags: ["Users"],
      summary: "Update own profile (name and phone only)",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Profile updated" },
        422: { description: "Invalid fields or attempt to change email/role" },
      },
    },
  },
  "/users": {
    get: {
      tags: ["Users"],
      summary: "List all users with filters (Admin only)",
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "role", in: "query", schema: { type: "string", enum: ["citizen", "official", "admin"] } },
        { name: "isBlocked", in: "query", schema: { type: "boolean" } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        { name: "sort", in: "query", schema: { type: "string", default: "-createdAt" } },
      ],
      responses: {
        200: { description: "Paginated user list" },
        403: { description: "Forbidden for non-admin" },
      },
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by ID",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "User details (full profile for self/admin, restricted id/name/role for others)" },
        404: { description: "User not found" },
      },
    },
  },
};
