import request from 'supertest';
import app from '../../app';

export const getApiAgent = () => request(app);

export const getTestData = () => {
  if (!(global as any).__TEST_DATA__) {
    throw new Error('Test data not initialized. Make sure setup.ts has run.');
  }
  return (global as any).__TEST_DATA__;
};
