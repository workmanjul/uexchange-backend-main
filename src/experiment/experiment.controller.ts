import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { AuthGuard } from '@nestjs/passport';
import PermissionGuard from 'src/role/permission.guard';
import { use } from 'passport';

@Controller('experiment')
export class ExperimentController {
  constructor(private readonly experimentService: ExperimentService) {}

  @Post()
  create(@Body() createExperimentDto: CreateExperimentDto) {
    return this.experimentService.create(createExperimentDto);
  }
  @UseGuards(PermissionGuard('read rolea'))
  @Get()
  findAll() {
    return this.experimentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experimentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExperimentDto: UpdateExperimentDto,
  ) {
    return this.experimentService.update(+id, updateExperimentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.experimentService.remove(+id);
  }
}
