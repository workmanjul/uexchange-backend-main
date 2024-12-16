/*
  Warnings:

  - You are about to drop the column `transaction_id` on the `Customer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Customer` DROP FOREIGN KEY `Customer_transaction_id_fkey`;

-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `transaction_id`;

-- AlterTable
ALTER TABLE `Transactions` ADD COLUMN `customerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Transactions` ADD CONSTRAINT `Transactions_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
