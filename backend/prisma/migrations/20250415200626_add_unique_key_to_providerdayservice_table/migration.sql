/*
  Warnings:

  - A unique constraint covering the columns `[serviceId]` on the table `ProviderDayService` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ProviderDayService_serviceId_key` ON `ProviderDayService`(`serviceId`);
