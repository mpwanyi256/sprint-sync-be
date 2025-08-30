const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Sprint Sync API',
    version: '1.0.0',
    description: 'API documentation for the Sprint Sync backend application',
  },
  host: 'localhost:3000',
  basePath: '/api',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication endpoints',
    },
    {
      name: 'Tasks',
      description: 'Task management endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'AI',
      description: 'AI assistance endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
  securityDefinitions: {
    ApiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
      description: 'API Key for authentication',
    },
    BearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'authorization',
      description: 'JWT Bearer token (format: Bearer <token>)',
    },
  },
  definitions: {
    User: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '60d5ec49f8c7a40015a7b8c9',
        },
        firstName: {
          type: 'string',
          example: 'John',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
        },
        isAdmin: {
          type: 'boolean',
          example: false,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
      },
    },
    Task: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '60d5ec49f8c7a40015a7b8c8',
        },
        title: {
          type: 'string',
          example: 'Implement Authentication',
        },
        description: {
          type: 'string',
          example: 'Create user registration and login functionality',
        },
        status: {
          type: 'string',
          enum: ['TODO', 'IN_PROGRESS', 'DONE'],
          example: 'TODO',
        },
        totalMinutes: {
          type: 'number',
          example: 240,
        },
        createdBy: {
          type: 'string',
          example: '60d5ec49f8c7a40015a7b8c9',
        },
        assignee: {
          $ref: '#/definitions/User',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
      },
    },
    Pagination: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          example: 1,
        },
        limit: {
          type: 'number',
          example: 10,
        },
        total: {
          type: 'number',
          example: 100,
        },
        pages: {
          type: 'number',
          example: 10,
        },
      },
    },
    Success: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        message: {
          type: 'string',
          example: 'Operation successful',
        },
        data: {
          type: 'object',
        },
      },
    },
    Error: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        message: {
          type: 'string',
          example: 'Error message',
        },
      },
    },
  },
};

const outputFile = './scripts/swagger-output.json';
const routes = ['./src/routes/index.ts'];

swaggerAutogen(outputFile, routes, doc);
