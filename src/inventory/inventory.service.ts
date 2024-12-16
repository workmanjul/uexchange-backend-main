import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationService } from "src/pagination/pagination.service";
import { Inventory, Prisma } from "@prisma/client";

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<any>
  ) {}
  async create(createInventoryDto: CreateInventoryDto) {
    const data = await this.prisma.$transaction(async (prisma) => {
      const exchangerate = await prisma.exchangeRate.findFirst({
        where: { id: +createInventoryDto.currency_code },
      });

      const officeLocation = await prisma.officeLocation.findFirst({
        where: { id: +createInventoryDto.location },
      });

      if (officeLocation && exchangerate) {
        const inventory = await prisma.inventory.create({
          data: createInventoryDto,
        });
      }
    });
    return { message: "success" };
  }

  async findAll(
    page?: number,
    pageSize?: number,
    user?: any
  ): Promise<PaginationResponse<any>> {
    try {
      let skip;
      let take;
      console.log("user", user);
      if (page !== undefined && pageSize !== undefined) {
        skip = (page - 1) * pageSize;
        take = Number(pageSize);
      }

      const transactions = await this.prisma.inventory.findMany({
        skip,
        take,
        ...(user.isDefault
          ? {}
          : {
              where: { location: user.officeId },
            }),
        include: {
          exchangeRate: {
            select: {
              id: true,
              code: true,
            },
          },
          office: true,
          branch_wholesale_inventory: {
            where: { received: false },
          },
        },
      });

      const totalItems = await this.prisma.inventory.count();

      if (page !== undefined && pageSize !== undefined) {
        return this.paginationService.getPaginationData(
          page,
          pageSize,
          transactions,
          totalItems
        );
      } else {
        return {
          items: transactions,
          page: page,
          totalPages: 0,
          pageSize: pageSize,
          totalItems: totalItems,
          hasPrevious: false,
          hasNext: false,
        };
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while fetching the transactions"
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    await this.prisma.findOrFail<Inventory>("inventory", id);
    const data = await this.prisma.$transaction(async (prisma) => {
      const exchangerate = await prisma.exchangeRate.findFirst({
        where: { id: +updateInventoryDto.currency_code },
      });

      const officeLocation = await prisma.officeLocation.findFirst({
        where: { id: +updateInventoryDto.location },
      });

      if (officeLocation && exchangerate) {
        const inventory = await prisma.inventory.update({
          where: { id: id },
          data: updateInventoryDto,
        });
      }
    });
    return { message: "success" };
  }

  async remove(id: number) {
    try {
      const response = await this.prisma.deleteOrThrow("inventory", id);
      return { message: "inventory deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while deleting the inventory."
      );
    }
  }
  async acceptInventory(id: number) {
    const data = await this.prisma.branch_wholesale_inventory.update({
      where: { id: id },
      data: { received: true },
    });
    // const receiving_inventory = await this.prisma.inventory.findFirst({
    //   where: { id: data.inventory_id },
    // });
    // const sender_inventory = await this.prisma.inventory.findFirst({
    //   where: { id: data.sender_inventory_id },
    // });
    // if (receiving_inventory.amount === 0) {
    //   const updatedReceivingInventory = await this.prisma.inventory.update({
    //     where: {
    //       id: data.inventory_id,
    //     },
    //     data: {
    //       amount: data.amount,
    //       purchase_rate: sender_inventory.purchase_rate,
    //     },
    //   });
    // } else {
    // }
    return "success";
  }
}
