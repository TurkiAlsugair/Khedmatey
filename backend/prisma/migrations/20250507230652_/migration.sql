-- DropForeignKey
ALTER TABLE `Request` DROP FOREIGN KEY `Request_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_serviceProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `Worker` DROP FOREIGN KEY `Worker_serviceProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `WorkerDay` DROP FOREIGN KEY `WorkerDay_workerId_fkey`;

-- DropIndex
DROP INDEX `Request_customerId_fkey` ON `Request`;

-- DropIndex
DROP INDEX `Service_serviceProviderId_fkey` ON `Service`;

-- DropIndex
DROP INDEX `Worker_serviceProviderId_fkey` ON `Worker`;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_serviceProviderId_fkey` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Worker` ADD CONSTRAINT `Worker_serviceProviderId_fkey` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkerDay` ADD CONSTRAINT `WorkerDay_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `Worker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
