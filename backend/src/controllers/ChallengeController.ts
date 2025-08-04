import { Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, CreateChallengeRequest } from '../types';
import { NotificationController } from './NotificationController';

export class ChallengeController {
  static async createChallenge(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map((err: { msg: string }) => err.msg)
        } as ApiResponse);
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const challengeData: CreateChallengeRequest = req.body;

      // Check if target team exists first
      const toTeam = await prisma.team.findUnique({
        where: { id: challengeData.toTeamId }
      });

      if (!toTeam) {
        res.status(404).json({
          success: false,
          message: 'Target team not found'
        } as ApiResponse);
        return;
      }

      if (!toTeam.isActive) {
        res.status(400).json({
          success: false,
          message: 'Target team is not active'
        } as ApiResponse);
        return;
      }

      // Find user's team for the same sport as target team
      const fromTeam = await prisma.team.findFirst({
        where: {
          ownerId: req.user.id,
          sport: toTeam.sport, // Use target team's sport
          isActive: true
        }
      });

      if (!fromTeam) {
        res.status(400).json({
          success: false,
          message: `You must have an active ${toTeam.sport} team to send challenges`
        } as ApiResponse);
        return;
      }

      // Check if challenge already exists for the same date and time
      const proposedDateTime = new Date(challengeData.proposedDate);
      const existingChallenge = await prisma.challenge.findFirst({
        where: {
          fromTeamId: fromTeam.id,
          toTeamId: toTeam.id,
          status: 'PENDING',
          proposedDate: proposedDateTime,
          proposedTime: challengeData.proposedTime
        }
      });

      if (existingChallenge) {
        res.status(400).json({
          success: false,
          message: 'You already have a pending challenge with this team for the same date and time'
        } as ApiResponse);
        return;
      }

      // Create challenge
      const challenge = await prisma.challenge.create({
        data: {
          fromUserId: req.user.id,
          fromTeamId: fromTeam.id,
          toTeamId: toTeam.id,
          sport: fromTeam.sport,
          proposedDate: new Date(challengeData.proposedDate),
          proposedTime: challengeData.proposedTime,
          venue: challengeData.venue,
          message: challengeData.message
        },
        include: {
          fromTeam: {
            select: {
              id: true,
              name: true,
              sport: true,
              region: true
            }
          },
          toTeam: {
            select: {
              id: true,
              name: true,
              sport: true,
              region: true
            }
          },
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create notification for the target team owner
      try {
        await NotificationController.createNotification(
          toTeam.ownerId,
          'CHALLENGE_RECEIVED',
          'New Challenge Received',
          `${fromTeam.name} has challenged your team ${toTeam.name} to a ${fromTeam.sport} match`
        );
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the challenge creation if notification fails
      }

      res.status(201).json({
        success: true,
        message: 'Challenge sent successfully',
        data: challenge
      } as ApiResponse);

    } catch (error) {
      console.error('Create challenge error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getMyChallenges(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      // Get user's teams
      const userTeams = await prisma.team.findMany({
        where: {
          ownerId: req.user.id,
          isActive: true
        },
        select: { id: true }
      });

      const teamIds = userTeams.map((team: { id: string }) => team.id);

      // Get challenges involving user's teams
      const challenges = await prisma.challenge.findMany({
        where: {
          OR: [
            { fromTeamId: { in: teamIds } },
            { toTeamId: { in: teamIds } }
          ]
        },
        include: {
          fromTeam: {
            select: {
              id: true,
              name: true,
              sport: true,
              region: true
            }
          },
          toTeam: {
            select: {
              id: true,
              name: true,
              sport: true,
              region: true
            }
          },
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: challenges
      } as ApiResponse);

    } catch (error) {
      console.error('Get my challenges error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async respondToChallenge(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map((err: { msg: string }) => err.msg)
        } as ApiResponse);
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { id } = req.params;
      const { response } = req.body; // 'accepted' or 'declined'

      const challenge = await prisma.challenge.findUnique({
        where: { id },
        include: {
          fromTeam: true,
          toTeam: true
        }
      });

      if (!challenge) {
        res.status(404).json({
          success: false,
          message: 'Challenge not found'
        } as ApiResponse);
        return;
      }

      // Check if user owns the target team
      if (challenge.toTeam.ownerId !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'You can only respond to challenges for teams you own'
        } as ApiResponse);
        return;
      }

      if (challenge.status !== 'PENDING') {
        res.status(400).json({
          success: false,
          message: 'This challenge has already been responded to'
        } as ApiResponse);
        return;
      }

      // Update challenge status
      const updatedChallenge = await prisma.challenge.update({
        where: { id },
        data: {
          status: response === 'accepted' ? 'ACCEPTED' : 'DECLINED'
        },
        include: {
          fromTeam: {
            select: {
              id: true,
              name: true,
              sport: true,
              region: true
            }
          },
          toTeam: {
            select: {
              id: true,
              name: true,
              sport: true,
              region: true
            }
          }
        }
      });

      // If accepted, create a match
      if (response === 'accepted') {
        await prisma.match.create({
          data: {
            challengeId: challenge.id,
            homeTeamId: challenge.toTeamId,
            awayTeamId: challenge.fromTeamId,
            sport: challenge.sport,
            matchDate: challenge.proposedDate,
            venue: challenge.venue
          }
        });
      }

      res.json({
        success: true,
        message: `Challenge ${response} successfully`,
        data: updatedChallenge
      } as ApiResponse);

    } catch (error) {
      console.error('Respond to challenge error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getPendingChallenges(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      // Get user's teams
      const userTeams = await prisma.team.findMany({
        where: {
          ownerId: req.user.id,
          isActive: true
        },
        select: { id: true }
      });

      const teamIds = userTeams.map((team: { id: string }) => team.id);

      // Get pending challenges for user's teams
      const challenges = await prisma.challenge.findMany({
        where: {
          toTeamId: { in: teamIds },
          status: 'PENDING'
        },
        include: {
          fromTeam: {
            select: {
              id: true,
              name: true,
              sport: true,
              region: true,
              rating: true
            }
          },
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: challenges
      } as ApiResponse);

    } catch (error) {
      console.error('Get pending challenges error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
