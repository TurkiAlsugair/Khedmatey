/*
  Warnings:

  - Added the required column `role` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `role` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ServiceProvider` ADD COLUMN `role` VARCHAR(191) NOT NULL;
