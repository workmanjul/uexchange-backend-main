-- CreateTable
CREATE TABLE `Inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency_code` INTEGER NULL,
    `location` INTEGER NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_currency_code_fkey` FOREIGN KEY (`currency_code`) REFERENCES `ExchangeRate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_location_fkey` FOREIGN KEY (`location`) REFERENCES `OfficeLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
