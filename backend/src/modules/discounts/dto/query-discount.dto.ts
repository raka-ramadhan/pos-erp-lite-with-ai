import { IsOptional, IsString, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DiscountType } from '../entities/discount.entity';

export class QueryDiscountDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'all';

  @IsOptional()
  @IsString()
  sort?: 'sortOrder' | 'name' | 'code' | 'value' | 'createdAt';

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';
}
