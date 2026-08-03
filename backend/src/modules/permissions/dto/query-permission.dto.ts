import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPermissionDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  module?: string;

  @IsString()
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
  @IsIn(['name', 'group', 'code', 'createdAt'])
  sort?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  order?: 'ASC' | 'DESC';
}
