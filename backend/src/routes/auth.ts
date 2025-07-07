import express from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { REGIONS } from '../types';

const router = express.Router();

// Register
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('region')
    .isIn(REGIONS)
    .withMessage('Please select a valid region'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
], AuthController.register);

// Login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], AuthController.login);

// Get profile (protected route)
router.get('/profile', AuthController.getProfile);

// Update profile (protected route)
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('region')
    .optional()
    .isIn(REGIONS)
    .withMessage('Please select a valid region'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
], AuthController.updateProfile);

export default router;
