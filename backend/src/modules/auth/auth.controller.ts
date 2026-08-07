import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, UserProfileResponse } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Public, CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from './guards';
import { Role } from './entities/role.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser('id') userId: string): Promise<UserProfileResponse> {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('menu')
  async getMenu(@CurrentUser('id') userId: string) {
    return this.authService.getSidebarMenu(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('roles')
  async getRoles(): Promise<Role[]> {
    return this.authService.getAllRoles();
  }
}
