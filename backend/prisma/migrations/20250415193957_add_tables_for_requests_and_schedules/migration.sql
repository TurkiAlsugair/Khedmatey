/*
  Warnings:

  - You are about to drop the `_RequestToWorker` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerId` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerDayId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_RequestToWorker` DROP FOREIGN KEY `_RequestToWorker_A_fkey`;

-- DropForeignKey
ALTER TABLE `_RequestToWorker` DROP FOREIGN KEY `_RequestToWorker_B_fkey`;

-- AlterTable
ALTER TABLE `Request` ADD COLUMN `customerId` INTEGER NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `providerDayId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `requiredNbOfWorkers` INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE `_RequestToWorker`;

-- CreateTable
CREATE TABLE `ProviderDay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `totalRequestsCount` INTEGER NOT NULL DEFAULT 0,
    `serviceProviderId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderDayService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `providerDayId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderDayWorker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nbOfAssignedRequests` INTEGER NOT NULL DEFAULT 0,
    `capacity` INTEGER NOT NULL DEFAULT 2,
    `providerDayId` INTEGER NOT NULL,
    `workerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DailyWorkerOnRequest` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_DailyWorkerOnRequest_AB_unique`(`A`, `B`),
    INDEX `_DailyWorkerOnRequest_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_providerDayId_fkey` FOREIGN KEY (`providerDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderDay` ADD CONSTRAINT `ProviderDay_serviceProviderId_fkey` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderDayService` ADD CONSTRAINT `ProviderDayService_providerDayId_fkey` FOREIGN KEY (`providerDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderDayService` ADD CONSTRAINT `ProviderDayService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderDayWorker` ADD CONSTRAINT `ProviderDayWorker_providerDayId_fkey` FOREIGN KEY (`providerDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderDayWorker` ADD CONSTRAINT `ProviderDayWorker_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `Worker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DailyWorkerOnRequest` ADD CONSTRAINT `_DailyWorkerOnRequest_A_fkey` FOREIGN KEY (`A`) REFERENCES `ProviderDayWorker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DailyWorkerOnRequest` ADD CONSTRAINT `_DailyWorkerOnRequest_B_fkey` FOREIGN KEY (`B`) REFERENCES `Request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
