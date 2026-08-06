import { PartialType } from '@nestjs/mapped-types';
import { CreateDiningTableDto } from './create-dining-table.dto';
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { DiningTableStatus } from '../entities/dining-table.entity';

export class UpdateDiningTableDto extends PartialType(CreateDiningTableDto) {
  @IsOptional()
  @IsString()
  tableCode?: string;

  @IsOptional()
  @IsString()
  tableName?: string;

  @IsOptional()
  @IsString()
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
