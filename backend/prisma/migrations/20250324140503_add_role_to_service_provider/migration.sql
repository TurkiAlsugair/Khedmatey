-- AlterTable
ALTER TABLE `ServiceProvider` ADD COLUMN `role` ENUM('CUSTOMER', 'SERVICE_PROVIDER', 'WORKER') NOT NULL DEFAULT 'SERVICE_PROVIDER';
