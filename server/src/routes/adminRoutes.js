import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', admin.dashboardStats);
router.get('/users', admin.listUsers);
router.patch('/users/:id/role', admin.updateUserRole);
router.delete('/users/:id', admin.deleteUser);

router.post('/media', admin.createMedia);
router.put('/media/:id', admin.updateMedia);
router.delete('/media/:id', admin.deleteMedia);
router.post('/media/bulk', admin.bulkImportMedia);

router.get('/forum/posts', admin.listForumPostsAdmin);
router.delete('/forum/posts/:id', admin.deleteForumPostAdmin);

export default router;
