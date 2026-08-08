import { Router } from 'express';
import * as chat from '../controllers/chatController.js';
import { authenticate, requireSupport } from '../middleware/auth.js';

const router = Router();

router.get('/history', authenticate, chat.getHistory);
router.post('/read', authenticate, chat.markRead);
router.get('/rooms', authenticate, requireSupport, chat.listSupportRooms);

export default router;
