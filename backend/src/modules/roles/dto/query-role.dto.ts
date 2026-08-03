import { IsString, IsOptional, IsInt, Min, IsBooleanString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryRoleDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsBooleanString()
  @IsOptional()
  status?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  @IsIn(['name', 'createdAt', 'updatedAt', 'sortOrder'])
  sort?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  order?: 'ASC' | 'DESC';
}
