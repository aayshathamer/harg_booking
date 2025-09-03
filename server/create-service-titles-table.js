const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function createServiceTitlesTable() {
  let connection;

  try {
    console.log('🔍 Checking database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');

    // Check if service_titles table exists
    console.log('\n🔍 Checking if service_titles table exists...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'service_titles'
    `, [dbConfig.database]);

    if (tables.length === 0) {
      console.log('❌ Service titles table does not exist. Creating it...');

      // Create service_titles table
      await connection.execute(`
        CREATE TABLE service_titles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          booking_id VARCHAR(255) NOT NULL,
          service_title VARCHAR(255) NOT NULL,
          service_type ENUM('service', 'deal') NOT NULL DEFAULT 'service',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_booking (booking_id),
          INDEX idx_booking_id (booking_id),
          INDEX idx_service_type (service_type)
        )
      `);
      console.log('✅ Service titles table created successfully');

      // Update existing bookings with service titles
      console.log('\n📝 Updating existing bookings with service titles...');
      
      // Get all bookings
      const [bookings] = await connection.execute(`
        SELECT id, service_id FROM bookings WHERE is_deleted = FALSE
      `);

      let updatedCount = 0;
      for (const booking of bookings) {
        try {
          let serviceTitle = 'Unknown Service';
          let serviceType = 'service';

          // Check if it's a deal
          if (booking.service_id && booking.service_id.startsWith('deal-')) {
            const [deals] = await connection.execute(`
              SELECT title FROM deals WHERE id = ? AND is_active = TRUE
            `, [booking.service_id]);
            
            if (deals.length > 0) {
              serviceTitle = deals[0].title;
              serviceType = 'deal';
            }
          } else {
            // Check if it's a service
            const [services] = await connection.execute(`
              SELECT title FROM services WHERE id = ? AND is_active = TRUE
            `, [booking.service_id]);
            
            if (services.length > 0) {
              serviceTitle = services[0].title;
              serviceType = 'service';
            }
          }

          // Insert service title
          await connection.execute(`
            INSERT INTO service_titles (booking_id, service_title, service_type)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE service_title = VALUES(service_title), service_type = VALUES(service_type)
          `, [booking.id, serviceTitle, serviceType]);

          updatedCount++;
        } catch (error) {
          console.log(`⚠️ Could not update booking ${booking.id}:`, error.message);
        }
      }

      console.log(`✅ Updated ${updatedCount} existing bookings with service titles`);

    } else {
      console.log('✅ Service titles table already exists');

      // Check how many service titles are in the table
      const [titleCount] = await connection.execute('SELECT COUNT(*) as count FROM service_titles');
      console.log(`📊 Found ${titleCount[0].count} service titles in the table`);

      // Show sample service titles
      const [titles] = await connection.execute('SELECT booking_id, service_title, service_type FROM service_titles LIMIT 5');
      if (titles.length > 0) {
        console.log('\n📋 Sample service titles in database:');
        titles.forEach(title => {
          console.log(`  - ${title.service_title} (${title.service_type}) for booking ${title.booking_id}`);
        });
      }
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

createServiceTitlesTable();
