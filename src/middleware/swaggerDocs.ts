import express from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
const swaggerDocument = require(
  path.join(__dirname, '../../scripts/swagger-output.json')
);

const router = express.Router();

router.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Sprint Sync API Documentation',
  })
);

export default router;
