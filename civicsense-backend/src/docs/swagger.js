const swaggerUi = require('swagger-ui-express');

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };
const issueIdParam = { name: 'issueId', in: 'path', required: true, schema: { type: 'string' } };
const sec = [{ bearerAuth: [] }];
const r = (summary, extra = {}) => ({ summary, security: sec, responses: { 200: { description: 'OK' } }, ...extra });

const spec = {
  openapi: '3.0.0',
  info: { title: 'CivicSense API (Apoorv modules)', version: '1.0.0' },
  servers: [{ url: '/api/v1' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/categories': { get: r('List categories'), post: r('Create category (admin)') },
    '/issues': { get: r('List issues (role scoped)'), post: r('Create issue (citizen, admin)') },
    '/issues/{id}': {
      parameters: [idParam],
      get: r('Issue detail'),
      patch: r('Update issue / status'),
      delete: r('Soft delete issue'),
    },
    '/issues/{id}/verify': { parameters: [idParam], patch: r('Verify issue (admin)') },
    '/issues/{issueId}/history': { parameters: [issueIdParam], get: r('Issue history') },
    '/issues/{issueId}/assign': { parameters: [issueIdParam], post: r('Assign official (admin)') },
    '/assignments/mine': { get: r('My assignments (official)') },
    '/assignments/{id}/accept': { parameters: [idParam], patch: r('Accept assignment') },
    '/assignments/{id}/complete': { parameters: [idParam], patch: r('Complete assignment') },
    '/assignments/{id}/reject': { parameters: [idParam], patch: r('Reject assignment') },
    '/issues/{issueId}/attachments': {
      parameters: [issueIdParam],
      get: r('List attachments'),
      post: r('Upload image (multipart field: file)'),
    },
    '/issues/{issueId}/attachments/{id}': { parameters: [issueIdParam, idParam], delete: r('Delete attachment') },
    '/issues/{issueId}/ai-analysis': {
      parameters: [issueIdParam],
      get: r('Latest AI analysis or null'),
      post: r('Generate AI analysis'),
    },
    '/issues/{issueId}/ai-responses': {
      parameters: [issueIdParam],
      get: r('AI bot history'),
      post: r('Ask AI bot'),
    },
  },
};

module.exports = { spec, serve: swaggerUi.serve, setup: swaggerUi.setup(spec) };