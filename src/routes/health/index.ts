import express from 'express';
import { SuccessResponse } from '../../core/ApiResponses';
import { environment } from '../../config';
import asyncHandler from '../../core/AsyncHandler';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    // #swagger.tags = ['Health']
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: environment,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
    };

    new SuccessResponse('Health check successful', healthData).send(res);
  })
);

export default router;
