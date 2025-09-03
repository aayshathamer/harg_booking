const mysql = require('mysql2/promise');

const testCredentials = [
  { user: 'uogp4qwszgrvsxaf', password: 'iySbNOApCRNTUyvNX1Ti' },
  { user: 'root', password: 'root' },
  { user: 'root', password: 'admin' },
  { user: 'root', password: 'password' },
  { user: 'root', password: '123456' },
  { user: 'root', password: 'mysql' }
];

async function testConnection() {
  console.log('🔍 Testing MySQL connections...\n');
  
  for (const cred of testCredentials) {
    try {
      console.log(`Testing: ${cred.user} / ${cred.password || '(no password)'}`);
      
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: cred.user,
        password: cred.password,
        port: 3306
      });
      
      await connection.ping();
      console.log(`✅ SUCCESS! User: ${cred.user}, Password: ${cred.password || '(none)'}\n`);
      
      // Test if database exists
      try {
        const [rows] = await connection.execute('SHOW DATABASES');
        console.log('Available databases:');
        rows.forEach(row => console.log(`  - ${row.Database_name}`));
        
        // Check if bbx1ftpsp8wy1mhy1m9c exists
        const dbExists = rows.some(row => row.Database_name === 'bbx1ftpsp8wy1mhy1m9c');
        if (dbExists) {
          console.log('\n✅ Database "bbx1ftpsp8wy1mhy1m9c" exists!');
        } else {
          console.log('\n❌ Database "bbx1ftpsp8wy1mhy1m9c" does not exist.');
          console.log('You need to create it first using your database-schema.sql file.');
        }
      } catch (dbError) {
        console.log('Could not check databases:', dbError.message);
      }
      
      await connection.end();
      return cred; // Return successful credentials
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log('❌ All connection attempts failed.');
  console.log('\n💡 You may need to:');
  console.log('1. Reset your MySQL root password');
  console.log('2. Create a new MySQL user');
  console.log('3. Check MySQL installation documentation');
  
  return null;
}

testConnection().catch(console.error);
