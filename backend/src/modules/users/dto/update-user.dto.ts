import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string | null;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
