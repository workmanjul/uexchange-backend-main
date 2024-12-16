import { IsNotEmpty, IsNumber, IsString, isNotEmpty } from "class-validator";

export class CreateOnholdDto {
  @IsNotEmpty()
  @IsString()
  customer_name: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  type_of_currency: string;

  @IsNotEmpty()
  @IsNumber()
  amount: string;

  @IsNotEmpty()
  pickup_date: string;
}
