const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function createUsersTable() {
  let connection;
  
  try {
    console.log('🔍 Checking database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Check if users table exists
    console.log('\n🔍 Checking if users table exists...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbConfig.database]);
    
    if (tables.length === 0) {
      console.log('❌ Users table does not exist. Creating it...');
      
      // Create users table with all required fields
      await connection.execute(`
        CREATE TABLE users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          avatar VARCHAR(255),
          role ENUM('customer', 'admin', 'moderator', 'super_admin') DEFAULT 'customer',
          is_active BOOLEAN DEFAULT TRUE,
          is_verified BOOLEAN DEFAULT FALSE,
          is_deleted BOOLEAN DEFAULT FALSE,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_username (username),
          INDEX idx_role (role),
          INDEX idx_is_active (is_active),
          INDEX idx_is_deleted (is_deleted)
        )
      `);
      console.log('✅ Users table created successfully');
      
      // Insert sample users
      const sampleUsers = [
        {
          id: 'user-1',
          username: 'john_doe',
          email: 'john@example.com',
          password_hash: '$2a$10$dummy.hash.for.demo',
          first_name: 'John',
          last_name: 'Doe',
          role: 'customer',
          is_active: true,
          avatar: '👤'
        },
        {
          id: 'user-2',
          username: 'jane_smith',
          email: 'jane@example.com',
          password_hash: '$2a$10$dummy.hash.for.demo',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'customer',
          is_active: true,
          avatar: '👩'
        },
        {
          id: 'user-3',
          username: 'bob_wilson',
          email: 'bob@example.com',
          password_hash: '$2a$10$dummy.hash.for.demo',
          first_name: 'Bob',
          last_name: 'Wilson',
          role: 'customer',
          is_active: false,
          avatar: '👨'
        },
        {
          id: 'admin-1',
          username: 'superadmin',
          email: 'superadmin@hargeisa-vibes.com',
          password_hash: '$2a$10$dummy.hash.for.demo',
          first_name: 'Super',
          last_name: 'Admin',
          role: 'super_admin',
          is_active: true,
          avatar: '👑'
        },
        {
          id: 'admin-2',
          username: 'admin',
          email: 'admin@hargeisa-vibes.com',
          password_hash: '$2a$10$dummy.hash.for.demo',
          first_name: 'Regular',
          last_name: 'Admin',
          role: 'admin',
          is_active: true,
          avatar: '👨‍💼'
        }
      ];

      for (const user of sampleUsers) {
        await connection.execute(`
          INSERT INTO users (
            id, username, email, password_hash, first_name, last_name, 
            role, is_active, avatar, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          user.id, user.username, user.email, user.password_hash,
          user.first_name, user.last_name, user.role, user.is_active, user.avatar
        ]);
      }
      console.log('✅ Sample users inserted successfully');
      
      // Create user_preferences table
      await connection.execute(`
        CREATE TABLE user_preferences (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          preference_key VARCHAR(100) NOT NULL,
          preference_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_preference (user_id, preference_key),
          INDEX idx_user_id (user_id)
        )
      `);
      console.log('✅ User preferences table created successfully');
      
      // Create user_notifications table
      await connection.execute(`
        CREATE TABLE user_notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type ENUM('deal', 'system', 'reminder') DEFAULT 'deal',
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_is_read (is_read),
          INDEX idx_type (type)
        )
      `);
      console.log('✅ User notifications table created successfully');
      
      // Create user_saved_deals table
      await connection.execute(`
        CREATE TABLE user_saved_deals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          deal_id VARCHAR(36) NOT NULL,
          saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_deal (user_id, deal_id),
          INDEX idx_user_id (user_id),
          INDEX idx_deal_id (deal_id)
        )
      `);
      console.log('✅ User saved deals table created successfully');
      
    } else {
      console.log('✅ Users table already exists');
      
      // Check if we need to add missing columns
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      `, [dbConfig.database]);
      
      const columnNames = columns.map(col => col.COLUMN_NAME);
      const requiredColumns = ['username', 'role', 'avatar', 'is_deleted', 'last_login'];
      
      for (const col of requiredColumns) {
        if (!columnNames.includes(col)) {
          console.log(`🔧 Adding missing column: ${col}`);
          if (col === 'username') {
            await connection.execute(`ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE AFTER id`);
          } else if (col === 'role') {
            await connection.execute(`ALTER TABLE users ADD COLUMN role ENUM('customer', 'admin', 'moderator', 'super_admin') DEFAULT 'customer' AFTER phone`);
          } else if (col === 'avatar') {
            await connection.execute(`ALTER TABLE users ADD COLUMN avatar VARCHAR(255) AFTER role`);
          } else if (col === 'is_deleted') {
            await connection.execute(`ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER is_verified`);
          } else if (col === 'last_login') {
            await connection.execute(`ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL AFTER is_deleted`);
          }
          console.log(`✅ Added column: ${col}`);
        }
      }
      
      // Check how many users are in the table
      const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE is_deleted = FALSE');
      console.log(`📊 Found ${userCount[0].count} users in the table`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Make sure your database credentials are correct in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure MySQL server is running');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

createUsersTable();
