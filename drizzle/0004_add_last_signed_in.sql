-- Migration 0004: Add lastSignedIn column to users table if not exists
-- Safe to run multiple times — uses IF NOT EXISTS check via stored procedure workaround
-- MySQL < 8.0 không hỗ trợ ADD COLUMN IF NOT EXISTS nên dùng cách kiểm tra qua information_schema

SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'lastSignedIn';
SET @preparedStatement = (
  SELECT IF(
    (
      SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME   = @tablename
        AND COLUMN_NAME  = @columnname
    ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE `users` ADD COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT (now())')
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
