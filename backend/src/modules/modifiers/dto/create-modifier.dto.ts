import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, Min, Max, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateModifierDto {
  @IsUUID()
  @IsString()
  modifierGroupId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : 0))
  additionalPrice: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  costPrice?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  isDefault?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  isAvailable?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : 0))
  sortOrder?: number = 0;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  isActive?: boolean = true;
}
