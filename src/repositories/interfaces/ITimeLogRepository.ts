import { ITimeLog } from '../../models/TimeLog';

export interface CreateTimeLogDto {
  task: string;
  user: string;
  start?: Date;
}

export interface UpdateTimeLogDto {
  end?: Date;
}

export interface ITimeLogRepository {
  create(timeLogData: CreateTimeLogDto): Promise<ITimeLog>;
  findById(id: string): Promise<ITimeLog | null>;
  findActiveTimeLogForUserAndTask(
    userId: string,
    taskId: string
  ): Promise<ITimeLog | null>;
  findByTask(taskId: string): Promise<ITimeLog[]>;
  findByUser(userId: string): Promise<ITimeLog[]>;
  update(id: string, timeLogData: UpdateTimeLogDto): Promise<ITimeLog | null>;
  delete(id: string): Promise<boolean>;
  getTotalTimeSpentOnTask(taskId: string): Promise<number>;
}
