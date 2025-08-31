import { NotFoundError } from '../../core/ApiErrors';
import { SuccessResponse } from '../../core/ApiResponses';
import { taskService } from '../../services/task';
import { ProtectedRequest } from '../../types/AppRequests';
import asyncHandler from '../../core/AsyncHandler';
import { Router } from 'express';
import schema from './schema';
import validator, { ValidationSource } from '../../helpers/validator';

const router = Router();

// Update task
router.patch(
  '/:id',
  validator(schema.updateTask, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Tasks']
    const { id } = req.params;
    const { title, description, totalMinutes, status } = req.body;
    const userId = req.user._id.toString();

    const updatedTask = await taskService.updateTask(
      id,
      {
        title,
        description,
        totalMinutes,
        status,
      },
      userId
    );

    if (!updatedTask) {
      throw new NotFoundError('Task not found');
    }

    const formattedTask = {
      id: updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description,
      totalMinutes: updatedTask.totalMinutes,
      totalTimeSpent: updatedTask.totalTimeSpent || 0,
      createdBy: updatedTask.createdBy,
      assignee: updatedTask.assignee,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
    };

    new SuccessResponse('Task updated successfully', formattedTask).send(res);
  })
);

export default router;
