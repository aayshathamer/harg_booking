-- Complete Database Schema for Hargeisa Vibes Webapp
-- This file contains all the necessary tables for services, deals, bookings, users, and admin functionality

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bbx1ftpsp8wy1mhy1m9c;
USE bbx1ftpsp8wy1mhy1m9c;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    role ENUM('customer', 'admin', 'moderator', 'super_admin') DEFAULT 'customer',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- Services table
CREATE TABLE services (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    image VARCHAR(255),
    location VARCHAR(255),
    is_popular BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    INDEX idx_category (category),
    INDEX idx_is_popular (is_popular),
    INDEX idx_is_new (is_new),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Service features table (many-to-many relationship)
CREATE TABLE service_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id VARCHAR(36) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_service_id (service_id)
);

-- Deals table
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
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Deal features table (many-to-many relationship)
CREATE TABLE deal_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id VARCHAR(36) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    INDEX idx_deal_id (deal_id)
);

-- Deal terms table
CREATE TABLE deal_terms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id VARCHAR(36) NOT NULL,
    term_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    INDEX idx_deal_id (deal_id)
);

-- Deal included services table
CREATE TABLE deal_included_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id VARCHAR(36) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    INDEX idx_deal_id (deal_id)
);

-- Deal excluded services table
CREATE TABLE deal_excluded_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id VARCHAR(36) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    INDEX idx_deal_id (deal_id)
);

-- Bookings table
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY,
    service_id VARCHAR(36) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE NOT NULL,
    number_of_people INT DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_service_id (service_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_booking_date (booking_date),
    INDEX idx_travel_date (travel_date),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Deal bookings table
CREATE TABLE deal_bookings (
    id VARCHAR(36) PRIMARY KEY,
    deal_id VARCHAR(36) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE NOT NULL,
    number_of_people INT DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_deal_id (deal_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_booking_date (booking_date),
    INDEX idx_travel_date (travel_date),
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- Payment details table
CREATE TABLE payment_details (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    gateway_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_booking_id (booking_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Admin roles and permissions
CREATE TABLE admin_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin users table
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
);

-- Analytics and reporting tables
CREATE TABLE analytics_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    user_id VARCHAR(36),
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reviews and ratings table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id VARCHAR(36),
    deal_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_deal_id (deal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (deal_id) REFERENCES deals(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    CHECK ((service_id IS NOT NULL AND deal_id IS NULL) OR (service_id IS NULL AND deal_id IS NOT NULL))
);

-- Create views for common queries
CREATE VIEW active_services AS
SELECT * FROM services WHERE is_active = TRUE;

CREATE VIEW active_deals AS
SELECT * FROM deals WHERE is_active = TRUE AND valid_until >= CURDATE();

CREATE VIEW recent_bookings AS
SELECT * FROM bookings WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);

CREATE VIEW revenue_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_bookings,
    SUM(total_amount) as total_revenue
FROM bookings 
WHERE payment_status = 'paid'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE GetPopularServices(IN limit_count INT)
BEGIN
    SELECT 
        s.*,
        GROUP_CONCAT(DISTINCT sf.feature_name) as features,
        COUNT(r.id) as review_count,
        AVG(r.rating) as avg_rating
    FROM services s
    LEFT JOIN service_features sf ON s.id = sf.service_id
    LEFT JOIN reviews r ON s.id = r.service_id
    WHERE s.is_popular = TRUE AND s.is_active = TRUE
    GROUP BY s.id
    ORDER BY avg_rating DESC, review_count DESC
    LIMIT limit_count;
END //

CREATE PROCEDURE GetHotDeals(IN limit_count INT)
BEGIN
    SELECT 
        d.*,
        GROUP_CONCAT(DISTINCT df.feature_name) as features,
        GROUP_CONCAT(DISTINCT dt.term_text) as terms
    FROM deals d
    LEFT JOIN deal_features df ON d.id = df.deal_id
    LEFT JOIN deal_terms dt ON d.id = dt.deal_id
    WHERE d.is_hot = TRUE AND d.is_active = TRUE AND d.valid_until >= CURDATE()
    GROUP BY d.id
    ORDER BY d.discount_percentage DESC, d.rating DESC
    LIMIT limit_count;
END //

CREATE PROCEDURE GetUserBookings(IN user_email VARCHAR(255))
BEGIN
    SELECT 
        b.*,
        s.title as service_title,
        s.category as service_category
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.customer_email = user_email
    ORDER BY b.created_at DESC;
END //

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_popular ON services(is_popular);
CREATE INDEX idx_services_new ON services(is_new);
CREATE INDEX idx_services_active ON services(is_active);

CREATE INDEX idx_deals_category ON deals(category);
CREATE INDEX idx_deals_hot ON deals(is_hot);
CREATE INDEX idx_deals_ai_recommended ON deals(is_ai_recommended);
CREATE INDEX idx_deals_valid_until ON deals(valid_until);
CREATE INDEX idx_deals_active ON deals(is_active);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);

CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_verified ON reviews(is_verified);

-- Create full-text search indexes
CREATE FULLTEXT INDEX idx_services_search ON services(title, description, location);
CREATE FULLTEXT INDEX idx_deals_search ON deals(title, description, location);

-- Grant permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON bbx1ftpsp8wy1mhy1m9c.* TO 'app_user'@'localhost';
GRANT EXECUTE ON PROCEDURE bbx1ftpsp8wy1mhy1m9c.* TO 'app_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show table status
SHOW TABLES;
