import { Router } from 'express';
import authentication from '../../middleware/authentication';
import getTasks from './getTasks';
import createTask from './createTask';
import updateTask from './updateTask';
import deleteTask from './deleteTask';
import assignTask from './assignTask';

const router = Router();

// Authentication middleware
router.use(authentication);

router.use('/', getTasks);
router.use('/', createTask);
router.use('/', updateTask);
router.use('/', deleteTask);
router.use('/', assignTask);

export default router;
