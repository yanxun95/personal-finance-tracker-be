import { Router } from 'express';
import { getAll, create, update } from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All category routes require authentication
router.use(authenticate);

router.get('/', getAll);
router.post('/', create);
router.patch('/', update);

export default router;
