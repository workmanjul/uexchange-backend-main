/*
  Warnings:

  - Added the required column `country` to the `ExchangeRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `ExchangeRate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ExchangeRate` ADD COLUMN `country` VARCHAR(191) NOT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL;
