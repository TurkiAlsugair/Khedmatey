/*
  Warnings:

  - Added the required column `cityId` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Worker` ADD COLUMN `cityId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Worker` ADD CONSTRAINT `Worker_id_fkey` FOREIGN KEY (`id`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
