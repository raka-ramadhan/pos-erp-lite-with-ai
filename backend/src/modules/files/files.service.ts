import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { Media } from './entities/media.entity';
import { FileUploadResult } from './interfaces/file-metadata.interface';
import { appConfig } from '../../config/app.config';

export interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSizeInBytes: number;
}

@Injectable()
export class FilesService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {
    const config = appConfig();
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = process.env.APP_URL || `http://localhost:${config.port}`;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    const directories = ['categories', 'products', 'customers', 'temporary'];

    directories.forEach((dir) => {
      const dirPath = path.join(this.uploadDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  private generateSafeFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename).toLowerCase();
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0];
    return `${timestamp}-${uuid}${ext}`;
  }

  private sanitizeFilename(filename: string): string {
    // Remove any path traversal attempts and special characters
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  private validateMimeType(mimeType: string): void {
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new UnsupportedMediaTypeException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private validateFileSize(size: number): void {
    if (size > this.maxFileSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }
  }

  async uploadFile(
    file: any,
    entityType: string,
    entityId?: string,
    userId?: string,
  ): Promise<FileUploadResult> {
    // Validate
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.validateMimeType(file.mimetype);
    this.validateFileSize(file.size);

    // Generate safe filename
    const safeFilename = this.generateSafeFilename(file.originalname);
    const storagePath = path.join(this.uploadDir, entityType, safeFilename);
    const relativeStoragePath = path.join('uploads', entityType, safeFilename);

    // Move file from temp to destination
    await fs.promises.writeFile(storagePath, file.buffer);

    // Create media record
    const media = this.mediaRepository.create({
      entityType,
      entityId: entityId || '',
      filename: safeFilename,
      originalFilename: this.sanitizeFilename(file.originalname),
      mimeType: file.mimetype,
      fileSize: file.size,
      storagePath: relativeStoragePath.replace(/\\/g, '/'),
      url: `${this.baseUrl}/uploads/${entityType}/${safeFilename}`,
      createdBy: userId,
    });

    const savedMedia = await this.mediaRepository.save(media);

    return {
      id: savedMedia.id,
      filename: savedMedia.filename,
      originalFilename: savedMedia.originalFilename,
      mimeType: savedMedia.mimeType,
      fileSize: savedMedia.fileSize,
      url: savedMedia.url,
      storagePath: savedMedia.storagePath,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id: fileId } });

    if (!media) {
      throw new NotFoundException('File not found');
    }

    // Delete physical file
    const fullPath = path.join(process.cwd(), media.storagePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }

    // Delete database record
    await this.mediaRepository.remove(media);
  }

  async deleteFileByEntity(entityType: string, entityId: string): Promise<void> {
    const mediaFiles = await this.mediaRepository.find({
      where: { entityType, entityId },
    });

    for (const media of mediaFiles) {
      const fullPath = path.join(process.cwd(), media.storagePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
      await this.mediaRepository.remove(media);
    }
  }

  async getFilesByEntity(entityType: string, entityId: string): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { entityType, entityId },
    });
  }

  async updateEntityId(fileId: string, entityId: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id: fileId } });

    if (!media) {
      throw new NotFoundException('File not found');
    }

    media.entityId = entityId;
    return this.mediaRepository.save(media);
  }
}
