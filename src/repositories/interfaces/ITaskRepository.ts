import { ITask } from '../../models/Task';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface ITaskWithTimeSpent extends ITask {
  totalTimeSpent: number;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  createdBy: string;
  totalMinutes: number;
  status?: TaskStatus;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  totalMinutes?: number;
  status?: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus;
  assignee?: string;
  createdBy?: string;
  title?: string;
  description?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedTasksResult {
  tasks: ITask[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginatedTasksWithTimeSpentResult {
  tasks: ITaskWithTimeSpent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ITaskRepository {
  create(taskData: CreateTaskDto): Promise<ITask>;
  findById(id: string): Promise<ITask | null>;
  findByUser(userId: string): Promise<ITask[]>;
  findAll(): Promise<ITask[]>;
  findAllWithPagination(
    filters: TaskFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedTasksResult>;
  update(id: string, taskData: UpdateTaskDto): Promise<ITask | null>;
  delete(id: string): Promise<boolean>;
  searchByText(searchTerm: string): Promise<ITask[]>;
  assignTask(
    taskId: string,
    assignedTo: string,
    assignedBy: string
  ): Promise<ITask | null>;
  unassignTask(taskId: string, userId: string): Promise<ITask | null>;
}
