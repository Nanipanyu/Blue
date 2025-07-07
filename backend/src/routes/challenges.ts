import express from 'express';
import { body } from 'express-validator';
import { ChallengeController } from '../controllers/ChallengeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create challenge
router.post('/', [
  body('toTeamId')
    .isUUID()
    .withMessage('Please provide a valid team ID'),
  body('proposedDate')
    .isISO8601()
    .withMessage('Please provide a valid date in ISO format'),
  body('proposedTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('venue')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Venue must not exceed 200 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters')
], ChallengeController.createChallenge);

// Get my challenges (sent and received)
router.get('/my', ChallengeController.getMyChallenges);

// Get pending challenges for my teams
router.get('/pending', ChallengeController.getPendingChallenges);

// Respond to challenge
router.patch('/:id/respond', [
  body('response')
    .isIn(['accepted', 'declined'])
    .withMessage('Response must be either "accepted" or "declined"')
], ChallengeController.respondToChallenge);

export default router;
