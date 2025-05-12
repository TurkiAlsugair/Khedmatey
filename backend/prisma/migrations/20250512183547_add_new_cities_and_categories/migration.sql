/*
  Warnings:

  - The values [Cleaning,Electrical,Painting] on the enum `Category_name` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Category` MODIFY `name` ENUM('AirConditioning', 'Plumbing', 'HomeAppliances', 'Electricity', 'PaintingAndDecorations', 'Sterilization', 'Gardening', 'CarServices', 'FurnitureMoving', 'Other') NOT NULL;

-- AlterTable
ALTER TABLE `City` MODIFY `name` ENUM('Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Unayzah') NOT NULL;
