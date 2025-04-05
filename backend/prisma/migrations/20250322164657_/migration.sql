/*
  Warnings:

  - You are about to alter the column `role` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `role` on the `ServiceProvider` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Customer` MODIFY `role` ENUM('CUSTOMER', 'SERVICE_PROVIDER', 'WORKER') NOT NULL DEFAULT 'CUSTOMER';

-- AlterTable
ALTER TABLE `ServiceProvider` MODIFY `role` ENUM('CUSTOMER', 'SERVICE_PROVIDER', 'WORKER') NOT NULL DEFAULT 'SERVICE_PROVIDER';
