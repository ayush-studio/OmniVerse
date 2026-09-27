import { Router } from 'express';
import * as forum from '../controllers/forumController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/posts', optionalAuth, forum.listPosts);
router.post('/posts', authenticate, forum.createPost);
router.get('/trending', optionalAuth, forum.getTrendingDiscussions);
router.get('/media/:mediaId/posts', optionalAuth, forum.listPosts);
router.post('/media/:mediaId/posts', authenticate, forum.createPost);
router.get('/posts/:postId', optionalAuth, forum.getPost);
router.post('/posts/:postId/comments', authenticate, forum.createComment);
router.post('/posts/:postId/vote', authenticate, forum.votePost);
router.post('/comments/:commentId/vote', authenticate, forum.voteComment);
router.delete('/posts/:postId', authenticate, forum.deletePost);

export default router;
