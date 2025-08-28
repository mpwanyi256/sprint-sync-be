import { ITask } from '../../models/Task';

export interface CreateTaskDto {
  title: string;
  description: string;
  createdBy: string;
  totalMinutes: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  totalMinutes?: number;
}

export interface TaskFilters {
  status?: string;
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

export interface ITaskRepository {
  create(taskData: CreateTaskDto): Promise<ITask>;
  findById(id: string): Promise<ITask | null>;
  findByUser(userId: string): Promise<ITask[]>;
  findAll(): Promise<ITask[]>;
  findAllWithPagination(filters: TaskFilters, pagination: PaginationOptions): Promise<PaginatedTasksResult>;
  update(id: string, taskData: UpdateTaskDto): Promise<ITask | null>;
  delete(id: string): Promise<boolean>;
  searchByText(searchTerm: string): Promise<ITask[]>;
}
