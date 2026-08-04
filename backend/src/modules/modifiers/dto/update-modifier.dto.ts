import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, Min, Max, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateModifierDto {
  @IsUUID()
  @IsOptional()
  @IsString()
  modifierGroupId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  additionalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  costPrice?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
