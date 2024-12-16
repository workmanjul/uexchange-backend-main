import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { Request } from "express";
import AtGuard from "src/role/atguard";

@Controller("inventory")
@UseGuards(AtGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  findAll(
    @Query("page") page: number,
    @Query("pageSize") pageSize: number,
    @Req() req: Request
  ) {
    return this.inventoryService.findAll(page, pageSize, req.user);
  }

  @Get("/accept-inventory/:id")
  acceptInventory(@Param("id") id: string) {
    return this.inventoryService.acceptInventory(+id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateInventoryDto: UpdateInventoryDto
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.inventoryService.remove(+id);
  }
}
