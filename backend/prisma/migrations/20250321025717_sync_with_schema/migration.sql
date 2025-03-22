/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `ServiceProvider` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ServiceProvider` ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `City_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CityToServiceProvider` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CityToServiceProvider_AB_unique`(`A`, `B`),
    INDEX `_CityToServiceProvider_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ServiceProvider_email_key` ON `ServiceProvider`(`email`);

-- AddForeignKey
ALTER TABLE `_CityToServiceProvider` ADD CONSTRAINT `_CityToServiceProvider_A_fkey` FOREIGN KEY (`A`) REFERENCES `City`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CityToServiceProvider` ADD CONSTRAINT `_CityToServiceProvider_B_fkey` FOREIGN KEY (`B`) REFERENCES `ServiceProvider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
