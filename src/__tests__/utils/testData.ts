import bcrypt from 'bcrypt';
import { UserModel } from '../../models/User';
import { TaskModel } from '../../models/Task';
import { ApiKeyModel } from '../../models/ApiKey';
import { KeystoreModel } from '../../models/KeyStore';
import { Types } from 'mongoose';

export const createTestUser = async (overrides: any = {}) => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const userData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: hashedPassword,
    isAdmin: false,
    ...overrides,
  };

  return await UserModel.create(userData);
};

export const createTestAdmin = async (overrides: any = {}) => {
  return await createTestUser({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    isAdmin: true,
    ...overrides,
  });
};

export const createTestTask = async (overrides: any = {}) => {
  const taskData = {
    title: 'Test Task',
    description: 'This is a test task',
    status: 'TODO',
    priority: 'MEDIUM',
    totalMinutes: 1,
    createdBy: new Types.ObjectId(),
    ...overrides,
  };

  return await TaskModel.create(taskData);
};

export const createTestTaskForUser = async (
  userId: string,
  overrides: any = {}
) => {
  const taskData = {
    title: 'Test Task',
    description: 'This is a test task',
    status: 'TODO',
    priority: 'MEDIUM',
    totalMinutes: 1,
    createdBy: userId,
    ...overrides,
  };

  return await TaskModel.create(taskData);
};

export const createTestApiKey = async (overrides: any = {}) => {
  const apiKeyData = {
    key: 'test-api-key-123',
    version: 1,
    permissions: ['GENERAL'],
    comments: ['Test API key'],
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  return await ApiKeyModel.create(apiKeyData);
};

export const createTestKeystore = async (
  userId: string,
  overrides: any = {}
) => {
  const keystoreData = {
    client: userId,
    primaryKey: 'test-primary-key',
    secondaryKey: 'test-secondary-key',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  return await KeystoreModel.create(keystoreData);
};
