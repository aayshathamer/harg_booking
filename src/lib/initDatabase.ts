import { initDatabase, closeDatabase } from './database';

// Database initialization and cleanup utilities
export class DatabaseManager {
  private static isInitialized = false;

  // Initialize database connection
  static async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('Initializing database connection...');
      const success = await initDatabase();
      
      if (success) {
        this.isInitialized = true;
        console.log('Database connection initialized successfully');
        
        // Set up cleanup on app exit
        this.setupCleanup();
        
        return true;
      } else {
        console.error('Failed to initialize database connection');
        return false;
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  // Close database connection
  static async cleanup(): Promise<void> {
    if (this.isInitialized) {
      try {
        await closeDatabase();
        this.isInitialized = false;
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database:', error);
      }
    }
  }

  // Set up cleanup handlers
  private static setupCleanup(): void {
    // Handle app exit
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }

    // Handle process exit (Node.js)
    if (typeof process !== 'undefined') {
      process.on('SIGINT', () => {
        this.cleanup();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        this.cleanup();
        process.exit(0);
      });
    }
  }

  // Check if database is initialized
  static isReady(): boolean {
    return this.isInitialized;
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      // Simple query to test connection
      const testQuery = 'SELECT 1 as test';
      const result = await fetch('/api/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: testQuery }),
      });

      if (result.ok) {
        return true;
      } else {
        console.error('Database health check failed');
        return false;
      }
    } catch (error) {
      console.error('Database health check error:', error);
      return false;
    }
  }
}

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Browser environment
  DatabaseManager.initialize().catch(console.error);
}
