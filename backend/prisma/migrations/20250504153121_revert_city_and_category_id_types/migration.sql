/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `Char(36)` to `Int`.
  - The primary key for the `City` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `City` table. The data in that column could be lost. The data in that column will be cast from `Char(36)` to `Int`.
  - You are about to alter the column `categoryId` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `cityId` on the `Worker` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `A` on the `_CityToServiceProvider` table. The data in that column could be lost. The data in that column will be cast from `Char(36)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Worker` DROP FOREIGN KEY `Worker_cityId_fkey`;

-- DropForeignKey
ALTER TABLE `_CityToServiceProvider` DROP FOREIGN KEY `_CityToServiceProvider_A_fkey`;

-- DropIndex
DROP INDEX `Service_categoryId_fkey` ON `Service`;

-- DropIndex
DROP INDEX `Worker_cityId_fkey` ON `Worker`;

-- AlterTable
ALTER TABLE `Category` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `City` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Service` MODIFY `categoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Worker` MODIFY `cityId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `_CityToServiceProvider` MODIFY `A` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Worker` ADD CONSTRAINT `Worker_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CityToServiceProvider` ADD CONSTRAINT `_CityToServiceProvider_A_fkey` FOREIGN KEY (`A`) REFERENCES `City`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
