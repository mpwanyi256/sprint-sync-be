import mongoose from 'mongoose';
import { connectToDatabase } from '../database';
import {
  createTestUser,
  createTestTask,
  createTestApiKey,
  createTestKeystore,
} from './utils/testData';

// Mock the JWT module globally
jest.mock('../core/JWT');

// Global test data that will be available to all tests
declare global {
  // eslint-disable-next-line no-var
  var __TEST_DATA__:
    | {
        adminUser: any;
        regularUser: any;
        tasks: any[];
        adminKeystore: any;
        regularUserKeystore: any;
        apiKey: any;
      }
    | undefined;
}

beforeAll(async () => {
  // Connect to test database
  await connectToDatabase();

  // Set up JWT mock with default implementations
  const mockJWT = require('../core/JWT').default;

  // Set default mock implementations
  mockJWT.validate.mockResolvedValue({
    aud: 'test-audience',
    sub: '507f1f77bcf86cd799439011', // Default user ID
    iss: 'test-issuer',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    prm: 'test-param',
  });

  mockJWT.encode.mockResolvedValue('mock-jwt-token');

  mockJWT.decode.mockResolvedValue({
    aud: 'test-audience',
    sub: '507f1f77bcf86cd799439011',
    iss: 'test-issuer',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    prm: 'test-param',
  });

  // Create test data that will be available to all tests
  console.log('Creating test data...');

  // Create admin user
  const adminUser = await createTestUser({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    isAdmin: true,
  });

  // Create regular user
  const regularUser = await createTestUser({
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@test.com',
    isAdmin: false,
  });

  // Create keystores for both users
  const adminKeystore = await createTestKeystore(adminUser._id.toString());
  const regularUserKeystore = await createTestKeystore(
    regularUser._id.toString()
  );

  // Create a single API key for all tests
  const apiKey = await createTestApiKey();

  // Create tasks with different statuses
  const tasks: any[] = [];

  // TODO tasks
  for (let i = 1; i <= 3; i++) {
    tasks.push(
      await createTestTask({
        title: `TODO Task ${i}`,
        description: `Description for TODO task ${i}`,
        status: 'TODO',
        createdBy: regularUser._id,
      })
    );
  }

  // IN_PROGRESS tasks
  for (let i = 1; i <= 2; i++) {
    tasks.push(
      await createTestTask({
        title: `In Progress Task ${i}`,
        description: `Description for in progress task ${i}`,
        status: 'IN_PROGRESS',
        createdBy: regularUser._id,
      })
    );
  }

  // DONE tasks (not COMPLETED)
  for (let i = 1; i <= 2; i++) {
    tasks.push(
      await createTestTask({
        title: `Done Task ${i}`,
        description: `Description for done task ${i}`,
        status: 'DONE',
        createdBy: regularUser._id,
      })
    );
  }

  // Make test data available globally
  global.__TEST_DATA__ = {
    adminUser,
    regularUser,
    tasks,
    adminKeystore,
    regularUserKeystore,
    apiKey,
  };

  console.log('Test data created successfully');
  console.log(`- Admin user: ${adminUser._id}`);
  console.log(`- Regular user: ${regularUser._id}`);
  console.log(`- Tasks created: ${tasks.length}`);
  console.log(`- API key: ${apiKey.key}`);
});

beforeEach(async () => {
  // No need to clear collections before each test since we're using the same data
  // The JWT mock will be updated by individual tests as needed
});

afterAll(async () => {
  // Clean up all test data
  console.log('Cleaning up test data...');

  if (global.__TEST_DATA__) {
    const {
      adminUser,
      regularUser,
      tasks,
      adminKeystore,
      regularUserKeystore,
      apiKey,
    } = global.__TEST_DATA__;

    // Delete all tasks
    for (const task of tasks) {
      await mongoose.model('Task').findByIdAndDelete(task._id);
    }

    // Delete keystores
    await mongoose.model('Keystore').findByIdAndDelete(adminKeystore._id);
    await mongoose.model('Keystore').findByIdAndDelete(regularUserKeystore._id);

    // Delete API key
    await mongoose.model('ApiKey').findByIdAndDelete(apiKey._id);

    // Delete users
    await mongoose.model('User').findByIdAndDelete(adminUser._id);
    await mongoose.model('User').findByIdAndDelete(regularUser._id);

    // Clear global test data
    global.__TEST_DATA__ = undefined;
  }

  // Close database connection after all tests
  await mongoose.connection.close();

  console.log('Test data cleanup completed');
});
