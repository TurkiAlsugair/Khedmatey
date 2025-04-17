-- DropForeignKey
ALTER TABLE `Worker` DROP FOREIGN KEY `Worker_id_fkey`;

-- AddForeignKey
ALTER TABLE `Worker` ADD CONSTRAINT `Worker_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
