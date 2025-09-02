import express from 'express';
import { PostController } from '../controllers/PostController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get user posts (public route for viewing other users' posts)
router.get('/user/:userId', PostController.getUserPosts);

// Create a new post (protected)
router.post('/', authenticate, PostController.createPost);

// Toggle like on a post (protected)
router.post('/:postId/like', authenticate, PostController.toggleLike);

// Add comment to a post (protected)
router.post('/:postId/comments', authenticate, PostController.addComment);

// Delete a comment (protected)
router.delete('/comments/:commentId', authenticate, PostController.deleteComment);

// Delete a post (protected)
router.delete('/:postId', authenticate, PostController.deletePost);

export default router;
