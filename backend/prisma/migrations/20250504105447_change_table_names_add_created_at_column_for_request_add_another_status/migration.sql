/*
  Warnings:

  - You are about to drop the `ProviderDayService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProviderDayWorker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ProviderDayService` DROP FOREIGN KEY `ProviderDayService_providerDayId_fkey`;

-- DropForeignKey
ALTER TABLE `ProviderDayService` DROP FOREIGN KEY `ProviderDayService_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `ProviderDayWorker` DROP FOREIGN KEY `ProviderDayWorker_providerDayId_fkey`;

-- DropForeignKey
ALTER TABLE `ProviderDayWorker` DROP FOREIGN KEY `ProviderDayWorker_workerId_fkey`;

-- DropForeignKey
ALTER TABLE `_DailyWorkerOnRequest` DROP FOREIGN KEY `_DailyWorkerOnRequest_A_fkey`;

-- DropForeignKey
ALTER TABLE `_DailyWorkerOnRequest` DROP FOREIGN KEY `_DailyWorkerOnRequest_B_fkey`;

-- DropIndex
DROP INDEX `Location_fullAddress_key` ON `Location`;

-- AlterTable
ALTER TABLE `Request` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `Service` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `ServiceProvider` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED') NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE `ProviderDayService`;

-- DropTable
DROP TABLE `ProviderDayWorker`;

-- CreateTable
CREATE TABLE `ServiceDay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `providerDayId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,

    UNIQUE INDEX `ServiceDay_serviceId_providerDayId_key`(`serviceId`, `providerDayId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkerDay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nbOfAssignedRequests` INTEGER NOT NULL DEFAULT 0,
    `capacity` INTEGER NOT NULL DEFAULT 2,
    `providerDayId` INTEGER NOT NULL,
    `workerId` INTEGER NOT NULL,

    UNIQUE INDEX `WorkerDay_workerId_providerDayId_key`(`workerId`, `providerDayId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceDay` ADD CONSTRAINT `ServiceDay_providerDayId_fkey` FOREIGN KEY (`providerDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceDay` ADD CONSTRAINT `ServiceDay_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkerDay` ADD CONSTRAINT `WorkerDay_providerDayId_fkey` FOREIGN KEY (`providerDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkerDay` ADD CONSTRAINT `WorkerDay_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `Worker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DailyWorkerOnRequest` ADD CONSTRAINT `_DailyWorkerOnRequest_A_fkey` FOREIGN KEY (`A`) REFERENCES `Request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DailyWorkerOnRequest` ADD CONSTRAINT `_DailyWorkerOnRequest_B_fkey` FOREIGN KEY (`B`) REFERENCES `WorkerDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
