import { User } from '../../types/User';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
}
