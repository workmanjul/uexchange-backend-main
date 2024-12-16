import { Module } from "@nestjs/common";
import { ExchangeRateService } from "./exchange_rate.service";
import { ExchangeRateController } from "./exchange_rate.controller";
import { PaginationModule } from "src/pagination/pagination.module";

@Module({
  imports: [PaginationModule],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService],
})
export class ExchangeRateModule {}
