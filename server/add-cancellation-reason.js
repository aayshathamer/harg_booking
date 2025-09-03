const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function addCancellationReason() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected to database successfully!');
    
    // Check if cancellation_reason column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'cancellation_reason'
    `, [dbConfig.database]);
    
    if (columns.length === 0) {
      console.log('Adding cancellation_reason column to bookings table...');
      await connection.execute(`
        ALTER TABLE bookings 
        ADD COLUMN cancellation_reason TEXT NULL AFTER notes
      `);
      console.log('cancellation_reason column added successfully!');
    } else {
      console.log('cancellation_reason column already exists.');
    }

    // Also add to deal_bookings table
    const [dealColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deal_bookings' AND COLUMN_NAME = 'cancellation_reason'
    `, [dbConfig.database]);
    
    if (dealColumns.length === 0) {
      console.log('Adding cancellation_reason column to deal_bookings table...');
      await connection.execute(`
        ALTER TABLE deal_bookings 
        ADD COLUMN cancellation_reason TEXT NULL AFTER notes
      `);
      console.log('cancellation_reason column added to deal_bookings successfully!');
    } else {
      console.log('cancellation_reason column already exists in deal_bookings.');
    }

  } catch (error) {
    console.error('Error adding cancellation_reason column:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

addCancellationReason();
