import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from "@nestjs/common";
import { WholesaleService } from "./wholesale.service";
import { CreateWholesaleDto } from "./dto/create-wholesale.dto";
import { UpdateWholesaleDto } from "./dto/update-wholesale.dto";
import { Request } from "express";
import AtGuard from "src/role/atguard";

@Controller("wholesale")
@UseGuards(AtGuard)
export class WholesaleController {
  constructor(private readonly wholesaleService: WholesaleService) {}

  @Post()
  create(@Body() createWholesaleDto: CreateWholesaleDto, @Req() req: Request) {
    return this.wholesaleService.create(createWholesaleDto, req.user);
  }

  @Get("office-location")
  findOfficeLocaiton(@Req() req: Request) {
    return this.wholesaleService.findOfficeLocaiton(req.user);
  }

  @Get()
  findAll() {
    return this.wholesaleService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.wholesaleService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateWholesaleDto: UpdateWholesaleDto
  ) {
    return this.wholesaleService.update(+id, updateWholesaleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.wholesaleService.remove(+id);
  }
}
