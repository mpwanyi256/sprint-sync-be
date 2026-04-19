import { Router } from 'express';
import authentication from '../../middleware/authentication';
import assignTask from './assignTask';
import commentsRouter from './comments';
import createTask from './createTask';
import deleteTask from './deleteTask';
import getTasks from './getTasks';
import updateTask from './updateTask';

const router = Router();

// Authentication middleware
router.use(authentication);

router.use('/', getTasks);
router.use('/', createTask);
router.use('/', updateTask);
router.use('/', deleteTask);
router.use('/', assignTask);

// Task comments
router.use('/:taskId/comments', commentsRouter);

export default router;
