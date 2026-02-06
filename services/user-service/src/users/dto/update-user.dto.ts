import { IsString, IsEnum, IsOptional, MinLength } from "class-validator";
import { UserRole } from "../entities/user.entity";

export class UpdateUserDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
