const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔌 Testing database connection...');
    console.log('Config:', { ...dbConfig, password: '***' });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');

    // Test each table
    const tables = ['services', 'users', 'deals', 'bookings'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 Table ${table}: ${rows[0].count} records`);
        
        if (rows[0].count > 0) {
          const [sampleRows] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
          console.log(`   Sample record:`, JSON.stringify(sampleRows[0], null, 2));
        }
      } catch (error) {
        console.log(`❌ Error checking table ${table}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testConnection();
