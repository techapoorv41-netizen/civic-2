module.exports = {
  "/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user (citizen or official)",
      description: "Creates a new citizen or official account. Admin registration is forbidden via this endpoint.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password", "role"],
              properties: {
                name: { type: "string", example: "John Doe" },
                email: { type: "string", format: "email", example: "john@example.com" },
                password: { type: "string", minLength: 8, example: "Password123" },
                phone: { type: "string", example: "+91 9876543210" },
                role: { type: "string", enum: ["citizen", "official"], example: "citizen" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Registered successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                          role: { type: "string" },
                          isBlocked: { type: "boolean" },
                        },
                      },
                      accessToken: { type: "string" },
                      refreshToken: { type: "string" },
                    },
                  },
                  meta: { type: "null" },
                },
              },
            },
          },
        },
        409: { description: "Email already registered" },
        422: { description: "Validation error or attempt to register as admin" },
      },
    },
  },
  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login with email and password",
      description: "Authenticates credentials and returns access and refresh tokens. Rate limited to 10 attempts per 15 min.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email", example: "citizen@civicsense.com" },
                password: { type: "string", example: "Password123" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Login successful" },
        401: { description: "Invalid credentials" },
        403: { description: "User blocked" },
        429: { description: "Too many login attempts" },
      },
    },
  },
  "/auth/refresh": {
    post: {
      tags: ["Authentication"],
      summary: "Rotate refresh token",
      description: "Issues new access token and rotating refresh token. Replay of revoked token revokes all user sessions.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["refreshToken"],
              properties: {
                refreshToken: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Tokens refreshed" },
        401: { description: "Invalid or reused refresh token" },
      },
    },
  },
  "/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout current session",
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Logged out successfully" },
      },
    },
  },
  "/auth/me": {
    get: {
      tags: ["Authentication"],
      summary: "Get current authenticated user profile",
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Authenticated user details" },
        401: { description: "Unauthorized" },
      },
    },
  },
};
