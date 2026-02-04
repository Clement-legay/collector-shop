import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    password: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
