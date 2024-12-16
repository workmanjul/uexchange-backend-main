import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateFaqDto } from "./dto/create-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationService } from "src/pagination/pagination.service";
import { Faq, Prisma } from "@prisma/client";

@Injectable()
export class FaqService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<CreateFaqDto>
  ) {}
  async create(createFaqDto: CreateFaqDto): Promise<CreateFaqDto> {
    try {
      const inputData: any = {
        question: createFaqDto.question,
        answer: createFaqDto.answer,
      };
      if (typeof createFaqDto.status === "boolean") {
        inputData.status = createFaqDto.status;
      } else {
        inputData.status = createFaqDto.status === "true" ? true : false;
      }

      const data = await this.prisma.faq.create({ data: inputData });
      return data;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while create the faq."
      );
    }
  }

  async findAll(
    page?: number,
    pageSize?: number
  ): Promise<PaginationResponse<CreateFaqDto>> {
    let skip;
    let take;
    if (page !== undefined && pageSize !== undefined) {
      skip = (page - 1) * pageSize;
      take = Number(pageSize);
    }

    const faqs = await this.prisma.faq.findMany({
      skip,
      take,
    });
    const totalItems = await this.prisma.role.count();

    if (page !== undefined && pageSize !== undefined) {
      return this.paginationService.getPaginationData(
        page,
        pageSize,
        faqs,
        totalItems
      );
    } else {
      return {
        items: faqs,
        page: page,
        totalPages: 0,
        pageSize: pageSize,
        totalItems: totalItems,
        hasPrevious: false,
        hasNext: false,
      };
    }
  }

  async findOne(id: number): Promise<CreateFaqDto> {
    const data = await this.prisma.findOrFail<CreateFaqDto>("faq", id);
    return data;
  }

  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<UpdateFaqDto> {
    await this.prisma.findOrFail<Faq>("faq", id);
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const inputData: any = {
          question: updateFaqDto.question,
          answer: updateFaqDto.answer,
        };
        if (typeof updateFaqDto.status === "boolean") {
          inputData.status = updateFaqDto.status;
        } else {
          inputData.status = updateFaqDto.status === "true" ? true : false;
        }
        const updatedFaq = await prisma.faq.update({
          where: { id: id },
          data: inputData,
        });

        return updatedFaq;
      });
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while updating the faq."
      );
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const response = await this.prisma.deleteOrThrow("faq", id);
      return { message: "faq deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while deleting the faq."
      );
    }
  }
}
