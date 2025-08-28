import { Router } from 'express';
import authentication from '../../middleware/authentication';
import getTasks from './getTasks';
import createTask from './createTask';
import updateTask from './updateTask';
import deleteTask from './deleteTask';

const router = Router();

// Authentication middleware
router.use(authentication);

router.use('/', getTasks);
router.use('/', createTask);
router.use('/', updateTask);
router.use('/', deleteTask);

export default router;
