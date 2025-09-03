// Database Configuration Example
// Copy this file to config.js and update with your actual values

module.exports = {
  // MySQL Database
  database: {
    host: 'localhost',
    user: 'hargeisa_user',
    password: 'your_secure_password',
    database: 'bbx1ftpsp8wy1mhy1m9c',
    port: 3306
  },
  
  // Application Settings
  app: {
    title: 'Hargeisa Vibes',
    version: '1.0.0',
    environment: 'development'
  },
  
  // API Configuration
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 30000
  },
  
  // Security
  security: {
    jwtSecret: 'your_jwt_secret_key_here',
    sessionSecret: 'your_session_secret_here'
  }
};
