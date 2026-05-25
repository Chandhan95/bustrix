-- ============================================================
-- BusTix Enterprise Bus Booking Application
-- MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS bus_booking_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bus_booking_db;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                        BIGINT          NOT NULL AUTO_INCREMENT,
    first_name                VARCHAR(50)     NOT NULL,
    last_name                 VARCHAR(50)     NOT NULL,
    email                     VARCHAR(100)    NOT NULL UNIQUE,
    password                  VARCHAR(255)    NOT NULL,
    phone                     VARCHAR(15)     UNIQUE,
    role                      ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    enabled                   BOOLEAN         NOT NULL DEFAULT TRUE,
    account_non_locked        BOOLEAN         NOT NULL DEFAULT TRUE,
    email_verification_token  VARCHAR(255),
    email_verification_expiry DATETIME,
    password_reset_token      VARCHAR(255),
    password_reset_expiry     DATETIME,
    created_at                DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BUSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS buses (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    bus_name         VARCHAR(100)    NOT NULL,
    bus_number       VARCHAR(20)     NOT NULL UNIQUE,
    bus_type         ENUM('SLEEPER','SEMI_SLEEPER','SEATER','AC_SLEEPER','AC_SEATER','VOLVO','LUXURY') NOT NULL,
    total_seats      INT             NOT NULL DEFAULT 40,
    available_seats  INT             NOT NULL DEFAULT 40,
    amenities        TEXT,
    operator_name    VARCHAR(100),
    contact_number   VARCHAR(15),
    active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_buses_number (bus_number),
    INDEX idx_buses_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ROUTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
    id                           BIGINT          NOT NULL AUTO_INCREMENT,
    source                       VARCHAR(100)    NOT NULL,
    destination                  VARCHAR(100)    NOT NULL,
    distance_km                  DOUBLE          NOT NULL,
    estimated_duration_minutes   INT             NOT NULL,
    source_state                 VARCHAR(100),
    destination_state            VARCHAR(100),
    active                       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at                   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_route (source, destination),
    INDEX idx_routes_source (source),
    INDEX idx_routes_destination (destination),
    INDEX idx_routes_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SCHEDULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS schedules (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    bus_id           BIGINT          NOT NULL,
    route_id         BIGINT          NOT NULL,
    travel_date      DATE            NOT NULL,
    departure_time   TIME            NOT NULL,
    arrival_time     TIME            NOT NULL,
    price_per_seat   DECIMAL(10,2)   NOT NULL,
    available_seats  INT             NOT NULL,
    status           ENUM('SCHEDULED','DEPARTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_schedules_date (travel_date),
    INDEX idx_schedules_route (route_id),
    INDEX idx_schedules_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS seats (
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    bus_id           BIGINT      NOT NULL,
    seat_number      VARCHAR(10) NOT NULL,
    seat_type        ENUM('WINDOW','AISLE','MIDDLE','LOWER_BERTH','UPPER_BERTH') NOT NULL,
    status           ENUM('AVAILABLE','BOOKED','LOCKED','MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    locked_at        DATETIME,
    locked_by_user_id BIGINT,
    created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_bus_seat (bus_id, seat_number),
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_seats_bus (bus_id),
    INDEX idx_seats_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    pnr_number          VARCHAR(20)     NOT NULL UNIQUE,
    user_id             BIGINT          NOT NULL,
    schedule_id         BIGINT          NOT NULL,
    total_amount        DECIMAL(10,2)   NOT NULL,
    discount_amount     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    final_amount        DECIMAL(10,2)   NOT NULL,
    status              ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
    cancellation_reason TEXT,
    cancelled_at        DATETIME,
    passenger_name      VARCHAR(150)    NOT NULL,
    passenger_email     VARCHAR(100)    NOT NULL,
    passenger_phone     VARCHAR(15)     NOT NULL,
    qr_code_base64      LONGTEXT,
    coupon_code         VARCHAR(50),
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    UNIQUE KEY uq_pnr (pnr_number),
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_pnr (pnr_number),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BOOKING_SEATS TABLE (Element Collection)
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_seats (
    booking_id   BIGINT      NOT NULL,
    seat_number  VARCHAR(10) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_seats (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id                   BIGINT          NOT NULL AUTO_INCREMENT,
    booking_id           BIGINT          NOT NULL UNIQUE,
    amount               DECIMAL(10,2)   NOT NULL,
    status               ENUM('PENDING','COMPLETED','FAILED','REFUNDED','PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_method       ENUM('RAZORPAY','UPI','CARD','NET_BANKING','WALLET','CASH') NOT NULL,
    transaction_id       VARCHAR(100),
    razorpay_order_id    VARCHAR(100),
    razorpay_payment_id  VARCHAR(100),
    razorpay_signature   VARCHAR(255),
    paid_at              DATETIME,
    refunded_at          DATETIME,
    refund_amount        DECIMAL(10,2),
    created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_txn (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- AUDIT_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT,
    user_email      VARCHAR(100),
    action          VARCHAR(100)    NOT NULL,
    details         TEXT,
    ip_address      VARCHAR(45),
    http_method     VARCHAR(10),
    request_uri     VARCHAR(255),
    response_status INT,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Admin user (password: Admin@123456)
INSERT IGNORE INTO users (first_name, last_name, email, password, phone, role, enabled)
VALUES ('Admin', 'BusTix', 'admin@bustix.com',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj.sFB9mhEJe',
        '9999999999', 'ADMIN', TRUE);

-- Sample buses
INSERT IGNORE INTO buses (bus_name, bus_number, bus_type, total_seats, available_seats, amenities, operator_name)
VALUES
('Rajdhani Express', 'TN-01-AB-1234', 'AC_SEATER', 40, 40, 'AC,WiFi,USB,Water', 'Express Travels'),
('Night Rider', 'MH-02-CD-5678', 'SLEEPER', 36, 36, 'AC,WiFi,Blanket,Water', 'Night Travels'),
('City Connect', 'KA-03-EF-9012', 'SEATER', 45, 45, 'Fan,Water', 'City Bus Co.'),
('Volvo Premier', 'DL-04-GH-3456', 'VOLVO', 41, 41, 'AC,WiFi,USB,TV,Snacks', 'Premier Travels'),
('Golden Chariot', 'GJ-05-IJ-7890', 'LUXURY', 32, 32, 'AC,WiFi,USB,TV,Meal,Blanket', 'Royal Travels');

-- Sample routes
INSERT IGNORE INTO routes (source, destination, distance_km, estimated_duration_minutes, source_state, destination_state)
VALUES
('Mumbai', 'Pune', 148.0, 180, 'Maharashtra', 'Maharashtra'),
('Delhi', 'Jaipur', 281.0, 300, 'Delhi', 'Rajasthan'),
('Bangalore', 'Chennai', 347.0, 360, 'Karnataka', 'Tamil Nadu'),
('Hyderabad', 'Bangalore', 570.0, 480, 'Telangana', 'Karnataka'),
('Mumbai', 'Ahmedabad', 524.0, 420, 'Maharashtra', 'Gujarat'),
('Delhi', 'Agra', 233.0, 240, 'Delhi', 'Uttar Pradesh'),
('Chennai', 'Coimbatore', 502.0, 420, 'Tamil Nadu', 'Tamil Nadu'),
('Bangalore', 'Hyderabad', 570.0, 480, 'Karnataka', 'Telangana');
