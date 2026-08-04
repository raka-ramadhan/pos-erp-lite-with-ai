import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateDiscountDto } from './create-discount.dto';
import { DiscountType } from '../entities/discount.entity';

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DiscountType, { message: 'Discount type must be either "percentage" or "fixed_amount"' })
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'Value must be greater than 0' })
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  value?: number;

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
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value !== undefined ? Boolean(value) : undefined))
  isActive?: boolean;
}
