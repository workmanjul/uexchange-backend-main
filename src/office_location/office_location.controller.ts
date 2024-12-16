import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { OfficeLocationService } from "./office_location.service";
import { CreateOfficeLocationDto } from "./dto/create-office_location.dto";
import { UpdateOfficeLocationDto } from "./dto/update-office_location.dto";
import AtGuard from "src/role/atguard";

@Controller("office-location")
@UseGuards(AtGuard)
export class OfficeLocationController {
  constructor(private readonly officeLocationService: OfficeLocationService) {}

  @Post()
  create(@Body() createOfficeLocationDto: CreateOfficeLocationDto) {
    return this.officeLocationService.create(createOfficeLocationDto);
  }

  @Get()
  findAll(@Query("page") page: number, @Query("pageSize") pageSize: number) {
    return this.officeLocationService.findAll(page, pageSize);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.officeLocationService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateOfficeLocationDto: UpdateOfficeLocationDto
  ) {
    return this.officeLocationService.update(+id, updateOfficeLocationDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.officeLocationService.remove(+id);
  }
}
