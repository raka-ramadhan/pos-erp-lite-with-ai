import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { DiningTableStatus } from '../entities/dining-table.entity';

export class CreateDiningTableDto {
  @IsOptional()
  @IsString()
  outletId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  tableCode!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  tableName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  areaName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  capacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(DiningTableStatus)
  status?: DiningTableStatus;
}
