/*
  Warnings:

  - You are about to drop the column `customCategory` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Service` table. All the data in the column will be lost.
  - Added the required column `nameAR` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEN` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Service` DROP COLUMN `customCategory`,
    DROP COLUMN `name`,
    ADD COLUMN `nameAR` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEN` VARCHAR(191) NOT NULL;
