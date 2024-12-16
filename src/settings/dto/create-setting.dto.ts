import { IsNotEmpty, IsString } from "class-validator";

export class CreateSettingDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
