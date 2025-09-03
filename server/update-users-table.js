const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function updateUsersTable() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');

    // Check if password_hash column exists
    console.log('🔍 Checking users table structure...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash'
    `, [dbConfig.database]);

    if (columns.length === 0) {
      console.log('⚠️ password_hash column not found, adding it...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN password_hash VARCHAR(255) NULL AFTER email
      `);
      console.log('✅ password_hash column added successfully');
    } else {
      console.log('✅ password_hash column already exists');
    }

    // Check if role column supports super_admin
    console.log('🔍 Checking role column...');
    const [roleColumns] = await connection.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `, [dbConfig.database]);

    if (roleColumns.length > 0) {
      const columnType = roleColumns[0].COLUMN_TYPE;
      console.log(`📊 Current role column type: ${columnType}`);
      
      if (!columnType.includes('super_admin')) {
        console.log('⚠️ Adding super_admin to role enum...');
        await connection.execute(`
          ALTER TABLE users 
          MODIFY COLUMN role ENUM('customer', 'admin', 'moderator', 'super_admin') DEFAULT 'customer'
        `);
        console.log('✅ super_admin added to role enum');
      } else {
        console.log('✅ super_admin already in role enum');
      }
    }

    // Show current table structure
    console.log('📋 Current users table structure:');
    const [tableStructure] = await connection.execute('DESCRIBE users');
    console.table(tableStructure);

  } catch (error) {
    console.error('❌ Error updating users table:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

updateUsersTable();
