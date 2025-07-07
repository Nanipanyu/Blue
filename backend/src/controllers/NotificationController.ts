import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../types';

export class NotificationController {
  // Get user notifications
  static async getUserNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = '1', limit = '20', unreadOnly = 'false' } = req.query;
      const userId = req.user!.id;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      interface WhereClause {
        userId: string;
        isRead?: boolean;
      }

      const whereClause: WhereClause = { userId };
      
      if (unreadOnly === 'true') {
        whereClause.isRead = false;
      }

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      });

      const totalNotifications = await prisma.notification.count({
        where: whereClause
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
      });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalNotifications,
            pages: Math.ceil(totalNotifications / limitNum)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { notificationId } = req.params;
      const userId = req.user!.id;

      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: updatedNotification
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create notification (internal helper method)
  static async createNotification(
    userId: string,
    type: 'CHALLENGE_RECEIVED' | 'CHALLENGE_ACCEPTED' | 'CHALLENGE_DECLINED' | 'MATCH_SCHEDULED' | 'MATCH_COMPLETED' | 'TEAM_INVITATION' | 'RATING_UPDATE',
    title: string,
    message: string
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const { notificationId } = req.params;
      const userId = req.user!.id;

      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
