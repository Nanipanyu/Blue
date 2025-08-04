import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { ProfileController } from '../controllers/ProfileController';

const router = Router();

// Get current user profile (protected)
router.get('/me', authenticate, ProfileController.getProfile);

// Update basic profile info (protected)
router.put('/basic-info', authenticate, ProfileController.updateBasicInfo);

// Get public profile by user ID
router.get('/:userId', ProfileController.getPublicProfile);

// Extended profile features (placeholder endpoints for after migration)
router.put('/social-links', authenticate, ProfileController.updateSocialLinks);
router.put('/sports-preferences', authenticate, ProfileController.updateSportsPreferences);
router.put('/availability', authenticate, ProfileController.updateAvailability);
router.put('/media', authenticate, ProfileController.updateMedia);
router.put('/privacy-settings', authenticate, ProfileController.updatePrivacySettings);
router.post('/generate-qr', authenticate, ProfileController.generateQRCode);
router.post('/achievements', authenticate, ProfileController.addAchievement);
router.post('/trophies', authenticate, ProfileController.addTrophy);

export default router;
