import { IsOptional, IsString, IsBoolean, IsIn, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum PaymentMethodSortField {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  CODE = 'code',
  PAYMENT_TYPE = 'paymentType',
  SORT_ORDER = 'sortOrder',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryPaymentMethodDto {
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
  @IsIn(['cash', 'e_wallet', 'bank_transfer', 'card', 'qris', 'other'])
  paymentType?: string;

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
  @IsIn(Object.values(PaymentMethodSortField))
  sort?: PaymentMethodSortField;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: SortOrder;
}
