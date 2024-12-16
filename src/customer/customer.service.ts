import { Injectable } from "@nestjs/common";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationService } from "src/pagination/pagination.service";
import { Customer } from "@prisma/client";

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<Customer>
  ) {}
  create(createCustomerDto: CreateCustomerDto) {
    return "This action adds a new customer";
  }

  async findAll(
    page?: number,
    pageSize?: number,
    fromDate?: string,
    toDate?: string
  ) {
    let skip;
    let take;

    if (page !== undefined && pageSize !== undefined) {
      skip = (page - 1) * pageSize;
      take = Number(pageSize);
    }

    const formattedStartDate = new Date(`${fromDate} 00:00:00.000`);
    const formattedEndDate = new Date(`${toDate} 23:59:59.999`);

    const locations = await this.prisma.customer.findMany({
      skip,
      take,
      where: {
        createdAt: {
          gte: formattedStartDate, // Greater than or equal to start_date
          lte: formattedEndDate, // Less than or equal to end_date
        },
      },
    });
    console.log(locations);
    const totalItems = await this.prisma.customer.count({
      where: {
        createdAt: {
          gte: formattedStartDate, // Greater than or equal to start_date
          lte: formattedEndDate, // Less than or equal to end_date
        },
      },
    });

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
    const data = await this.prisma.customer.findUnique({
      where: { id: id },
      include: {
        transactions: true,
      },
    });
    if (data) {
      const transactionsGreaterThan1000 =
        await this.prisma.transactions.findMany({
          where: {
            customerId: id,
            total: {
              gt: 1000,
            },
          },
        });
      // Find the latest transaction
      const latestTransaction = await this.prisma.transactions.findFirst({
        where: {
          customerId: id,
        },
        orderBy: {
          createdAt: "desc", // Replace 'timestampField' with the actual timestamp field name
        },
      });
      //console.log(data);
      const transformedData = {
        customer: data.customer,
        first_name: data.first_name,
        last_name: data.last_name,
        dob: data.dob,
        id_type: data.id_type,
        id_number: data.id_number,
        expiry_date: data.expiry_date,
        place_of_issue: data.place_of_issue,
        phone: data.phone,
        address: data.address,
        city: data.city,
        province: data.province,
        postal_code: data.postal_code,
        occupation: data.occupation,
        business_phone: data.business_phone,
        total_number_of_transactions: data.transactions.length,
        transactions_greater_than_1000: transactionsGreaterThan1000.length,
        latest_transaction: latestTransaction.createdAt,
      };
      return transformedData;
    } else {
      return data;
    }
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
