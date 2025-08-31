import { TimeLogModel, ITimeLog } from '../models/TimeLog';
import { DatabaseError } from '../core/ApiErrors';
import {
  ITimeLogRepository,
  CreateTimeLogDto,
  UpdateTimeLogDto,
} from './interfaces/ITimeLogRepository';
import Logger from '../core/Logger';

export class TimeLogRepository implements ITimeLogRepository {
  async create(timeLogData: CreateTimeLogDto): Promise<ITimeLog> {
    try {
      const timeLog = await TimeLogModel.create({
        ...timeLogData,
        start: timeLogData.start || new Date(),
      });

      Logger.info(
        `TimeLog created for task: ${timeLogData.task} by user: ${timeLogData.user}`
      );
      return timeLog.toObject() as ITimeLog;
    } catch (error) {
      Logger.error('Error creating time log:', error);
      throw new DatabaseError('Failed to create time log', error);
    }
  }

  async findById(id: string): Promise<ITimeLog | null> {
    try {
      const timeLog = await TimeLogModel.findById(id)
        .populate('task', 'title description')
        .populate('user', 'firstName lastName email')
        .lean()
        .exec();

      if (!timeLog) {
        Logger.debug(`TimeLog not found for id: ${id}`);
        return null;
      }

      return timeLog as ITimeLog;
    } catch (error) {
      Logger.error('Error finding time log by id:', error);
      throw new DatabaseError('Failed to find time log by id', error);
    }
  }

  async findActiveTimeLogForUserAndTask(
    userId: string,
    taskId: string
  ): Promise<ITimeLog | null> {
    try {
      const activeTimeLog = await TimeLogModel.findOne({
        user: userId,
        task: taskId,
        end: { $exists: false },
      })
        .sort({ start: -1 })
        .lean()
        .exec();

      if (!activeTimeLog) {
        Logger.debug(
          `No active time log found for user: ${userId} and task: ${taskId}`
        );
        return null;
      }

      Logger.debug(
        `Active time log found for user: ${userId} and task: ${taskId}`
      );
      return activeTimeLog as ITimeLog;
    } catch (error) {
      Logger.error('Error finding active time log:', error);
      throw new DatabaseError('Failed to find active time log', error);
    }
  }

  async findByTask(taskId: string): Promise<ITimeLog[]> {
    try {
      const timeLogs = await TimeLogModel.find({ task: taskId })
        .populate('user', 'firstName lastName email')
        .sort({ start: -1 })
        .lean()
        .exec();

      Logger.debug(`Found ${timeLogs.length} time logs for task: ${taskId}`);
      return timeLogs as ITimeLog[];
    } catch (error) {
      Logger.error('Error finding time logs by task:', error);
      throw new DatabaseError('Failed to find time logs by task', error);
    }
  }

  async findByUser(userId: string): Promise<ITimeLog[]> {
    try {
      const timeLogs = await TimeLogModel.find({ user: userId })
        .populate('task', 'title description')
        .sort({ start: -1 })
        .lean()
        .exec();

      Logger.debug(`Found ${timeLogs.length} time logs for user: ${userId}`);
      return timeLogs as ITimeLog[];
    } catch (error) {
      Logger.error('Error finding time logs by user:', error);
      throw new DatabaseError('Failed to find time logs by user', error);
    }
  }

  async update(
    id: string,
    timeLogData: UpdateTimeLogDto
  ): Promise<ITimeLog | null> {
    try {
      const timeLog = await TimeLogModel.findByIdAndUpdate(
        id,
        { ...timeLogData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate('task', 'title description')
        .populate('user', 'firstName lastName email')
        .lean()
        .exec();

      if (!timeLog) {
        Logger.debug(`TimeLog not found for update with id: ${id}`);
        return null;
      }

      Logger.info(`TimeLog updated: ${id}`);
      return timeLog as ITimeLog;
    } catch (error) {
      Logger.error('Error updating time log:', error);
      throw new DatabaseError('Failed to update time log', error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await TimeLogModel.findByIdAndDelete(id).lean().exec();
      const success = !!result;

      if (success) {
        Logger.info(`TimeLog deleted with id: ${id}`);
      } else {
        Logger.debug(`TimeLog not found for deletion with id: ${id}`);
      }

      return success;
    } catch (error) {
      Logger.error('Error deleting time log:', error);
      throw new DatabaseError('Failed to delete time log', error);
    }
  }

  async getTotalTimeSpentOnTask(taskId: string): Promise<number> {
    try {
      const timeLogs = await TimeLogModel.find({
        task: taskId,
        end: { $exists: true },
      })
        .select('start end')
        .lean()
        .exec();

      let totalMinutes = 0;

      timeLogs.forEach(timeLog => {
        if (timeLog.end && timeLog.start) {
          const duration =
            new Date(timeLog.end).getTime() - new Date(timeLog.start).getTime();
          totalMinutes += Math.round(duration / (1000 * 60)); // Convert milliseconds to minutes
        }
      });

      Logger.debug(
        `Total time spent on task ${taskId}: ${totalMinutes} minutes`
      );
      return totalMinutes;
    } catch (error) {
      Logger.error('Error calculating total time spent on task:', error);
      throw new DatabaseError(
        'Failed to calculate total time spent on task',
        error
      );
    }
  }
}
