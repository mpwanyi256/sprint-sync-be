import { User } from "../../types/User";
import { BadRequestError } from "../../core/ApiErrors";
import { UserRepository } from "../../repositories/UserRepository";
import { KeystoreRepository } from "../../repositories/KeystoreRepository";
import { IUserRepository, CreateUserDto, UserFilters, PaginationOptions, PaginatedUsersResult } from "../../repositories/interfaces/IUserRepository";
import { IKeystoreRepository } from "../../repositories/interfaces/IKeystoreRepository";
import bcrypt from 'bcrypt';
import Logger from '../../core/Logger';

export class UserService {
    constructor(
        private userRepo: IUserRepository = new UserRepository(),
        private keystoreRepo: IKeystoreRepository = new KeystoreRepository()
    ) {}

    async createUserWithKeystore(userData: CreateUserDto, accessKey: string, refreshKey: string) {
        const existingUser = await this.userRepo.findByEmail(userData.email);
        if (existingUser) {
            throw new BadRequestError('User already registered');
        }

        const user = await this.userRepo.create(userData);
        const keystore = await this.keystoreRepo.create(user, accessKey, refreshKey);
        
        Logger.info(`User successfully created and keystore assigned: ${userData.email}`);
        
        return { user, keystore };
    }

    async authenticateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new BadRequestError('User not found');
        }
        
        if (!user.password) {
            throw new BadRequestError('User password not found');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new BadRequestError('Invalid password');
        }

        Logger.info(`User successfully authenticated: ${email}`);
        return user;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return await this.userRepo.findByEmail(email);
    }

    async findUserById(id: string): Promise<User | null> {
        return await this.userRepo.findById(id);
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new BadRequestError('User not found');
        }
        return user;
    }

    async getAllUsersWithPagination(filters: UserFilters, pagination: PaginationOptions): Promise<PaginatedUsersResult> {
        // Validate pagination parameters
        if (pagination.page < 1) {
            throw new BadRequestError('Page number must be at least 1');
        }
        
        if (pagination.limit < 1 || pagination.limit > 100) {
            throw new BadRequestError('Limit must be between 1 and 100');
        }
        
        Logger.debug(`Fetching users with pagination. Page: ${pagination.page}, Limit: ${pagination.limit}, Filters:`, JSON.stringify(filters));
        
        const result = await this.userRepo.getAllUsersWithPagination(filters, pagination);
        
        Logger.debug(`User service returned ${result.users.length} users`);
        
        return result;
    }
}

// Export service instance for backward compatibility
export const userService = new UserService();

// Export individual functions for backward compatibility
export const createUser = async (
    user: User,
    accessTokenKey: string,
    refreshTokenKey: string,
) => {
    return await userService.createUserWithKeystore(user as CreateUserDto, accessTokenKey, refreshTokenKey);
}

export const findUserByEmail = async (email: string) => {
    return await userService.findUserByEmail(email);
}
