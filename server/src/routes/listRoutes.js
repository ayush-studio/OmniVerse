import { Router } from 'express';
import * as lists from '../controllers/listController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', lists.listLists);
router.post('/', lists.createList);
router.get('/:id', lists.getList);
router.delete('/:id', lists.deleteList);
router.post('/:id/items', lists.addToList);
router.delete('/:id/items/:mediaId', lists.removeFromList);

export default router;
