import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  UseGuards,
} from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import PermissionGuard from "./permission.guard";
import { CREATE_ROLE, EDIT_ROLE, DELETE_ROLE, READ_ROLE } from "src/Constants";
import AtGuard from "./atguard";

@Controller("role")
@UseGuards(AtGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(PermissionGuard(CREATE_ROLE))
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @UseGuards(PermissionGuard(READ_ROLE))
  @Get()
  findAll(@Query("page") page: number, @Query("pageSize") pageSize: number) {
    return this.roleService.findAll(page, pageSize);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.roleService.findOne(+id);
  }

  @UseGuards(PermissionGuard(READ_ROLE))
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @UseGuards(PermissionGuard(DELETE_ROLE))
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.roleService.remove(+id);
  }
}
