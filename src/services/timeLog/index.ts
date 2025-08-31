import { ITimeLog } from '../../models/TimeLog';
import { BadRequestError, NotFoundError } from '../../core/ApiErrors';
import { TimeLogRepository } from '../../repositories/TimeLogRepository';
import {
  ITimeLogRepository,
  CreateTimeLogDto,
  UpdateTimeLogDto,
  PaginatedDailyTimeLogsResult,
} from '../../repositories/interfaces/ITimeLogRepository';
import Logger from '../../core/Logger';

export class TimeLogService {
  constructor(
    private timeLogRepo: ITimeLogRepository = new TimeLogRepository()
  ) {}

  async createTimeLog(timeLogData: CreateTimeLogDto): Promise<ITimeLog> {
    if (!timeLogData.task || !timeLogData.user) {
      throw new BadRequestError('Task ID and User ID are required');
    }

    Logger.info(
      `Creating time log for task: ${timeLogData.task} by user: ${timeLogData.user}`
    );

    const timeLog = await this.timeLogRepo.create(timeLogData);
    Logger.info(`TimeLog created successfully with ID: ${timeLog._id}`);

    return timeLog;
  }

  async getTimeLogById(id: string): Promise<ITimeLog> {
    const timeLog = await this.timeLogRepo.findById(id);
    if (!timeLog) {
      throw new NotFoundError('TimeLog not found');
    }
    return timeLog;
  }

  async getActiveTimeLogForUserAndTask(
    userId: string,
    taskId: string
  ): Promise<ITimeLog | null> {
    Logger.debug(
      `Checking for active time log for user: ${userId} and task: ${taskId}`
    );
    return await this.timeLogRepo.findActiveTimeLogForUserAndTask(
      userId,
      taskId
    );
  }

  async getTimeLogsByTask(taskId: string): Promise<ITimeLog[]> {
    Logger.debug(`Fetching time logs for task: ${taskId}`);
    return await this.timeLogRepo.findByTask(taskId);
  }

  async getTimeLogsByUser(userId: string): Promise<ITimeLog[]> {
    Logger.debug(`Fetching time logs for user: ${userId}`);
    return await this.timeLogRepo.findByUser(userId);
  }

  async updateTimeLog(
    id: string,
    timeLogData: UpdateTimeLogDto
  ): Promise<ITimeLog> {
    const existingTimeLog = await this.timeLogRepo.findById(id);
    if (!existingTimeLog) {
      throw new NotFoundError('TimeLog not found');
    }

    Logger.info(`Updating time log: ${id}`);

    const updatedTimeLog = await this.timeLogRepo.update(id, timeLogData);
    if (!updatedTimeLog) {
      throw new NotFoundError('TimeLog not found during update');
    }

    Logger.info(`TimeLog updated successfully: ${updatedTimeLog._id}`);
    return updatedTimeLog;
  }

  async endTimeLog(id: string): Promise<ITimeLog> {
    return await this.updateTimeLog(id, { end: new Date() });
  }

  async endActiveTimeLog(
    userId: string,
    taskId: string
  ): Promise<ITimeLog | null> {
    const activeTimeLog = await this.getActiveTimeLogForUserAndTask(
      userId,
      taskId
    );

    if (!activeTimeLog) {
      Logger.debug(
        `No active time log found to end for user: ${userId} and task: ${taskId}`
      );
      return null;
    }

    Logger.info(
      `Ending active time log for user: ${userId} and task: ${taskId}`
    );
    return await this.endTimeLog(activeTimeLog._id!.toString());
  }

  async deleteTimeLog(id: string): Promise<boolean> {
    const existingTimeLog = await this.timeLogRepo.findById(id);
    if (!existingTimeLog) {
      throw new NotFoundError('TimeLog not found');
    }

    Logger.info(`Deleting time log: ${id}`);

    const success = await this.timeLogRepo.delete(id);
    if (success) {
      Logger.info(`TimeLog deleted successfully: ${id}`);
    }

    return success;
  }

  async getTotalTimeSpentOnTask(taskId: string): Promise<number> {
    Logger.debug(`Calculating total time spent on task: ${taskId}`);
    return await this.timeLogRepo.getTotalTimeSpentOnTask(taskId);
  }

  async startTimeLog(userId: string, taskId: string): Promise<ITimeLog> {
    // Check if there's already an active time log for this user and task
    const activeTimeLog = await this.getActiveTimeLogForUserAndTask(
      userId,
      taskId
    );

    if (activeTimeLog) {
      throw new BadRequestError(
        'There is already an active time log for this task'
      );
    }

    // Create new time log
    return await this.createTimeLog({
      user: userId,
      task: taskId,
      start: new Date(),
    });
  }

  async getDailyTimeLogsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<PaginatedDailyTimeLogsResult> {
    // Validate inputs
    if (startDate > endDate) {
      throw new BadRequestError('Start date must be before end date');
    }

    if (page < 1) {
      throw new BadRequestError('Page number must be at least 1');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    // Calculate date range (ensure we capture the full day in UTC)
    const startOfDay = new Date(
      startDate.toISOString().split('T')[0] + 'T00:00:00.000Z'
    );
    const endOfDay = new Date(
      endDate.toISOString().split('T')[0] + 'T23:59:59.999Z'
    );

    Logger.debug(
      `Fetching daily time logs from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}${
        userId ? ` for user: ${userId}` : ''
      }`
    );

    return await this.timeLogRepo.getDailyTimeLogsByDateRange(
      startOfDay,
      endOfDay,
      page,
      limit,
      userId
    );
  }
}

// Export service instance for backward compatibility
export const timeLogService = new TimeLogService();
