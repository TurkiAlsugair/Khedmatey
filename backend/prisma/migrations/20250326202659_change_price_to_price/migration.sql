/*
  Warnings:

  - You are about to drop the column `Price` on the `Service` table. All the data in the column will be lost.
  - Added the required column `price` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Service` DROP COLUMN `Price`,
    ADD COLUMN `price` VARCHAR(191) NOT NULL;
