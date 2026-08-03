import { IsString, IsOptional, IsBoolean, IsInt, Min, Matches, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^[a-z]+\.[a-z]+$|^[a-z]+_[a-z]+$/, {
    message: 'Permission code must be in format: module.action (e.g., user.view) or module_action (e.g., user_view)',
  })
  code: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  group?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  sortOrder?: number;
}
