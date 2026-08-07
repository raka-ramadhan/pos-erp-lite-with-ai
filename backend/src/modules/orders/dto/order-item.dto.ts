import { IsString, IsNumber, IsOptional, IsPositive, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemModifierDto {
  @IsString()
  modifierId!: string;

  @IsString()
  modifierName!: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;
}

export class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantName?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  unitPrice!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemModifierDto)
  modifiers?: OrderItemModifierDto[];
}

export class UpdateOrderItemDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsString()
  variantName?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemModifierDto)
  modifiers?: OrderItemModifierDto[];
}

export class UpdateOrderItemNotesDto {
  @IsString()
  notes!: string;
}
