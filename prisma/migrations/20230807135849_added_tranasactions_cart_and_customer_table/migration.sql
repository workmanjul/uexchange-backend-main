-- CreateTable
CREATE TABLE `Transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `country` VARCHAR(191) NOT NULL,
    `country_id` INTEGER NOT NULL,
    `pay_in` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `we_buy` DOUBLE NOT NULL DEFAULT 0.00,
    `we_sell` DOUBLE NOT NULL DEFAULT 0.00,
    `cash` DOUBLE NOT NULL DEFAULT 0.00,
    `interac` DOUBLE NOT NULL DEFAULT 0.00,
    `money_order` DOUBLE NOT NULL DEFAULT 0.00,
    `transaction_type` VARCHAR(191) NOT NULL,
    `change` DOUBLE NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionCart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionId` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `currency_amount` DOUBLE NOT NULL DEFAULT 0.00,
    `total` DOUBLE NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` INTEGER NOT NULL,
    `customer` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `dob` VARCHAR(191) NULL,
    `id_type` VARCHAR(191) NULL,
    `id_number` VARCHAR(191) NULL,
    `expiry_date` VARCHAR(191) NULL,
    `place_of_issue` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `postal_code` VARCHAR(191) NULL,
    `occupation` VARCHAR(191) NULL,
    `business_phone` VARCHAR(191) NULL,

    UNIQUE INDEX `Customer_transaction_id_key`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransactionCart` ADD CONSTRAINT `TransactionCart_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
