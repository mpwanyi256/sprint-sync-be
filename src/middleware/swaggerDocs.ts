import express from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';
import { isDev } from '../config';

const router = express.Router();

// Try to load swagger documentation
// In production build, the file will be in build/scripts/swagger-output.json
// In development, it will be in scripts/swagger-output.json
const swaggerPath = path.join(
  __dirname,
  isDev ? '../../scripts/swagger-output.json' : '../scripts/swagger-output.json'
);
let swaggerDocument: any = null;

try {
  if (fs.existsSync(swaggerPath)) {
    swaggerDocument = require(swaggerPath);
  }
} catch (error) {
  console.log(
    'Swagger documentation not available:',
    error instanceof Error ? error.message : 'Unknown error'
  );
}

if (swaggerDocument) {
  router.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Sprint Sync API Documentation',
    })
  );
} else {
  // Provide a fallback response when swagger docs are not available
  router.get('/api-docs', (req, res) => {
    res.status(503).json({
      error: 'API Documentation not available',
      message: 'Swagger documentation is not available in this environment',
    });
  });
}

export default router;
