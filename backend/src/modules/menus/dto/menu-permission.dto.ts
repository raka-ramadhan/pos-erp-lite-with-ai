import { IsArray, IsString, IsOptional } from 'class-validator';

export class AssignPermissionsToMenuDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds!: string[];
}

export class RemovePermissionsFromMenuDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds!: string[];
}

export class MenuPermissionResponse {
  menuId!: string;
  menuName!: string;
  menuCode!: string;
  type!: string;
  permissions!: {
    id: string;
    code: string;
    name: string;
  }[];
}
