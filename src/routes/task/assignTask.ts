import { BadRequestError } from '../../core/ApiErrors';
import { SuccessResponse } from '../../core/ApiResponses';
import { taskService } from '../../services/task';
import { ProtectedRequest } from '../../types/AppRequests';
import asyncHandler from '../../core/AsyncHandler';
import { Router } from 'express';
import schema from './schema';
import validator, { ValidationSource } from '../../helpers/validator';

const router = Router();

// Assign task to user
router.post(
  '/:id/assign',
  validator(schema.assignTask, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Tasks']
    const { id } = req.params;
    const { assignedTo } = req.body;
    const assignedBy = req.user._id.toString();

    // check if user is an admin
    if (!req.user.isAdmin) {
      throw new BadRequestError('You are not authorized to assign tasks');
    }

    const assignedTask = await taskService.assignTask(
      id,
      assignedTo,
      assignedBy
    );

    const formattedTask = {
      id: assignedTask._id,
      title: assignedTask.title,
      description: assignedTask.description,
      totalMinutes: assignedTask.totalMinutes,
      status: assignedTask.status,
      createdBy: assignedTask.createdBy,
      assignedTo: assignedTask.assignee,
      createdAt: assignedTask.createdAt,
      updatedAt: assignedTask.updatedAt,
    };

    new SuccessResponse('Task assigned successfully', formattedTask).send(res);
  })
);

// Unassign task
router.delete(
  '/:id/assign',
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Tasks']
    const { id } = req.params;
    const userId = req.user._id.toString();

    // check if user is an admin
    if (!req.user.isAdmin) {
      throw new BadRequestError('You are not authorized to unassign tasks');
    }

    const unassignedTask = await taskService.unassignTask(id, userId);

    const formattedTask = {
      id: unassignedTask._id,
      title: unassignedTask.title,
      description: unassignedTask.description,
      totalMinutes: unassignedTask.totalMinutes,
      status: unassignedTask.status,
      createdBy: unassignedTask.createdBy,
      assignee: unassignedTask.assignee,
      createdAt: unassignedTask.createdAt,
      updatedAt: unassignedTask.updatedAt,
    };

    new SuccessResponse('Task unassigned successfully', formattedTask).send(
      res
    );
  })
);

export default router;
