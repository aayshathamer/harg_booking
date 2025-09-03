const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendBookingReceipt, testEmailConfig } = require('./emailService');
const { createPayPalOrder, capturePayPalOrder, getPayPalOrder, verifyPayPalWebhook, testPayPalConfiguration } = require('./paypalService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());



// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c',
  port: process.env.DB_PORT || 3306
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database connection pool
let connectionPool = null;

// Initialize database connection
const initDatabase = async () => {
  try {
    connectionPool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();
    
    console.log('✅ Database connection initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('⚠️ Server will start without database connection. Some features may not work.');
    return false;
  }
};

// Execute database query
const executeQuery = async (query, params = []) => {
  try {
    console.log('🔍 Executing query:', query);
    console.log('🔍 Params:', params);
    
    if (connectionPool) {
      const [result] = await connectionPool.execute(query, params);
      console.log('✅ Query executed successfully');
      
      // Handle different types of results
      if (query.trim().toUpperCase().startsWith('INSERT')) {
        // INSERT returns OkPacket with affectedRows
        console.log('📝 Insert operation - affected rows:', result.affectedRows);
        return result.affectedRows > 0 ? [result] : [];
      } else if (query.trim().toUpperCase().startsWith('UPDATE') || query.trim().toUpperCase().startsWith('DELETE')) {
        // UPDATE/DELETE returns OkPacket with affectedRows
        console.log('📝 Update/Delete operation - affected rows:', result.affectedRows);
        return result.affectedRows > 0 ? [result] : [];
      } else {
        // SELECT returns rows
        console.log('📝 Select operation - rows returned:', result.length || 0);
        return result;
      }
    }
    
    console.log('⚠️ Database not connected, returning empty result');
    return [];
  } catch (error) {
    console.error('❌ Database query error:', error);
    console.log('⚠️ Database operation failed, returning empty result');
    return [];
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// API Routes

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        GROUP_CONCAT(DISTINCT sf.feature_name) as features
      FROM services s
      LEFT JOIN service_features sf ON s.id = sf.service_id
      WHERE s.is_active = TRUE
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;
    
    const services = await executeQuery(query);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get services by category
app.get('/api/services/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const query = `
      SELECT 
        s.*,
        GROUP_CONCAT(DISTINCT sf.feature_name) as features
      FROM services s
      LEFT JOIN service_features sf ON s.id = sf.service_id
      WHERE s.category = ? AND s.is_active = TRUE
      GROUP BY s.id
      ORDER BY s.rating DESC
    `;
    
    const services = await executeQuery(query, [category]);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({ error: 'Failed to fetch services by category' });
  }
});

// Get service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        s.*,
        GROUP_CONCAT(DISTINCT sf.feature_name) as features
      FROM services s
      LEFT JOIN service_features sf ON s.id = sf.service_id
      WHERE s.id = ? AND s.is_active = TRUE
      GROUP BY s.id
    `;
    
    const services = await executeQuery(query, [id]);
    
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(services[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create a new service
app.post('/api/services', async (req, res) => {
  try {
    const { title, description, category, price, rating, image, location, isPopular, isNew, features } = req.body;
    
    // Generate service ID
    const serviceId = `service-${Date.now()}`;
    
    // Parse price - remove currency symbols and convert to number
    let parsedPrice = 0;
    if (price) {
      // Remove currency symbols, commas, and spaces, then parse as float
      const cleanPrice = price.toString().replace(/[$,€£¥\s]/g, '');
      parsedPrice = parseFloat(cleanPrice) || 0;
    }
    
    // Insert main service
    const insertQuery = `
      INSERT INTO services (
        id, title, description, category, price, rating, image, location,
        is_popular, is_new, created_at, updated_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE)
    `;
    
    const insertParams = [
      serviceId, title, description, category, parsedPrice, rating || 0,
      image, location, isPopular || false, isNew || false
    ];
    
    await executeQuery(insertQuery, insertParams);
    
    // Insert features if provided
    if (features && features.length > 0) {
      for (const feature of features) {
        const featureQuery = 'INSERT INTO service_features (service_id, feature_name) VALUES (?, ?)';
        await executeQuery(featureQuery, [serviceId, feature]);
      }
    }
    
    res.status(201).json({ 
      message: 'Service created successfully',
      serviceId: serviceId 
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update existing service
app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, rating, image, location, isPopular, isNew, features } = req.body;
    
    // Parse price - remove currency symbols and convert to number
    let parsedPrice = 0;
    if (price) {
      // Remove currency symbols, commas, and spaces, then parse as float
      const cleanPrice = price.toString().replace(/[$,€£¥\s]/g, '');
      parsedPrice = parseFloat(cleanPrice) || 0;
    }
    
    // Update main service
    const updateQuery = `
      UPDATE services SET 
        title = ?, description = ?, category = ?, price = ?, 
        rating = ?, image = ?, location = ?, is_popular = ?, is_new = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const updateParams = [
      title, description, category, parsedPrice, rating || 0,
      image, location, isPopular || false, isNew || false, id
    ];
    
    await executeQuery(updateQuery, updateParams);
    
    // Update features if provided
    if (features) {
      // Delete existing features
      await executeQuery('DELETE FROM service_features WHERE service_id = ?', [id]);
      
      // Insert new features
      if (features.length > 0) {
        for (const feature of features) {
          const featureQuery = 'INSERT INTO service_features (service_id, feature_name) VALUES (?, ?)';
          await executeQuery(featureQuery, [id, feature]);
        }
      }
    }
    
    res.json({ 
      message: 'Service updated successfully',
      serviceId: id 
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service (soft delete)
app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete the service
    const deleteQuery = 'UPDATE services SET is_active = FALSE WHERE id = ?';
    await executeQuery(deleteQuery, [id]);
    
    res.json({ 
      message: 'Service deleted successfully',
      serviceId: id 
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Get all deals
app.get('/api/deals', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.*,
        GROUP_CONCAT(DISTINCT df.feature_name) as features,
        GROUP_CONCAT(DISTINCT dt.term_text) as terms,
        GROUP_CONCAT(DISTINCT dis.service_name) as included_services,
        GROUP_CONCAT(DISTINCT des.service_name) as excluded_services
      FROM deals d
      LEFT JOIN deal_features df ON d.id = df.deal_id
      LEFT JOIN deal_terms dt ON d.id = dt.deal_id
      LEFT JOIN deal_included_services dis ON d.id = dis.deal_id
      LEFT JOIN deal_excluded_services des ON d.id = des.deal_id
      WHERE d.is_active = TRUE
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `;
    
    const deals = await executeQuery(query);
    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Get deal by ID
app.get('/api/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        d.*,
        GROUP_CONCAT(DISTINCT df.feature_name) as features,
        GROUP_CONCAT(DISTINCT dt.term_text) as terms,
        GROUP_CONCAT(DISTINCT dis.service_name) as included_services,
        GROUP_CONCAT(DISTINCT des.service_name) as excluded_services
      FROM deals d
      LEFT JOIN deal_features df ON d.id = df.deal_id
      LEFT JOIN deal_terms dt ON d.id = dt.deal_id
      LEFT JOIN deal_included_services dis ON d.id = dis.deal_id
      LEFT JOIN deal_excluded_services des ON d.id = des.deal_id
      WHERE d.id = ? AND d.is_active = TRUE
      GROUP BY d.id
    `;
    
    const deals = await executeQuery(query, [id]);
    if (deals.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    
    res.json(deals[0]);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// Create new deal
app.post('/api/deals', async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      originalPrice,
      rating = 0,
      reviews = 0,
      image,
      category,
      discount,
      timeLeft,
      description,
      validUntil,
      hot = false,
      aiRecommended = false,
      features = [],
      terms = [],
      includedServices = [],
      excludedServices = []
    } = req.body;

    // Parse price to float
    const priceValue = parseFloat(price) || 0;
    const originalPriceValue = parseFloat(originalPrice) || 0;
    
    // Generate deal ID
    const dealId = `deal-${Date.now()}`;
    
    // Insert main deal
    const insertQuery = `
      INSERT INTO deals (
        id, title, location, price, original_price, rating, reviews_count,
        image, category, discount_percentage, discount_label, time_left,
        description, valid_until, is_hot, is_ai_recommended, created_at, updated_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE)
    `;
    
    // Extract discount percentage from discount string
    const discountPercentage = discount ? parseInt(discount.replace(/\D/g, '')) : 0;
    
    const insertParams = [
      dealId,
      title,
      location,
      priceValue,
      originalPriceValue,
      rating,
      reviews,
      image,
      category,
      discountPercentage,
      discount || '0% OFF',
      timeLeft || '1 week left',
      description,
      validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hot,
      aiRecommended
    ];
    
    await executeQuery(insertQuery, insertParams);
    
    // Insert features if provided
    if (features && features.length > 0) {
      for (const feature of features) {
        await executeQuery(
          'INSERT INTO deal_features (deal_id, feature_name) VALUES (?, ?)',
          [dealId, feature]
        );
      }
    }
    
    // Insert terms if provided
    if (terms && terms.length > 0) {
      for (const term of terms) {
        await executeQuery(
          'INSERT INTO deal_terms (deal_id, term_text) VALUES (?, ?)',
          [dealId, term]
        );
      }
    }
    
    // Insert included services if provided
    if (includedServices && includedServices.length > 0) {
      for (const service of includedServices) {
        await executeQuery(
          'INSERT INTO deal_included_services (deal_id, service_name) VALUES (?, ?)',
          [dealId, service]
        );
      }
    }
    
    // Insert excluded services if provided
    if (excludedServices && excludedServices.length > 0) {
      for (const service of excludedServices) {
        await executeQuery(
          'INSERT INTO deal_excluded_services (deal_id, service_name) VALUES (?, ?)',
          [dealId, service]
        );
      }
    }
    
    res.status(201).json({ 
      message: 'Deal created successfully',
      dealId: dealId 
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Update deal
app.put('/api/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      location,
      price,
      originalPrice,
      rating,
      reviews,
      image,
      category,
      discount,
      timeLeft,
      description,
      validUntil,
      hot,
      aiRecommended,
      features = [],
      terms = [],
      includedServices = [],
      excludedServices = []
    } = req.body;

    // Parse price to float
    const priceValue = parseFloat(price) || 0;
    const originalPriceValue = parseFloat(originalPrice) || 0;
    
    // Update main deal
    const updateQuery = `
      UPDATE deals SET
        title = ?, location = ?, price = ?, original_price = ?, rating = ?, reviews_count = ?,
        image = ?, category = ?, discount_percentage = ?, discount_label = ?, time_left = ?,
        description = ?, valid_until = ?, is_hot = ?, is_ai_recommended = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = TRUE
    `;
    
    // Extract discount percentage from discount string
    const discountPercentage = discount ? parseInt(discount.replace(/\D/g, '')) : 0;
    
    const updateParams = [
      title,
      location,
      priceValue,
      originalPriceValue,
      rating,
      reviews,
      image,
      category,
      discountPercentage,
      discount || '0% OFF',
      timeLeft || '1 week left',
      description,
      validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hot,
      aiRecommended,
      id
    ];
    
    const result = await executeQuery(updateQuery, updateParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Deal not found or already deleted' });
    }
    
    // Delete existing related data
    await executeQuery('DELETE FROM deal_features WHERE deal_id = ?', [id]);
    await executeQuery('DELETE FROM deal_terms WHERE deal_id = ?', [id]);
    await executeQuery('DELETE FROM deal_included_services WHERE deal_id = ?', [id]);
    await executeQuery('DELETE FROM deal_excluded_services WHERE deal_id = ?', [id]);
    
    // Insert updated features if provided
    if (features && features.length > 0) {
      for (const feature of features) {
        await executeQuery(
          'INSERT INTO deal_features (deal_id, feature_name) VALUES (?, ?)',
          [id, feature]
        );
      }
    }
    
    // Insert updated terms if provided
    if (terms && terms.length > 0) {
      for (const term of terms) {
        await executeQuery(
          'INSERT INTO deal_terms (deal_id, term_text) VALUES (?, ?)',
          [id, term]
        );
      }
    }
    
    // Insert updated included services if provided
    if (includedServices && includedServices.length > 0) {
      for (const service of includedServices) {
        await executeQuery(
          'INSERT INTO deal_included_services (deal_id, service_name) VALUES (?, ?)',
          [id, service]
        );
      }
    }
    
    // Insert updated excluded services if provided
    if (excludedServices && excludedServices.length > 0) {
      for (const service of excludedServices) {
        await executeQuery(
          'INSERT INTO deal_excluded_services (deal_id, service_name) VALUES (?, ?)',
          [id, service]
        );
      }
    }
    
    res.json({ 
      message: 'Deal updated successfully',
      dealId: id 
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// Delete deal (soft delete)
app.delete('/api/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete the deal
    const deleteQuery = 'UPDATE deals SET is_active = FALSE WHERE id = ?';
    const result = await executeQuery(deleteQuery, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Deal not found or already deleted' });
    }
    
    res.json({ 
      message: 'Deal deleted successfully',
      dealId: id 
    });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const query = 'SELECT * FROM users WHERE is_active = TRUE ORDER BY created_at DESC';
    const users = await executeQuery(query);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        id, username, email, first_name, last_name, phone, avatar,
        role, is_active, last_login, created_at, updated_at
      FROM users
      WHERE id = ? AND is_deleted = FALSE
    `;
    
    const result = await executeQuery(query, [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user by username
app.get('/api/users/username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const query = `
      SELECT 
        id, username, email, first_name, last_name, phone, avatar,
        role, is_active, last_login, created_at, updated_at
      FROM users
      WHERE username = ? AND is_deleted = FALSE
    `;
    
    const result = await executeQuery(query, [username]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (for admin panel)
app.post('/api/users', async (req, res) => {
  try {
    const { id, username, email, firstName, lastName, phone, avatar, role, isActive, password } = req.body;
    
    // Validate required fields
    if (!id || !username || !email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already exists
    const existingUser = await executeQuery('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }
    
    // Hash password if provided
    let passwordHash = null;
    if (password && password.trim()) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }
    
    // Insert new user
    const insertQuery = `
      INSERT INTO users (
        id, username, email, password_hash, first_name, last_name, phone, avatar,
        role, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    // Map super_admin to admin for database compatibility
    const dbRole = role === 'super_admin' ? 'admin' : (role || 'customer');
    
    const insertParams = [
      id, username, email, passwordHash, firstName, lastName, phone || null, avatar || null,
      dbRole, isActive !== undefined ? isActive : true
    ];
    
    const result = await executeQuery(insertQuery, insertParams);
    
    if (!result || result.length === 0) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    res.status(201).json({ 
      message: 'User created successfully',
      userId: id 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (for admin panel)
app.put('/api/users', async (req, res) => {
  try {
    const { query, params } = req.body;
    
    if (!query || !params) {
      return res.status(400).json({ error: 'Query and params are required' });
    }
    
    const result = await executeQuery(query, params);
    
    res.json({ 
      message: 'User updated successfully',
      result: result 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (for admin panel)
app.delete('/api/users', async (req, res) => {
  try {
    const { query, params } = req.body;
    
    if (!query || !params) {
      return res.status(400).json({ error: 'Query and params are required' });
    }
    
    const result = await executeQuery(query, params);
    
    res.json({ 
      message: 'User deleted successfully',
      result: result 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get booking statistics
app.get('/api/bookings/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue
      FROM bookings
      WHERE is_deleted = FALSE
    `;
    
    const result = await executeQuery(query);
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    res.status(500).json({ error: 'Failed to fetch booking statistics' });
  }
});

// Get revenue analytics
app.get('/api/bookings/analytics', async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as revenue,
        AVG(total_amount) as avg_booking_value
      FROM bookings
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      AND is_deleted = FALSE
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    const result = await executeQuery(query);
    res.json(result);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Get all bookings with optional filtering
app.get('/api/bookings', async (req, res) => {
  try {
    const { status, paymentStatus, customerEmail, search } = req.query;
    
    let whereClause = 'WHERE b.is_deleted = FALSE';
    let queryParams = [];
    
    // Add status filter
    if (status) {
      whereClause += ' AND b.status = ?';
      queryParams.push(status);
    }
    
    // Add payment status filter
    if (paymentStatus) {
      whereClause += ' AND b.payment_status = ?';
      queryParams.push(paymentStatus);
    }
    
    // Add customer email filter
    if (customerEmail) {
      whereClause += ' AND b.customer_email = ?';
      queryParams.push(customerEmail);
    }
    
    // Add search filter (search in customer info only since we fetch service titles separately)
    if (search) {
      whereClause += ' AND (b.customer_name LIKE ? OR b.customer_email LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }
    
    const query = `
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
        b.updated_at
      FROM bookings b
      ${whereClause}
      ORDER BY b.created_at DESC
    `;
    
    const rawBookings = await executeQuery(query, queryParams);
    
    // Debug: Log raw database data
    console.log('Raw database bookings:', rawBookings);
    
    // Debug: Log first booking details
    if (rawBookings.length > 0) {
      console.log('First booking raw data:', {
        id: rawBookings[0].id,
        service_id: rawBookings[0].service_id,
        status: rawBookings[0].status,
        payment_status: rawBookings[0].payment_status,
        booking_date: rawBookings[0].booking_date,
        travel_date: rawBookings[0].travel_date,
        total_amount: rawBookings[0].total_amount
      });
    }
    
    // Map database fields to frontend interface and get service titles
    const bookings = await Promise.all(rawBookings.map(async (booking) => {
      let serviceTitle = 'Unknown Service';
      let serviceImage = '';
      
      try {
        // Try to find it as a deal first
        if (booking.service_id && booking.service_id.startsWith('deal-')) {
          const dealQuery = `SELECT title, image FROM deals WHERE id = ? AND is_active = TRUE`;
          const deals = await executeQuery(dealQuery, [booking.service_id]);
          if (deals.length > 0) {
            serviceTitle = deals[0].title;
            serviceImage = deals[0].image || '';
          }
        } else {
          // Try to find it as a regular service
          const serviceQuery = `SELECT title, image FROM services WHERE id = ? AND is_active = TRUE`;
          const services = await executeQuery(serviceQuery, [booking.service_id]);
          if (services.length > 0) {
            serviceTitle = services[0].title;
            serviceImage = services[0].image || '';
          }
        }
      } catch (error) {
        console.log('Could not fetch service/deal info for booking:', booking.service_id);
      }
      
      return {
        id: booking.id,
        serviceId: booking.service_id,
        serviceTitle: serviceTitle,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        bookingDate: booking.booking_date ? new Date(booking.booking_date) : new Date(),
        travelDate: booking.travel_date ? new Date(booking.travel_date) : new Date(),
        numberOfPeople: parseInt(booking.number_of_people) || 1,
        totalAmount: parseFloat(booking.total_amount) || 0,
        status: booking.status,
        paymentStatus: booking.payment_status,
        paymentMethod: booking.payment_method,
        transactionId: booking.transaction_id,
        notes: booking.notes,
        createdAt: new Date(booking.created_at),
        updatedAt: new Date(booking.updated_at)
      };
    }));
    
    // Debug: Log mapped data
    console.log('Mapped bookings:', bookings);
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { 
      serviceId, customerName, customerEmail, customerPhone, 
      bookingDate, travelDate, numberOfPeople, totalAmount, 
      status, paymentStatus, paymentMethod, notes 
    } = req.body;
    
    // Generate booking ID
    const bookingId = `booking-${Date.now()}`;
    
    // Get service/deal title (treat deals as services)
    let serviceTitle = 'Unknown Service';
    let calculatedTotalAmount = totalAmount || 0;
    
    try {
      // First try to find it as a deal
      if (serviceId && serviceId.startsWith('deal-')) {
        const dealQuery = `SELECT title, price FROM deals WHERE id = ? AND is_active = TRUE`;
        const deals = await executeQuery(dealQuery, [serviceId]);
        if (deals.length > 0) {
          serviceTitle = deals[0].title;
          // Use the deal price if available
          if (deals[0].price && deals[0].price !== '0.00') {
            calculatedTotalAmount = parseFloat(deals[0].price) * (numberOfPeople || 1);
          }
        }
      } else {
        // Try to find it as a regular service
        const serviceQuery = `SELECT title FROM services WHERE id = ? AND is_active = TRUE`;
        const services = await executeQuery(serviceQuery, [serviceId]);
        if (services.length > 0) {
          serviceTitle = services[0].title;
        }
      }
    } catch (error) {
      console.log('Could not fetch service/deal info, using default values');
    }
    
    // Insert booking
    const insertQuery = `
      INSERT INTO bookings (
        id, service_id, customer_name, customer_email, customer_phone,
        booking_date, travel_date, number_of_people, total_amount,
        status, payment_status, payment_method, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    const insertParams = [
      bookingId, serviceId, customerName, customerEmail, customerPhone,
      bookingDate, travelDate, numberOfPeople, calculatedTotalAmount,
      status || 'pending', paymentStatus || 'pending', paymentMethod, notes
    ];
    
    await executeQuery(insertQuery, insertParams);
    
    // Store the service title (treat deals as services)
    try {
      const serviceTitleQuery = `
        INSERT INTO service_titles (booking_id, service_title, service_type)
        VALUES (?, ?, 'service')
        ON DUPLICATE KEY UPDATE service_title = VALUES(service_title)
      `;
      await executeQuery(serviceTitleQuery, [bookingId, serviceTitle]);
    } catch (titleError) {
      console.log('Could not store service title, continuing with booking creation');
    }
    
    // Send email receipt to customer
    try {
      const emailData = {
        bookingId: bookingId,
        customerName: customerName,
        serviceTitle: serviceTitle,
        travelDate: travelDate,
        numberOfPeople: numberOfPeople,
        totalAmount: calculatedTotalAmount,
        paymentMethod: paymentMethod || 'Not specified',
        bookingDate: bookingDate || new Date()
      };
      
      const emailResult = await sendBookingReceipt(emailData);
      if (emailResult.success) {
        console.log(`📧 Receipt email sent successfully to ${customerEmail}`);
      } else {
        console.log(`⚠️ Failed to send receipt email: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.log('⚠️ Email sending failed, but booking was created:', emailError.message);
    }
    
    res.status(201).json({ 
      message: 'Booking created successfully',
      bookingId: bookingId,
      serviceTitle: serviceTitle,
      totalAmount: calculatedTotalAmount,
      emailSent: true
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get a single booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the basic booking information
    const query = `
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
        b.updated_at
      FROM bookings b
      WHERE b.id = ? AND b.is_deleted = FALSE
    `;
    
    const rawBookings = await executeQuery(query, [id]);
    
    if (rawBookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const rawBooking = rawBookings[0];
    
    // Get service title and image (treat deals as services)
    let serviceTitle = 'Unknown Service';
    let serviceImage = '';
    
    try {
      // Try to find it as a deal first
      if (rawBooking.service_id && rawBooking.service_id.startsWith('deal-')) {
        const dealQuery = `SELECT title, image FROM deals WHERE id = ? AND is_active = TRUE`;
        const deals = await executeQuery(dealQuery, [rawBooking.service_id]);
        if (deals.length > 0) {
          serviceTitle = deals[0].title;
          serviceImage = deals[0].image || '';
        }
      } else {
        // Try to find it as a regular service
        const serviceQuery = `SELECT title, image FROM services WHERE id = ? AND is_active = TRUE`;
        const services = await executeQuery(serviceQuery, [rawBooking.service_id]);
        if (services.length > 0) {
          serviceTitle = services[0].title;
          serviceImage = services[0].image || '';
        }
      }
    } catch (error) {
      console.log('Could not fetch service/deal info for booking:', rawBooking.service_id);
    }
    
    // Map database fields to frontend interface
    const booking = {
      id: rawBooking.id,
      serviceId: rawBooking.service_id,
      serviceTitle: serviceTitle,
      customerName: rawBooking.customer_name,
      customerEmail: rawBooking.customer_email,
      customerPhone: rawBooking.customer_phone,
      bookingDate: rawBooking.booking_date ? new Date(rawBooking.booking_date) : new Date(),
      travelDate: rawBooking.travel_date ? new Date(rawBooking.travel_date) : new Date(),
      numberOfPeople: parseInt(rawBooking.number_of_people) || 1,
      totalAmount: parseFloat(rawBooking.total_amount) || 0,
      status: rawBooking.status,
      paymentStatus: rawBooking.payment_status,
      paymentMethod: rawBooking.payment_method,
      transactionId: rawBooking.transaction_id,
      notes: rawBooking.notes,
      createdAt: new Date(rawBooking.created_at),
      updatedAt: new Date(rawBooking.updated_at)
    };
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    
    let updateQuery;
    let params;
    
    if (status === 'cancelled' && cancellationReason) {
      updateQuery = `
        UPDATE bookings SET 
          status = ?, cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [status, cancellationReason, id];
    } else {
      updateQuery = `
        UPDATE bookings SET 
          status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [status, id];
    }
    
    await executeQuery(updateQuery, params);
    
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Update payment status
app.patch('/api/bookings/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;
    
    const updateQuery = `
      UPDATE bookings SET 
        payment_status = ?, transaction_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [paymentStatus, transactionId || null, id]);
    
    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Update booking details
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerEmail, customerPhone, travelDate, numberOfPeople, totalAmount, notes } = req.body;
    
    const updateQuery = `
      UPDATE bookings SET 
        customer_name = ?, customer_email = ?, customer_phone = ?,
        travel_date = ?, number_of_people = ?, total_amount = ?,
        notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [
      customerName, customerEmail, customerPhone, travelDate, 
      numberOfPeople, totalAmount, notes, id
    ]);
    
    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete booking (soft delete)
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleteQuery = 'UPDATE bookings SET is_deleted = TRUE WHERE id = ?';
    await executeQuery(deleteQuery, [id]);
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    // Check if user already exists
    const existingUser = await executeQuery('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Generate user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate username from email
    const username = email.split('@')[0] + Math.random().toString(36).substr(2, 3);
    
    // Insert new user
    const insertQuery = `
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertResult = await executeQuery(insertQuery, [userId, username, email, passwordHash, firstName, lastName, phone || null]);
    
    // Check if insert was successful
    if (!insertResult || insertResult.length === 0) {
      console.error('❌ User insert failed - no rows returned');
      return res.status(500).json({ error: 'Failed to create user account' });
    }
    
    console.log('✅ User inserted successfully:', userId);
    
    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        phone
      }
    });
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const users = await executeQuery('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone
      }
    });
    
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Save Deal for User
app.post('/api/user/save-deal', authenticateToken, async (req, res) => {
  try {
    const { dealId } = req.body;
    const userId = req.user.userId;
    
    if (!dealId) {
      return res.status(400).json({ error: 'Deal ID is required' });
    }
    
    // Check if deal exists
    const deals = await executeQuery('SELECT id FROM deals WHERE id = ? AND is_active = TRUE', [dealId]);
    if (deals.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    
    // Check if already saved
    const existingSave = await executeQuery('SELECT id FROM user_saved_deals WHERE user_id = ? AND deal_id = ?', [userId, dealId]);
    if (existingSave.length > 0) {
      return res.status(409).json({ error: 'Deal already saved' });
    }
    
    // Save deal
    await executeQuery('INSERT INTO user_saved_deals (user_id, deal_id) VALUES (?, ?)', [userId, dealId]);
    
    res.json({ message: 'Deal saved successfully' });
    
  } catch (error) {
    console.error('Error saving deal:', error);
    res.status(500).json({ error: 'Failed to save deal' });
  }
});

// Get User's Saved Deals
app.get('/api/user/saved-deals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const query = `
      SELECT d.*, usd.saved_at
      FROM user_saved_deals usd
      JOIN deals d ON usd.deal_id = d.id
      WHERE usd.user_id = ? AND d.is_active = TRUE
      ORDER BY usd.saved_at DESC
    `;
    
    const savedDeals = await executeQuery(query, [userId]);
    res.json(savedDeals);
    
  } catch (error) {
    console.error('Error fetching saved deals:', error);
    res.status(500).json({ error: 'Failed to fetch saved deals' });
  }
});

// Get User Notifications
app.get('/api/user/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const query = `
      SELECT * FROM user_notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    
    const notifications = await executeQuery(query, [userId]);
    res.json(notifications);
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark Notification as Read
app.patch('/api/user/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    await executeQuery('UPDATE user_notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    
    res.json({ message: 'Notification marked as read' });
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Admin Authentication
app.post('/api/admin/auth', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get admin user from database
    const query = `
      SELECT * FROM users 
      WHERE username = ? AND is_active = 1 AND is_deleted = 0
    `;
    
    const users = await executeQuery(query, [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await executeQuery('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Set permissions based on role
    let permissions = [];
    if (user.role === 'admin' || user.role === 'super_admin') {
      permissions = ['*']; // Full access for admin and super_admin
    } else if (user.role === 'moderator') {
      permissions = ['read', 'update']; // Limited access for moderators
    }

    const adminUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '👤',
      isActive: user.is_active,
      lastLogin: new Date(),
      permissions: permissions
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role_name,
        permissions: permissions
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      user: adminUser,
      token: token
    });

  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get Admin Statistics
app.get('/api/admin/statistics', async (req, res) => {
  try {
    // Get total users
    const usersResult = await executeQuery('SELECT COUNT(*) as count FROM users WHERE is_deleted = 0');
    const totalUsers = usersResult[0]?.count || 0;

    // Get total bookings
    const bookingsResult = await executeQuery('SELECT COUNT(*) as count FROM bookings WHERE is_deleted = 0');
    const totalBookings = bookingsResult[0]?.count || 0;

    // Get total revenue
    const revenueResult = await executeQuery('SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = "paid" AND is_deleted = 0');
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get pending bookings
    const pendingResult = await executeQuery('SELECT COUNT(*) as count FROM bookings WHERE status = "pending" AND is_deleted = 0');
    const pendingBookings = pendingResult[0]?.count || 0;

    // Get active services
    const servicesResult = await executeQuery('SELECT COUNT(*) as count FROM services WHERE is_active = 1');
    const activeServices = servicesResult[0]?.count || 0;

    res.json({
      totalUsers,
      totalBookings,
      totalRevenue,
      pendingBookings,
      activeServices
    });

  } catch (error) {
    console.error('Error getting admin statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get Admin Notifications
app.get('/api/admin/notifications', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    // Get recent bookings as notifications
    const bookingsQuery = `
      SELECT 
        b.id,
        b.booking_date,
        b.status,
        b.payment_status,
        b.customer_name,
        b.customer_email,
        b.total_amount,
        s.title as service_title
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.is_deleted = 0
      ORDER BY b.booking_date DESC
      LIMIT ?
    `;
    
    const bookings = await executeQuery(bookingsQuery, [limit]);

    // Get recent user registrations
    const usersQuery = `
      SELECT 
        id,
        username,
        email,
        created_at,
        role
      FROM users
      WHERE is_deleted = 0 AND role = 'customer'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const users = await executeQuery(usersQuery);

    // Get recent service changes
    const servicesQuery = `
      SELECT 
        id,
        title,
        created_at,
        updated_at
      FROM services
      WHERE is_active = 1
      ORDER BY updated_at DESC
      LIMIT 10
    `;
    
    const services = await executeQuery(servicesQuery);

    const notifications = [];

    // Convert bookings to notifications
    bookings.forEach((booking, index) => {
      if (index < 20) { // Limit to 20 most recent
        const isNew = new Date(booking.booking_date).getTime() > Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
        
        if (isNew) {
          notifications.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            title: 'New Booking',
            message: `New booking from ${booking.customer_name} for ${booking.service_title}`,
            isRead: false,
            createdAt: booking.booking_date,
            relatedId: booking.id,
            priority: booking.total_amount > 100 ? 'high' : 'medium'
          });
        }

        // Payment status notifications
        if (booking.payment_status === 'paid') {
          notifications.push({
            id: `payment-${booking.id}`,
            type: 'payment',
            title: 'Payment Confirmed',
            message: `Payment confirmed for ${booking.customer_name}'s booking`,
            isRead: false,
            createdAt: booking.booking_date,
            relatedId: booking.id,
            priority: 'medium'
          });
        }
      }
    });

    // Convert user registrations to notifications
    users.forEach((user, index) => {
      if (index < 10) { // Limit to 10 most recent
        const isNew = new Date(user.created_at).getTime() > Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
        
        if (isNew) {
          notifications.push({
            id: `user-${user.id}`,
            type: 'user',
            title: 'New User Registration',
            message: `New user registered: ${user.email}`,
            isRead: false,
            createdAt: user.created_at,
            relatedId: user.id,
            priority: 'low'
          });
        }
      }
    });

    // Convert service changes to notifications
    services.forEach((service, index) => {
      if (index < 5) { // Limit to 5 most recent
        const isNew = new Date(service.updated_at).getTime() > Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
        
        if (isNew) {
          notifications.push({
            id: `service-${service.id}`,
            type: 'service',
            title: 'Service Updated',
            message: `Service "${service.title}" has been updated`,
            isRead: false,
            createdAt: service.updated_at,
            relatedId: service.id,
            priority: 'low'
          });
        }
      }
    });

    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(notifications.slice(0, limit));

  } catch (error) {
    console.error('Error getting admin notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// ==================== END ADMIN ENDPOINTS ====================

// Get Admin Recent Activities
app.get('/api/admin/activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent bookings as activities
    const bookingsQuery = `
      SELECT 
        CONCAT('booking-', b.id) as id,
        'booking' as type,
        CONCAT('New booking from ', b.customer_name, ' for ', COALESCE(s.title, 'Unknown Service')) as description,
        b.booking_date as timestamp,
        b.customer_email as username
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.is_deleted = 0
      ORDER BY b.booking_date DESC
      LIMIT ?
    `;
    
    const bookings = await executeQuery(bookingsQuery, [limit]);

    // Get recent user registrations as activities
    const usersQuery = `
      SELECT 
        CONCAT('user-', u.id) as id,
        'user' as type,
        CONCAT('New user registration: ', u.email) as description,
        u.created_at as timestamp,
        u.username
      FROM users u
      WHERE u.is_deleted = 0 AND u.role = 'customer'
      ORDER BY u.created_at DESC
      LIMIT ?
    `;
    
    const users = await executeQuery(usersQuery, [Math.ceil(limit/2)]);

    // Get recent service changes as activities
    const servicesQuery = `
      SELECT 
        CONCAT('service-', s.id) as id,
        'service' as type,
        CONCAT('Service "', s.title, '" has been updated') as description,
        s.updated_at as timestamp,
        'system' as username
      FROM services s
      WHERE s.is_active = 1 AND s.updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY s.updated_at DESC
      LIMIT ?
    `;
    
    const services = await executeQuery(servicesQuery, [Math.ceil(limit/3)]);

    // Get recent payments as activities
    const paymentsQuery = `
      SELECT 
        CONCAT('payment-', b.id) as id,
        'payment' as type,
        CONCAT('Payment confirmed for ', b.customer_name, '\'s booking') as description,
        b.booking_date as timestamp,
        'system' as username
      FROM bookings b
      WHERE b.payment_status = 'paid' AND b.is_deleted = 0
      ORDER BY b.booking_date DESC
      LIMIT ?
    `;
    
    const payments = await executeQuery(paymentsQuery, [Math.ceil(limit/3)]);

    // Combine all activities
    const allActivities = [
      ...bookings,
      ...users,
      ...services,
      ...payments
    ];

    // Sort by timestamp (newest first) and limit results
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Transform the data to match frontend expectations
    const activities = allActivities.slice(0, limit).map(activity => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      timestamp: activity.timestamp,
      username: activity.username || 'system'
    }));

    res.json(activities);

  } catch (error) {
    console.error('Error getting admin activities:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// Get Admin Settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    // Get settings from system_settings table
    const settingsQuery = `
      SELECT category, settings_data
      FROM system_settings
      ORDER BY category
    `;
    
    const settings = await executeQuery(settingsQuery);
    
    if (settings.length === 0) {
      // Return default settings if none exist
      return res.json({
        general: {
          siteName: "Hargeisa Vibes",
          siteDescription: "Discover and book amazing experiences in Hargeisa",
          contactEmail: "admin@hargeisavibes.com",
          contactPhone: "+252 61 123 4567",
          timezone: "Africa/Mogadishu",
          currency: "USD",
          language: "English"
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          bookingConfirmations: true,
          paymentConfirmations: true,
          newUserRegistrations: true,
          systemAlerts: true,
          marketingEmails: false
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginAttempts: 5,
          ipWhitelist: "",
          auditLogging: true
        },
        appearance: {
          primaryColor: "#3B82F6",
          secondaryColor: "#8B5CF6",
          sidebarCollapsed: false,
          compactMode: false,
          showAvatars: true,
          showNotifications: true
        },
        email: {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpUsername: "noreply@hargeisavibes.com",
          smtpPassword: "••••••••",
          fromName: "Hargeisa Vibes",
          fromEmail: "noreply@hargeisavibes.com",
          replyToEmail: "support@hargeisavibes.com"
        }
      });
    }

    // Transform database settings to frontend format
    const settingsData = {};
    settings.forEach(setting => {
      try {
        settingsData[setting.category] = JSON.parse(setting.settings_data);
      } catch (parseError) {
        console.error(`Error parsing settings for ${setting.category}:`, parseError);
        // Use default for this category if parsing fails
        settingsData[setting.category] = {};
      }
    });

    res.json(settingsData);

  } catch (error) {
    console.error('Error getting admin settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: connectionPool ? 'Connected' : 'Disconnected'
  });
});

// Test email configuration endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const emailValid = await testEmailConfig();
    res.json({ 
      emailConfigured: emailValid,
      message: emailValid ? 'Email configuration is valid' : 'Email configuration is invalid',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      emailConfigured: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
const startServer = async () => {
  // Initialize database first
  const dbConnected = await initDatabase();
  
  if (!dbConnected) {
    console.log('⚠️ Database connection failed, but server will start with limited functionality');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    if (!dbConnected) {
      console.log('⚠️ Database features will not work until connection is established');
    }
  });
};

// ==================== PAYPAL ENDPOINTS ====================

// Test PayPal configuration
app.get('/api/paypal/test-config', (req, res) => {
  try {
    const config = testPayPalConfiguration();
    res.json({
      success: true,
      configuration: config,
      message: config.configured ? 'PayPal is properly configured' : 'PayPal credentials not configured'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create PayPal order for booking
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { bookingId, serviceTitle, totalAmount, customerEmail, customerName } = req.body;
    
    if (!bookingId || !serviceTitle || !totalAmount || !customerEmail || !customerName) {
      return res.status(400).json({ error: 'Missing required fields for PayPal order' });
    }

    const orderData = {
      bookingId,
      serviceTitle,
      totalAmount: parseFloat(totalAmount),
      customerEmail,
      customerName
    };

    const result = await createPayPalOrder(orderData);
    
    if (result.success) {
      res.json({
        success: true,
        orderId: result.orderId,
        approvalUrl: result.approvalUrl,
        message: 'PayPal order created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// Capture PayPal order
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const result = await capturePayPalOrder(orderId);
    
    if (result.success) {
      res.json({
        success: true,
        captureId: result.captureId,
        status: result.status,
        message: 'PayPal order captured successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
});

// Get PayPal order details
app.get('/api/paypal/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await getPayPalOrder(orderId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting PayPal order:', error);
    res.status(500).json({ error: 'Failed to get PayPal order' });
  }
});

// PayPal webhook handler
app.post('/api/paypal/webhook', async (req, res) => {
  try {
    const headers = req.headers;
    const body = req.body;
    
    // Verify webhook signature (implement proper verification in production)
    if (!verifyPayPalWebhook(headers, body)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    
    const eventType = body.event_type;
    const resource = body.resource;
    
    console.log('PayPal webhook received:', eventType);
    
    // Handle different webhook events
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was captured successfully
        console.log('Payment captured:', resource.id);
        // Update booking status in database
        // You can implement this based on your needs
        break;
        
      case 'PAYMENT.CAPTURE.DENIED':
        // Payment was denied
        console.log('Payment denied:', resource.id);
        break;
        
      default:
        console.log('Unhandled webhook event:', eventType);
    }
    
    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (connectionPool) {
    await connectionPool.end();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});
