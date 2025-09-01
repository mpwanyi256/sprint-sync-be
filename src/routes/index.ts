import express from 'express';
import authRoutes from './auth';
import taskRoutes from './task';
import aiRoutes from './ai';
import userRoutes from './users';
import healthRoutes from './health';
import timeLogRoutes from './timeLog';
import adminRoutes from './admin';
import apiKey from '../middleware/api-key';
import permission from '../middleware/permission';
import { Permission } from '../types/AppRequests';

const router = express.Router();

// Public routes (no authentication required)
router.use('/health', healthRoutes);

// Setup API middleware for protected routes
router.use(apiKey);
router.use(permission(Permission.GENERAL));

// Protected routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);
router.use('/users', userRoutes);
router.use('/timelogs', timeLogRoutes);
router.use('/admin', adminRoutes);

export default router;
