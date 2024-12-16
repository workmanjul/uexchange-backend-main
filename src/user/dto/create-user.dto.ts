import { IsEmail, IsNotEmpty, IsString, IsNumber } from "class-validator";
import { IsRoleExists } from "../decorators/is_role_exists.decorator";
import { IsUnique } from "src/role/decorator/IsUniqueName.decorator";
import { Exclude } from "class-transformer";
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @IsUnique("user", "email")
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsRoleExists()
  roles?: number[];

  @IsNumber()
  officeId?: number;
}
