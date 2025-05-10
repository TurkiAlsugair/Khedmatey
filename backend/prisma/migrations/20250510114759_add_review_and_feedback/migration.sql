-- AlterTable
ALTER TABLE `ServiceProvider` ADD COLUMN `avgRating` DOUBLE NULL;

-- CreateTable
CREATE TABLE `RequestFeedback` (
    `id` CHAR(36) NOT NULL,
    `rating` DOUBLE NOT NULL,
    `review` VARCHAR(191) NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `serviceProviderId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RequestFeedback_requestId_key`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequestFeedback` ADD CONSTRAINT `RequestFeedback_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `Request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestFeedback` ADD CONSTRAINT `RequestFeedback_serviceProviderId_fkey` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
