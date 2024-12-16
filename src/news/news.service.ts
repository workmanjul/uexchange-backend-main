import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationService } from 'src/pagination/pagination.service';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<newsResponseType>,
  ) {}
  async create(createNewsDto: CreateNewsDto, filename?: string) {
    console.log(createNewsDto);
    const inputData: any = {
      name: createNewsDto.title,
      description: createNewsDto.description,
      status: createNewsDto.status === 'true' ? true : false,
    };

    if (filename) {
      inputData.image = 'uploads/' + filename;
    }

    const data = await this.prisma.news.create({ data: inputData });
    return { message: 'success', data: data };
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginationResponse<newsResponseType>> {
    const skip = (page - 1) * pageSize;
    const take = Number(pageSize);
    const news = await this.prisma.news.findMany({
      skip,
      take,
    });
    const totalItems = await this.prisma.news.count(); // Count total number of items
    return this.paginationService.getPaginationData(
      page,
      pageSize,
      news,
      totalItems,
    );
  }

  async findOne(id: number) {
    return await this.prisma.news.findUnique({ where: { id: id } });
  }

  async update(id: number, updateNewsDto: UpdateNewsDto, filename?: string) {
    const updatedNews = await this.prisma.$transaction(async (prisma) => {
      const data: any = {
        name: updateNewsDto.title,
        description: updateNewsDto.description,
        status: updateNewsDto.status === 'true' ? true : false,
      };

      if (filename) {
        data.image = 'uploads/' + filename;
      }

      const updatedNews = await prisma.news.update({
        where: { id: id },
        data: data,
      });

      return updatedNews; // Return the updated news inside the transaction callback
    });

    console.log('updatedNews', updatedNews);
    return updatedNews; // Return the updated news outside the transaction callback
  }

  async remove(id: number) {
    await this.prisma.$transaction(async (prisma) => {
      await this.prisma.news.delete({
        where: {
          id: id,
        },
      });
    });
    return { message: 'News deleted successfully' };
  }
}
