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
import { CategoriesService, PaginatedResult, CategoryResponse } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('create_categories')
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponse> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @RequirePermission('view_categories')
  findAll(@Query() query: QueryCategoryDto): Promise<PaginatedResult<CategoryResponse>> {
    return this.categoriesService.findAll(query);
  }

  @Get('active')
  @RequirePermission('view_categories')
  findAllActive(): Promise<CategoryResponse[]> {
    return this.categoriesService.findAllActive();
  }

  @Get(':id')
  @RequirePermission('view_categories')
  findOne(@Param('id') id: string): Promise<CategoryResponse> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update_categories')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('delete_categories')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.categoriesService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('update_categories')
  restore(@Param('id') id: string): Promise<CategoryResponse> {
    return this.categoriesService.restore(id);
  }
}
