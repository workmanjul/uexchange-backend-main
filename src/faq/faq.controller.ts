import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { FaqService } from "./faq.service";
import { CreateFaqDto } from "./dto/create-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";

@Controller("faq")
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  findAll(@Query("page") page: number, @Query("pageSize") pageSize: number) {
    return this.faqService.findAll(page, pageSize);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.faqService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(+id, updateFaqDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.faqService.remove(+id);
  }
}
