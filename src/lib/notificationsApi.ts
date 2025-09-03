import { executeQuery, apiConfig } from './database';

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'user' | 'service' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  userId?: string;
  relatedId?: string;
  priority: 'low' | 'medium' | 'high';
}

export class NotificationsApiService {
  // Get all notifications for admin
  static async getAdminNotifications(limit: number = 50): Promise<Notification[]> {
    try {
      // Make API call to backend for real notifications
      const response = await fetch(`${apiConfig.baseUrl}/admin/notifications?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const notificationsData = await response.json();
      
      // Transform backend data to Notification format
      const notifications: Notification[] = notificationsData.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        isRead: item.isRead || false,
        createdAt: new Date(item.createdAt),
        userId: item.userId,
        relatedId: item.relatedId,
        priority: item.priority || 'medium'
      }));

      // Sort by creation date (newest first)
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return notifications.slice(0, limit);
    } catch (error) {
      console.error('Error getting admin notifications:', error);
      throw new Error('Failed to get notifications');
    }
  }

  // Get unread notifications count
  static async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getAdminNotifications(100);
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // In a real implementation, you would update a notifications table
      // For now, we'll just return success
      console.log(`Marking notification ${notificationId} as read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<boolean> {
    try {
      // In a real implementation, you would update a notifications table
      // For now, we'll just return success
      console.log('Marking all notifications as read');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Create a new notification
  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    try {
      // In a real implementation, you would insert into a notifications table
      // For now, we'll just return the notification with generated ID
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        createdAt: new Date()
      };
      
      console.log('Creating notification:', newNotification);
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      // In a real implementation, you would delete from a notifications table
      // For now, we'll just return success
      console.log(`Deleting notification ${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
}
