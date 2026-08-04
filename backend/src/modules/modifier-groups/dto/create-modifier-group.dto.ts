import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsIn, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateModifierGroupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['single', 'multiple'])
  @IsOptional()
  selectionType?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  minSelections?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  maxSelections?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : 0))
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? value === true || value === 'true' : true))
  isActive?: boolean;

  @IsString()
  @IsOptional()
  outletId?: string;
}
