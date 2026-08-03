import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
}

@Controller('menus')
@UseGuards(JwtAuthGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  /**
   * Get sidebar menus for the current authenticated user
   * Permission filtering is done based on user's role
   */
  @Get('sidebar')
  async getSidebar(@CurrentUser() user: CurrentUserData) {
    return this.menusService.getSidebarForUser(user.id);
  }

  /**
   * Get all menus for sidebar (admin view - no permission filtering)
   */
  @Get('sidebar/admin')
  async getSidebarAdmin() {
    return this.menusService.getSidebarForAdmin();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}
