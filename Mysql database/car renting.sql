CREATE DATABASE IF NOT EXISTS car_rental_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE car_rental_db;

-- 1. Users Table (Ready for Login / Sign-up)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Store bcrypt/Argon2 hash here later
    role ENUM('ADMIN', 'RENTER', 'OWNER') NOT NULL DEFAULT 'RENTER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE, -- Useful for future sign-up flow
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Driver's Licenses (Mandatory for Renters)
CREATE TABLE driver_licenses (
    license_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_class VARCHAR(10) NOT NULL, -- e.g., B1, B2, D (needed for 16-seaters)
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    verification_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    verified_by INT NULL, -- Admin who approved it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Cars Table
CREATE TABLE cars (
    car_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    seat_capacity ENUM('4', '6', '7', '16') NOT NULL,
    fuel_type ENUM('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID') NOT NULL,
    price_per_day DECIMAL(12, 2) NOT NULL,
    price_per_km DECIMAL(10, 2) NOT NULL,
    status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Discounts / Promo Codes
CREATE TABLE discounts (
    discount_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 5. Bookings / Rentals Table
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    renter_id INT NOT NULL,
    car_id INT NOT NULL,
    discount_id INT NULL,
    purpose ENUM('TRAVEL', 'WEDDING', 'BUSINESS', 'OTHER') NOT NULL,
    purpose_note VARCHAR(255) NULL,
    pricing_mode ENUM('PER_KM', 'PER_DAY', 'HYBRID_DAY_AND_KM') NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    estimated_km DECIMAL(10, 2) NULL,
    actual_km DECIMAL(10, 2) NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12, 2) NOT NULL,
    -- Fuel, repairs, and extra fees are explicitly excluded from platform billing
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (renter_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE RESTRICT,
    FOREIGN KEY (discount_id) REFERENCES discounts(discount_id) ON DELETE SET NULL
) ENGINE=InnoDB;