import { SuccessResponse } from '../../core/ApiResponses';
import validator, { ValidationSource } from '../../helpers/validator';
import { timeLogService } from '../../services/timeLog';
import { ProtectedRequest } from '../../types/AppRequests';
import schema from './schema';
import asyncHandler from '../../core/AsyncHandler';
import { Router } from 'express';

const router = Router();

// Get daily time logs with pagination and metrics
router.get(
  '/daily',
  validator(schema.getDailyTimeLogs, ValidationSource.QUERY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['TimeLogs']
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId as string;

    const result = await timeLogService.getDailyTimeLogsByDateRange(
      startDate,
      endDate,
      page,
      limit,
      userId
    );

    new SuccessResponse('Daily time logs retrieved successfully', result).send(
      res
    );
  })
);

export default router;
