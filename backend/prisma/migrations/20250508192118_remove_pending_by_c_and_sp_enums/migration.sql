/*
  Warnings:

  - You are about to alter the column `status` on the `Request` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(7))`.
  - The values [PENDING_BY_SP,PENDING_BY_C] on the enum `Request_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_BY_SP,PENDING_BY_C] on the enum `Request_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Request` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `Service` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `ServiceProvider` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING';
