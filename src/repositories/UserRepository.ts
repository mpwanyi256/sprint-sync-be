import { UserModel } from '../models/User';
import { User } from '../types/User';
import { DatabaseError } from '../core/ApiErrors';
import { IUserRepository, CreateUserDto } from './interfaces/IUserRepository';
import Logger from '../core/Logger';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel
        .findOne({ email })
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
      const user = await UserModel
        .findById(id)
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
}
