import { TaskModel } from '../models/Task';
import { ITask, TaskStatus } from '../models/Task';
import { TaskAssignmentModel } from '../models/TaskAssignment';
import { DatabaseError } from '../core/ApiErrors';
import { ITaskRepository, CreateTaskDto, UpdateTaskDto, TaskFilters, PaginationOptions, PaginatedTasksResult } from './interfaces/ITaskRepository';
import Logger from '../core/Logger';

export class TaskRepository implements ITaskRepository {
  async create(taskData: CreateTaskDto): Promise<ITask> {
    try {
      const task = await TaskModel.create({
        ...taskData,
        createdBy: taskData.createdBy
      });
      
      Logger.info(`Task created: ${task.title} by user ${taskData.createdBy}`);
      return task.toObject() as ITask;
    } catch (error: any) {
      Logger.error('Error creating task:', error);
      throw new DatabaseError('Failed to create task', error);
    }
  }

  async findById(id: string): Promise<ITask | null> {
    try {
      const task = await TaskModel
        .findById(id)
        .populate('createdBy', 'firstName lastName email')
        .lean()
        .exec();
      
      if (!task) {
        Logger.debug(`Task not found for id: ${id}`);
        return null;
      }
      
      // Get assignee information
      const latestAssignment = await TaskAssignmentModel
        .findOne({ task: task._id })
        .sort({ updatedAt: -1 })
        .populate('assignedTo', '_id firstName lastName email')
        .lean()
        .exec();
      
      const taskWithAssignee = {
        ...task,
        assignee: latestAssignment ? latestAssignment.assignedTo : null
      };
      
      return taskWithAssignee as ITask;
    } catch (error: any) {
      Logger.error('Error finding task by id:', error);
      throw new DatabaseError('Failed to find task by id', error);
    }
  }

  async findByUser(userId: string): Promise<ITask[]> {
    try {
      const tasks = await TaskModel
        .find({ createdBy: userId })
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      // Get assignee information for each task
      const tasksWithAssignees = await Promise.all(
        tasks.map(async (task) => {
          const latestAssignment = await TaskAssignmentModel
            .findOne({ task: task._id })
            .sort({ updatedAt: -1 })
            .populate('assignedTo', 'firstName lastName email')
            .lean()
            .exec();
          
          return {
            ...task,
            assignee: latestAssignment ? latestAssignment.assignedTo : null
          };
        })
      );
      
      Logger.debug(`Found ${tasksWithAssignees.length} tasks for user: ${userId}`);
      return tasksWithAssignees as ITask[];
    } catch (error: any) {
      Logger.error('Error finding tasks by user:', error);
      throw new DatabaseError('Failed to find tasks by user', error);
    }
  }

  async findAll(): Promise<ITask[]> {
    try {
      const tasks = await TaskModel
        .find()
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      
      // Get assignee information for each task
      const tasksWithAssignees = await Promise.all(
        tasks.map(async (task) => {
          const latestAssignment = await TaskAssignmentModel
            .findOne({ task: task._id })
            .sort({ updatedAt: -1 })
            .populate('assignedTo', 'firstName lastName email')
            .lean()
            .exec();
          
          return {
            ...task,
            assignee: latestAssignment ? latestAssignment.assignedTo : null
          };
        })
      );
      
      Logger.debug(`Found ${tasksWithAssignees.length} total tasks`);
      return tasksWithAssignees as ITask[];
    } catch (error: any) {
      Logger.error('Error finding all tasks:', error);
      throw new DatabaseError('Failed to find all tasks', error);
    }
  }

  async findAllWithPagination(filters: TaskFilters, pagination: PaginationOptions): Promise<PaginatedTasksResult> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;
      
      // Build filter query
      const filterQuery: any = {};
      
      if (filters.createdBy) {
        filterQuery.createdBy = filters.createdBy;
      }
      
      if (filters.title) {
        filterQuery.title = { $regex: filters.title, $options: 'i' };
      }
      
      if (filters.description) {
        filterQuery.description = { $regex: filters.description, $options: 'i' };
      }
      
      // Implement status filter
      if (filters.status) {
        filterQuery.status = filters.status;
      }
      
      if (filters.assignee) {
        Logger.debug(`Assignee filter requested: ${filters.assignee} (not implemented yet)`);
      }
      
