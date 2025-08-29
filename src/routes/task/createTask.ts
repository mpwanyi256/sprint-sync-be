import { BadRequestError } from "../../core/ApiErrors";
import { SuccessResponse } from "../../core/ApiResponses";
import validator from "../../helpers/validator";
import { taskService } from "../../services/task";
import { ProtectedRequest } from "../../types/AppRequests";
import schema from "./schema";
import asyncHandler from "../../core/AsyncHandler";
import { Router } from "express";

const router = Router();

// Create a new task
router.post(
    '/',
    validator(schema.createTask),
    asyncHandler(async (req: ProtectedRequest, res) => {
      const { title, description, totalMinutes } = req.body;
      const userId = req.user._id.toString();
      
      const task = await taskService.createTask({
        title,
        description,
        totalMinutes,
        createdBy: userId
      });
  
      if (!task._id) {
        throw new BadRequestError('Failed to create task');
      }
  
      const createdTask = await taskService.getTaskById(task._id.toString());
  
      new SuccessResponse('Task created successfully', {
          id: createdTask._id,
          title: createdTask.title,
          status: createdTask.status,
          description: createdTask.description,
          totalMinutes: createdTask.totalMinutes,
          createdBy: createdTask.createdBy,
          createdAt: createdTask.createdAt,
          updatedAt: createdTask.updatedAt
      }).send(res);
    })
  );

export default router;
