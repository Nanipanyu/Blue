import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class ProfileController {
  // Get user profile
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'User not authenticated' 
        });
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          region: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Extended profile fields that exist in schema
          bio: true,
          dateOfBirth: true,
          gender: true,
          city: true,
          country: true,
          emailVisibility: true,
          instagramUrl: true,
          twitterUrl: true,
          facebookUrl: true,
          linkedinUrl: true,
          favoriteSports: true,
          preferredPositions: true,
          skillLevel: true,
          totalMatches: true,
          totalWins: true,
          totalGoals: true,
          totalAssists: true,
          weeklyAvailability: true,
          willingToJoinTeams: true,
          profileVisibility: true,
          emailNotifications: true,
          pushNotifications: true,
          qrCode: true,
          favoriteTeams: true,
          favoritePlayers: true,
          isVerified: true,
          profileCompleted: true,
        }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      res.json({ 
        success: true,
        data: user 
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  }

  // Update basic profile information
  static async updateBasicInfo(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const {
        name,
        phone,
        avatar,
        bio,
        city,
        country,
        gender,
        dateOfBirth,
        instagramUrl,
        twitterUrl,
        facebookUrl,
        linkedinUrl
      } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          avatar,
          bio,
          city,
          country,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          instagramUrl,
          twitterUrl,
          facebookUrl,
          linkedinUrl,
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          bio: true,
          city: true,
          country: true,
          gender: true,
          dateOfBirth: true,
          instagramUrl: true,
          twitterUrl: true,
          facebookUrl: true,
          linkedinUrl: true,
          updatedAt: true
        }
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Update basic info error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get public profile (for other users to view)
  static async getPublicProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          avatar: true,
          region: true,
          createdAt: true,
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get public profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Social Links Management
  static async updateSocialLinks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { instagramUrl, twitterUrl, facebookUrl, linkedinUrl } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          instagramUrl,
          twitterUrl,
          facebookUrl,
          linkedinUrl,
          updatedAt: new Date()
        },
        select: {
          id: true,
          instagramUrl: true,
          twitterUrl: true,
          facebookUrl: true,
          linkedinUrl: true,
        }
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Update social links error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Sports Preferences Management
  static async updateSportsPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { 
        favoriteSports, 
        preferredPositions, 
        skillLevel, 
        favoriteTeams, 
        favoritePlayers 
      } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          favoriteSports: favoriteSports || [],
          preferredPositions: preferredPositions || [],
          skillLevel,
          favoriteTeams: favoriteTeams || [],
          favoritePlayers: favoritePlayers || [],
          updatedAt: new Date()
        },
        select: {
          id: true,
          favoriteSports: true,
          preferredPositions: true,
          skillLevel: true,
          favoriteTeams: true,
          favoritePlayers: true,
        }
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Update sports preferences error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Availability Management
  static async updateAvailability(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { weeklyAvailability, willingToJoinTeams } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          weeklyAvailability,
          willingToJoinTeams,
          updatedAt: new Date()
        },
        select: {
          id: true,
          weeklyAvailability: true,
          willingToJoinTeams: true,
        }
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Privacy Settings Management
  static async updatePrivacySettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { 
        profileVisibility, 
        emailVisibility, 
        emailNotifications, 
        pushNotifications 
      } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profileVisibility,
          emailVisibility,
          emailNotifications,
          pushNotifications,
          updatedAt: new Date()
        },
        select: {
          id: true,
          profileVisibility: true,
          emailVisibility: true,
          emailNotifications: true,
          pushNotifications: true,
        }
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Update privacy settings error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // QR Code Generation
  static async generateQRCode(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Generate a simple QR code data (in a real app, you'd use a QR code library)
      const qrCodeData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/${userId}`;
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          qrCode: qrCodeData,
          updatedAt: new Date()
        },
        select: {
          id: true,
          qrCode: true,
        }
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Generate QR code error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Achievement Management
  static async addAchievement(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { type, title, description, icon } = req.body;

      if (!type || !title || !description) {
        return res.status(400).json({ message: 'Type, title, and description are required' });
      }

      const achievement = await prisma.achievement.create({
        data: {
          type,
          title,
          description,
          icon,
          dateEarned: new Date(),
          userId
        }
      });

      res.status(201).json({ achievement });
    } catch (error) {
      console.error('Add achievement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Trophy Management
  static async addTrophy(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { type, title, description, icon, event, position } = req.body;

      if (!type || !title || !description) {
        return res.status(400).json({ message: 'Type, title, and description are required' });
      }

      const trophy = await prisma.trophy.create({
        data: {
          type,
          title,
          description,
          icon,
          event,
          position,
          dateEarned: new Date(),
          userId
        }
      });

      res.status(201).json({ trophy });
    } catch (error) {
      console.error('Add trophy error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
