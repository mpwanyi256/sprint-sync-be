import { ITimeLog } from '../../models/TimeLog';

export interface CreateTimeLogDto {
  task: string;
  user: string;
  start?: Date;
}

export interface UpdateTimeLogDto {
  end?: Date;
}

export interface DailyTimeLogEntry {
  date: string;
  userId: string;
  userName: string;
  totalMinutes: number;
  taskCount: number;
  timeLogs: {
    taskId: string;
    taskTitle: string;
    minutes: number;
    sessions: number;
  }[];
}

export interface TimeLogMetrics {
  totalMinutes: number;
  totalUsers: number;
  totalTasks: number;
  totalSessions: number;
  averageMinutesPerUser: number;
  averageMinutesPerTask: number;
}

export interface PaginatedDailyTimeLogsResult {
  data: DailyTimeLogEntry[];
  metrics: TimeLogMetrics;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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
  getDailyTimeLogsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    userId?: string
  ): Promise<PaginatedDailyTimeLogsResult>;
}
