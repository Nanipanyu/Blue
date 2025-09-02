import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const PostController = {
  // Get user posts with optional filtering by type
  getUserPosts: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { type } = req.query;
      
      const whereClause: { authorId: string; type?: 'PHOTO' | 'VIDEO' | 'TEXT' } = { authorId: userId };
      
      // Add type filter if specified
      if (type && ['PHOTO', 'VIDEO', 'TEXT'].includes(type as string)) {
        whereClause.type = type as 'PHOTO' | 'VIDEO' | 'TEXT';
      }
      
      const posts = await prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          likes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      console.error('Get user posts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Create a new post when media is uploaded
  createPost: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { mediaUrl, type, caption } = req.body;
      
      if (!mediaUrl || !type) {
        return res.status(400).json({
          success: false,
          message: 'Media URL and type are required'
        });
      }

      const post = await prisma.post.create({
        data: {
          authorId: userId,
          mediaUrl,
          type,
          caption: caption || null,
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
      });

      res.status(201).json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create post',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Toggle like on a post
  toggleLike: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { postId } = req.params;

      // Check if user already liked the post
      const existingLike = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });

      if (existingLike) {
        // Unlike the post
        await prisma.postLike.delete({
          where: {
            id: existingLike.id
          }
        });
      } else {
        // Like the post
        await prisma.postLike.create({
          data: {
            userId,
            postId
          }
        });
      }

      // Get updated like count
      const likeCount = await prisma.postLike.count({
        where: { postId }
      });

      res.json({
        success: true,
        data: {
          liked: !existingLike,
          likeCount
        }
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle like',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Add comment to a post
  addComment: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { postId } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }

      const comment = await prisma.postComment.create({
        data: {
          userId,
          postId,
          content: content.trim()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete a comment
  deleteComment: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { commentId } = req.params;

      // Check if comment exists and user owns it
      const comment = await prisma.postComment.findUnique({
        where: { id: commentId }
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this comment'
        });
      }

      await prisma.postComment.delete({
        where: { id: commentId }
      });

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete a post
  deletePost: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { postId } = req.params;

      // Check if post exists and user owns it
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      if (post.authorId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this post'
        });
      }

      await prisma.post.delete({
        where: { id: postId }
      });

      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete post',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
