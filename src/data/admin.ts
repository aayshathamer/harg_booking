export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: string[];
}

export type AdminRole = 'super_admin' | 'admin';

export const adminRoles: Record<AdminRole, {
  label: string;
  description: string;
  permissions: string[];
  color: string;
}> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access and control',
    permissions: ['*'],
    color: 'bg-red-500'
  },
  admin: {
    label: 'Admin',
    description: 'Full management access',
    permissions: [
      'manage_services',
      'manage_bookings',
      'manage_content',
      'view_analytics',
      'manage_settings'
    ],
    color: 'bg-blue-500'
  }
};

export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'superadmin',
    email: 'superadmin@hargeisa-vibes.com',
    role: 'super_admin',
    avatar: '👑',
    isActive: true,
    lastLogin: new Date('2024-01-15T10:30:00Z'),
    permissions: ['*']
  },
  {
    id: 'admin-2',
    username: 'admin',
    email: 'admin@hargeisa-vibes.com',
    role: 'admin',
    avatar: '👨‍💼',
    isActive: true,
    lastLogin: new Date('2024-01-14T15:45:00Z'),
    permissions: adminRoles.admin.permissions
  }
];

export const hasPermission = (user: AdminUser, permission: string): boolean => {
  return user.permissions.includes('*') || user.permissions.includes(permission);
};

export const canAccessAdmin = (user: AdminUser): boolean => {
  return user.isActive && user.role !== 'support';
};
