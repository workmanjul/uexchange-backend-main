-- AlterTable
ALTER TABLE `OfficeLocation` ADD COLUMN `address1` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `address2` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `phone_number` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `postal_code` VARCHAR(191) NOT NULL DEFAULT '';
