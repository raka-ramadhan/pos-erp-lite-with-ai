import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaxDto {
  @IsString()
  @MaxLength(30)
  code!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsIn(['percentage', 'fixed_amount'])
  taxType!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  rate!: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['subtotal', 'after_discount'])
  calculationBase?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  calculationOrder?: number;

  @IsOptional()
  @IsBoolean()
  isInclusive?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
