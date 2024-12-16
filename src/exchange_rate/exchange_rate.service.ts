import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateExchangeRateDto } from "./dto/create-exchange_rate.dto";
import { UpdateExchangeRateDto } from "./dto/update-exchange_rate.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { ExchangeRate, Prisma } from "@prisma/client";
import { PaginationService } from "src/pagination/pagination.service";
import { USERNAME, PASSWORD } from "src/config";
import axios from "axios";
import { ChangeExchangeRateDto } from "./dto/ChangeExchangeRate.dto";

@Injectable()
export class ExchangeRateService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService<ExchangeRate>
  ) {}
  async create(
    createExchangeRateDto: CreateExchangeRateDto
  ): Promise<ExchangeRate> {
    try {
      const formateddata = {
        ...createExchangeRateDto,
        uce_buy_rate: createExchangeRateDto.uce_buy_rate ?? undefined,
        uce_sell_rate: createExchangeRateDto.uce_sell_rate ?? undefined,
        cxi_buy_rate: createExchangeRateDto.cxi_buy_rate ?? undefined,
        cxi_sell_rate: createExchangeRateDto.cxi_sell_rate ?? undefined,
      };
      const data = await this.prisma.$transaction(async (prisma) =>
        prisma.exchangeRate.create({ data: formateddata })
      );
      return data;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while create the exchange rate."
      );
    }
  }

  async findAll(
    page?: number,
    pageSize?: number
  ): Promise<PaginationResponse<ExchangeRate>> {
    try {
      let skip;
      let take;
      if (page !== undefined && pageSize !== undefined) {
        skip = (page - 1) * pageSize;
        take = Number(pageSize);
      }

      const exchangeRate = await this.prisma.exchangeRate.findMany({
        skip,
        take,
      });
      const totalItems = await this.prisma.exchangeRate.count();

      if (page !== undefined && pageSize !== undefined) {
        return this.paginationService.getPaginationData(
          page,
          pageSize,
          exchangeRate,
          totalItems
        );
      } else {
        return {
          items: exchangeRate,
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
        "An error occurred while fetching the exchange rate."
      );
    }
  }

  async findOne(id: number, user: any) {
    try {
      console.log(user);
      // const data = await this.prisma.findOrFail<ExchangeRate>(
      //   "exchangeRate",
      //   id
      // );

      const data = await this.prisma.exchangeRate.findUnique({
        where: {
          id: id,
        },
        include: {
          inventory: {
            where: {
              location: user.officeId,
            },
          },
        },
      });
      console.log(data);
      return data;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while fetching the exchange rate."
      );
    }
  }

  async update(
    id: number,
    updateExchangeRateDto: UpdateExchangeRateDto
  ): Promise<ExchangeRate> {
    try {
      const data = await this.prisma.findOrFail<ExchangeRate>(
        "exchangeRate",
        id
      );

      const updatedData = await this.prisma.$transaction(async (prisma) => {
        const updatedData = await prisma.exchangeRate.update({
          where: { id: id },
          data: updateExchangeRateDto,
        });
        return updatedData;
      });

      return updatedData;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while fetching the exchange rate."
      );
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.deleteOrThrow("exchangeRate", id);
      return { message: "Exchange Rate deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        "An error occurred while fetching the exchange rate."
      );
    }
  }
  async getData() {
    let currency_codes = "";
    const result_set = await this.prisma.exchangeRate.findMany({
      select: {
        code: true,
      },
    });
    const currencyCodes = result_set.map((row) => row.code).join(",");
    const username = USERNAME;
    const password = PASSWORD;
    const URL = `https://xecdapi.xe.com/v1/convert_from.json/?from=CAD&to=${currencyCodes}&amount=1 `;
    const options = {
      method: "GET",
      url: URL,
      headers: {
        "Content-Type": "text/xml",
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          "base64"
        )}`,
      },
      timeout: 60000,
    };
    try {
      const response = await axios(options);
      const result = response.data.to;

      // Process the response data here
      result.forEach(async (result) => {
        const data = await this.prisma.exchangeRate.findFirst({
          where: {
            code: result.quotecurrency,
          },
        });
        if (data) {
          await this.prisma.exchangeRate.update({
            where: { id: data.id },
            data: { spot_rate: result.mid },
          });
        }
      });
      return { mesage: "success" };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeRates(changeExchangeRateDto: ChangeExchangeRateDto) {
    if (
      changeExchangeRateDto.type ===
      "Change selected Buy Rates to Suggested Buy Rates"
    ) {
      const exchangeRates = await this.prisma.exchangeRate.findMany({
        where: {
          id: { in: changeExchangeRateDto.selectedRows },
        },
      });

      const updatedExchangeRates = await Promise.all(
        exchangeRates.map(async (exchangeRate) => {
          const updatedRate = {
            cxi_buy_rate: exchangeRate.suggested_buy_rate,
          };
          return this.prisma.exchangeRate.update({
            where: { id: exchangeRate.id },
            data: updatedRate,
          });
        })
      );
    }
    if (
      changeExchangeRateDto.type ===
      "Change selected Sale Rates to Suggested Sell Rates"
    ) {
      const exchangeRates = await this.prisma.exchangeRate.findMany({
        where: {
          id: { in: changeExchangeRateDto.selectedRows },
        },
      });

      const updatedExchangeRates = await Promise.all(
        exchangeRates.map(async (exchangeRate) => {
          const updatedRate = {
            cxi_sell_rate: exchangeRate.suggested_sell_rate,
          };
          return this.prisma.exchangeRate.update({
            where: { id: exchangeRate.id },
            data: updatedRate,
          });
        })
      );
    }
    if (
      changeExchangeRateDto.type === "Change selected Rates to Suggested Rates"
    ) {
      const exchangeRates = await this.prisma.exchangeRate.findMany({
        where: {
          id: { in: changeExchangeRateDto.selectedRows },
        },
      });

      const updatedExchangeRates = await Promise.all(
        exchangeRates.map(async (exchangeRate) => {
          const updatedRate = {
            cxi_sell_rate: exchangeRate.suggested_sell_rate,
            cxi_buy_rate: exchangeRate.suggested_buy_rate,
          };
          return this.prisma.exchangeRate.update({
            where: { id: exchangeRate.id },
            data: updatedRate,
          });
        })
      );
    }

    return { message: "exchange rates changed" };
  }

  async getMajorCurrencies(): Promise<ExchangeRate[]> {
    const data = await this.prisma.exchangeRate.findMany({
      where: {
        currency_type: "Major",
      },
    });
    return data;
  }
  async getMinorCurrencies(): Promise<ExchangeRate[]> {
    const data = await this.prisma.exchangeRate.findMany({
      where: {
        currency_type: "Minor",
      },
    });
    return data;
  }
  async getGroupOfCoins(): Promise<ExchangeRate[]> {
    const data = await this.prisma.exchangeRate.findMany({
      where: {
        currency_type: "Group Of Coins",
      },
    });
    return data;
  }

  async getExchangeRateData() {
    const data = await this.prisma.exchangeRate.findMany();
    return data;
  }
}
