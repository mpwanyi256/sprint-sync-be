import { ITask } from '../../models/Task';
import { BadRequestError, NotFoundError } from '../../core/ApiErrors';
import { TaskRepository } from '../../repositories/TaskRepository';
import {
  ITaskRepository,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  PaginationOptions,
  PaginatedTasksWithTimeSpentResult,
  ITaskWithTimeSpent,
} from '../../repositories/interfaces/ITaskRepository';
import { timeLogService } from '../timeLog';
import Logger from '../../core/Logger';

export class TaskService {
  constructor(private taskRepo: ITaskRepository = new TaskRepository()) {}

  async createTask(taskData: CreateTaskDto): Promise<ITask> {
    // Validate task data
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new BadRequestError('Task title is required');
    }

    if (!taskData.description || taskData.description.trim().length === 0) {
      throw new BadRequestError('Task description is required');
    }

    if (!taskData.totalMinutes || taskData.totalMinutes < 1) {
      throw new BadRequestError('Task duration must be at least 1 minute');
    }

    if (taskData.totalMinutes > 10080) {
      // Max 1 week
      throw new BadRequestError('Task duration cannot exceed 1 week');
    }

    Logger.info(
      `Creating task: ${taskData.title} for user: ${taskData.createdBy}`
    );

    const task = await this.taskRepo.create(taskData);
    Logger.info(`Task created successfully with ID: ${task._id}`);

