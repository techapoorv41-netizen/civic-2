import { Express } from "express";
import swaggerUi from "swagger-ui-express";

// Import existing openapi schema parts
const authSchemas = require("./schemas/auth.openapi");
const usersSchemas = require("./schemas/users.openapi");
const officialsSchemas = require("./schemas/officials.openapi");
const commentsSchemas = require("./schemas/comments.openapi");
const notificationsSchemas = require("./schemas/notifications.openapi");
const adminSchemas = require("./schemas/admin.openapi");

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "CivicSense Backend API",
    version: "1.0.0",
    description: "Production API for CivicSense - Civic Issue Reporting and Resolution Platform",
    contact: {
      name: "CivicSense Engineering Team",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1 Base URL",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Standard JWT Bearer token authentication header: `Authorization: Bearer <accessToken>`",
      },
    },
    schemas: {
      StandardSuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          meta: { type: "object", nullable: true },
        },
      },
      StandardListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "array", items: { type: "object" } },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer", example: 42 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              pages: { type: "integer", example: 5 },
            },
          },
        },
      },
      StandardErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Validation failed" },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      ...authSchemas.schemas,
      ...usersSchemas.schemas,
      ...officialsSchemas.schemas,
      ...commentsSchemas.schemas,
      ...notificationsSchemas.schemas,
      ...adminSchemas.schemas,
    },
  },
  paths: {
    ...authSchemas.paths,
    ...usersSchemas.paths,
    ...officialsSchemas.paths,
    ...commentsSchemas.paths,
    ...notificationsSchemas.paths,
    ...adminSchemas.paths,
  },
};

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "CivicSense API Documentation",
    })
  );
};

export default { setupSwagger, openApiDocument };
