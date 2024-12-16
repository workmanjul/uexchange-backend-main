import { Module } from "@nestjs/common";
import { FaqService } from "./faq.service";
import { FaqController } from "./faq.controller";
import { PaginationModule } from "src/pagination/pagination.module";

@Module({
  imports: [PaginationModule],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
