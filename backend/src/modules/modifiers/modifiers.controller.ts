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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ModifiersService, PaginatedResult, ModifierResponse } from './modifiers.service';
import { CreateModifierDto, UpdateModifierDto, QueryModifierDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('modifiers')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ModifiersController {
  constructor(private readonly modifiersService: ModifiersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('create_modifier')
  create(@Body() createModifierDto: CreateModifierDto): Promise<ModifierResponse> {
    return this.modifiersService.create(createModifierDto);
  }

  @Get()
  @RequirePermission('view_modifier')
  findAll(@Query() query: QueryModifierDto): Promise<PaginatedResult<ModifierResponse>> {
    return this.modifiersService.findAll(query);
  }

  @Get('group/:modifierGroupId')
  @RequirePermission('view_modifier')
  findAllByModifierGroup(
    @Param('modifierGroupId', ParseUUIDPipe) modifierGroupId: string,
  ): Promise<ModifierResponse[]> {
    return this.modifiersService.findAllByModifierGroup(modifierGroupId);
  }

  @Get(':id')
  @RequirePermission('view_modifier')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ModifierResponse> {
    return this.modifiersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update_modifier')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModifierDto: UpdateModifierDto,
  ): Promise<ModifierResponse> {
    return this.modifiersService.update(id, updateModifierDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('delete_modifier')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.modifiersService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('update_modifier')
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<ModifierResponse> {
    return this.modifiersService.restore(id);
  }
}
