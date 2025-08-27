import express from 'express';
import authRoutes from './auth';
import apiKey from '../middleware/api-key';

const router = express.Router();

// Setup API middleware
router.use(apiKey);

// Other routes
router.use('/auth', authRoutes);

export default router;
