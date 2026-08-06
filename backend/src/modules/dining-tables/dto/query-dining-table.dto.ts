import { IsOptional, IsString, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { DiningTableStatus } from '../entities/dining-table.entity';

export enum DiningTableSortField {
  TABLE_CODE = 'tableCode',
  TABLE_NAME = 'tableName',
  AREA_NAME = 'areaName',
  CAPACITY = 'capacity',
  SORT_ORDER = 'sortOrder',
  STATUS = 'status',
  IS_ACTIVE = 'isActive',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryDiningTableDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: DiningTableSortField;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;

  @IsOptional()
  @IsString()
  areaName?: string;

  @IsOptional()
  @IsEnum(DiningTableStatus)
  status?: DiningTableStatus;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}
