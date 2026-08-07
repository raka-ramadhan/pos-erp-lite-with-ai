import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { OrderType, OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  outletId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  customerCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  internalNotes?: string;
}
