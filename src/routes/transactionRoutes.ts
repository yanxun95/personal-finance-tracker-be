import { Router } from 'express';
import { create, getAll, update, remove } from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

router.post('/', create);
router.get('/', getAll);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
