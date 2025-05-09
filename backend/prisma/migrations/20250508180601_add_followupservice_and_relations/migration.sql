-- AlterTable
ALTER TABLE `Request` ADD COLUMN `followupDate` DATETIME(3) NULL,
    MODIFY `status` ENUM('PENDING', 'PENDING_BY_SP', 'PENDING_BY_C', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING_BY_SP';

-- AlterTable
ALTER TABLE `Service` MODIFY `status` ENUM('PENDING', 'PENDING_BY_SP', 'PENDING_BY_C', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `ServiceProvider` MODIFY `status` ENUM('PENDING', 'PENDING_BY_SP', 'PENDING_BY_C', 'ACCEPTED', 'DECLINED', 'CANCELED', 'COMING', 'IN_PROGRESS', 'FINISHED', 'INVOICED', 'PAID') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `FollowupService` (
    `id` CHAR(36) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `nameAR` VARCHAR(191) NOT NULL,
    `nameEN` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `requiredNbOfWorkers` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FollowupService_requestId_key`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FollowupService` ADD CONSTRAINT `FollowupService_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `Request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowupService` ADD CONSTRAINT `FollowupService_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
