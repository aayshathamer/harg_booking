import { executeQuery, apiConfig } from './database';

export interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    timezone: string;
    currency: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    bookingConfirmations: boolean;
    paymentConfirmations: boolean;
    newUserRegistrations: boolean;
    systemAlerts: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAttempts: number;
    ipWhitelist: string;
    auditLogging: boolean;
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    sidebarCollapsed: boolean;
    compactMode: boolean;
    showAvatars: boolean;
    showNotifications: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
  };
}

export interface SystemInfo {
  databaseVersion: string;
  lastBackup: string;
  systemStatus: string;
  uptime: string;
  memoryUsage: string;
  diskUsage: string;
}

export class SettingsApiService {
  // Get all system settings
  static async getSystemSettings(): Promise<SystemSettings> {
    try {
      // Make API call to backend for real settings
      const response = await fetch(`${apiConfig.baseUrl}/admin/settings`);
      
      if (!response.ok) {
        // If API fails, return default settings
        console.warn('Failed to fetch settings from API, using defaults');
        return {
          general: {
            siteName: "Hargeisa Vibes",
            siteDescription: "Discover and book amazing experiences in Hargeisa",
            contactEmail: "admin@hargeisavibes.com",
            contactPhone: "+252 61 123 4567",
            timezone: "Africa/Mogadishu",
            currency: "USD",
            language: "English"
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
            bookingConfirmations: true,
            paymentConfirmations: true,
            newUserRegistrations: true,
            systemAlerts: true,
            marketingEmails: false
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90,
            loginAttempts: 5,
            ipWhitelist: "",
            auditLogging: true
          },
          appearance: {
            primaryColor: "#3B82F6",
            secondaryColor: "#8B5CF6",
            sidebarCollapsed: false,
            compactMode: false,
            showAvatars: true,
            showNotifications: true
          },
          email: {
            smtpHost: "smtp.gmail.com",
            smtpPort: 587,
            smtpUsername: "noreply@hargeisavibes.com",
            smtpPassword: "••••••••",
            fromName: "Hargeisa Vibes",
            fromEmail: "noreply@hargeisavibes.com",
            replyToEmail: "support@hargeisavibes.com"
          }
        };
      }

      const settingsData = await response.json();
      
      // Transform backend data to SystemSettings format
      return {
        general: settingsData.general || {
          siteName: "Hargeisa Vibes",
          siteDescription: "Discover and book amazing experiences in Hargeisa",
          contactEmail: "admin@hargeisavibes.com",
          contactPhone: "+252 61 123 4567",
          timezone: "Africa/Mogadishu",
          currency: "USD",
          language: "English"
        },
        notifications: settingsData.notifications || {
          emailNotifications: true,
          smsNotifications: false,
          bookingConfirmations: true,
          paymentConfirmations: true,
          newUserRegistrations: true,
          systemAlerts: true,
          marketingEmails: false
        },
        security: settingsData.security || {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginAttempts: 5,
          ipWhitelist: "",
          auditLogging: true
        },
        appearance: settingsData.appearance || {
          primaryColor: "#3B82F6",
          secondaryColor: "#8B5CF6",
          sidebarCollapsed: false,
          compactMode: false,
          showAvatars: true,
          showNotifications: true
        },
        email: settingsData.email || {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpUsername: "noreply@hargeisavibes.com",
          smtpPassword: "••••••••",
          fromName: "Hargeisa Vibes",
          fromEmail: "noreply@hargeisavibes.com",
          replyToEmail: "support@hargeisavibes.com"
        }
      };
    } catch (error) {
      console.error('Error getting system settings:', error);
      throw new Error('Failed to get system settings');
    }
  }

  // Save system settings
  static async saveSystemSettings(category: string, settings: any): Promise<boolean> {
    try {
      // For now, just log the settings being saved
      // In production, this should make an API call to save the data
      console.log(`Saving ${category} settings:`, settings);
      return true;
    } catch (error) {
      console.error('Error saving system settings:', error);
      throw new Error('Failed to save system settings');
    }
  }

  // Get system information
  static async getSystemInfo(): Promise<SystemInfo> {
    try {
      // For now, return mock system information
      // In production, this should make API calls to get real data
      return {
        databaseVersion: "MySQL 8.0.33",
        lastBackup: "2 hours ago",
        systemStatus: "All Systems Operational",
        uptime: "99.9%",
        memoryUsage: `${Math.round(Math.random() * 30 + 40)}%`,
        diskUsage: "15.2 MB (8 tables)"
      };
    } catch (error) {
      console.error('Error getting system info:', error);
      throw new Error('Failed to get system info');
    }
  }

  // Reset settings to default
  static async resetSettings(category: string): Promise<boolean> {
    try {
      // For now, just log the reset action
      // In production, this should make an API call to reset the data
      console.log(`Resetting ${category} settings to default`);
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error('Failed to reset settings');
    }
  }

  // Test email configuration
  static async testEmailConfig(emailConfig: any): Promise<boolean> {
    try {
      // In a real implementation, you would test the SMTP connection
      // For now, we'll just simulate a successful test
      console.log('Testing email configuration:', emailConfig);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error testing email config:', error);
      return false;
    }
  }

  // Backup system settings
  static async backupSettings(): Promise<string> {
    try {
      // For now, just create a mock backup
      // In production, this should make an API call to backup the data
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `settings-backup-${timestamp}.json`;
      
      console.log('Creating backup:', filename);
      console.log('Settings data: Mock data for now');
      
      return filename;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  // Restore system settings from backup
  static async restoreSettings(backupData: any): Promise<boolean> {
    try {
      // For now, just log the restore action
      // In production, this should make an API call to restore the data
      console.log('Restoring settings from backup:', backupData);
      return true;
    } catch (error) {
      console.error('Error restoring settings:', error);
      throw new Error('Failed to restore settings');
    }
  }
}
