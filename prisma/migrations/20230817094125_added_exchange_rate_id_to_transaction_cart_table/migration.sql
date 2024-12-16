/*
  Warnings:

  - Added the required column `exchange_rate_id` to the `TransactionCart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TransactionCart` ADD COLUMN `exchange_rate_id` INTEGER NOT NULL;
