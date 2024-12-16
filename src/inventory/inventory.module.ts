import { Module } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { InventoryController } from "./inventory.controller";
import { PaginationModule } from "src/pagination/pagination.module";

@Module({
  imports: [PaginationModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
