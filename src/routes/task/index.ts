import { Router } from 'express';
import { taskService } from '../../services/task';
import { BadRequestError } from '../../core/ApiErrors';
import { SuccessResponse } from '../../core/ApiResponses';
import asyncHandler from '../../core/AsyncHandler';
import { ProtectedRequest } from '../../types/AppRequests';
import authentication from '../../middleware/authentication';
import schema from './schema';
import validator from '../../helpers/validator';

const router = Router();

// Authentication middleware
router.use(authentication);

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

    new SuccessResponse('Task created successfully', {
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        totalMinutes: task.totalMinutes,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    }).send(res);
  })
);

router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const tasks = await taskService.getAllTasks();
    
    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      totalMinutes: task.totalMinutes,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    new SuccessResponse('Tasks retrieved successfully', {
      tasks: formattedTasks,
      count: formattedTasks.length
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
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };

    new SuccessResponse('Task retrieved successfully', {
      task: formattedTask
    }).send(res);
  })
);

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

// Delete task
router.delete(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;
    
    // Get user ID from authenticated request
    const userId = req.user?._id?.toString();
    
    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    await taskService.deleteTask(id, userId);

    new SuccessResponse('Task deleted successfully', {
      message: 'Task has been permanently deleted'
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
