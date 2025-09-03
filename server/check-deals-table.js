const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

async function checkAndCreateDealsTable() {
  let connection;
  
  try {
    console.log('🔍 Checking database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Check if deals table exists
    console.log('\n🔍 Checking if deals table exists...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deals'
    `, [dbConfig.database]);
    
    if (tables.length === 0) {
      console.log('❌ Deals table does not exist. Creating it...');
      
      // Create deals table
      await connection.execute(`
        CREATE TABLE deals (
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_by VARCHAR(36),
          INDEX idx_category (category),
          INDEX idx_is_hot (is_hot),
          INDEX idx_is_ai_recommended (is_ai_recommended),
          INDEX idx_valid_until (valid_until),
          INDEX idx_is_active (is_active)
        )
      `);
      console.log('✅ Deals table created successfully');
      
      // Create deal_features table
      await connection.execute(`
        CREATE TABLE deal_features (
          id INT AUTO_INCREMENT PRIMARY KEY,
          deal_id VARCHAR(36) NOT NULL,
          feature_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
          INDEX idx_deal_id (deal_id)
        )
      `);
      console.log('✅ Deal features table created successfully');
      
      // Create deal_terms table
      await connection.execute(`
        CREATE TABLE deal_terms (
          id INT AUTO_INCREMENT PRIMARY KEY,
          deal_id VARCHAR(36) NOT NULL,
          term_text TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
          INDEX idx_deal_id (deal_id)
        )
      `);
      console.log('✅ Deal terms table created successfully');
      
      // Create deal_included_services table
      await connection.execute(`
        CREATE TABLE deal_included_services (
          id INT AUTO_INCREMENT PRIMARY KEY,
          deal_id VARCHAR(36) NOT NULL,
          service_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
          INDEX idx_deal_id (deal_id)
        )
      `);
      console.log('✅ Deal included services table created successfully');
      
      // Create deal_excluded_services table
      await connection.execute(`
        CREATE TABLE deal_excluded_services (
          id INT AUTO_INCREMENT PRIMARY KEY,
          deal_id VARCHAR(36) NOT NULL,
          service_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
          INDEX idx_deal_id (deal_id)
        )
      `);
      console.log('✅ Deal excluded services table created successfully');
      
      // Insert sample deals
      console.log('\n📝 Inserting sample deals...');
      const sampleDeals = [
        {
          id: 'deal-1',
          title: 'Luxury Hotel in Downtown',
          location: 'Hargeisa City Center',
          price: 120.00,
          original_price: 160.00,
          rating: 4.8,
          reviews_count: 324,
          image: '🏨',
          category: 'Hotels',
          discount_percentage: 25,
          discount_label: '25% OFF',
          time_left: '2 days left',
          description: 'Experience luxury in the heart of Hargeisa with our premium downtown hotel.',
          valid_until: '2025-02-15',
          is_hot: true,
          is_ai_recommended: false
        },
        {
          id: 'deal-2',
          title: 'SUV Car Rental Deal',
          location: 'Hargeisa Airport',
          price: 45.00,
          original_price: 60.00,
          rating: 4.6,
          reviews_count: 158,
          image: '🚗',
          category: 'Cars',
          discount_percentage: 25,
          discount_label: '25% OFF',
          time_left: '5 days left',
          description: 'Explore Hargeisa and beyond with our reliable SUV rental.',
          valid_until: '2025-02-20',
          is_hot: false,
          is_ai_recommended: true
        }
      ];
      
      for (const deal of sampleDeals) {
        await connection.execute(`
          INSERT INTO deals (
            id, title, location, price, original_price, rating, reviews_count,
            image, category, discount_percentage, discount_label, time_left,
            description, valid_until, is_hot, is_ai_recommended
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          deal.id, deal.title, deal.location, deal.price, deal.original_price,
          deal.rating, deal.reviews_count, deal.image, deal.category,
          deal.discount_percentage, deal.discount_label, deal.time_left,
          deal.description, deal.valid_until, deal.is_hot, deal.is_ai_recommended
        ]);
      }
      console.log(`✅ Inserted ${sampleDeals.length} sample deals`);
      
    } else {
      console.log('✅ Deals table already exists');
      
      // Check how many deals are in the table
      const [dealCount] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE is_active = TRUE');
      console.log(`📊 Found ${dealCount[0].count} active deals in the table`);
      
      // Show sample deals
      const [deals] = await connection.execute('SELECT id, title, category, price FROM deals WHERE is_active = TRUE LIMIT 5');
      if (deals.length > 0) {
        console.log('\n📋 Sample deals in database:');
        deals.forEach(deal => {
          console.log(`  - ${deal.title} (${deal.category}) - $${deal.price}`);
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

checkAndCreateDealsTable();
