import { IsString, IsOptional, IsBoolean, IsInt, IsIn, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum ModifierSortField {
  NAME = 'name',
  SORT_ORDER = 'sortOrder',
  ADDITIONAL_PRICE = 'additionalPrice',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryModifierDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  modifierGroupId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'all'])
  status?: 'active' | 'inactive' | 'all';

  @IsOptional()
  @IsString()
  @IsIn(['name', 'sortOrder', 'additionalPrice', 'createdAt', 'updatedAt'])
  sort?: ModifierSortField = ModifierSortField.SORT_ORDER;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: SortOrder = SortOrder.ASC;
}
