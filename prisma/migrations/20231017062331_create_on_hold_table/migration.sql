-- CreateTable
CREATE TABLE `OnHold` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_name` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `type_of_currency` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0.00,
    `pickup_date` DATETIME(3) NOT NULL,
    `inventory_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OnHold` ADD CONSTRAINT `OnHold_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
