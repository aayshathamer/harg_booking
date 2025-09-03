const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'bbx1ftpsp8wy1mhy1m9c-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'uogp4qwszgrvsxaf',
  password: process.env.DB_PASSWORD || 'iySbNOApCRNTUyvNX1Ti',
  database: process.env.DB_NAME || 'bbx1ftpsp8wy1mhy1m9c'
};

async function setupAdminDatabase() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected to database successfully!');
    
    // Check if admin_roles table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "admin_roles"');
    
    if (tables.length === 0) {
      console.log('Creating admin_roles table...');
      await connection.execute(`
        CREATE TABLE admin_roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          role_name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          permissions JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('admin_roles table created successfully!');
    }
    
    // Check if admin_users table exists
    const [adminTables] = await connection.execute('SHOW TABLES LIKE "admin_users"');
    
    if (adminTables.length === 0) {
      console.log('Creating admin_users table...');
      await connection.execute(`
        CREATE TABLE admin_users (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          role_id INT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (role_id) REFERENCES admin_roles(id),
          INDEX idx_role_id (role_id),
          INDEX idx_is_active (is_active)
        )
      `);
      console.log('admin_users table created successfully!');
    }
    
    // Insert default admin roles
    console.log('Setting up admin roles...');
    
    // Check if roles already exist
    const [existingRoles] = await connection.execute('SELECT COUNT(*) as count FROM admin_roles');
    
    if (existingRoles[0].count === 0) {
      await connection.execute(`
        INSERT INTO admin_roles (role_name, description, permissions) VALUES
        ('super_admin', 'Full system access and control', '["*"]'),
        ('admin', 'Full management access', '["manage_services", "manage_users", "manage_bookings", "manage_content", "view_analytics", "manage_settings"]'),
        ('moderator', 'Content and user moderation', '["moderate_content", "moderate_users", "view_reports", "manage_support"]'),
        ('support', 'Customer support and assistance', '["view_bookings", "manage_support_tickets", "view_user_info", "update_booking_status"]'),
        ('finance_admin', 'Payment processing and financial management', '["manage_payments", "view_all_bookings", "process_refunds", "view_financial_reports", "manage_invoices", "view_analytics", "manage_services"]')
      `);
      console.log('Admin roles created successfully!');
    } else {
      console.log('Admin roles already exist, skipping...');
    }
    
    // Create admin users
    console.log('Setting up admin users...');
    
    // Check if admin users already exist
    const [existingAdminUsers] = await connection.execute('SELECT COUNT(*) as count FROM admin_users');
    
    if (existingAdminUsers[0].count === 0) {
      // First, create a super admin user
      const superAdminId = `admin-${Date.now()}`;
      const superAdminUserId = `user-${Date.now()}`;
      
      // Insert into users table
      await connection.execute(`
        INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, 'admin', 1)
      `, [
        superAdminUserId,
        'superadmin',
        'superadmin@hargeisa-vibes.com',
        'admin123', // In production, use proper password hashing
        'Super',
        'Admin'
      ]);
      
      // Get the super_admin role ID
      const [superAdminRole] = await connection.execute(
        'SELECT id FROM admin_roles WHERE role_name = "super_admin"'
      );
      
      // Insert into admin_users table
      await connection.execute(`
        INSERT INTO admin_users (id, user_id, role_id) VALUES (?, ?, ?)
      `, [superAdminId, superAdminUserId, superAdminRole[0].id]);
      
      console.log('Super admin user created successfully!');
      console.log('Username: superadmin');
      console.log('Password: admin123');
      
      // Create a regular admin user
      const adminId = `admin-${Date.now() + 1}`;
      const adminUserId = `user-${Date.now() + 1}`;
      
      // Insert into users table
      await connection.execute(`
        INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, 'admin', 1)
      `, [
        adminUserId,
        'admin',
        'admin@hargeisa-vibes.com',
        'admin123', // In production, use proper password hashing
        'Regular',
        'Admin'
      ]);
      
      // Get the admin role ID
      const [adminRole] = await connection.execute(
        'SELECT id FROM admin_roles WHERE role_name = "admin"'
      );
      
      // Insert into admin_users table
      await connection.execute(`
        INSERT INTO admin_users (id, user_id, role_id) VALUES (?, ?, ?)
      `, [adminId, adminUserId, adminRole[0].id]);
      
      console.log('Regular admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
      
    } else {
      console.log('Admin users already exist, skipping...');
    }
    
    // Verify the setup
    console.log('\nVerifying setup...');
    
    const [roles] = await connection.execute('SELECT * FROM admin_roles');
    console.log(`Found ${roles.length} admin roles:`);
    roles.forEach(role => {
      console.log(`- ${role.role_name}: ${role.description}`);
    });
    
    const [adminUsers] = await connection.execute(`
      SELECT u.username, u.email, ar.role_name, u.is_active
      FROM users u
      JOIN admin_users au ON u.id = au.user_id
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE u.role = 'admin'
    `);
    
    console.log(`\nFound ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}): ${user.role_name} - ${user.is_active ? 'Active' : 'Inactive'}`);
    });
    
    console.log('\n✅ Admin database setup completed successfully!');
    console.log('\nYou can now login with:');
    console.log('Username: superadmin, Password: admin123 (Super Admin)');
    console.log('Username: admin, Password: admin123 (Regular Admin)');
    
  } catch (error) {
    console.error('❌ Error setting up admin database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupAdminDatabase()
    .then(() => {
      console.log('Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupAdminDatabase };
