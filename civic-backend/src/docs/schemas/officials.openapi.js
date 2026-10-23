module.exports = {
  "/officials": {
    post: {
      tags: ["Officials"],
      summary: "Create official profile for authenticated official",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["department"],
              properties: {
                department: { type: "string", example: "Roads & Transport" },
                designation: { type: "string", example: "Senior Inspector" },
                employeeId: { type: "string", example: "EMP-9021" },
                area: { type: "string", example: "Zone 4 North" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Official profile created" },
        403: { description: "Only official role can create profile" },
        409: { description: "Profile already exists for this user" },
      },
    },
    get: {
      tags: ["Officials"],
      summary: "List all official profiles (Admin only)",
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "isVerified", in: "query", schema: { type: "boolean" } },
        { name: "department", in: "query", schema: { type: "string" } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
      ],
      responses: {
        200: { description: "Paginated officials list containing both id (profile) and userId" },
        403: { description: "Forbidden for non-admin" },
      },
    },
  },
  "/officials/{id}": {
    get: {
      tags: ["Officials"],
      summary: "Get official profile by ID (Owner or Admin)",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Official profile details with basic user info" },
        403: { description: "Forbidden for other users" },
        404: { description: "Official profile not found" },
      },
    },
  },
  "/officials/{id}/verify": {
    patch: {
      tags: ["Officials"],
      summary: "Verify official profile (Admin only)",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Official verified, audit logged and notification sent" },
        403: { description: "Admin access required" },
        409: { description: "Official is already verified" },
      },
    },
  },
};
