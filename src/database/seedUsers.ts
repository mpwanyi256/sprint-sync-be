import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
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

const loadSeedData = (): SeedUser[] => {
  try {
    const seedFilePath = path.join(__dirname, 'seed.json');
    const seedData = fs.readFileSync(seedFilePath, 'utf8');
    const parsedData = JSON.parse(seedData);
    
    if (!parsedData.users || !Array.isArray(parsedData.users)) {
      throw new Error('Invalid seed data format. Expected "users" array.');
    }
    
    Logger.info(`Loaded ${parsedData.users.length} users from seed file`);
    return parsedData.users;
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
      Logger.info(`Database already contains ${existingUsers} users. Skipping user seeding.`);
      return;
    }

    // Load seed data from JSON file
    const userData = loadSeedData();

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      userData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    // Insert all users
    const result = await UserModel.insertMany(hashedUsers);
    
    Logger.info(`Successfully seeded ${result.length} users:`);
    result.forEach(user => {
      Logger.info(`- ${user.firstName} ${user.lastName} (${user.email})`);
    });

  } catch (error) {
    Logger.error('Error seeding users:', error);
    throw error;
  }
};

// If running this file directly
if (require.main === module) {
  import('../database').then(async ({ connectToDatabase }) => {
    try {
      await connectToDatabase();
      await seedUsers();
      Logger.info('User seeding completed successfully');
      process.exit(0);
    } catch (error) {
      Logger.error('User seeding failed:', error);
      process.exit(1);
    }
  });
}
