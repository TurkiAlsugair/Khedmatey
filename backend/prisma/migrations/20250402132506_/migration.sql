/*
  Warnings:

  - You are about to alter the column `status` on the `Request` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(6))`.
  - You are about to drop the column `status` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Request` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `Worker` MODIFY `role` ENUM('CUSTOMER', 'SERVICE_PROVIDER', 'WORKER', 'ADMIN') NOT NULL DEFAULT 'WORKER';
