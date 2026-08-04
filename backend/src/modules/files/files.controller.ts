import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FileResponseDto } from './dto/file-response.dto';

interface UploadedFileInterface {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('files')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('upload_files')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          callback(
            new Error('Invalid file type. Only PNG, JPG, and JPEG are allowed.'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: UploadedFileInterface,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    console.log('[FilesController] Upload request:', { entityType, entityId, userId });
    const result = await this.filesService.uploadFile(
      file as any,
      entityType,
      entityId,
      userId,
    );
    console.log('[FilesController] Upload result:', result);
    return new FileResponseDto({
      ...result,
      createdAt: new Date(),
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('delete_files')
  async deleteFile(@Param('id') id: string): Promise<{ message: string }> {
    await this.filesService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }
}
