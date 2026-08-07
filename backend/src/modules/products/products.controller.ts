import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface UploadedFileInterface {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('create_products')
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('with-image')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('create_products')
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        callback(new Error('Invalid file type. Only PNG, JPG, and JPEG are allowed.'), false);
        return;
      }
      callback(null, true);
    },
  }))
  async createWithImage(
    @UploadedFile() file: UploadedFileInterface,
    @Body() body: Record<string, any>,
    @CurrentUser('id') userId: string,
  ) {
    // Parse the body into CreateProductDto
    const createProductDto: CreateProductDto = {
      name: body.name,
      categoryId: body.categoryId,
      price: Number(body.price),
      unitType: body.unitType || 'unit',
      isAvailable: body.isAvailable === 'true',
      isFeatured: body.isFeatured === 'true',
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== 'false',
      taxIds: body.taxIds ? JSON.parse(body.taxIds) : [],
      modifierGroupIds: body.modifierGroupIds ? JSON.parse(body.modifierGroupIds) : [],
      ...(body.sku && { sku: body.sku }),
      ...(body.slug && { slug: body.slug }),
      ...(body.description && { description: body.description }),
      ...(body.costPrice !== undefined && { costPrice: Number(body.costPrice) }),
      ...(body.preparationTime !== undefined && { preparationTime: Number(body.preparationTime) }),
    };
    return this.productsService.createWithImage(createProductDto, file, userId);
  }

  @Get()
  @RequirePermission('view_products')
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get('active')
  @RequirePermission('use_cashier')
  async findAllActive() {
    return this.productsService.findAllActive();
  }

  @Get(':id')
  @RequirePermission('view_products')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/with-modifiers')
  @RequirePermission('use_cashier')
  async findOneWithModifiers(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOneWithModifiers(id);
  }

  @Patch(':id')
  @RequirePermission('update_products')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('delete_products')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('delete_products')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.restore(id);
  }
}
