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
import { OnholdService } from "./onhold.service";
import { CreateOnholdDto } from "./dto/create-onhold.dto";
import { UpdateOnholdDto } from "./dto/update-onhold.dto";
import { Request } from "express";
import AtGuard from "src/role/atguard";

@Controller("onhold")
@UseGuards(AtGuard)
export class OnholdController {
  constructor(private readonly onholdService: OnholdService) {}

  @Post()
  create(@Body() createOnholdDto: CreateOnholdDto, @Req() req: Request) {
    return this.onholdService.create(createOnholdDto, req.user);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.onholdService.findAll(req.user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.onholdService.findOne(+id);
  }

  @Get("/release/:id")
  releaseOnHold(@Param("id") id: string) {
    return this.onholdService.releaseOnHold(+id);
  }
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateOnholdDto: UpdateOnholdDto) {
    return this.onholdService.update(+id, updateOnholdDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.onholdService.remove(+id);
  }
}
