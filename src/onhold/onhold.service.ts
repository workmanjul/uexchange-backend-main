import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateOnholdDto } from "./dto/create-onhold.dto";
import { UpdateOnholdDto } from "./dto/update-onhold.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class OnholdService {
  constructor(private prisma: PrismaService) {}
  async create(createOnholdDto: CreateOnholdDto, user: any) {
    console.log(user);
    //console.log(createOnholdDto);
    try {
      const data = await this.prisma.inventory.findFirst({
        where: {
          currency_code: +createOnholdDto.type_of_currency,
          location: user.officeId,
        },
        include: {
          exchangeRate: true,
        },
      });
      console.log(data);
      if (!data) {
        throw new NotFoundException("Inventory not found");
      } else {
        if (data.on_hold > 0) {
          const remaining_amount = data.amount - data.on_hold;
          console.log("remaingin", remaining_amount);
          if (+createOnholdDto.amount > remaining_amount) {
            console.log("hello");
            throw new BadRequestException(
              "The amount is not sufficeint in the inventory"
            );
          }
        }

        const onHoldData = await this.prisma.onHold.create({
          data: {
            customer_name: createOnholdDto.customer_name,
            phone_number: createOnholdDto.phone_number,
            type_of_currency: createOnholdDto.type_of_currency,
            amount: +createOnholdDto.amount,
            pickup_date: new Date(createOnholdDto.pickup_date),
            currency_code: data.exchangeRate.code,
            inventory_id: data.id,
            office_id: user.officeId,
          },
        });
        const inventory = await this.prisma.inventory.update({
          where: { id: data.id },
          data: {
            on_hold: data.on_hold + onHoldData.amount,
          },
        });
      }
      return "on hold saved";
    } catch (error) {
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while saving on hold"
      );
    }
  }

  async findAll(user: any) {
    const onHold_data = await this.prisma.onHold.findMany({
      where: { office_id: user.officeId },
      orderBy: {
        createdAt: "desc", // or 'desc' for descending order
      },
    });
    return onHold_data;
  }

  findOne(id: number) {
    return `This action returns a #${id} onhold`;
  }

  update(id: number, updateOnholdDto: UpdateOnholdDto) {
    return `This action updates a #${id} onhold`;
  }

  remove(id: number) {
    return `This action removes a #${id} onhold`;
  }

  async releaseOnHold(id: number) {
    const data = await this.prisma.onHold.update({
      where: { id: id },
      data: { released: true },
      include: {
        inventory: true,
      },
    });
    console.log(data.inventory);
    const inventory = await this.prisma.inventory.update({
      where: { id: data.inventory.id },
      data: {
        on_hold: data.inventory.on_hold - data.amount,
      },
    });
    console.log("inve", inventory);
    return data;
  }
}
