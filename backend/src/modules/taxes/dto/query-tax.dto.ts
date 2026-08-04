import { IsOptional, IsString, IsBoolean, IsIn, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum TaxSortField {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  CODE = 'code',
  RATE = 'rate',
  TAX_TYPE = 'taxType',
  CALCULATION_ORDER = 'calculationOrder',
  SORT_ORDER = 'sortOrder',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryTaxDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['percentage', 'fixed_amount'])
  taxType?: string;

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
  @IsIn(['percentage', 'fixed_amount', 'all'])
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(TaxSortField))
  sort?: TaxSortField;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: SortOrder;
}
