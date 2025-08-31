import request from 'supertest';
import app from '../../app';

describe('Health Route', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe('10000'); // Application success code
      expect(response.body.message).toBe('Health check successful');
      expect(response.body.data).toHaveProperty('status', 'OK');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('environment');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('memory');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 5000); // Within last 5 seconds
    });

    it('should return memory usage information', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      const memory = response.body.data.memory;
      expect(memory).toHaveProperty('used');
      expect(memory).toHaveProperty('total');
      expect(typeof memory.used).toBe('number');
      expect(typeof memory.total).toBe('number');
      expect(memory.used).toBeGreaterThan(0);
      expect(memory.total).toBeGreaterThan(0);
    });

    it('should return environment and version information', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('environment');
      expect(response.body.data).toHaveProperty('node');
      expect(typeof response.body.data.environment).toBe('string');
      expect(typeof response.body.data.node).toBe('string');
    });

    it('should return uptime as positive number', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      const uptime = response.body.data.uptime;
      expect(typeof uptime).toBe('number');
      expect(uptime).toBeGreaterThan(0);
    });
  });
});
