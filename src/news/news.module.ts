import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/multer.config';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [MulterModule.register(multerConfig), PaginationModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
