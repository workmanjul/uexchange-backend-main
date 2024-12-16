import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  isBoolean,
} from "class-validator";

export class CreateExchangeRateDto {
  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  currency_type: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  spot_rate: number;

  @IsNotEmpty()
  @IsNumber()
  cxi_buy: number;

  @IsNotEmpty()
  @IsNumber()
  cxi_sell: number;

  @IsNotEmpty()
  @IsNumber()
  my_buy_target: number;

  @IsNotEmpty()
  @IsNumber()
  my_sell_target: number;

  @IsOptional()
  @IsNumber()
  uce_buy_rate?: number;

  @IsOptional()
  @IsNumber()
  uce_sell_rate?: number;

  @IsOptional()
  @IsNumber()
  cxi_buy_rate?: number;

  @IsOptional()
  @IsNumber()
  cxi_sell_rate?: number;

  status: boolean;
  round_up_to: number;
}