    return task;
  }

  async getTaskById(id: string): Promise<ITaskWithTimeSpent> {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const totalTimeSpent = await timeLogService.getTotalTimeSpentOnTask(id);

    return {
      ...task,
      totalTimeSpent,
    };
  }

  async getTasksByUser(userId: string): Promise<ITask[]> {
    Logger.debug(`Fetching tasks for user: ${userId}`);
    return await this.taskRepo.findByUser(userId);
  }

  async getAllTasks(): Promise<ITask[]> {
    Logger.debug('Fetching all tasks');
    return await this.taskRepo.findAll();
  }

  async getAllTasksWithPagination(
    filters: TaskFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedTasksWithTimeSpentResult> {
    // Validate pagination parameters
    if (pagination.page < 1) {
      throw new BadRequestError('Page number must be at least 1');
    }

    if (pagination.limit < 1 || pagination.limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    // Validate filters
    if (
      filters.status &&
      !['TODO', 'IN_PROGRESS', 'DONE'].includes(filters.status)
    ) {
      throw new BadRequestError(
        'Invalid status filter. Must be one of: TODO, IN_PROGRESS, DONE'
      );
    }

    Logger.debug(
      `Fetching tasks with pagination. Page: ${pagination.page}, Limit: ${pagination.limit}, Filters:`,
      JSON.stringify(filters)
    );

    const result = await this.taskRepo.findAllWithPagination(
      filters,
      pagination
    );

    // Add total time spent for each task
    const tasksWithTimeSpent = await Promise.all(
      result.tasks.map(async task => {
        const totalTimeSpent = await timeLogService.getTotalTimeSpentOnTask(
          task._id!.toString()
        );
        return {
          ...task,
          totalTimeSpent,
        };
      })
    );

    Logger.debug(
      `Task service returned ${result.tasks.length} tasks for status: ${filters.status || 'all'}`
    );

    return {
      ...result,
      tasks: tasksWithTimeSpent,
    };
  }

  async updateTask(
    id: string,
    taskData: UpdateTaskDto,
    userId: string
  ): Promise<ITaskWithTimeSpent> {
    // First check if task exists and user has permission
    const existingTask = await this.taskRepo.findById(id);
    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    // Validate update data
    if (taskData.title !== undefined && taskData.title.trim().length === 0) {
      throw new BadRequestError('Task title cannot be empty');
    }

    if (
      taskData.description !== undefined &&
      taskData.description.trim().length === 0
    ) {
      throw new BadRequestError('Task description cannot be empty');
    }

    if (
      taskData.totalMinutes !== undefined &&
      (taskData.totalMinutes < 1 || taskData.totalMinutes > 10080)
    ) {
      throw new BadRequestError(
        'Task duration must be between 1 minute and 1 week'
      );
    }

    // Handle TimeLog logic for status changes
    if (
      taskData.status !== undefined &&
      taskData.status !== existingTask.status
    ) {
      await this.handleStatusChangeTimeLog(
        id,
        existingTask.status,
        taskData.status,
        userId
      );
    }

    Logger.info(`Updating task: ${id} by user: ${userId}`);

    const updatedTask = await this.taskRepo.update(id, taskData);
    if (!updatedTask) {
      throw new NotFoundError('Task not found during update');
    }

    // Add total time spent
    const totalTimeSpent = await timeLogService.getTotalTimeSpentOnTask(id);

    Logger.info(`Task updated successfully: ${updatedTask.title}`);
    return {
      ...updatedTask,
      totalTimeSpent,
    };
  }

  private async handleStatusChangeTimeLog(
    taskId: string,
    oldStatus: string,
    newStatus: string,
    userId: string
  ): Promise<void> {
    Logger.info(
      `Handling status change for task ${taskId}: ${oldStatus} -> ${newStatus} by user ${userId}`
    );

    // If moving TO 'IN_PROGRESS', end any existing active time logs for this task
    // and start a new one for the current user
    if (newStatus === 'IN_PROGRESS') {
      // End ALL active time logs for this task (from any user)
      const endedCount =
        await timeLogService.endAllActiveTimeLogsForTask(taskId);
      if (endedCount > 0) {
        Logger.info(
          `Ended ${endedCount} active time log(s) for task ${taskId} when moving to IN_PROGRESS`
        );
      }

      // Start new time log for the current user
      await timeLogService.startTimeLog(userId, taskId);
      Logger.info(`Started new time log for task ${taskId} and user ${userId}`);
    }
    // If moving FROM 'IN_PROGRESS' to any other status, end ALL active time logs
    else if (
      oldStatus === 'IN_PROGRESS' ||
      newStatus === 'DONE' ||
      newStatus === 'TODO'
    ) {
      // End ALL active time logs for this task regardless of user
      const endedCount =
        await timeLogService.endAllActiveTimeLogsForTask(taskId);
      if (endedCount > 0) {
        Logger.info(
          `Ended ${endedCount} active time log(s) for task ${taskId} when moving to ${newStatus}`
        );
      }
    }
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    // First check if task exists and user has permission
    const existingTask = await this.taskRepo.findById(id);
    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    // Check if user is the creator of the task
    if (existingTask.createdBy.toString() !== userId) {
      throw new BadRequestError('You can only delete tasks you created');
    }

    Logger.info(`Deleting task: ${id} by user: ${userId}`);

    const success = await this.taskRepo.delete(id);
    if (success) {
      Logger.info(`Task deleted successfully: ${id}`);
    }

    return success;
  }

  async searchTasks(searchTerm: string): Promise<ITaskWithTimeSpent[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new BadRequestError('Search term is required');
    }

    Logger.debug(`Searching tasks with term: ${searchTerm}`);
    const tasks = await this.taskRepo.searchByText(searchTerm);

    // Add total time spent for each task
    const tasksWithTimeSpent = await Promise.all(
      tasks.map(async task => {
        const totalTimeSpent = await timeLogService.getTotalTimeSpentOnTask(
          task._id!.toString()
        );
        return {
          ...task,
          totalTimeSpent,
        };
      })
    );

    return tasksWithTimeSpent;
  }

  async assignTask(
    taskId: string,
    assignedTo: string,
    assignedBy: string
  ): Promise<ITask> {
    // Validate inputs
    if (!taskId || !assignedTo || !assignedBy) {
      throw new BadRequestError(
        'Task ID, assignedTo, and assignedBy are required'
      );
    }

    Logger.info(
      `Assigning task: ${taskId} to user: ${assignedTo} by user: ${assignedBy}`
    );

    const assignedTask = await this.taskRepo.assignTask(
      taskId,
      assignedTo,
      assignedBy
    );
    if (!assignedTask) {
      throw new NotFoundError('Task not found or assignment failed');
    }

    Logger.info(`Task assigned successfully: ${assignedTask.title}`);
    return assignedTask;
  }

  async unassignTask(taskId: string, userId: string): Promise<ITask> {
    // Validate inputs
    if (!taskId || !userId) {
      throw new BadRequestError('Task ID and user ID are required');
    }

    Logger.info(`Unassigning task: ${taskId} by user: ${userId}`);

    const unassignedTask = await this.taskRepo.unassignTask(taskId, userId);
    if (!unassignedTask) {
      throw new NotFoundError('Task not found or unassignment failed');
    }

    Logger.info(`Task unassigned successfully: ${unassignedTask.title}`);
    return unassignedTask;
  }
}

// Export service instance for backward compatibility
export const taskService = new TaskService();
