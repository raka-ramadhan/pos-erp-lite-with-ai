-- Migration: Create media table for file uploads
-- Date: 2026-08-03

CREATE TABLE IF NOT EXISTS `media` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(36) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `original_filename` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size` INT NOT NULL,
    `storage_path` VARCHAR(500) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_by` VARCHAR(36) NULL,
    INDEX `idx_media_entity` (`entity_type`, `entity_id`),
    INDEX `idx_media_entity_id` (`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Remove image_url column from categories (no longer needed)
-- ALTER TABLE `categories` DROP COLUMN IF EXISTS `image_url`;
