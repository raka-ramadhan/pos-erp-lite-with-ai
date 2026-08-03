import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
