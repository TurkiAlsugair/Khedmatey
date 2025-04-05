/*
  Warnings:

  - You are about to drop the column `ServiceProviderId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `serviceProviderId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_ServiceProviderId_fkey`;

-- DropIndex
DROP INDEX `Service_ServiceProviderId_fkey` ON `Service`;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `ServiceProviderId`,
    ADD COLUMN `serviceProviderId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_serviceProviderId_fkey` FOREIGN KEY (`serviceProviderId`) REFERENCES `ServiceProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
