/*
  Warnings:

  - You are about to alter the column `role` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - You are about to drop the column `role` on the `ServiceProvider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Customer` MODIFY `role` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ServiceProvider` DROP COLUMN `role`;
