/*
  Warnings:

  - Added the required column `usernameAR` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ServiceProvider` ADD COLUMN `usernameAR` VARCHAR(191) NOT NULL;
