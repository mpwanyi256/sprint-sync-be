import { SuccessResponse } from "../../core/ApiResponses";
import validator, { ValidationSource } from "../../helpers/validator";
import { taskService } from "../../services/task";
import { ProtectedRequest } from "../../types/AppRequests";
import schema from "./schema";
import asyncHandler from "../../core/AsyncHandler";
import { Router } from "express";
import { TaskStatus } from "../../repositories/interfaces/ITaskRepository";

const router = Router();

// Get all tasks with pagination and filtering
router.get(
  '/',
  validator(schema.getTasks, ValidationSource.QUERY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Extract query parameters for pagination and filtering
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as TaskStatus | undefined;
    const assignee = req.query.assignee as string;
    const createdBy = req.query.createdBy as string;
    const title = req.query.title as string;
    const description = req.query.description as string;
    
    const filters = {
      status,
      assignee,
      createdBy,
      title,
      description
    };
    
    const pagination = { page, limit };
    
    const result = await taskService.getAllTasksWithPagination(filters, pagination);
    
    const formattedTasks = result.tasks.map(task => ({
      id: task._id,
      title: task.title,
      status: task.status,
      description: task.description,
      totalMinutes: task.totalMinutes,
      createdBy: task.createdBy,
      assignedTo: task.assignee,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    new SuccessResponse('Tasks retrieved successfully with pagination', {
      tasks: formattedTasks,
      pagination: result.pagination
    }).send(res);
  })
);

// Get task by ID
router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);
    
    const formattedTask = {
      id: task._id,
      title: task.title,
      description: task.description,
      totalMinutes: task.totalMinutes,
      createdBy: task.createdBy,
      assignee: task.assignee,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };

    new SuccessResponse('Task retrieved successfully', {
      task: formattedTask
    }).send(res);
  })
);

// Search tasks by text
router.get(
  '/search/:term',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { term } = req.params;
    const tasks = await taskService.searchTasks(term);
    
    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      totalMinutes: task.totalMinutes,
      createdBy: task.createdBy,
      assignee: task.assignee,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    new SuccessResponse('Task search completed', {
      tasks: formattedTasks,
      count: formattedTasks.length,
      searchTerm: term
    }).send(res);
  })
);

export default router;
