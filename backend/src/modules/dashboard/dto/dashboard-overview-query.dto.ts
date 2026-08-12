import { IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class DashboardOverviewQueryDto {
  @IsOptional()
  @IsIn(['today', '7d', '30d'])
  @Transform(({ value }) => value || 'today')
  range?: 'today' | '7d' | '30d' = 'today';
}
