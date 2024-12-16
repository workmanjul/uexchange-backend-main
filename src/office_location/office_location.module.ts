import { Module } from "@nestjs/common";
import { OfficeLocationService } from "./office_location.service";
import { OfficeLocationController } from "./office_location.controller";
import { PaginationModule } from "src/pagination/pagination.module";

@Module({
  imports: [PaginationModule],
  controllers: [OfficeLocationController],
  providers: [OfficeLocationService],
})
export class OfficeLocationModule {}
