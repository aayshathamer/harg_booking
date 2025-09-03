import { executeQuery } from './database';

// User interface for database operations
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  password?: string; // Optional password field for form handling
  role: 'customer' | 'admin' | 'moderator' | 'super_admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API service for users management
export class UsersApiService {
  
  // Get all active users
  static async getAllUsers(): Promise<User[]> {
    try {
      const query = `
        SELECT 
          id, username, email, first_name, last_name, phone, avatar,
          role, is_active, last_login, created_at, updated_at
        FROM users
        WHERE is_deleted = FALSE
        ORDER BY created_at DESC
      `;
      
      const result = await executeQuery(query);
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<User[]> {
    try {
      const query = `
        SELECT 
          id, username, email, first_name, last_name, phone, avatar,
          role, is_active, last_login, created_at, updated_at
        FROM users
        WHERE role = ? AND is_deleted = FALSE
        ORDER BY created_at DESC
      `;
      
      const result = await executeQuery(query, [role]);
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users by role');
    }
  }

  // Get active users only
  static async getActiveUsers(): Promise<User[]> {
    try {
      const query = `
        SELECT 
          id, username, email, first_name, last_name, phone, avatar,
          role, is_active, last_login, created_at, updated_at
        FROM users
        WHERE is_active = TRUE AND is_deleted = FALSE
        ORDER BY created_at DESC
      `;
      
      const result = await executeQuery(query);
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw new Error('Failed to fetch active users');
    }
  }

  // Search users
  static async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const query = `
        SELECT 
          id, username, email, first_name, last_name, phone, avatar,
          role, is_active, last_login, created_at, updated_at
        FROM users
        WHERE (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)
        AND is_deleted = FALSE
        ORDER BY created_at DESC
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const result = await executeQuery(query, [searchPattern, searchPattern, searchPattern, searchPattern]);
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    try {
      const query = `
        SELECT 
          id, username, email, first_name, last_name, phone, avatar,
          role, is_active, last_login, created_at, updated_at
        FROM users
        WHERE id = ? AND is_deleted = FALSE
      `;
      
      const result = await executeQuery(query, [id]);
      
      // Handle both single user object and array responses
      if (!result) return null;
      
      // If result is a single object (from new endpoint), wrap it in an array
      const userArray = Array.isArray(result) ? result : [result];
      if (userArray.length === 0) return null;
      
      return this.transformDatabaseResult(userArray)[0];
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT 
          id, username, email, first_name, last_name, phone, avatar,
          role, is_active, last_login, created_at, updated_at
        FROM users
        WHERE email = ? AND is_deleted = FALSE
      `;
      
      const result = await executeQuery(query, [email]);
      if (result.length === 0) return null;
      
      return this.transformDatabaseResult(result)[0];
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // Get user by username
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const query = `
        SELECT 
          id, username, email, first_name, last_name, phone, avatar,
          role, is_active, last_login, created_at, updated_at
        FROM users
        WHERE username = ? AND is_deleted = FALSE
      `;
      
      const result = await executeQuery(query, [username]);
      
      // Handle both single user object and array responses
      if (!result) return null;
      
      // If result is a single object (from new endpoint), wrap it in an array
      const userArray = Array.isArray(result) ? result : [result];
      if (userArray.length === 0) return null;
      
      return this.transformDatabaseResult(userArray)[0];
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // Create new user
  static async createUser(userData: Partial<User>): Promise<string> {
    try {
      const userId = `user-${Date.now()}`;
      
      // Username is required - no auto-generation
      if (!userData.username || userData.username.trim() === '') {
        throw new Error('Username is required');
      }
      
      const username = userData.username.trim();
      
      // Check if username is already taken
      const existingUser = await this.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username is already taken. Please choose a different username.');
      }
      
      const insertQuery = `
        INSERT INTO users (
          id, username, email, password_hash, first_name, last_name, phone, avatar,
          role, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      // Use the role directly since database now supports super_admin
      const dbRole = userData.role || 'customer';
      
      const insertParams = [
        userId,
        username,
        userData.email || '',
        userData.password || null, // Add password parameter
        userData.firstName || '',
        userData.lastName || '',
        userData.phone || null,
        userData.avatar || null,
        dbRole,
        userData.isActive !== undefined ? userData.isActive : true
      ];
      
      await executeQuery(insertQuery, insertParams);
      return userId;
    } catch (error) {
      console.error('Error creating user:', error);
      // Re-throw the original error message if it's already user-friendly
      if (error instanceof Error && error.message) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  // Update user
  static async updateUser(id: string, userData: Partial<User>): Promise<void> {
    try {
      const updateFields = [];
      const updateParams = [];
      
      if (userData.username !== undefined) {
        updateFields.push('username = ?');
        updateParams.push(userData.username);
      }
      if (userData.email !== undefined) {
        updateFields.push('email = ?');
        updateParams.push(userData.email);
      }
      if (userData.firstName !== undefined) {
        updateFields.push('first_name = ?');
        updateParams.push(userData.firstName);
      }
      if (userData.lastName !== undefined) {
        updateFields.push('last_name = ?');
        updateParams.push(userData.lastName);
      }
      if (userData.phone !== undefined) {
        updateFields.push('phone = ?');
        updateParams.push(userData.phone);
      }
      if (userData.avatar !== undefined) {
        updateFields.push('avatar = ?');
        updateParams.push(userData.avatar);
      }
      if (userData.role !== undefined) {
        updateFields.push('role = ?');
        updateParams.push(userData.role);
      }
      if (userData.isActive !== undefined) {
        updateFields.push('is_active = ?');
        updateParams.push(userData.isActive);
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateParams.push(id);
      
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, updateParams);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Update user status
  static async updateUserStatus(id: string, isActive: boolean): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await executeQuery(query, [isActive, id]);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  // Delete user (soft delete)
  static async deleteUser(id: string): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await executeQuery(query, [id]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Hard delete user (permanent)
  static async hardDeleteUser(id: string): Promise<void> {
    try {
      const query = `DELETE FROM users WHERE id = ?`;
      await executeQuery(query, [id]);
    } catch (error) {
      console.error('Error hard deleting user:', error);
      throw new Error('Failed to hard delete user');
    }
  }

  // Transform database result to User interface
  private static transformDatabaseResult(result: any[]): User[] {
    return result.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      avatar: row.avatar,
      role: row.role,
      isActive: row.is_active === 1 || row.is_active === true,
      lastLogin: row.last_login ? new Date(row.last_login) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }
}
