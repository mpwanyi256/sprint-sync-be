import express from 'express';
import suggestRoutes from './suggest';

const router = express.Router();

router.use('/suggest', suggestRoutes);

export default router;
