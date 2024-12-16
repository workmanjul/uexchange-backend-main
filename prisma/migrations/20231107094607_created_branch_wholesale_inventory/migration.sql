-- CreateTable
CREATE TABLE `Branch_wholesale_inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wholesale_id` INTEGER NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0.00,
    `currency_code` VARCHAR(191) NULL,
    `currency_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Branch_wholesale_inventory` ADD CONSTRAINT `Branch_wholesale_inventory_wholesale_id_fkey` FOREIGN KEY (`wholesale_id`) REFERENCES `Wholesale`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
