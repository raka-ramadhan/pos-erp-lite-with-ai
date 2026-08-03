import { IsString, IsOptional, IsBoolean, IsInt, IsUUID, Min } from 'class-validator';
import { MenuType } from '../entities/menu.entity';

export class CreateMenuDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: MenuType;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsUUID()
  @IsOptional()
  permissionId?: string;
}
