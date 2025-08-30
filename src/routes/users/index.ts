import { Router } from 'express';
import authentication from '../../middleware/authentication';
import getUsers from './getUsers';

const router = Router();

// Authentication middleware
router.use(authentication);

router.use('/', getUsers);

export default router;
