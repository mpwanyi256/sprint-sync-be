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

export interface ITaskRepository {
  create(taskData: CreateTaskDto): Promise<ITask>;
  findById(id: string): Promise<ITask | null>;
  findByUser(userId: string): Promise<ITask[]>;
  findAll(): Promise<ITask[]>;
  update(id: string, taskData: UpdateTaskDto): Promise<ITask | null>;
  delete(id: string): Promise<boolean>;
  searchByText(searchTerm: string): Promise<ITask[]>;
}
