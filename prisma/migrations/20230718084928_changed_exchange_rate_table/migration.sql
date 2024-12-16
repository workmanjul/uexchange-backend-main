-- AlterTable
ALTER TABLE `ExchangeRate` MODIFY `uce_buy_rate` DOUBLE NOT NULL DEFAULT 0.00,
    MODIFY `uce_sell_rate` DOUBLE NOT NULL DEFAULT 0.00,
    MODIFY `cxi_buy_rate` DOUBLE NOT NULL DEFAULT 0.00,
    MODIFY `cxi_sell_rate` DOUBLE NOT NULL DEFAULT 0.00;
