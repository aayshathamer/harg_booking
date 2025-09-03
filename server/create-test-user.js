const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function createTestUser() {
  let connection;
  
  try {
    console.log('🔍 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Check if users table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbConfig.database]);
    
    if (tables.length === 0) {
      console.log('❌ Users table does not exist. Creating it first...');
      
      // Create users table
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
    }
    
    // Check if test user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['test@example.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('✅ Test user already exists');
      return;
    }
    
    // Create test user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const username = 'testuser';
    const email = 'test@example.com';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await connection.execute(`
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, username, email, passwordHash, 'Test', 'User', 'customer', true]);
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('🆔 User ID:', userId);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

createTestUser();
