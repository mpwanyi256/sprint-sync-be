import { User } from '../../types/User';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface UserFilters {
  search?: string;
  isAdmin?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedUsersResult {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  updateById(id: string, updateData: Partial<User>): Promise<User | null>;
  getAllUsersWithPagination(
    filters: UserFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedUsersResult>;
}
