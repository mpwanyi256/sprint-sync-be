import { BadRequestError } from "../../core/ApiErrors";
import { SuccessResponse } from "../../core/ApiResponses";
import { taskService } from "../../services/task";
import { ProtectedRequest } from "../../types/AppRequests";
import asyncHandler from "../../core/AsyncHandler";
import { Router } from "express";

const router = Router();

// Update task
router.patch(
    '/:id',
    asyncHandler(async (req: ProtectedRequest, res) => {
      const { id } = req.params;
      const { title, description, totalMinutes } = req.body;
      
      // Get user ID from authenticated request
      const userId = req.user?._id?.toString();
      
      if (!userId) {
        throw new BadRequestError('User authentication required');
      }
  
      const updatedTask = await taskService.updateTask(id, {
        title,
        description,
        totalMinutes
      }, userId);
  
      const formattedTask = {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        totalMinutes: updatedTask.totalMinutes,
        createdBy: updatedTask.createdBy,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt
      };
  
      new SuccessResponse('Task updated successfully', {
        task: formattedTask
      }).send(res);
    })
  );

export default router;
