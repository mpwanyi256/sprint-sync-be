import express from 'express';
import authRoutes from './auth';
import taskRoutes from './task';
import apiKey from '../middleware/api-key';
import permission from '../middleware/permission';
import { Permission } from '../types/AppRequests';

const router = express.Router();

// Setup API middleware
router.use(apiKey);
router.use(permission(Permission.GENERAL));

// Other routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router;
