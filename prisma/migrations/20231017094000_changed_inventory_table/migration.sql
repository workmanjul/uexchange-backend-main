-- AlterTable
ALTER TABLE `OnHold` ADD COLUMN `office_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OnHold` ADD CONSTRAINT `OnHold_office_id_fkey` FOREIGN KEY (`office_id`) REFERENCES `OfficeLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
