-- AddForeignKey
ALTER TABLE `ProviderDayService` ADD CONSTRAINT `ProviderDayService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
