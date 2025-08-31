import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export default async function globalSetup() {
  // Start in-memory MongoDB instance for testing
  mongod = await MongoMemoryServer.create({
    binary: {
      version: '7.0.0',
    },
  });

  const uri = mongod.getUri();
  process.env.DB_URI = uri;
  process.env.NODE_ENV = 'test';

  // Store the instance for global teardown
  (global as any).__MONGOD__ = mongod;

  console.log('Test database setup complete:', uri);
}
