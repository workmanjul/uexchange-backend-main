-- CreateTable
CREATE TABLE `ExchangeRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `spot_rate` DOUBLE NOT NULL,
    `cxi_buy` DOUBLE NOT NULL,
    `cxi_sell` DOUBLE NOT NULL,
    `my_buy_target` DOUBLE NOT NULL,
    `my_sell_target` DOUBLE NOT NULL,
    `uce_buy_rate` DOUBLE NOT NULL,
    `uce_sell_rate` DOUBLE NOT NULL,
    `cxi_buy_rate` DOUBLE NOT NULL,
    `cxi_sell_rate` DOUBLE NOT NULL,
    `compared_with_cxi_buy` DOUBLE NOT NULL DEFAULT 0.00,
    `compared_with_cxi_sell` DOUBLE NOT NULL DEFAULT 0.00,
    `suggested_buy_rate` DOUBLE NOT NULL DEFAULT 0.00,
    `suggested_sell_rate` DOUBLE NOT NULL DEFAULT 0.00,
    `status` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
