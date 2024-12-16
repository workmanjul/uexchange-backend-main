import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { MANAGE_EXCHANGE_RATES } from "src/Constants";
import { ExchangeRateService } from "./exchange_rate.service";
import { CreateExchangeRateDto } from "./dto/create-exchange_rate.dto";
import { UpdateExchangeRateDto } from "./dto/update-exchange_rate.dto";
import PermissionGuard from "src/role/permission.guard";
import { ChangeExchangeRateDto } from "./dto/ChangeExchangeRate.dto";
import { ExchangeRate } from "@prisma/client";
import { Request } from "express";
import AtGuard from "src/role/atguard";

@Controller("exchange-rate")
@UseGuards(AtGuard)
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @UseGuards(PermissionGuard(MANAGE_EXCHANGE_RATES))
  @Post()
  create(@Body() createExchangeRateDto: CreateExchangeRateDto) {
    return this.exchangeRateService.create(createExchangeRateDto);
  }
  @Get("get-exchange-rate-data")
  async getExchangeRateData() {
    return this.exchangeRateService.getExchangeRateData();
  }
  @Get("get-data")
  getData() {
    return this.exchangeRateService.getData();
  }
  @Get("major-currencies")
  async getMajorCurrencies(): Promise<{ items: ExchangeRate[] }> {
    const items = await this.exchangeRateService.getMajorCurrencies();
    return { items: items };
  }
  @Get("minor-currencies")
  async getMinorCurrencies(): Promise<{ items: ExchangeRate[] }> {
    const items = await this.exchangeRateService.getMinorCurrencies();
    return { items: items };
  }
  @Get("group-of-coins")
  async getGroupOfCoins(): Promise<{ items: ExchangeRate[] }> {
    const items = await this.exchangeRateService.getGroupOfCoins();
    return { items: items };
  }
  @Post("change-rates")
  changeRates(@Body() changeExchangeRateDto: ChangeExchangeRateDto) {
    return this.exchangeRateService.changeRates(changeExchangeRateDto);
  }

  @UseGuards(PermissionGuard(MANAGE_EXCHANGE_RATES))
  @Get()
  findAll(@Query("page") page: number, @Query("pageSize") pageSize: number) {
    return this.exchangeRateService.findAll(page, pageSize);
  }

  // @UseGuards(PermissionGuard(MANAGE_EXCHANGE_RATES))
  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: Request) {
    return this.exchangeRateService.findOne(+id, req.user);
  }

  @UseGuards(PermissionGuard(MANAGE_EXCHANGE_RATES))
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto
  ) {
    return this.exchangeRateService.update(+id, updateExchangeRateDto);
  }

  @UseGuards(PermissionGuard(MANAGE_EXCHANGE_RATES))
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.exchangeRateService.remove(+id);
  }
}
