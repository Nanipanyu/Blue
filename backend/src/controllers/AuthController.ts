import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AuthTokenPayload } from '../types';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => err.msg)
        } as ApiResponse);
        return;
      }

      const { email, password, name, region, phone } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        } as ApiResponse);
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          region,
          phone
        },
        select: {
          id: true,
          email: true,
          name: true,
          region: true,
          phone: true,
          createdAt: true
        }
      });

      // Generate JWT token
      const tokenPayload: AuthTokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => err.msg)
        } as ApiResponse);
        return;
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          region: true,
          phone: true,
          isActive: true
        }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        } as ApiResponse);
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        } as ApiResponse);
        return;
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        } as ApiResponse);
        return;
      }

      // Generate JWT token
      const tokenPayload: AuthTokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          region: true,
          phone: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              ownedTeams: true
            }
          }
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: user
      } as ApiResponse);

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        } as ApiResponse);
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => err.msg)
        } as ApiResponse);
        return;
      }

      const { name, region, phone } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, region, phone },
        select: {
          id: true,
          email: true,
          name: true,
          region: true,
          phone: true,
          avatar: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      } as ApiResponse);

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
