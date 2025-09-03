const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function debugAuth() {
  let connection;
  
  try {
    console.log('🔍 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');
    
    // Test 1: Check if the test user exists
    console.log('\n🧪 Test 1: Checking if test user exists...');
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['testauth@example.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Test user not found');
      return;
    }
    
    const user = users[0];
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      password_hash_length: user.password_hash ? user.password_hash.length : 0
    });
    
    // Test 2: Check is_active value
    console.log('\n🧪 Test 2: Checking is_active value...');
    console.log('is_active type:', typeof user.is_active);
    console.log('is_active value:', user.is_active);
    console.log('is_active === 1:', user.is_active === 1);
    console.log('is_active === true:', user.is_active === true);
    
    // Test 3: Test password comparison
    console.log('\n🧪 Test 3: Testing password comparison...');
    const testPassword = 'testpass123';
    console.log('Test password:', testPassword);
    console.log('Password hash from DB:', user.password_hash);
    
    try {
      const isValidPassword = await bcrypt.compare(testPassword, user.password_hash);
      console.log('✅ Password comparison result:', isValidPassword);
    } catch (bcryptError) {
      console.log('❌ Bcrypt error:', bcryptError.message);
    }
    
    // Test 4: Test the exact query from the server
    console.log('\n🧪 Test 4: Testing the exact server query...');
    const [activeUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      ['testauth@example.com']
    );
    
    console.log('Query result length:', activeUsers.length);
    if (activeUsers.length > 0) {
      console.log('✅ Query found user with is_active = 1');
    } else {
      console.log('❌ Query did not find user with is_active = 1');
    }
    
    // Test 5: Check all users and their is_active status
    console.log('\n🧪 Test 5: Checking all users is_active status...');
    const [allUsers] = await connection.execute('SELECT email, is_active FROM users LIMIT 5');
    allUsers.forEach(u => {
      console.log(`${u.email}: is_active = ${u.is_active} (type: ${typeof u.is_active})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

debugAuth().catch(console.error);
