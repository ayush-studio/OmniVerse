import { Router } from 'express';
import * as notifications from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', notifications.listNotifications);
router.post('/read', notifications.markRead);

export default router;
