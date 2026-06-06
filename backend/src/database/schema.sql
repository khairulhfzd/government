-- ============================================================
-- Script DDL: Portal Pengaduan Masyarakat Pintar
-- Database: pengaduan_db
-- Compatible with: MySQL 8.0+
-- HeidiSQL Friendly
-- ============================================================

CREATE DATABASE IF NOT EXISTS `pengaduan_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `pengaduan_db`;

-- ============================================================
-- Tabel: users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`         VARCHAR(36) NOT NULL PRIMARY KEY,
  `name`       VARCHAR(150) NOT NULL,
  `email`      VARCHAR(150) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `phone`      VARCHAR(20) NULL,
  `role`       ENUM('warga', 'admin') NOT NULL DEFAULT 'warga',
  `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role`  (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabel: complaints
-- ============================================================
CREATE TABLE IF NOT EXISTS `complaints` (
  `id`               VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id`          VARCHAR(36) NOT NULL,
  `title`            VARCHAR(255) NOT NULL,
  `description`      TEXT NOT NULL,
  `image_url`        VARCHAR(500) NULL,
  `category`         ENUM(
                       'Infrastruktur',
                       'Lingkungan',
                       'Keamanan',
                       'Kesehatan',
                       'Pendidikan',
                       'Administrasi',
                       'Lainnya'
                     ) NOT NULL DEFAULT 'Lainnya',
  `ai_summary`       TEXT NULL COMMENT 'Ringkasan otomatis dari AI',
  `ai_urgency_level` ENUM('High', 'Medium', 'Low') NULL DEFAULT 'Medium',
  `status`           ENUM('Menunggu', 'Diproses', 'Selesai', 'Ditolak') NOT NULL DEFAULT 'Menunggu',
  `admin_notes`      TEXT NULL COMMENT 'Catatan tambahan dari admin',
  `createdAt`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_complaints_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_complaints_user_id`       (`user_id`),
  INDEX `idx_complaints_status`        (`status`),
  INDEX `idx_complaints_category`      (`category`),
  INDEX `idx_complaints_urgency`       (`ai_urgency_level`),
  INDEX `idx_complaints_created_at`    (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Data Seed: Admin Default
-- Password: admin123 (bcrypt hashed)
-- ============================================================
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Administrator',
  'admin@pengaduan.go.id',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123
  'admin',
  1
);
