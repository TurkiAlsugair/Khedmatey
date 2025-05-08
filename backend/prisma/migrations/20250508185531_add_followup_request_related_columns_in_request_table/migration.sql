/*
  Warnings:

  - You are about to drop the column `followupDate` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Request` DROP COLUMN `followupDate`,
    ADD COLUMN `followUpProviderDayId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `_FollowUpDailyWorkerOnRequest` (
    `A` CHAR(36) NOT NULL,
    `B` CHAR(36) NOT NULL,

    UNIQUE INDEX `_FollowUpDailyWorkerOnRequest_AB_unique`(`A`, `B`),
    INDEX `_FollowUpDailyWorkerOnRequest_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_followUpProviderDayId_fkey` FOREIGN KEY (`followUpProviderDayId`) REFERENCES `ProviderDay`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FollowUpDailyWorkerOnRequest` ADD CONSTRAINT `_FollowUpDailyWorkerOnRequest_A_fkey` FOREIGN KEY (`A`) REFERENCES `Request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FollowUpDailyWorkerOnRequest` ADD CONSTRAINT `_FollowUpDailyWorkerOnRequest_B_fkey` FOREIGN KEY (`B`) REFERENCES `WorkerDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
