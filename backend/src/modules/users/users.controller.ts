import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService, PaginatedResult, UserResponse } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('user.create')
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @RequirePermission('user.view')
  findAll(@Query() query: QueryUserDto): Promise<PaginatedResult<UserResponse>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('user.view')
  findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('user.update')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  @RequirePermission('user.change_status')
  changeStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<UserResponse> {
    return this.usersService.changeStatus(id, isActive);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('user.delete')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('user.update')
  restore(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.restore(id);
  }
}
