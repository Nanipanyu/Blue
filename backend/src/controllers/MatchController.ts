import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../types';

export class MatchController {
  // Validation rules for creating a match
  static createMatchValidation = [
    body('challengeId').isUUID().withMessage('Valid challenge ID is required'),
    body('homeScore').isInt({ min: 0 }).withMessage('Home score must be a non-negative integer'),
    body('awayScore').isInt({ min: 0 }).withMessage('Away score must be a non-negative integer'),
    body('matchDate').isISO8601().withMessage('Valid match date is required'),
    body('venue').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Venue must be 1-200 characters')
  ];

  // Create a match result from a completed challenge
  static async createMatch(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { challengeId, homeScore, awayScore, matchDate, venue } = req.body;
      const userId = req.user!.id;

      // First, verify the challenge exists and is accepted
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
          fromTeam: { include: { owner: true } },
          toTeam: { include: { owner: true } }
        }
      });

      if (!challenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }

      if (challenge.status !== 'ACCEPTED') {
        return res.status(400).json({
          success: false,
          message: 'Can only create matches from accepted challenges'
        });
      }

      // Verify user is owner of one of the teams
      const isFromTeamOwner = challenge.fromTeam.owner.id === userId;
      const isToTeamOwner = challenge.toTeam.owner.id === userId;

      if (!isFromTeamOwner && !isToTeamOwner) {
        return res.status(403).json({
          success: false,
          message: 'Only team owners can record match results'
        });
      }

      // Check if match already exists for this challenge
      const existingMatch = await prisma.match.findFirst({
        where: { challengeId }
      });

      if (existingMatch) {
        return res.status(400).json({
          success: false,
          message: 'Match result already recorded for this challenge'
        });
      }

      // Determine match result
      let result: 'WIN' | 'LOSS' | 'DRAW';
      if (homeScore > awayScore) {
        result = 'WIN';
      } else if (homeScore < awayScore) {
        result = 'LOSS';
      } else {
        result = 'DRAW';
      }

      // Create the match using a transaction to update team stats
      const match = await prisma.$transaction(async (tx) => {
        // Create the match
        const newMatch = await tx.match.create({
          data: {
            challengeId,
            homeTeamId: challenge.fromTeamId,
            awayTeamId: challenge.toTeamId,
            homeScore,
            awayScore,
            sport: challenge.sport,
            date: new Date(matchDate),
            venue,
            status: 'COMPLETED'
          },
          include: {
            homeTeam: true,
            awayTeam: true,
            challenge: true
          }
        });

        // Update team statistics
        const homeTeam = challenge.fromTeam;
        const awayTeam = challenge.toTeam;

        if (result === 'WIN') {
          // Home team wins
          await tx.team.update({
            where: { id: homeTeam.id },
            data: {
              wins: { increment: 1 },
              matchesPlayed: { increment: 1 },
              rating: { increment: 25 } // Simple ELO-like system
            }
          });
          await tx.team.update({
            where: { id: awayTeam.id },
            data: {
              losses: { increment: 1 },
              matchesPlayed: { increment: 1 },
              rating: { decrement: 25 }
            }
          });
        } else if (result === 'LOSS') {
          // Away team wins
          await tx.team.update({
            where: { id: homeTeam.id },
            data: {
              losses: { increment: 1 },
              matchesPlayed: { increment: 1 },
              rating: { decrement: 25 }
            }
          });
          await tx.team.update({
            where: { id: awayTeam.id },
            data: {
              wins: { increment: 1 },
              matchesPlayed: { increment: 1 },
              rating: { increment: 25 }
            }
          });
        } else {
          // Draw
          await tx.team.update({
            where: { id: homeTeam.id },
            data: {
              draws: { increment: 1 },
              matchesPlayed: { increment: 1 },
              rating: { increment: 5 }
            }
          });
          await tx.team.update({
            where: { id: awayTeam.id },
            data: {
              draws: { increment: 1 },
              matchesPlayed: { increment: 1 },
              rating: { increment: 5 }
            }
          });
        }

        // Update challenge status to COMPLETED
        await tx.challenge.update({
          where: { id: challengeId },
          data: { status: 'COMPLETED' }
        });

        return newMatch;
      });

      res.status(201).json({
        success: true,
        message: 'Match result recorded successfully',
        data: match
      });

    } catch (error) {
      console.error('Error creating match:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get matches for a team
  static async getTeamMatches(req: AuthenticatedRequest, res: Response) {
    try {
      const { teamId } = req.params;
      const { page = '1', limit = '10' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Verify team exists and user has access
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          members: {
            where: { userId: req.user!.id }
          }
        }
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }

      // Get matches where this team was either home or away
      const matches = await prisma.match.findMany({
        where: {
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId }
          ]
        },
        include: {
          homeTeam: {
            select: { id: true, name: true, avatar: true }
          },
          awayTeam: {
            select: { id: true, name: true, avatar: true }
          },
          challenge: {
            select: { id: true, sport: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      });

      const totalMatches = await prisma.match.count({
        where: {
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId }
          ]
        }
      });

      res.json({
        success: true,
        data: {
          matches,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalMatches,
            pages: Math.ceil(totalMatches / limitNum)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching team matches:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get match details by ID
  static async getMatchById(req: AuthenticatedRequest, res: Response) {
    try {
      const { matchId } = req.params;

      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: {
            select: { id: true, name: true, avatar: true, sport: true }
          },
          awayTeam: {
            select: { id: true, name: true, avatar: true, sport: true }
          },
          challenge: {
            select: { id: true, sport: true, proposedDate: true, message: true }
          }
        }
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match not found'
        });
      }

      res.json({
        success: true,
        data: match
      });

    } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get recent matches (public endpoint for leaderboards)
  static async getRecentMatches(req: Request, res: Response) {
    try {
      const { sport, region, limit = '20' } = req.query;
      const limitNum = parseInt(limit as string);

      interface WhereClause {
        challenge?: {
          sport: string;
        };
        OR?: Array<{
          homeTeam: { region: string };
        } | {
          awayTeam: { region: string };
        }>;
      }

      const whereClause: WhereClause = {};

      if (sport) {
        whereClause.challenge = {
          sport: sport as string
        };
      }

      if (region) {
        whereClause.OR = [
          { homeTeam: { region: region as string } },
          { awayTeam: { region: region as string } }
        ];
      }

      const matches = await prisma.match.findMany({
        where: whereClause,
        include: {
          homeTeam: {
            select: { id: true, name: true, avatar: true, sport: true, region: true }
          },
          awayTeam: {
            select: { id: true, name: true, avatar: true, sport: true, region: true }
          },
          challenge: {
            select: { sport: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum
      });

      res.json({
        success: true,
        data: matches
      });

    } catch (error) {
      console.error('Error fetching recent matches:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
