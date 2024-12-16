-- AlterTable
ALTER TABLE `Transactions` ADD COLUMN `frequent_transaction` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hesitate_to_provide_id` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `other_reasons` VARCHAR(191) NULL,
    ADD COLUMN `red_flag` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `uncommon_question` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `unusual_behaviour` BOOLEAN NOT NULL DEFAULT false;
