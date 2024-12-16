import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SoftDeleteDto {
  @IsNotEmpty()
  @IsNumber()
  transactionId: number;
  @IsNotEmpty()
  @IsString()
  message: string;
}
