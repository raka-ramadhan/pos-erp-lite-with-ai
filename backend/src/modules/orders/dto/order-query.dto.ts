import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderType, OrderStatus } from '../entities/order.entity';

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