      // Get total count for pagination
      const totalItems = await TaskModel.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalItems / limit);
      
      // Get paginated results
      const tasks = await TaskModel
        .find(filterQuery)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      
      // Get assignee information for each task
      const tasksWithAssignees = await Promise.all(
        tasks.map(async (task) => {
          const latestAssignment = await TaskAssignmentModel
            .findOne({ task: task._id })
            .sort({ updatedAt: -1 })
            .populate('assignedTo', 'firstName lastName email')
            .lean()
            .exec();
          
          return {
            ...task,
            assignee: latestAssignment ? latestAssignment.assignedTo : null
          };
        })
      );
      
      Logger.debug(`Found ${tasksWithAssignees.length} tasks with filters and pagination. Page ${page}/${totalPages}, Total: ${totalItems}, Status filter: ${filters.status || 'none'}`);
      
      return {
        tasks: tasksWithAssignees as ITask[],
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error: any) {
      Logger.error('Error finding tasks with pagination:', error);
      throw new DatabaseError('Failed to find tasks with pagination', error);
    }
  }

  async update(id: string, taskData: UpdateTaskDto): Promise<ITask | null> {
    try {
      const task = await TaskModel
        .findByIdAndUpdate(
          id,
          { ...taskData, updatedAt: new Date() },
          { new: true, runValidators: true }
        )
        .populate('createdBy', 'firstName lastName email')
        .lean()
        .exec();
      
      if (!task) {
        Logger.debug(`Task not found for update with id: ${id}`);
        return null;
      }
      
      // Get assignee information
      const latestAssignment = await TaskAssignmentModel
        .findOne({ task: task._id })
        .sort({ updatedAt: -1 })
        .populate('assignedTo', 'firstName lastName email')
        .lean()
        .exec();
      
      const taskWithAssignee = {
        ...task,
        assignee: latestAssignment ? latestAssignment.assignedTo : null
      };
      
      Logger.info(`Task updated: ${task.title}`);
      return taskWithAssignee as ITask;
    } catch (error: any) {
      Logger.error('Error updating task:', error);
      throw new DatabaseError('Failed to update task', error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await TaskModel.findByIdAndDelete(id).lean().exec();
      const success = !!result;
      
      if (success) {
        Logger.info(`Task deleted with id: ${id}`);
      } else {
        Logger.debug(`Task not found for deletion with id: ${id}`);
      }
      
      return success;
    } catch (error: any) {
      Logger.error('Error deleting task:', error);
      throw new DatabaseError('Failed to delete task', error);
    }
  }

  async searchByText(searchTerm: string): Promise<ITask[]> {
    try {
      const tasks = await TaskModel
        .find(
          { $text: { $search: searchTerm } },
          { score: { $meta: 'textScore' } }
        )
        .populate('createdBy', 'firstName lastName email')
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean()
        .exec();
      
      // Get assignee information for each task
      const tasksWithAssignees = await Promise.all(
        tasks.map(async (task) => {
          const latestAssignment = await TaskAssignmentModel
            .findOne({ task: task._id })
            .sort({ updatedAt: -1 })
            .populate('assignedTo', 'firstName lastName email')
            .lean()
            .exec();
          
          return {
            ...task,
            assignee: latestAssignment ? latestAssignment.assignedTo : null
          };
        })
      );
      
      Logger.debug(`Found ${tasksWithAssignees.length} tasks matching search: ${searchTerm}`);
      return tasksWithAssignees as ITask[];
    } catch (error: any) {
      Logger.error('Error searching tasks by text:', error);
      throw new DatabaseError('Failed to search tasks by text', error);
    }
  }

  async assignTask(taskId: string, assignedTo: string, assignedBy: string): Promise<ITask | null> {
    try {
      // First check if task exists
      const task = await TaskModel.findById(taskId).lean().exec();
      if (!task) {
        Logger.debug(`Task not found for assignment with id: ${taskId}`);
        return null;
      }

      // Create or update task assignment
      const assignmentData = {
        task: taskId,
        assignedTo,
        assignedBy,
        updatedAt: new Date()
      };

      await TaskAssignmentModel.findOneAndUpdate(
        { task: taskId },
        assignmentData,
        { upsert: true, new: true, runValidators: true }
      );

      Logger.info(`Task assignment created/updated: ${taskId} -> ${assignedTo}`);

      // Return the task with updated assignee information
      const taskWithAssignee = await this.findById(taskId);
      return taskWithAssignee;
    } catch (error: any) {
      Logger.error('Error assigning task:', error);
      throw new DatabaseError('Failed to assign task', error);
    }
  }

  async unassignTask(taskId: string, userId: string): Promise<ITask | null> {
    try {
      // First check if task exists
      const task = await TaskModel.findById(taskId).lean().exec();
      if (!task) {
        Logger.debug(`Task not found for unassignment with id: ${taskId}`);
        return null;
      }

      // Remove task assignment
      await TaskAssignmentModel.findOneAndDelete({ task: taskId });

      Logger.info(`Task assignment removed: ${taskId}`);

      // Return the task with updated assignee information
      const taskWithAssignee = await this.findById(taskId);
      return taskWithAssignee;
    } catch (error: any) {
      Logger.error('Error unassigning task:', error);
      throw new DatabaseError('Failed to unassign task', error);
    }
  }
}
