-- ============================================
-- Migration: Create Product Module Tables
-- Date: 2026-08-03
-- ============================================

-- Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `outlet_id` CHAR(36) NULL,
    `parent_id` CHAR(36) NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` DATETIME(6) NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    UNIQUE KEY `uq_categories_slug_outlet` (`slug`, `outlet_id`),
    KEY `idx_categories_parent_id` (`parent_id`),
    KEY `idx_categories_outlet_id` (`outlet_id`),
    KEY `idx_categories_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modifier Groups Table
CREATE TABLE IF NOT EXISTS `modifier_groups` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `outlet_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `selection_type` VARCHAR(20) NOT NULL DEFAULT 'single',
    `is_required` TINYINT(1) NOT NULL DEFAULT 0,
    `min_selections` INT NULL,
    `max_selections` INT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` DATETIME(6) NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    UNIQUE KEY `uq_modifier_groups_slug_outlet` (`slug`, `outlet_id`),
    KEY `idx_modifier_groups_outlet_id` (`outlet_id`),
    KEY `idx_modifier_groups_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modifiers Table
CREATE TABLE IF NOT EXISTS `modifiers` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `modifier_group_id` CHAR(36) NOT NULL,
    `sku` VARCHAR(50) NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `additional_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `cost_price` DECIMAL(12,2) NULL,
    `is_default` TINYINT(1) NOT NULL DEFAULT 0,
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` DATETIME(6) NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    UNIQUE KEY `uq_modifiers_sku_group` (`sku`, `modifier_group_id`),
    KEY `idx_modifiers_group_id` (`modifier_group_id`),
    KEY `idx_modifiers_is_available` (`is_available`),
    KEY `idx_modifiers_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `outlet_id` CHAR(36) NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `sku` VARCHAR(50) NULL,
    `name` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `media_id` CHAR(36) NULL,
    `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `cost_price` DECIMAL(12,2) NULL,
    `unit_type` VARCHAR(20) NOT NULL DEFAULT 'unit',
    `has_variants` TINYINT(1) NOT NULL DEFAULT 0,
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
    `preparation_time` INT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` DATETIME(6) NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    UNIQUE KEY `uq_products_sku_outlet` (`sku`, `outlet_id`),
    UNIQUE KEY `uq_products_slug_outlet` (`slug`, `outlet_id`),
    KEY `idx_products_category_id` (`category_id`),
    KEY `idx_products_outlet_id` (`outlet_id`),
    KEY `idx_products_is_available` (`is_available`),
    KEY `idx_products_is_active` (`is_active`),
    KEY `idx_products_sort_order` (`sort_order`),
    KEY `idx_products_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Modifier Groups Pivot Table
CREATE TABLE IF NOT EXISTS `product_modifier_groups` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `product_id` CHAR(36) NOT NULL,
    `modifier_group_id` CHAR(36) NOT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `created_by` CHAR(36) NULL,
    UNIQUE KEY `uq_pmg_product_modifier_group` (`product_id`, `modifier_group_id`),
    KEY `idx_pmg_product_id` (`product_id`),
    KEY `idx_pmg_modifier_group_id` (`modifier_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Taxes Table
CREATE TABLE IF NOT EXISTS `taxes` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `outlet_id` CHAR(36) NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `tax_type` VARCHAR(20) NOT NULL DEFAULT 'percentage',
    `rate` DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
    `is_default` TINYINT(1) NOT NULL DEFAULT 0,
    `calculation_base` VARCHAR(20) NOT NULL DEFAULT 'subtotal',
    `calculation_order` INT NOT NULL DEFAULT 1,
    `is_inclusive` TINYINT(1) NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `effective_from` DATETIME(6) NULL,
    `effective_until` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` DATETIME(6) NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    UNIQUE KEY `uq_taxes_code_outlet` (`code`, `outlet_id`),
    KEY `idx_taxes_outlet_id` (`outlet_id`),
    KEY `idx_taxes_is_default` (`is_default`),
    KEY `idx_taxes_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Taxes Pivot Table
CREATE TABLE IF NOT EXISTS `product_taxes` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `product_id` CHAR(36) NOT NULL,
    `tax_id` CHAR(36) NOT NULL,
    `is_exclusive` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `created_by` CHAR(36) NULL,
    UNIQUE KEY `uq_pt_product_tax` (`product_id`, `tax_id`),
    KEY `idx_pt_product_id` (`product_id`),
    KEY `idx_pt_tax_id` (`tax_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Foreign Keys
ALTER TABLE `modifiers` ADD CONSTRAINT `fk_modifiers_group` FOREIGN KEY (`modifier_group_id`) REFERENCES `modifier_groups`(`id`) ON DELETE CASCADE;
ALTER TABLE `products` ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT;
ALTER TABLE `product_modifier_groups` ADD CONSTRAINT `fk_pmg_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE;
ALTER TABLE `product_modifier_groups` ADD CONSTRAINT `fk_pmg_modifier_group` FOREIGN KEY (`modifier_group_id`) REFERENCES `modifier_groups`(`id`) ON DELETE CASCADE;
ALTER TABLE `product_taxes` ADD CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE;
ALTER TABLE `product_taxes` ADD CONSTRAINT `fk_pt_tax` FOREIGN KEY (`tax_id`) REFERENCES `taxes`(`id`) ON DELETE CASCADE;

-- Insert default PPN tax
INSERT INTO `taxes` (`id`, `outlet_id`, `code`, `name`, `description`, `tax_type`, `rate`, `is_default`, `calculation_base`, `calculation_order`, `is_inclusive`, `is_active`)
VALUES (UUID(), NULL, 'PPN', 'Pajak Pertambahan Nilai', 'Pajak atas barang/jasa yang dikenakan PPN 11%', 'percentage', 11.0000, 1, 'subtotal', 1, 0, 1);
