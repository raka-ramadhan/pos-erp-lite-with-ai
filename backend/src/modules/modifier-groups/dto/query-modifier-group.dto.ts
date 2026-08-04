import { IsOptional, IsString, IsBoolean, IsIn, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ModifierGroupSortField {
  NAME = 'name',
  SORT_ORDER = 'sortOrder',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryModifierGroupDto {
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['single', 'multiple'])
  selectionType?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'all'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'sortOrder', 'createdAt', 'updatedAt'])
  sort?: ModifierGroupSortField;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: SortOrder;
}
