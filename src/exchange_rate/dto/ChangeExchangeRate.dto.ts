import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  isBoolean,
} from "class-validator";

export class ChangeExchangeRateDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  selectedRows: number[];
}
