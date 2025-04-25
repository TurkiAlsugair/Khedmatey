/*
  Warnings:

  - A unique constraint covering the columns `[date,serviceProviderId]` on the table `ProviderDay` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ProviderDay_date_serviceProviderId_key` ON `ProviderDay`(`date`, `serviceProviderId`);
