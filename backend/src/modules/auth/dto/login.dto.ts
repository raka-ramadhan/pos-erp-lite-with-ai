import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AppType {
  DASHBOARD = 'dashboard',
  POS = 'pos',
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsOptional()
  @IsString()
  @IsIn([AppType.DASHBOARD, AppType.POS], { message: 'App must be either "dashboard" or "pos"' })
  @Transform(({ value }) => value || AppType.DASHBOARD)
  app?: AppType;
}
