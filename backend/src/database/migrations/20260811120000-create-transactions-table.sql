-- Migration: Create transactions, transaction_items, transaction_item_modifiers, transaction_payments tables
-- Date: 2026-08-11
-- Purpose: POS Transaction History module

-- ============================================
-- 1. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `transaction_number` VARCHAR(25) NOT NULL,
    `order_id` CHAR(36) NULL,
    `order_number` VARCHAR(20) NULL,
    `order_type` ENUM('dine_in', 'take_away', 'delivery') NOT NULL DEFAULT 'dine_in',
    `table_id` CHAR(36) NULL,
    `table_code` VARCHAR(20) NULL,
    `table_name` VARCHAR(50) NULL,
    `cashier_id` CHAR(36) NULL,
    `cashier_name` VARCHAR(100) NULL,
    `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `discount_id` CHAR(36) NULL,
    `discount_name` VARCHAR(100) NULL,
    `discount_type` ENUM('percentage', 'fixed') NULL,
    `discount_value` DECIMAL(10,2) NULL,
    `discount_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `tax_id` CHAR(36) NULL,
    `tax_name` VARCHAR(50) NULL,
    `tax_rate` DECIMAL(5,2) NULL,
    `tax_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `ordered_at` TIMESTAMP NOT NULL,
    `completed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `IDX_TRANSACTION_NUMBER` (`transaction_number`),
    INDEX `IDX_ORDER_NUMBER` (`order_number`),
    INDEX `IDX_COMPLETED_AT` (`completed_at`),
    INDEX `IDX_ORDER_TYPE` (`order_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TRANSACTION_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `transaction_items` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `transaction_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `product_name` VARCHAR(100) NOT NULL,
    `variant_name` VARCHAR(100) NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `FK_TRANSACTION_ITEMS_TRANSACTION`
        FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `IDX_TRANSACTION_ITEM_TRANSACTION` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TRANSACTION_ITEM_MODIFIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `transaction_item_modifiers` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `transaction_item_id` CHAR(36) NOT NULL,
    `modifier_id` CHAR(36) NOT NULL,
    `modifier_name` VARCHAR(100) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `FK_TRANS_ITEM_MOD_TRANS_ITEM`
        FOREIGN KEY (`transaction_item_id`) REFERENCES `transaction_items`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `IDX_TRANS_ITEM_MOD_ITEM` (`transaction_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TRANSACTION_PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `transaction_payments` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `transaction_id` CHAR(36) NOT NULL,
    `payment_method_id` CHAR(36) NOT NULL,
    `payment_method_name` VARCHAR(50) NOT NULL,
    `payment_type` VARCHAR(20) NOT NULL,
    `provider` VARCHAR(50) NULL,
    `amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `change_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `reference_number` VARCHAR(100) NULL,
    `card_number` VARCHAR(20) NULL,
    `card_holder` VARCHAR(100) NULL,
    `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `paid_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `FK_TRANS_PAYMENTS_TRANSACTION`
        FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `IDX_TRANS_PAYMENT_TRANSACTION` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
