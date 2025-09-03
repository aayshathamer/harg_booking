const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c'
};

async function createSettingsTable() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected to database successfully!');
    
    // Check if system_settings table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "system_settings"');
    
    if (tables.length === 0) {
      console.log('Creating system_settings table...');
      await connection.execute(`
        CREATE TABLE system_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          settings_data JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_category (category),
          INDEX idx_category (category)
        )
      `);
      console.log('system_settings table created successfully!');
      
      // Insert default settings
      console.log('Inserting default settings...');
      
      const defaultSettings = [
        {
          category: 'general',
          settings_data: JSON.stringify({
            siteName: "Hargeisa Vibes",
            siteDescription: "Discover and book amazing experiences in Hargeisa",
            contactEmail: "admin@hargeisavibes.com",
            contactPhone: "+252 61 123 4567",
            timezone: "Africa/Mogadishu",
            currency: "USD",
            language: "English"
          })
        },
        {
          category: 'notifications',
          settings_data: JSON.stringify({
            emailNotifications: true,
            smsNotifications: false,
            bookingConfirmations: true,
            paymentConfirmations: true,
            newUserRegistrations: true,
            systemAlerts: true,
            marketingEmails: false
          })
        },
        {
          category: 'security',
          settings_data: JSON.stringify({
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90,
            loginAttempts: 5,
            ipWhitelist: "",
            auditLogging: true
          })
        },
        {
          category: 'appearance',
          settings_data: JSON.stringify({
            primaryColor: "#3B82F6",
            secondaryColor: "#8B5CF6",
            sidebarCollapsed: false,
            compactMode: false,
            showAvatars: true,
            showNotifications: true
          })
        },
        {
          category: 'email',
          settings_data: JSON.stringify({
            smtpHost: "smtp.gmail.com",
            smtpPort: 587,
            smtpUsername: "noreply@hargeisavibes.com",
            smtpPassword: "",
            fromName: "Hargeisa Vibes",
            fromEmail: "noreply@hargeisavibes.com",
            replyToEmail: "support@hargeisavibes.com"
          })
        }
      ];
      
      for (const setting of defaultSettings) {
        await connection.execute(
          'INSERT INTO system_settings (category, settings_data) VALUES (?, ?)',
          [setting.category, setting.settings_data]
        );
      }
      
      console.log('Default settings inserted successfully!');
      
    } else {
      console.log('system_settings table already exists, skipping...');
    }
    
    // Verify the setup
    console.log('\nVerifying setup...');
    
    const [settings] = await connection.execute('SELECT category FROM system_settings');
    console.log(`Found ${settings.length} setting categories:`);
    settings.forEach(setting => {
      console.log(`- ${setting.category}`);
    });
    
    console.log('\n✅ Settings table setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up settings table:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the setup
if (require.main === module) {
  createSettingsTable()
    .then(() => {
      console.log('Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createSettingsTable };
