import { db } from './index';
import Logger from '../core/Logger';
import { UserModel } from '../models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createUser } from '../services/user';
import { User } from '../types/User';
import crypto from 'crypto';

const populateAPIKeys = async () => {
  try {
    Logger.info('Populating API Keys');

    // Check if the database connection is available
    if (!mongoose.connection.db) {
      throw new Error('Database connection not available');
    }

    // Check if the collection exists, if not create it
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map(
      (collection: { name: string }) => collection.name
    );

    if (!collectionNames.includes('api_keys')) {
      await mongoose.connection.createCollection('api_keys');
      Logger.info('Created api_keys collection');
    }

    // Check if API key already exists to avoid duplicates
    const existingKey = await mongoose.connection
      .collection('api_keys')
      .findOne({});

    if (!existingKey) {
      const result = await mongoose.connection
        .collection('api_keys')
        .insertOne({
          metadata: 'To be used by the API developers',
          key: db.apikey || 'default-api-key',
          permissions: ['GENERAL'],
          version: 1,
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      Logger.info(`API Key inserted with ID: ${result.insertedId}`);
    } else {
      Logger.info('API Key already exists, skipping insertion');
    }
  } catch (error) {
    Logger.error('Error populating API Keys:', error);
    throw error;
  }
};

const poulateAdminUser = async () => {
  try {
    Logger.info('Populating Admin User');
    const existingAdmin = await UserModel.findOne({ isAdmin: true });
    if (!existingAdmin) {
      const accessTokenKey = crypto.randomBytes(64).toString('hex');
      const refreshTokenKey = crypto.randomBytes(64).toString('hex');
      await createUser(
        {
          firstName: 'Admin',
          lastName: 'Account',
          email: 'admin@sprintsync.com',
          isAdmin: true,
          password: await bcrypt.hash('admin1234', 10),
        } as User,
        accessTokenKey,
        refreshTokenKey
      );
      Logger.info('Admin User created successfully');
    } else {
      Logger.info('Admin User already exists, skipping creation');
    }
  } catch (error) {
    Logger.error('Error populating Admin User:', error);
    throw error;
  }
};

export const initCollection = async (collectionName: string) => {
  try {
    switch (collectionName) {
      case 'api_keys':
        await populateAPIKeys();
        break;
      case 'users':
        await poulateAdminUser();
        break;
      default:
        Logger.warn(
          `Collection initialization not implemented for: ${collectionName}`
        );
    }
  } catch (error) {
    Logger.error(`Error initializing collection ${collectionName}:`, error);
    throw error;
  }
};

export const initializeDBData = async (mongoose: typeof import('mongoose')) => {
  try {
    Logger.info('Initializing DB Data');
    if (!mongoose) {
      Logger.warn('Mongoose instance not provided');
      return;
    }

    if (!mongoose.connection.db) {
      Logger.warn('Database connection not available');
      return;
    }

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    const collectionNames = collections.map(
      (collection: { name: string }) => collection.name
    );
    Logger.debug(`Existing collections: ${collectionNames.join(', ')}`);

    const operations = [];

    // Initialize required collections
    if (!collectionNames.includes('api_keys')) {
      Logger.info('Initializing api_keys collection');
      operations.push(initCollection('api_keys'));
    } else {
      Logger.info('api_keys collection already exists');
    }

    // Setup Admin account
    if (!collectionNames.includes('users')) {
      Logger.info('Initializing users collection');
      operations.push(initCollection('users'));
    } else {
      Logger.info('users collection already exists');
    }

    await Promise.all(operations);

    Logger.info('Database initialization completed successfully');
  } catch (error) {
    Logger.error('Error initializing database data:', error);
    throw error;
  }
};
