import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { DiscountType } from '../entities/discount.entity';

export class CreateDiscountDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType, { message: 'Discount type must be either "percentage" or "fixed_amount"' })
  discountType!: DiscountType;

  @IsNumber()
  @Min(0.01, { message: 'Value must be greater than 0' })
  @Transform(({ value }) => parseFloat(value))
  value!: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Minimum order amount cannot be negative' })
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  minOrderAmount?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Maximum discount amount cannot be negative' })
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  maxDiscountAmount?: number | null;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value) || 0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value !== undefined ? Boolean(value) : true)
  isActive?: boolean;
}
