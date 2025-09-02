import { Request, Response } from 'express';
import { upload } from '../config/s3';
import { prisma } from '../config/database';

// Extend Request interface for authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Define S3 file interface
interface S3File {
  location: string;
  bucket: string;
  key: string;
  originalname: string;
  mimetype: string;
  fieldname: string;
}

export class UploadController {
  // Upload photos to S3 and create posts
  static uploadPhotos = [
    upload.array('photos', 10), // Allow up to 10 photos at once
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'User not authenticated'
          });
        }

        const files = req.files as unknown as S3File[];
        
        if (!files || files.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No files uploaded'
          });
        }

        // Get the S3 URLs
        const photoUrls = files.map(file => file.location);

        // Create posts for each uploaded photo (no longer updating photoGallery arrays)
        const postPromises = photoUrls.map(photoUrl => 
          prisma.post.create({
            data: {
              authorId: userId,
              type: 'PHOTO',
              mediaUrl: photoUrl,
              caption: req.body.caption || null,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                }
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                }
              }
            }
          })
        );

        const createdPosts = await Promise.all(postPromises);

        res.status(200).json({
          success: true,
          message: 'Photos uploaded successfully',
          data: {
            posts: createdPosts,
            uploadedCount: photoUrls.length
          }
        });

      } catch (error) {
        console.error('Error uploading photos:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        });
        
        // Check if it's an S3 specific error
        if (error instanceof Error) {
          if (error.message.includes('credentials')) {
            console.error('AWS credentials issue detected');
          }
          if (error.message.includes('bucket')) {
            console.error('S3 bucket issue detected');
          }
        }
        
        res.status(500).json({
          success: false,
          message: 'Failed to upload photos',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  ];

  // Upload videos to S3 and create posts
  static uploadVideos = [
    upload.array('videos', 5), // Allow up to 5 videos at once
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'User not authenticated'
          });
        }

        const files = req.files as unknown as S3File[];
        
        if (!files || files.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No files uploaded'
          });
        }

        // Get the S3 URLs
        const videoUrls = files.map(file => file.location);

        // Create posts for each uploaded video (no longer updating highlightVideos arrays)
        const postPromises = videoUrls.map(videoUrl => 
          prisma.post.create({
            data: {
              authorId: userId,
              type: 'VIDEO',
              mediaUrl: videoUrl,
              caption: req.body.caption || null,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                }
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                }
              }
            }
          })
        );

        const createdPosts = await Promise.all(postPromises);

        res.status(200).json({
          success: true,
          message: 'Videos uploaded successfully',
          data: {
            posts: createdPosts,
            uploadedCount: videoUrls.length
          }
        });

      } catch (error) {
        console.error('Error uploading videos:', error);
        console.error('Video Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        });
        
        // Check if it's an S3 specific error
        if (error instanceof Error) {
          if (error.message.includes('credentials')) {
            console.error('AWS credentials issue detected for videos');
          }
          if (error.message.includes('bucket')) {
            console.error('S3 bucket issue detected for videos');
          }
        }
        
        res.status(500).json({
          success: false,
          message: 'Failed to upload videos',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  ];

  // Remove photo post from user's posts
  static removePhoto = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { photoUrl } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!photoUrl) {
        return res.status(400).json({
          success: false,
          message: 'Photo URL is required'
        });
      }

      // Find and delete the post with the matching photo URL
      const deletedPost = await prisma.post.deleteMany({
        where: {
          authorId: userId,
          type: 'PHOTO',
          mediaUrl: photoUrl
        }
      });

      if (deletedPost.count === 0) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found or you do not have permission to delete it'
        });
      }

      // Get remaining photo count
      const remainingPhotos = await prisma.post.count({
        where: {
          authorId: userId,
          type: 'PHOTO'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Photo removed successfully',
        data: {
          remainingPhotos: remainingPhotos
        }
      });

    } catch (error) {
      console.error('Error removing photo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove photo',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Remove video post from user's posts
  static removeVideo = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { videoUrl } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          message: 'Video URL is required'
        });
      }

      // Find and delete the post with the matching video URL
      const deletedPost = await prisma.post.deleteMany({
        where: {
          authorId: userId,
          type: 'VIDEO',
          mediaUrl: videoUrl
        }
      });

      if (deletedPost.count === 0) {
        return res.status(404).json({
          success: false,
          message: 'Video not found or you do not have permission to delete it'
        });
      }

      // Get remaining video count
      const remainingVideos = await prisma.post.count({
        where: {
          authorId: userId,
          type: 'VIDEO'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Video removed successfully',
        data: {
          remainingVideos: remainingVideos
        }
      });

    } catch (error) {
      console.error('Error removing video:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove video',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
