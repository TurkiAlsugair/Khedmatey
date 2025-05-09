/*
  Warnings:

  - A unique constraint covering the columns `[fullAddress]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serviceId,providerDayId]` on the table `ProviderDayService` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workerId,providerDayId]` on the table `ProviderDayWorker` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `ProviderDayService` DROP FOREIGN KEY `ProviderDayService_serviceId_fkey`;

-- DropIndex
DROP INDEX `ProviderDayService_serviceId_key` ON `ProviderDayService`;

-- CreateIndex
CREATE UNIQUE INDEX `Location_fullAddress_key` ON `Location`(`fullAddress`);

-- CreateIndex
CREATE UNIQUE INDEX `ProviderDayService_serviceId_providerDayId_key` ON `ProviderDayService`(`serviceId`, `providerDayId`);

-- CreateIndex
CREATE UNIQUE INDEX `ProviderDayWorker_workerId_providerDayId_key` ON `ProviderDayWorker`(`workerId`, `providerDayId`);

-- AddForeignKey
ALTER TABLE `Worker` ADD CONSTRAINT `Worker_serviceProviderId_fkey2` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
