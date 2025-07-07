import { Router } from 'express';
import { MatchController } from '../controllers/MatchController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected routes (require authentication)
router.post('/', authenticate, MatchController.createMatchValidation, MatchController.createMatch);
router.get('/team/:teamId', authenticate, MatchController.getTeamMatches);
router.get('/:matchId', authenticate, MatchController.getMatchById);

// Public routes
router.get('/', MatchController.getRecentMatches);

export default router;
