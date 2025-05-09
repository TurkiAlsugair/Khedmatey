/*
  Warnings:

  - Added the required column `notes` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Request` ADD COLUMN `notes` VARCHAR(191) NOT NULL;
