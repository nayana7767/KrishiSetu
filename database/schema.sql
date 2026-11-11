-- ====================================================================
-- KRISHISETU FULL-STACK AGRITECH PLATFORM
-- DATABASE SCHEMA DEFINITION FOR MYSQL 8.0+
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `krishisetu` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `krishisetu`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(120) NOT NULL,
    `role` ENUM('farmer', 'provider', 'admin') DEFAULT 'farmer' NOT NULL,
    `preferred_language` VARCHAR(10) DEFAULT 'en' NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Farmer Profiles Table
CREATE TABLE IF NOT EXISTS `farmer_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `district` VARCHAR(80) NOT NULL,
    `taluk` VARCHAR(80) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `land_acres` FLOAT NOT NULL DEFAULT 2.0,
    `land_ownership` ENUM('owned', 'leased', 'both') DEFAULT 'owned',
    `crops` TEXT NOT NULL,
    `crop_season` VARCHAR(30) DEFAULT 'kharif',
    `irrigation_type` VARCHAR(30) DEFAULT 'canal',
    `farmer_category` VARCHAR(30) DEFAULT 'small_marginal',
    `fruits_id` VARCHAR(50) NULL,
    `has_kcc` BOOLEAN DEFAULT FALSE,
    `annual_income` FLOAT DEFAULT 100000.0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_farmer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_farmer_district` (`district`),
    INDEX `idx_farmer_category` (`farmer_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Machinery Providers Table
CREATE TABLE IF NOT EXISTS `machinery_providers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `business_name` VARCHAR(150) NOT NULL,
    `contact_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `alt_phone` VARCHAR(20) NULL,
    `district` VARCHAR(80) NOT NULL,
    `taluk` VARCHAR(80) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `full_address` TEXT NULL,
    `is_verified` BOOLEAN DEFAULT TRUE,
    `rating` FLOAT DEFAULT 4.8,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_provider_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_provider_district` (`district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Machinery Table
CREATE TABLE IF NOT EXISTS `machinery` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `provider_id` INT NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `model_name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `price_per_hour` FLOAT NOT NULL DEFAULT 800.0,
    `price_per_acre` FLOAT NULL DEFAULT 1200.0,
    `price_per_day` FLOAT NULL DEFAULT 6000.0,
    `has_operator` BOOLEAN DEFAULT TRUE,
    `operator_rate_per_hour` FLOAT DEFAULT 150.0,
    `transport_rate_per_km` FLOAT DEFAULT 25.0,
    `equipment_condition` VARCHAR(30) DEFAULT 'excellent',
    `horsepower` INT DEFAULT 50,
    `district` VARCHAR(80) NOT NULL,
    `taluk` VARCHAR(80) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `latitude` FLOAT DEFAULT 12.5218,
    `longitude` FLOAT DEFAULT 76.8951,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_machinery_provider` FOREIGN KEY (`provider_id`) REFERENCES `machinery_providers` (`id`) ON DELETE CASCADE,
    INDEX `idx_machinery_category` (`category`),
    INDEX `idx_machinery_district` (`district`),
    INDEX `idx_machinery_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Machinery Bookings Table
CREATE TABLE IF NOT EXISTS `machinery_bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_code` VARCHAR(30) NOT NULL UNIQUE,
    `machinery_id` INT NOT NULL,
    `farmer_id` INT NOT NULL,
    `booking_date` VARCHAR(20) NOT NULL,
    `time_slot` VARCHAR(30) NOT NULL,
    `duration_hours` FLOAT DEFAULT 4.0,
    `acreage` FLOAT DEFAULT 1.0,
    `rental_cost` FLOAT DEFAULT 0.0,
    `operator_cost` FLOAT DEFAULT 0.0,
    `transport_cost` FLOAT DEFAULT 0.0,
    `total_amount` FLOAT DEFAULT 0.0,
    `status` ENUM('requested', 'confirmed', 'rejected', 'cancelled', 'in_progress', 'completed') DEFAULT 'requested' NOT NULL,
    `farmer_village` VARCHAR(100) NOT NULL,
    `delivery_required` BOOLEAN DEFAULT TRUE,
    `notes` TEXT NULL,
    `provider_notes` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_booking_machinery` FOREIGN KEY (`machinery_id`) REFERENCES `machinery` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_booking_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_booking_schedule` (`machinery_id`, `booking_date`, `time_slot`),
    INDEX `idx_booking_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Government Schemes Table
CREATE TABLE IF NOT EXISTS `government_schemes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `scheme_code` VARCHAR(50) NOT NULL UNIQUE,
    `scheme_name` VARCHAR(200) NOT NULL,
    `kannada_name` VARCHAR(255) NULL,
    `hindi_name` VARCHAR(255) NULL,
    `department` VARCHAR(150) NOT NULL,
    `scheme_type` VARCHAR(40) DEFAULT 'state_karnataka',
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `benefits_summary` TEXT NOT NULL,
    `financial_assistance` VARCHAR(255) NOT NULL,
    `subsidy_percentage` FLOAT DEFAULT 50.0,
    `min_land_acres` FLOAT DEFAULT 0.0,
    `max_land_acres` FLOAT DEFAULT 25.0,
    `eligible_categories` VARCHAR(255) DEFAULT 'all',
    `eligible_crops` VARCHAR(255) DEFAULT 'all',
    `eligible_irrigation` VARCHAR(255) DEFAULT 'all',
    `required_documents` TEXT NOT NULL,
    `official_url` VARCHAR(255) NOT NULL,
    `helpline_number` VARCHAR(80) NULL,
    `application_instructions` TEXT NOT NULL,
    `opening_date` VARCHAR(30) DEFAULT 'Open Throughout Year',
    `closing_date` VARCHAR(30) DEFAULT 'Ongoing (Batch-wise)',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_schemes_category` (`category`),
    INDEX `idx_schemes_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Loan Products Table
CREATE TABLE IF NOT EXISTS `loan_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bank_name` VARCHAR(150) NOT NULL,
    `loan_name` VARCHAR(200) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `min_amount` FLOAT DEFAULT 10000.0,
    `max_amount` FLOAT DEFAULT 300000.0,
    `base_interest_rate` FLOAT DEFAULT 7.0,
    `subsidized_interest_rate` FLOAT DEFAULT 4.0,
    `interest_subsidy_note` TEXT NOT NULL,
    `max_tenure_months` INT DEFAULT 12,
    `collateral_required` BOOLEAN DEFAULT FALSE,
    `collateral_details` VARCHAR(255) DEFAULT 'Hypothecation of crop/equipment',
    `eligibility_criteria` TEXT NOT NULL,
    `required_documents` TEXT NOT NULL,
    `application_url` VARCHAR(255) NOT NULL,
    `contact_number` VARCHAR(50) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_loans_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Application Records Table
CREATE TABLE IF NOT EXISTS `application_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `scheme_id` INT NULL,
    `loan_id` INT NULL,
    `title` VARCHAR(200) NOT NULL,
    `department` VARCHAR(150) NOT NULL,
    `reference_number` VARCHAR(100) NOT NULL,
    `submission_date` VARCHAR(30) NOT NULL,
    `current_status` ENUM('preparation', 'submitted', 'under_verification', 'pending', 'approved', 'rejected', 'benefit_received') DEFAULT 'submitted' NOT NULL,
    `status_notes` TEXT NULL,
    `rejection_reason` TEXT NULL,
    `corrective_action` TEXT NULL,
    `is_official_api` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_app_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `government_schemes` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_app_loan` FOREIGN KEY (`loan_id`) REFERENCES `loan_products` (`id`) ON DELETE SET NULL,
    INDEX `idx_app_user_status` (`user_id`, `current_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Farmer Documents Checklist Table
CREATE TABLE IF NOT EXISTS `farmer_documents_checklist` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `scheme_id` INT NULL,
    `document_key` VARCHAR(80) NOT NULL,
    `document_name` VARCHAR(150) NOT NULL,
    `is_ready` BOOLEAN DEFAULT FALSE,
    `source_portal` VARCHAR(150) NULL,
    `notes` TEXT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_doc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_doc_user_key` (`user_id`, `document_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Complaints Table
CREATE TABLE IF NOT EXISTS `complaints` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `category` VARCHAR(60) DEFAULT 'machinery_booking',
    `subject` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
    `admin_response` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_complaint_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(40) DEFAULT 'info',
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_notif_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
