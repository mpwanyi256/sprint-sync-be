import { TaskModel } from '../models/Task';
import { ITask } from '../models/Task';
import { DatabaseError } from '../core/ApiErrors';
import { ITaskRepository, CreateTaskDto, UpdateTaskDto } from './interfaces/ITaskRepository';
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
      
      return task as ITask;
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
      
      Logger.debug(`Found ${tasks.length} tasks for user: ${userId}`);
      return tasks as ITask[];
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
      
      Logger.debug(`Found ${tasks.length} total tasks`);
      return tasks as ITask[];
    } catch (error: any) {
      Logger.error('Error finding all tasks:', error);
      throw new DatabaseError('Failed to find all tasks', error);
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
      
      Logger.info(`Task updated: ${task.title}`);
      return task as ITask;
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
        .lean()
        .exec();
      
      Logger.debug(`Found ${tasks.length} tasks matching search: ${searchTerm}`);
      return tasks as ITask[];
    } catch (error: any) {
      Logger.error('Error searching tasks by text:', error);
      throw new DatabaseError('Failed to search tasks by text', error);
    }
  }
}
