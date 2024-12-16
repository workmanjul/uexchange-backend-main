-- AlterTable
ALTER TABLE `Branch_wholesale_inventory` ADD COLUMN `inventory_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Branch_wholesale_inventory` ADD CONSTRAINT `Branch_wholesale_inventory_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
