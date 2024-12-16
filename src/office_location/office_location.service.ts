import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateOfficeLocationDto } from "./dto/create-office_location.dto";
import { UpdateOfficeLocationDto } from "./dto/update-office_location.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationService } from "src/pagination/pagination.service";
import { OfficeLocation, Prisma } from "@prisma/client";

@Injectable()
export class OfficeLocationService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<OfficeLocation>
  ) {}
  async create(createOfficeLocationDto: CreateOfficeLocationDto) {
    try {
      const officeLocation = await this.prisma.officeLocation.create({
        data: createOfficeLocationDto,
      });
      return officeLocation;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while creating office location."
      );
    }
  }

  async findAll(page?: number, pageSize?: number) {
    let skip;
    let take;
    if (page !== undefined && pageSize !== undefined) {
      skip = (page - 1) * pageSize;
      take = Number(pageSize);
    }
    const locations = await this.prisma.officeLocation.findMany({ skip, take });
    const totalItems = await this.prisma.officeLocation.count();
    if (page !== undefined && pageSize !== undefined) {
      return this.paginationService.getPaginationData(
        page,
        pageSize,
        locations,
        totalItems
      );
    } else {
      return {
        items: locations,
        totalItems: locations.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }
  }

  async findOne(id: number) {
    const data = await this.prisma.findOrFail("officeLocation", id);
    return data;
  }

  async update(id: number, updateOfficeLocationDto: UpdateOfficeLocationDto) {
    await this.prisma.findOrFail<OfficeLocation>("officeLocation", id);
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const inputData: any = {
          location: updateOfficeLocationDto.location,
          address1: updateOfficeLocationDto.address1,
          address2: updateOfficeLocationDto.address2,
          postal_code: updateOfficeLocationDto.postal_code,
          phone_number: updateOfficeLocationDto.phone_number,
        };

        const updatedLocation = await prisma.officeLocation.update({
          where: { id: id },
          data: inputData,
        });

        return updatedLocation;
      });
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while updating the office location."
      );
    }
  }

  async remove(id: number) {
    try {
      const response = await this.prisma.deleteOrThrow("officeLocation", id);
      return { message: "office location deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while deleting the office location."
      );
    }
  }
}
