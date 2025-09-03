import { executeQuery, apiConfig } from './database';
// Define admin user type
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserFromDB {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  role: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AdminRoleFromDB {
  id: number;
  role_name: string;
  description: string;
  permissions: string;
}

export class AdminApiService {
  // Get admin user by username and password
  static async authenticateAdmin(username: string, password: string): Promise<{ user: AdminUser; token: string } | null> {
    try {
      // Make API call to backend for real authentication
      const response = await fetch(`${apiConfig.baseUrl}/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return null;
      }

      const responseData = await response.json();
      
      // Transform backend data to AdminUser format
      const user: AdminUser = {
        id: responseData.user.id,
        username: responseData.user.username,
        email: responseData.user.email,
        role: responseData.user.role,
        avatar: responseData.user.avatar || '👤',
        isActive: responseData.user.isActive,
        lastLogin: responseData.user.lastLogin ? new Date(responseData.user.lastLogin).toISOString() : undefined,
        permissions: responseData.user.permissions || [],
        createdAt: responseData.user.createdAt || new Date().toISOString(),
        updatedAt: responseData.user.updatedAt || new Date().toISOString()
      };

      return {
        user,
        token: responseData.token
      };
    } catch (error) {
      console.error('Error authenticating admin:', error);
      throw new Error('Authentication failed');
    }
  }

  // Get admin user by ID
  static async getAdminUserById(id: string): Promise<AdminUser | null> {
    try {
      // For now, return the user based on ID
      // In production, this should make an API call to the backend
      if (id === 'admin-1') {
        return {
          id: 'admin-1',
          username: 'superadmin',
          email: 'superadmin@hargeisa-vibes.com',
          role: 'super_admin',
          avatar: '👑',
          isActive: true,
          lastLogin: new Date().toISOString(),
          permissions: ['*'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      if (id === 'admin-2') {
        return {
          id: 'admin-2',
          username: 'admin',
          email: 'admin@hargeisa-vibes.com',
          role: 'admin',
          avatar: '👨‍💼',
          isActive: true,
          lastLogin: new Date().toISOString(),
          permissions: [
            'manage_services',
            'manage_bookings',
            'manage_content',
            'view_analytics',
            'manage_settings'
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting admin user:', error);
      throw new Error('Failed to get admin user');
    }
  }

  // Get all admin users
  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      // Get admin users from database
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin users');
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error getting admin users:', error);
      throw new Error('Failed to get admin users');
    }
  }

  // Create new admin user
  static async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  }): Promise<AdminUser> {
    try {
      // Create admin user via API
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to create admin user');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin user');
    }
  }

  // Update admin user
  static async updateAdminUser(id: string, userData: {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<AdminUser> {
    try {
      // For now, just return the updated user
      // In production, this should make an API call to update the user
      const existingUser = await this.getAdminUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      return {
        ...existingUser,
        ...userData,
        role: userData.role as 'super_admin' | 'admin' || existingUser.role
      };
    } catch (error) {
      console.error('Error updating admin user:', error);
      throw new Error('Failed to update admin user');
    }
  }

  // Delete admin user (soft delete)
  static async deleteAdminUser(id: string): Promise<boolean> {
    try {
      // For now, just return success
      // In production, this should make an API call to delete the user
      console.log(`Deleting admin user: ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting admin user:', error);
      throw new Error('Failed to delete admin user');
    }
  }

  // Get admin statistics
  static async getAdminStatistics(): Promise<{
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
    pendingBookings: number;
    activeServices: number;
  }> {
    try {
      // Make API call to backend for real statistics
      const response = await fetch(`${apiConfig.baseUrl}/admin/statistics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const stats = await response.json();
      
      return {
        totalUsers: stats.totalUsers || 0,
        totalBookings: stats.totalBookings || 0,
        totalRevenue: stats.totalRevenue || 0,
        pendingBookings: stats.pendingBookings || 0,
        activeServices: stats.activeServices || 0
      };
    } catch (error) {
      console.error('Error getting admin statistics:', error);
      throw new Error('Failed to get admin statistics');
    }
  }

  // Get recent admin activities
  static async getRecentActivities(limit: number = 10): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    userId?: string;
    username?: string;
  }>> {
    try {
      // Make API call to backend for real activities
      const response = await fetch(`${apiConfig.baseUrl}/admin/activities?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }

      const activitiesData = await response.json();
      
      // Transform backend data to Activity format
      const activities = activitiesData.map((item: any) => ({
        id: item.id,
        type: item.type,
        description: item.description,
        timestamp: new Date(item.timestamp),
        userId: item.userId,
        username: item.username || 'system'
      }));

      return activities;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw new Error('Failed to get recent activities');
    }
  }
}
