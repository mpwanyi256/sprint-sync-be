import { NotFoundResponse, SuccessResponse } from '@/core/ApiResponses';
import { taskService } from '@/services/task';
import { ProtectedRequest } from '@/types/AppRequests';
import { Router } from 'express';
import asyncHandler from '../../core/AsyncHandler';

const router = Router();

// Get task details by ID
router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Tasks']
    const { id } = req.params as { id: string };

    const task = await taskService.getTaskById(id);

    if (!task) {
      throw new NotFoundResponse('Task not found.');
    }

    const formattedTask = {
      id: task._id,
      title: task.title,
      description: task.description,
      totalMinutes: task.totalMinutes,
      totalTimeSpent: task.totalTimeSpent || 0,
      createdBy: task.createdBy,
      assignedTo: task.assignee,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };

    new SuccessResponse(
      'Task details retrieved successfully',
      formattedTask
    ).send(res);
  })
);

export default router;
