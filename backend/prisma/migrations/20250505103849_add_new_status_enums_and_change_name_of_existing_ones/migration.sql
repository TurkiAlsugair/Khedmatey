/*
  Warnings:

  - You are about to alter the column `status` on the `Request` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(7))`.
  - You are about to alter the column `status` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(7))` to `Enum(EnumId(7))`.
  - You are about to alter the column `status` on the `ServiceProvider` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(8))` to `Enum(EnumId(7))`.

*/
-- AlterTable
ALTER TABLE `Request` MODIFY `status` ENUM('PENDING_BY_SP', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING_BY_SP';

-- AlterTable
ALTER TABLE `Service` MODIFY `status` ENUM('PENDING_BY_SP', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING_BY_SP';

-- AlterTable
ALTER TABLE `ServiceProvider` MODIFY `status` ENUM('PENDING_BY_SP', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING_BY_SP';
