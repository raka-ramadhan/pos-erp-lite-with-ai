import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ApplyDiscountDto {
  @IsOptional()
  @IsUUID()
  discountId?: string | null;
}
