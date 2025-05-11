/*
  Warnings:

  - You are about to drop the column `description` on the `InvoiceItem` table. All the data in the column will be lost.
  - Added the required column `descriptionAR` to the `FollowupService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionEN` to the `FollowupService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameAR` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEN` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionAR` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionEN` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FollowupService` ADD COLUMN `descriptionAR` VARCHAR(191) NOT NULL,
    ADD COLUMN `descriptionEN` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `InvoiceItem` DROP COLUMN `description`,
    ADD COLUMN `nameAR` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEN` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `descriptionAR` VARCHAR(191) NOT NULL,
    ADD COLUMN `descriptionEN` VARCHAR(191) NOT NULL;
