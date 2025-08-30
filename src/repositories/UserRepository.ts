import { UserModel } from '../models/User';
import { User } from '../types/User';
import { DatabaseError } from '../core/ApiErrors';
import {
  IUserRepository,
  CreateUserDto,
  UserFilters,
  PaginationOptions,
  PaginatedUsersResult,
} from './interfaces/IUserRepository';
import Logger from '../core/Logger';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email })
        .select('+firstName +lastName +email +password +isAdmin')
        .lean()
        .exec();

      if (!user) {
        Logger.debug(`User not found for email: ${email}`);
        return null;
      }

      Logger.debug(`User found for email: ${email}`);
      return user as User;
    } catch (error: any) {
      Logger.error('Error finding user by email:', error);
      throw new DatabaseError('Failed to find user by email', error);
    }
  }

  async create(userData: CreateUserDto): Promise<User> {
    try {
      const user = await UserModel.create(userData);
      Logger.info(`User created with email: ${userData.email}`);
      return user.toObject() as User;
    } catch (error: any) {
      Logger.error('Error creating user:', error);
      if (error.code === 11000) {
        throw new DatabaseError('User with this email already exists', error);
      }
      throw new DatabaseError('Failed to create user', error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(id)
        .select('+firstName +lastName +email +isAdmin')
        .lean()
        .exec();

      if (!user) {
        Logger.debug(`User not found for id: ${id}`);
        return null;
      }

      return user as User;
    } catch (error: any) {
      Logger.error('Error finding user by id:', error);
      throw new DatabaseError('Failed to find user by id', error);
    }
  }

  async getAllUsersWithPagination(
    filters: UserFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedUsersResult> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Build filter query
      const filterQuery: any = {};

      if (filters.search) {
        filterQuery.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.isAdmin !== undefined) {
        filterQuery.isAdmin = filters.isAdmin;
      }

      // Get total count for pagination
      const totalItems = await UserModel.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalItems / limit);

      // Get paginated results
      const users = await UserModel.find(filterQuery)
        .select('firstName lastName email isAdmin createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      Logger.debug(
        `Found ${users.length} users with filters and pagination. Page ${page}/${totalPages}, Total: ${totalItems}`
      );

      return {
        users: users as User[],
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error: any) {
      Logger.error('Error finding users with pagination:', error);
      throw new DatabaseError('Failed to find users with pagination', error);
    }
  }
}
