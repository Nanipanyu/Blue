import express from 'express';
import { body, query } from 'express-validator';
import { TeamController } from '../controllers/TeamController';
import { authenticate } from '../middleware/auth';
import { SPORTS, REGIONS } from '../types';

const router = express.Router();

// Get all teams (public route with filtering)
router.get('/', [
  query('sport').optional().isIn(['all', ...SPORTS]),
  query('region').optional().isIn(['all', ...REGIONS]),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], TeamController.getTeams);

// Get team by ID (public route)
router.get('/:id', TeamController.getTeamById);

// Get team stats (public route)
router.get('/:id/stats', TeamController.getTeamStats);

// Protected routes (require authentication)
router.use(authenticate);

// Create team
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Team name must be between 3 and 50 characters'),
  body('sport')
    .isIn(SPORTS)
    .withMessage('Please select a valid sport'),
  body('region')
    .isIn(REGIONS)
    .withMessage('Please select a valid region'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('maxPlayers')
    .isInt({ min: 5, max: 50 })
    .withMessage('Maximum players must be between 5 and 50'),
  body('contactEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),
  body('contactPhone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid contact phone number')
], TeamController.createTeam);

// Get my teams
router.get('/my/teams', TeamController.getMyTeams);

// Update team
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Team name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('maxPlayers')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Maximum players must be between 5 and 50'),
  body('contactEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),
  body('contactPhone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid contact phone number')
], TeamController.updateTeam);

// Delete team (soft delete)
router.delete('/:id', TeamController.deleteTeam);

export default router;
