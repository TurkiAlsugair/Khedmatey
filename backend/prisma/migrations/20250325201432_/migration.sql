/*
  Warnings:

  - You are about to alter the column `name` on the `City` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- DropIndex
DROP INDEX `City_name_key` ON `City`;

-- AlterTable
ALTER TABLE `City` MODIFY `name` ENUM('Riyadh', 'Jeddah', 'Dammam') NOT NULL;
