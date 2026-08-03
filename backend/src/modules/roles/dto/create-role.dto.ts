import { IsString, IsArray, IsOptional, IsBoolean, IsInt, Min, Matches } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Matches(/^[a-z_]+$/, {
    message: 'Role code must be lowercase letters and underscores only (e.g., role_manager)',
  })
  code: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}
