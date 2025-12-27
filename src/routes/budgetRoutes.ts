import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/budgetController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All budget routes require authentication
router.use(authenticate);

router.get('/', getAll);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
