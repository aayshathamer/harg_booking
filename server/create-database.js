const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createDatabase() {
  try {
    console.log('🔧 Creating database and importing schema...\n');
    
    // Connect to MySQL (no password)
    const connection = await mysql.createConnection({
      host: 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
      user: 'uogp4qwszgrvsxaf',
      password: 'iySbNOApCRNTUyvNX1Ti',
      port: 3306
    });
    
    console.log('✅ Connected to MySQL successfully');
    
    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS bbx1ftpsp8wy1mhy1m9c');
    console.log('✅ Database "bbx1ftpsp8wy1mhy1m9c" created/verified');
    
    // Connect directly to the specific database
    const dbConnection = await mysql.createConnection({
      host: 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
      user: 'uogp4qwszgrvsxaf',
      password: 'iySbNOApCRNTUyvNX1Ti',
      port: 3306,
      database: 'bbx1ftpsp8wy1mhy1m9c'
    });
    console.log('✅ Connected to database "bbx1ftpsp8wy1mhy1m9c"');
    
    // Close the initial connection
    await connection.end();
    
    // Create basic tables manually (simplified approach)
    console.log('📝 Creating basic tables...');
    
    // Create services table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        rating DECIMAL(3,2) DEFAULT 0.00,
        image VARCHAR(255),
        location VARCHAR(255),
        is_popular BOOLEAN DEFAULT FALSE,
        is_new BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Services table created');
    
    // Create service_features table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS service_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id VARCHAR(36) NOT NULL,
        feature_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_service_id (service_id)
      )
    `);
    console.log('✅ Service features table created');
    
    // Create deals table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS deals (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) NOT NULL,
        rating DECIMAL(3,2) DEFAULT 0.00,
        reviews_count INT DEFAULT 0,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        discount_percentage INT NOT NULL,
        discount_label VARCHAR(50) NOT NULL,
        time_left VARCHAR(100),
        description TEXT,
        valid_until DATE NOT NULL,
        is_hot BOOLEAN DEFAULT FALSE,
        is_ai_recommended BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Deals table created');
    
    // Create users table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        role ENUM('customer', 'admin', 'moderator') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
    // Create bookings table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        service_id VARCHAR(36) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        travel_date DATE NOT NULL,
        number_of_people INT DEFAULT 1,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'refunded') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
        payment_method VARCHAR(100),
        transaction_id VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Bookings table created');
    
    console.log('\n🎉 Database setup completed!');
    
    // Verify the setup
    const [tables] = await dbConnection.execute('SHOW TABLES');
    console.log('\n📊 Created tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    await dbConnection.end();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

createDatabase();
