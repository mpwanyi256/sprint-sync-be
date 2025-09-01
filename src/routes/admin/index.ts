import { Router } from 'express';
import authentication from '../../middleware/authentication';
import { createUsers } from './createUsers';
import { createTasks } from './createTasks';
import { updateUserRole } from './updateUserRole';

const router = Router();

// All admin routes require authentication
router.use(authentication);

// Admin route for bulk user creation
router.post('/users', createUsers);

// Admin route for bulk task creation
router.post('/tasks', createTasks);

// Admin route for updating user admin status
router.patch('/users/:userId/role', updateUserRole);

export default router;
