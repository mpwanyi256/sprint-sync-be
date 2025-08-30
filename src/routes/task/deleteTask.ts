import { BadRequestError } from '../../core/ApiErrors';
import { SuccessResponse } from '../../core/ApiResponses';
import { taskService } from '../../services/task';
import { ProtectedRequest } from '../../types/AppRequests';
import asyncHandler from '../../core/AsyncHandler';
import { Router } from 'express';

const router = Router();

// Delete task
router.delete(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Tasks']
    const { id } = req.params;

    // Get user ID from authenticated request
    const userId = req.user?._id?.toString();

    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    await taskService.deleteTask(id, userId);

    new SuccessResponse('Task deleted successfully', {
      message: 'Task has been permanently deleted',
    }).send(res);
  })
);

export default router;
