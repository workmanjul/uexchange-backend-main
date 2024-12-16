-- CreateTable
CREATE TABLE `Wholesale` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_type` VARCHAR(191) NULL,
    `paid_by` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0.00,
    `type_of_currency` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `company` VARCHAR(191) NULL,
    `wholeseller_sale_rate` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
