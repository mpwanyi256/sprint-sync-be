import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { TaskModel } from '../models/Task';
import Logger from '../core/Logger';
import * as fs from 'fs';
import * as path from 'path';

interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

interface SeedTask {
  title: string;
  description: string;
  totalMinutes: number;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

interface SeedData {
  users: SeedUser[];
  tasks: SeedTask[];
  metadata: {
    version: string;
    description: string;
    lastUpdated: string;
    notes: string;
  };
}

const loadSeedData = (): SeedData => {
  try {
    const seedFilePath = path.join(__dirname, 'seed.json');
    const seedData = fs.readFileSync(seedFilePath, 'utf8');
    const parsedData = JSON.parse(seedData);

    if (!parsedData.users || !Array.isArray(parsedData.users)) {
      throw new Error('Invalid seed data format. Expected "users" array.');
    }

    if (!parsedData.tasks || !Array.isArray(parsedData.tasks)) {
      throw new Error('Invalid seed data format. Expected "tasks" array.');
    }

    Logger.info(
      `Loaded ${parsedData.users.length} users and ${parsedData.tasks.length} tasks from seed file`
    );
    return parsedData;
  } catch (error) {
    Logger.error('Error loading seed data:', error);
    throw new Error('Failed to load seed data from JSON file');
  }
};

export const seedUsers = async (): Promise<void> => {
  try {
    Logger.info('Starting user seeding process...');

    // Check if users already exist
    const existingUsers = await UserModel.countDocuments();
    if (existingUsers > 1) {
      Logger.info(
        `Database already contains ${existingUsers} users. Skipping user seeding.`
      );
      return;
    }

    // Load seed data from JSON file
    const { users } = loadSeedData();

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    // Insert all users
    const result = await UserModel.insertMany(hashedUsers);

    Logger.info(`Successfully seeded ${result.length} users:`);
    result.forEach(user => {
      Logger.info(
        `- ${user.firstName} ${user.lastName} (${user.email}) - Admin: ${user.isAdmin}`
      );
    });
  } catch (error) {
    Logger.error('Error seeding users:', error);
    throw error;
  }
};

export const seedTasks = async (): Promise<void> => {
  try {
    Logger.info('Starting task seeding process...');

    // Check if tasks already exist
    const existingTasks = await TaskModel.countDocuments();
    if (existingTasks > 0) {
      Logger.info(
        `Database already contains ${existingTasks} tasks. Skipping task seeding.`
      );
      return;
    }

    // Get the first user (admin) to assign as creator
    const adminUser = await UserModel.findOne({ isAdmin: true });
    if (!adminUser) {
      Logger.error('No admin user found. Please seed users first.');
      throw new Error('Admin user required for task seeding');
    }

    // Load seed data from JSON file
    const { tasks } = loadSeedData();

    // Add creator to tasks
    const tasksWithCreator = tasks.map(task => ({
      ...task,
      createdBy: adminUser._id,
    }));

    // Insert all tasks
    const result = await TaskModel.insertMany(tasksWithCreator);

    Logger.info(`Successfully seeded ${result.length} tasks:`);
    result.forEach(task => {
      Logger.info(
        `- ${task.title} (${task.status}) - ${task.totalMinutes} minutes`
      );
    });
  } catch (error) {
    Logger.error('Error seeding tasks:', error);
    throw error;
  }
};

export const seedData = async (): Promise<void> => {
  try {
    Logger.info('Starting complete data seeding process...');

    await seedUsers();
    await seedTasks();

    Logger.info('Data seeding completed successfully');
  } catch (error) {
    Logger.error('Data seeding failed:', error);
    throw error;
  }
};

// If running this file directly
if (require.main === module) {
  import('../database').then(async ({ connectToDatabase }) => {
    try {
      await connectToDatabase();
      await seedData();
      Logger.info('Complete data seeding completed successfully');
      process.exit(0);
    } catch (error) {
      Logger.error('Data seeding failed:', error);
      process.exit(1);
    }
  });
}
