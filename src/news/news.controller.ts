import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createNewsDto: CreateNewsDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (file) {
      console.log('title', file);
      return this.newsService.create(createNewsDto, file.filename);
    } else {
      return this.newsService.create(createNewsDto);
    }
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const res = this.newsService.findAll(page, pageSize);
    return res;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (file) {
      console.log('title', file);
      return this.newsService.update(+id, updateNewsDto, file.filename);
    } else {
      return this.newsService.update(+id, updateNewsDto);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(+id);
  }
}
