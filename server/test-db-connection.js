const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function testDatabaseConnection() {
  let connection;
  
  try {
    console.log('🔍 Testing database connection...');
    console.log('🔍 Config:', { ...dbConfig, password: '***' });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Test 1: Check if users table exists
    console.log('\n🧪 Test 1: Checking users table...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbConfig.database]);
    
    if (tables.length === 0) {
      console.log('❌ Users table does not exist');
      return;
    }
    console.log('✅ Users table exists');
    
    // Test 2: Check table structure
    console.log('\n🧪 Test 2: Checking table structure...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);
    
    console.log('📋 Table columns:');
    columns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE}, default: ${col.COLUMN_DEFAULT})`);
    });
    
    // Test 3: Check existing users
    console.log('\n🧪 Test 3: Checking existing users...');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('📊 Total users in table:', users[0].count);
    
    // Test 4: Try a simple INSERT
    console.log('\n🧪 Test 4: Testing INSERT operation...');
    const testUserId = `test-${Date.now()}`;
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      const [insertResult] = await connection.execute(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [testUserId, testEmail, 'test-hash', 'Test', 'User', '1234567890']);
      
      console.log('✅ INSERT successful');
      console.log('📝 Insert result:', insertResult);
      console.log('📝 Affected rows:', insertResult.affectedRows);
      
      // Clean up - delete the test user
      await connection.execute('DELETE FROM users WHERE id = ?', [testUserId]);
      console.log('🧹 Test user cleaned up');
      
    } catch (insertError) {
      console.log('❌ INSERT failed:', insertError.message);
      console.log('❌ Error code:', insertError.code);
      console.log('❌ Error sqlState:', insertError.sqlState);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testDatabaseConnection().catch(console.error);
