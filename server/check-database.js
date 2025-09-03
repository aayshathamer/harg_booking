const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');

    // Check table structure
    console.log('\n📋 Checking table structure...');
    
    const tables = ['services', 'users', 'deals', 'bookings'];
    
    for (const table of tables) {
      try {
        console.log(`\n--- Table: ${table} ---`);
        
        // Check columns
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.log('Columns:');
        columns.forEach(col => {
          console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Check record count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult[0].count;
        console.log(`Record count: ${count}`);
        
        // Show sample data
        if (count > 0) {
          const [sampleData] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
          console.log('Sample record:');
          console.log(JSON.stringify(sampleData[0], null, 2));
        }
        
      } catch (error) {
        console.log(`❌ Error checking table ${table}:`, error.message);
      }
    }

    // Test specific queries
    console.log('\n🧪 Testing specific queries...');
    
    try {
      // Test bookings query
      const [bookings] = await connection.execute(`
        SELECT 
          b.id,
          b.service_id,
          b.customer_name,
          b.customer_email,
          b.customer_phone,
          b.booking_date,
          b.travel_date,
          b.number_of_people,
          b.total_amount,
          b.status,
          b.payment_status,
          b.payment_method,
          b.transaction_id,
          b.notes,
          b.created_at,
          b.updated_at,
          COALESCE(s.title, 'Unknown Service') as serviceTitle,
          s.image as serviceImage
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        ORDER BY b.created_at DESC
        LIMIT 3
      `);
      
      console.log('\nBookings query result:');
      console.log(JSON.stringify(bookings, null, 2));
      
    } catch (error) {
      console.log('❌ Error testing bookings query:', error.message);
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkDatabase();
