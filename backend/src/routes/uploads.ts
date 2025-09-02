import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Upload photos to S3 and create posts
// POST /api/uploads/photos
// Body: FormData with 'photos' field containing files
router.post('/photos', UploadController.uploadPhotos);

// Upload videos to S3 and create posts
// POST /api/uploads/videos
// Body: FormData with 'videos' field containing files
router.post('/videos', UploadController.uploadVideos);

// Remove photo from user's gallery
// DELETE /api/uploads/photos
// Body: { photoUrl: string }
router.delete('/photos', UploadController.removePhoto);

// Remove video from user's gallery  
// DELETE /api/uploads/videos
// Body: { videoUrl: string }
router.delete('/videos', UploadController.removeVideo);

export default router;
