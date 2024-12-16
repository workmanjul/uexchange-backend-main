import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { PaginationModule } from "src/pagination/pagination.module";

@Module({
  imports: [PaginationModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
