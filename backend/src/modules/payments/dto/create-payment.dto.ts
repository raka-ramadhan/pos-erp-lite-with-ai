import { IsString, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsString()
  paymentMethodId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsNumber()
  @Min(0)
  changeAmount!: number;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  cardNumber?: string;

  @IsString()
  @IsOptional()
  cardHolder?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
