import { Module } from "@nestjs/common";
import { TradingService } from "./trading.service";
import { TradingController } from "./trading.controller";
import { PaginationModule } from "src/pagination/pagination.module";

@Module({
  imports: [PaginationModule],
  controllers: [TradingController],
  providers: [TradingService],
})
export class TradingModule {}
