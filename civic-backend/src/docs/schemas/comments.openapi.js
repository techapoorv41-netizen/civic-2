module.exports = {
  "/issues/{issueId}/comments": {
    post: {
      tags: ["Comments"],
      summary: "Add comment to issue",
      description: "Allowed only for issue reporter, assigned official, or admin.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "issueId", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["message"],
              properties: {
                message: { type: "string", minLength: 1, maxLength: 1000, example: "Investigation underway." },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Comment added successfully" },
        403: { description: "User not authorized for this issue" },
        404: { description: "Issue not found" },
        422: { description: "Validation error" },
      },
    },
    get: {
      tags: ["Comments"],
      summary: "Get comments on issue",
      description: "Allowed only for issue reporter, assigned official, or admin. Returns comments oldest first.",
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: "issueId", in: "path", required: true, schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
      ],
      responses: {
        200: { description: "Paginated comments list" },
        403: { description: "User not authorized for this issue" },
        404: { description: "Issue not found" },
      },
    },
  },
};
