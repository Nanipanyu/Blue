import { Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, CreateTeamRequest, TeamFilters, PaginatedResponse } from '../types';

export class TeamController {
  static async createTeam(req: AuthRequest, res: Response): Promise<void> {
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

      const teamData: CreateTeamRequest = req.body;

      // Check if user already has a team with the same name
      const existingTeam = await prisma.team.findFirst({
        where: {
          name: teamData.name,
          ownerId: req.user.id
        }
      });

      if (existingTeam) {
        res.status(400).json({
          success: false,
          message: 'You already have a team with this name'
        } as ApiResponse);
        return;
      }

      // Create team
      const team = await prisma.team.create({
        data: {
          ...teamData,
          ownerId: req.user.id
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        }
      });

      // Add owner as first team member
      await prisma.teamMember.create({
        data: {
          userId: req.user.id,
          teamId: team.id,
          role: 'captain'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: team
      } as ApiResponse);

    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sport, region, search, page = 1, limit = 20 }: TeamFilters = req.query;

      const where: Record<string, unknown> = {
        isActive: true
      };

      if (sport && sport !== 'all') {
        where.sport = sport;
      }

      if (region && region !== 'all') {
        where.region = region;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [teams, total] = await Promise.all([
        prisma.team.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                members: true
              }
            }
          },
          orderBy: [
            { rating: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take
        }),
        prisma.team.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      res.json({
        success: true,
        data: teams,
        pagination: {
          page: Number(page),
          limit: take,
          total,
          totalPages
        }
      } as PaginatedResponse<typeof teams[0]>);

    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getTeamById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              region: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              sentChallenges: true,
              receivedChallenges: true,
              homeMatches: true,
              awayMatches: true
            }
          }
        }
      });

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Team not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: team
      } as ApiResponse);

    } catch (error) {
      console.error('Get team by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getMyTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const teams = await prisma.team.findMany({
        where: {
          ownerId: req.user.id,
          isActive: true
        },
        include: {
          _count: {
            select: {
              members: true,
              receivedChallenges: {
                where: { status: 'PENDING' }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: teams
      } as ApiResponse);

    } catch (error) {
      console.error('Get my teams error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async updateTeam(req: AuthRequest, res: Response): Promise<void> {
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
      const updateData = req.body;

      // Check if team exists and user owns it
      const existingTeam = await prisma.team.findUnique({
        where: { id }
      });

      if (!existingTeam) {
        res.status(404).json({
          success: false,
          message: 'Team not found'
        } as ApiResponse);
        return;
      }

      if (existingTeam.ownerId !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'You can only update teams you own'
        } as ApiResponse);
        return;
      }

      const updatedTeam = await prisma.team.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Team updated successfully',
        data: updatedTeam
      } as ApiResponse);

    } catch (error) {
      console.error('Update team error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async deleteTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const { id } = req.params;

      // Check if team exists and user owns it
      const existingTeam = await prisma.team.findUnique({
        where: { id }
      });

      if (!existingTeam) {
        res.status(404).json({
          success: false,
          message: 'Team not found'
        } as ApiResponse);
        return;
      }

      if (existingTeam.ownerId !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'You can only delete teams you own'
        } as ApiResponse);
        return;
      }

      // Soft delete by setting isActive to false
      await prisma.team.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Team deleted successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Delete team error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getTeamStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const team = await prisma.team.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          wins: true,
          losses: true,
          draws: true,
          rating: true,
          matchesPlayed: true
        }
      });

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Team not found'
        } as ApiResponse);
        return;
      }

      // Get recent matches for this team
      const recentMatches = await prisma.match.findMany({
        where: {
          OR: [
            { homeTeamId: id },
            { awayTeamId: id }
          ],
          status: 'COMPLETED'
        },
        include: {
          homeTeam: {
            select: { id: true, name: true }
          },
          awayTeam: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const stats = {
        ...team,
        winPercentage: team.matchesPlayed > 0 ? 
          Math.round((team.wins / team.matchesPlayed) * 100) : 0,
        recentMatches
      };

      res.json({
        success: true,
        data: stats
      } as ApiResponse);

    } catch (error) {
      console.error('Get team stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
