import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Define admin types and utilities
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const hasPermission = (user: AdminUser | null, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission) || user.permissions.includes('*');
};

const canAccessAdmin = (user: AdminUser | null): boolean => {
  return user !== null && user.isActive;
};
import { AdminApiService } from '@/lib/adminApi';

interface AdminContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
  canAccess: () => boolean;
  refreshUser: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
      const loginTime = localStorage.getItem('adminLoginTime');
      
      if (storedUser && loginTime) {
        const user = JSON.parse(storedUser);
        const loginDate = new Date(loginTime);
        const now = new Date();
        
        // Check if session is still valid (24 hours)
        const sessionValid = (now.getTime() - loginDate.getTime()) < (24 * 60 * 60 * 1000);
        
        if (sessionValid && user && user.isActive) {
          setAdminUser(user);
        } else {
          // Session expired or user inactive
          clearSession();
        }
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoginTime');
    setAdminUser(null);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Authenticate with real database
      const response = await AdminApiService.authenticateAdmin(username, password);
      
      if (response && response.user && response.user.isActive) {
        // Store session with JWT token
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminLoginTime', new Date().toISOString());
        
        setAdminUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  const checkPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    return hasPermission(adminUser, permission);
  };

  const canAccess = (): boolean => {
    if (!adminUser) return false;
    return canAccessAdmin(adminUser);
  };

  const refreshUser = async () => {
    if (adminUser) {
      try {
        const refreshedUser = await AdminApiService.getAdminUserById(adminUser.id);
        if (refreshedUser) {
          setAdminUser(refreshedUser);
          localStorage.setItem('adminUser', JSON.stringify(refreshedUser));
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
        // If refresh fails, logout user
        logout();
      }
    }
  };

  const value: AdminContextType = {
    adminUser,
    isAuthenticated: !!adminUser,
    isLoading,
    login,
    logout,
    checkPermission,
    canAccess,
    refreshUser,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};


