import { Router } from 'express';
import * as media from '../controllers/mediaController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, media.listMedia);
router.get('/search', optionalAuth, media.searchMedia);
router.get('/genres', optionalAuth, media.listGenres);
router.get('/by-ids', optionalAuth, media.getByIds);
router.get('/recommendations', optionalAuth, media.getRecommendations);
router.get('/library', authenticate, media.getUserLibrary);
router.get('/:id', optionalAuth, media.getMedia);
router.get('/:id/enrichment', optionalAuth, media.getMediaEnrichment);
router.put('/:mediaId/interaction', authenticate, media.upsertInteraction);

export default router;
