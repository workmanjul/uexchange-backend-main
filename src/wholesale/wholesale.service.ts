import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateWholesaleDto } from "./dto/create-wholesale.dto";
import { UpdateWholesaleDto } from "./dto/update-wholesale.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Wholesale } from "./entities/wholesale.entity";

@Injectable()
export class WholesaleService {
  constructor(private prisma: PrismaService) {}
  async create(createWholesaleDto: CreateWholesaleDto, user: any) {
    console.log(createWholesaleDto);
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        currency_code: +createWholesaleDto.type_of_currency,
        location: user.officeId,
      },
    });
    console.log(inventory);

    if (createWholesaleDto.location) {
      const location = await this.prisma.officeLocation.findFirst({
        where: { location: createWholesaleDto.location },
      });
      //console.log(location);
    }

    if (inventory) {
      if (inventory.amount < createWholesaleDto.amount) {
        throw new InternalServerErrorException(
          "not enough amount in inventory"
        );
      } else {
        const wholesale_data = await this.prisma.$transaction(
          async (prisma) => {
            const wholesale = await prisma.wholesale.create({
              data: {
                transaction_type: createWholesaleDto.transaction_type,
                paid_by: createWholesaleDto.paid_by,
                amount: createWholesaleDto.amount,
                type_of_currency: createWholesaleDto.type_of_currency,
                date: new Date(createWholesaleDto.date),
                company: createWholesaleDto.company,
                wholeseller_purchase_rate:
                  createWholesaleDto.transaction_type === "Sell To UCE branches"
                    ? inventory.purchase_rate.toString()
                    : createWholesaleDto.wholeseller_purchase_rate
                    ? createWholesaleDto.wholeseller_purchase_rate.toString()
                    : "",
                wholeseller_sale_rate: createWholesaleDto.wholeseller_sale_rate
                  ? createWholesaleDto.wholeseller_sale_rate.toString()
                  : "",
                location: createWholesaleDto.location,
              },
            });
            return wholesale;
          }
        );
        if (
          createWholesaleDto.transaction_type === "Purchase From Wholeseller"
        ) {
          if (inventory.amount === 0) {
            const updatedInventory = await this.prisma.inventory.update({
              where: {
                id: inventory.id, // Assuming there's an 'id' field in your inventory model
              },
              data: {
                amount: createWholesaleDto.amount,
                purchase_rate: createWholesaleDto.wholeseller_sale_rate,
              },
            });
          } else {
            const new_purhase_rate =
              (inventory.amount * inventory.purchase_rate +
                createWholesaleDto.wholeseller_sale_rate *
                  createWholesaleDto.amount) /
              (inventory.amount + createWholesaleDto.amount);
            const updatedInventory = await this.prisma.inventory.update({
              where: {
                id: inventory.id, // Assuming there's an 'id' field in your inventory model
              },
              data: {
                amount: createWholesaleDto.amount + inventory.amount,
                purchase_rate: new_purhase_rate,
              },
            });
          }
        }
        // if (createWholesaleDto.transaction_type === "Sell To Wholeseller") {
        // }
        if (createWholesaleDto.transaction_type === "Sell To UCE branches") {
          const location = await this.prisma.officeLocation.findFirst({
            where: { location: createWholesaleDto.location },
          });
          //console.log("location", location);
          const inventory_of_that_location =
            await this.prisma.inventory.findFirst({
              where: {
                currency_code: +createWholesaleDto.type_of_currency,
                location: location.id,
              },
            });
          const currency = await this.prisma.exchangeRate.findFirst({
            where: { id: +createWholesaleDto.type_of_currency },
          });
          console.log("currency", currency);
          //console.log("inventory_of_tha_location", inventory_of_that_location);
          if (inventory_of_that_location) {
            const data = await this.prisma.branch_wholesale_inventory.create({
              data: {
                wholesale_id: wholesale_data.id,
                amount: createWholesaleDto.amount,
                currency_id: +createWholesaleDto.type_of_currency,
                inventory_id: inventory_of_that_location.id,
                sender_inventory_id: inventory.id,
                currency_code: currency.code,
              },
            });
          } else {
            throw new NotFoundException(
              "inventory of currency you are trying to send is not in the receiver branch"
            );
          }
        }
        return wholesale_data;
      }
    } else {
      throw new NotFoundException("Inventory not found");
    }
    //console.log(inventory);
  }

  findAll() {
    return `This action returns all wholesale`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wholesale`;
  }

  update(id: number, updateWholesaleDto: UpdateWholesaleDto) {
    return `This action updates a #${id} wholesale`;
  }

  remove(id: number) {
    return `This action removes a #${id} wholesale`;
  }

  async findOfficeLocaiton(user: any) {
    console.log("user", user);
    const data = await this.prisma.officeLocation.findMany({
      where: {
        id: {
          not: user.officeId,
        },
      },
    });
    return data;
  }
}
