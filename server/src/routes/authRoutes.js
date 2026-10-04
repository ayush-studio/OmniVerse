import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', authenticate, auth.me);
router.put('/onboarding', optionalAuth, auth.completeOnboarding);
router.put('/profile', authenticate, auth.updateProfile);
router.put('/child-lock', authenticate, auth.setChildLock);

export default router;
