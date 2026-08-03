import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum UserSortField {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserSortField)
  sort?: UserSortField = UserSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

  @IsOptional()
  @IsUUID()
  roleId?: string;
}
