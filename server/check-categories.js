const mysql = require('mysql2/promise');

// Database configuration (using the same config as server.js)
const dbConfig = {
  host: 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: 'uogp4qwszgrvsxaf',
  password: 'iySbNOApCRNTUyvNX1Ti',
  database: 'bbx1ftpsp8wy1mhy1m9c',
  port: 3306
};

async function checkCategories() {
  let connection;
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to database successfully!');
    
    // Check all categories
    const [categories] = await connection.execute('SELECT DISTINCT category FROM services WHERE is_active = TRUE');
    console.log('\n📋 Available categories:');
    categories.forEach((row, index) => {
      console.log(`${index + 1}. ${row.category}`);
    });
    
    // Check services in each category
    console.log('\n📊 Services by category:');
    for (const categoryRow of categories) {
      const category = categoryRow.category;
      const [services] = await connection.execute('SELECT COUNT(*) as count FROM services WHERE category = ? AND is_active = TRUE', [category]);
      console.log(`${category}: ${services[0].count} services`);
    }
    
    // Check specifically for Car Rentals
    console.log('\n🚗 Checking for Car Rentals services:');
    const [carServices] = await connection.execute('SELECT id, title, category FROM services WHERE category = ? AND is_active = TRUE', ['Car Rentals']);
    if (carServices.length > 0) {
      console.log(`Found ${carServices.length} Car Rentals services:`);
      carServices.forEach(service => {
        console.log(`  - ${service.title} (ID: ${service.id})`);
      });
    } else {
      console.log('❌ No Car Rentals services found!');
      
      // Check what categories are similar
      const [similarCategories] = await connection.execute('SELECT DISTINCT category FROM services WHERE category LIKE ? AND is_active = TRUE', ['%Car%']);
      if (similarCategories.length > 0) {
        console.log('Similar categories found:');
        similarCategories.forEach(cat => {
          console.log(`  - ${cat.category}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkCategories();
