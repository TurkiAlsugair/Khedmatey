-- CreateTable
CREATE TABLE `ServiceProvider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ServiceProvider_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
