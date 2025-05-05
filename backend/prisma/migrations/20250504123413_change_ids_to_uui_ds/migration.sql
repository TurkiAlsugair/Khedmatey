/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `City` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProviderDay` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ServiceDay` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ServiceProvider` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Worker` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkerDay` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `ProviderDay` DROP FOREIGN KEY `ProviderDay_serviceProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `Request` DROP FOREIGN KEY `Request_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `Request` DROP FOREIGN KEY `Request_locationId_fkey`;

-- DropForeignKey
ALTER TABLE `Request` DROP FOREIGN KEY `Request_providerDayId_fkey`;

-- DropForeignKey
ALTER TABLE `Request` DROP FOREIGN KEY `Request_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_serviceProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceDay` DROP FOREIGN KEY `ServiceDay_providerDayId_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceDay` DROP FOREIGN KEY `ServiceDay_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `Worker` DROP FOREIGN KEY `Worker_cityId_fkey`;

-- DropForeignKey
ALTER TABLE `Worker` DROP FOREIGN KEY `Worker_serviceProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `Worker` DROP FOREIGN KEY `Worker_serviceProviderId_fkey2`;

-- DropForeignKey
ALTER TABLE `WorkerDay` DROP FOREIGN KEY `WorkerDay_providerDayId_fkey`;

-- DropForeignKey
ALTER TABLE `WorkerDay` DROP FOREIGN KEY `WorkerDay_workerId_fkey`;

-- DropForeignKey
ALTER TABLE `_CityToServiceProvider` DROP FOREIGN KEY `_CityToServiceProvider_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CityToServiceProvider` DROP FOREIGN KEY `_CityToServiceProvider_B_fkey`;

-- DropForeignKey
ALTER TABLE `_DailyWorkerOnRequest` DROP FOREIGN KEY `_DailyWorkerOnRequest_A_fkey`;

-- DropForeignKey
ALTER TABLE `_DailyWorkerOnRequest` DROP FOREIGN KEY `_DailyWorkerOnRequest_B_fkey`;

-- DropIndex
DROP INDEX `ProviderDay_serviceProviderId_fkey` ON `ProviderDay`;

-- DropIndex
DROP INDEX `Request_customerId_fkey` ON `Request`;

-- DropIndex
DROP INDEX `Request_locationId_fkey` ON `Request`;

-- DropIndex
DROP INDEX `Request_providerDayId_fkey` ON `Request`;

-- DropIndex
DROP INDEX `Request_serviceId_fkey` ON `Request`;

-- DropIndex
DROP INDEX `Service_categoryId_fkey` ON `Service`;

-- DropIndex
DROP INDEX `Service_serviceProviderId_fkey` ON `Service`;

-- DropIndex
DROP INDEX `ServiceDay_providerDayId_fkey` ON `ServiceDay`;

-- DropIndex
DROP INDEX `Worker_cityId_fkey` ON `Worker`;

-- DropIndex
DROP INDEX `Worker_serviceProviderId_fkey2` ON `Worker`;

-- DropIndex
DROP INDEX `WorkerDay_providerDayId_fkey` ON `WorkerDay`;

-- AlterTable
ALTER TABLE `Admin` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Category` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `City` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Customer` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Location` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ProviderDay` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `serviceProviderId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Request` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `serviceId` VARCHAR(191) NOT NULL,
    MODIFY `customerId` VARCHAR(191) NOT NULL,
    MODIFY `providerDayId` VARCHAR(191) NOT NULL,
    MODIFY `locationId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Service` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `categoryId` VARCHAR(191) NOT NULL,
    MODIFY `serviceProviderId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ServiceDay` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `providerDayId` VARCHAR(191) NOT NULL,
    MODIFY `serviceId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ServiceProvider` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Worker` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `serviceProviderId` VARCHAR(191) NOT NULL,
    MODIFY `cityId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `WorkerDay` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `providerDayId` VARCHAR(191) NOT NULL,
    MODIFY `workerId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `_CityToServiceProvider` MODIFY `A` CHAR(36) NOT NULL,
    MODIFY `B` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `_DailyWorkerOnRequest` MODIFY `A` CHAR(36) NOT NULL,
    MODIFY `B` CHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_serviceProviderId_fkey` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Worker` ADD CONSTRAINT `Worker_serviceProviderId_fkey` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Worker` ADD CONSTRAINT `Worker_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_providerDayId_fkey` FOREIGN KEY (`providerDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderDay` ADD CONSTRAINT `ProviderDay_serviceProviderId_fkey` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceDay` ADD CONSTRAINT `ServiceDay_providerDayId_fkey` FOREIGN KEY (`providerDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceDay` ADD CONSTRAINT `ServiceDay_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkerDay` ADD CONSTRAINT `WorkerDay_providerDayId_fkey` FOREIGN KEY (`providerDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkerDay` ADD CONSTRAINT `WorkerDay_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `Worker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CityToServiceProvider` ADD CONSTRAINT `_CityToServiceProvider_A_fkey` FOREIGN KEY (`A`) REFERENCES `City`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CityToServiceProvider` ADD CONSTRAINT `_CityToServiceProvider_B_fkey` FOREIGN KEY (`B`) REFERENCES `ServiceProvider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DailyWorkerOnRequest` ADD CONSTRAINT `_DailyWorkerOnRequest_A_fkey` FOREIGN KEY (`A`) REFERENCES `Request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DailyWorkerOnRequest` ADD CONSTRAINT `_DailyWorkerOnRequest_B_fkey` FOREIGN KEY (`B`) REFERENCES `WorkerDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
