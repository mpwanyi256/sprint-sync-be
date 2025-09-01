import { TimeLogModel, ITimeLog } from '../models/TimeLog';
import { DatabaseError } from '../core/ApiErrors';
import {
  ITimeLogRepository,
  CreateTimeLogDto,
  UpdateTimeLogDto,
  DailyTimeLogEntry,
  TimeLogMetrics,
  PaginatedDailyTimeLogsResult,
} from './interfaces/ITimeLogRepository';
import { Types } from 'mongoose';
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

  async findActiveTimeLogsForTask(taskId: string): Promise<ITimeLog[]> {
    try {
      const activeTimeLogs = await TimeLogModel.find({
        task: taskId,
        end: { $exists: false },
      })
        .populate('user', 'firstName lastName email')
        .sort({ start: -1 })
        .lean()
        .exec();

      Logger.debug(
        `Found ${activeTimeLogs.length} active time logs for task: ${taskId}`
      );
      return activeTimeLogs as ITimeLog[];
    } catch (error) {
      Logger.error('Error finding active time logs for task:', error);
      throw new DatabaseError(
        'Failed to find active time logs for task',
        error
      );
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
          totalMinutes += Math.round((duration / (1000 * 60)) * 10) / 10; // Convert milliseconds to minutes with 1 decimal place
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

  async getDailyTimeLogsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    userId?: string
  ): Promise<PaginatedDailyTimeLogsResult> {
    try {
      const skip = (page - 1) * limit;

      // Build match condition
      const matchCondition: any = {
        end: { $exists: true },
        start: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      if (userId) {
        matchCondition.user = new Types.ObjectId(userId);
      }

      // Aggregation pipeline for daily time logs
      const aggregationPipeline = [
        { $match: matchCondition },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        {
          $lookup: {
            from: 'tasks',
            localField: 'task',
            foreignField: '_id',
            as: 'taskInfo',
          },
        },
        {
          $addFields: {
            duration: {
              $divide: [{ $subtract: ['$end', '$start'] }, 1000 * 60],
            },
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$start',
              },
            },
            user: { $arrayElemAt: ['$userInfo', 0] },
            task: { $arrayElemAt: ['$taskInfo', 0] },
          },
        },
        {
          $group: {
            _id: {
              date: '$date',
              userId: '$user._id',
              taskId: '$task._id',
            },
            userName: { $first: '$user.firstName' },
            userLastName: { $first: '$user.lastName' },
            taskTitle: { $first: '$task.title' },
            totalMinutes: { $sum: '$duration' },
            sessions: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: {
              date: '$_id.date',
              userId: '$_id.userId',
            },
            userName: { $first: '$userName' },
            userLastName: { $first: '$userLastName' },
            totalMinutes: { $sum: '$totalMinutes' },
            taskCount: { $sum: 1 },
            timeLogs: {
              $push: {
                taskId: '$_id.taskId',
                taskTitle: '$taskTitle',
                minutes: { $round: ['$totalMinutes', 1] },
                sessions: '$sessions',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id.date',
            userId: '$_id.userId',
            userName: {
              $concat: ['$userName', ' ', '$userLastName'],
            },
            totalMinutes: { $round: ['$totalMinutes', 1] },
            taskCount: 1,
            timeLogs: 1,
          },
        },
        { $sort: { date: -1 as const, userName: 1 as const } },
      ];

      // Get total count for pagination
      const countPipeline = [...aggregationPipeline, { $count: 'totalCount' }];

      const countResult = await TimeLogModel.aggregate(countPipeline);
      const totalItems = countResult[0]?.totalCount || 0;
      const totalPages = Math.ceil(totalItems / limit);

      // Get paginated data
      const dataPipeline = [
        ...aggregationPipeline,
        { $skip: skip },
        { $limit: limit },
      ];

      const dailyTimeLogs = await TimeLogModel.aggregate(dataPipeline);

      // Calculate metrics for the entire date range
      const metricsPipeline = [
        { $match: matchCondition },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        {
          $lookup: {
            from: 'tasks',
            localField: 'task',
            foreignField: '_id',
            as: 'taskInfo',
          },
        },
        {
          $addFields: {
            duration: {
              $divide: [{ $subtract: ['$end', '$start'] }, 1000 * 60],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalMinutes: { $sum: '$duration' },
            totalSessions: { $sum: 1 },
            uniqueUsers: { $addToSet: '$user' },
            uniqueTasks: { $addToSet: '$task' },
          },
        },
        {
          $project: {
            _id: 0,
            totalMinutes: { $round: ['$totalMinutes', 1] },
            totalSessions: 1,
            totalUsers: { $size: '$uniqueUsers' },
            totalTasks: { $size: '$uniqueTasks' },
            averageMinutesPerUser: {
              $round: [
                { $divide: ['$totalMinutes', { $size: '$uniqueUsers' }] },
                1,
              ],
            },
            averageMinutesPerTask: {
              $round: [
                { $divide: ['$totalMinutes', { $size: '$uniqueTasks' }] },
                1,
              ],
            },
          },
        },
      ];

      const metricsResult = await TimeLogModel.aggregate(metricsPipeline);
      const metrics: TimeLogMetrics = metricsResult[0] || {
        totalMinutes: 0,
        totalUsers: 0,
        totalTasks: 0,
        totalSessions: 0,
        averageMinutesPerUser: 0,
        averageMinutesPerTask: 0,
      };

      Logger.debug(
        `Retrieved ${dailyTimeLogs.length} daily time log entries for date range ${startDate.toISOString()} - ${endDate.toISOString()}`
      );

      return {
        data: dailyTimeLogs as DailyTimeLogEntry[],
        metrics,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      Logger.error('Error getting daily time logs by date range:', error);
      throw new DatabaseError(
        'Failed to get daily time logs by date range',
        error
      );
    }
  }
}
