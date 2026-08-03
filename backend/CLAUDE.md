# Backend Project - NestJS

## Overview

NestJS backend API dengan TypeScript, menggunakan pattern modular yang clean, maintainable, dan secure.

## Tech Stack

```json
{
  "framework": "NestJS 11",
  "language": "TypeScript",
  "runtime": "Node.js",
  "packageManager": "npm"
}
```

## Database Connection (MCP)

Project ini menggunakan MCP server untuk koneksi database.

### MCP Server: `my-mcp-server-erp-lite`

| Property | Value |
|----------|-------|
| **Type** | MySQL |
| **Host** | `127.0.0.1` |
| **Database** | `erp_lite` |
| **Port** | `3306` |
| **User** | `superuser` |

### Kapan Pakai MCP?

Gunakan MCP server untuk:
- **Feature baru** - Check existing table structures, columns, relationships
- **Bug fix** - Verify data schema, check existing queries
- **API integration** - Understand database structure untuk mapping entity/field
- **CRUD operations** - Reference existing tables untuk buat module baru

### Checklist Sebelum Coding

Sebelum bikin module/feature baru:
1. Check apakah table sudah ada di database via MCP
2. Understand existing table structure (columns, types, constraints)
3. Reference pattern dari table yang sudah ada
4. Jangan duplicate nama table/column yang sudah ada

### Konvensi Database

- Table names: `snake_case`, plural (e.g., `users`, `product_categories`)
- Column names: `snake_case` (e.g., `created_at`, `user_id`)
- Primary key: `id` (UUID or auto-increment integer)
- Timestamps: `created_at`, `updated_at`
- Foreign key: `{table}_id` pattern (e.g., `user_id`, `product_id`)

## Project Structure

```
backend/src/
├── main.ts              # Entry point, bootstrap app
├── app.module.ts        # Root module
├── app.controller.ts    # Root controller
├── app.service.ts       # Root service
├── common/              # Shared decorators, guards, pipes
├── config/              # Configuration files
├── modules/             # Feature modules
│   └── auth/            # Auth module (contoh)
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── auth.dto.ts
│       └── entities/
└── shared/              # Shared modules, interceptors
```

## NestJS Architecture Pattern

### Standard Module Structure

```
modules/{feature}/
├── {feature}.module.ts      # Module definition
├── {feature}.controller.ts  # HTTP endpoints
├── {feature}.service.ts     # Business logic
├── dto/                     # Data Transfer Objects
│   ├── create-{feature}.dto.ts
│   └── update-{feature}.dto.ts
├── entities/                 # Database entities (if applicable)
│   └── {feature}.entity.ts
└── {feature}.controller.spec.ts
```

## Naming Conventions

### Files
| Type | Convention | Example |
|------|------------|---------|
| Module | `kebab-case.module.ts` | `auth.module.ts` |
| Controller | `kebab-case.controller.ts` | `auth.controller.ts` |
| Service | `kebab-case.service.ts` | `auth.service.ts` |
| DTO | `kebab-case.dto.ts` | `create-user.dto.ts` |
| Entity | `kebab-case.entity.ts` | `user.entity.ts` |
| Interface | `camelCase.interface.ts` | `response.interface.ts` |
| Guard | `camelCase.guard.ts` | `jwt-auth.guard.ts` |
| Decorator | `camelCase.decorator.ts` | `current-user.decorator.ts` |

### Classes
- Use `PascalCase`
- Suffix: `Controller`, `Service`, `Module`, `Dto`, `Entity`, `Guard`, `Pipe`, `Interceptor`

### Variables & Functions
- Use `camelCase`

## DTO Pattern

```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}

// update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

## Service Pattern

```typescript
// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
```

## Controller Pattern

```typescript
// users.controller.ts
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

## Security Best Practices

### 1. Input Validation (Wajib)

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error on non-whitelisted
      transform: true,          // Auto-transform payloads to DTOs
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  await app.listen(3000);
}
```

### 2. Security Headers

```typescript
// main.ts
import helmet from 'helmet';

app.use(helmet());
```

### 3. Rate Limiting

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 minute
      limit: 100,   // 100 requests per minute
    }]),
  ],
})
export class AppModule {}
```

### 4. CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
  credentials: true,
});
```

### 5. Password Hashing

```typescript
// Pake bcrypt
import * as bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 6. Environment Variables

```typescript
// config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get(key: string): string {
    return this.configService.get<string>(key)!;
  }

  getOrThrow(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Configuration key "${key}" is not defined`);
    }
    return value;
  }
}
```

## Validation Rules

### ✅ WAJIB

1. **ValidationPipe** - Selalu gunakan untuk validasi input
2. **DTOs** - Buat DTO untuk setiap request
3. **Class Validator** - Pakai decorators untuk validasi
4. **Whitelist** - Strip data tidak dikenal
5. **Error Handling** - Selalu throw proper exception
6. **Type Safety** - Jangan pakai `any`

### ❌ JANGAN

1. Jangan trust input user langsung
2. Jangan expose sensitive data di response
3. Jangan hardcode secrets di code
4. Jangan pakai `any` untuk typed data
5. Jangan skip validation
6. Jangan ignore TypeScript errors

## Error Handling Pattern

```typescript
// Throws standard NestJS exceptions
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Not authenticated');
throw new ForbiddenException('Access denied');
throw new NotFoundException('Resource not found');
throw new InternalServerErrorException('Something went wrong');

// Custom error response
throw new HttpException(
  {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Validation failed',
    error: 'Bad Request',
    details: validationErrors,
  },
  HttpStatus.BAD_REQUEST,
);
```

## Response Pattern

```typescript
// Standard success response
{
  "data": {...},
  "message": "Operation successful"
}

// Paginated response
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}

// Error response
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## REST API Conventions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resources` | Create new resource |
| GET | `/resources` | List all resources |
| GET | `/resources/:id` | Get single resource |
| PATCH | `/resources/:id` | Partial update |
| PUT | `/resources/:id` | Full update |
| DELETE | `/resources/:id` | Delete resource |

## Available Scripts

```bash
npm run start        # Start production server
npm run start:dev    # Start with hot reload
npm run start:debug # Start with debug
npm run build       # Build for production
npm run test         # Run unit tests
npm run test:watch  # Watch mode for tests
npm run lint        # Run ESLint
```

## Testing Credentials

### Default Admin User

| Property | Value |
|----------|-------|
| **Email** | `admin@nexus.com` |
| **Password** | `admin123` |
| **Role** | Administrator (all permissions) |

### Test Login via cURL

```bash
# Login
curl --location 'http://localhost:3000/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "admin@nexus.com",
    "password": "admin123"
}'

# Get Users (after login, use token from response)
curl --location 'http://localhost:3000/api/users' \
--header 'Authorization: Bearer <TOKEN_DARI_LOGIN>'

# Get Roles
curl --location 'http://localhost:3000/api/roles' \
--header 'Authorization: Bearer <TOKEN_DARI_LOGIN>'
```

### Permission Codes

Permissions di database menggunakan format `{resource}.{action}`:

| Resource | Permissions |
|----------|-------------|
| Dashboard | `dashboard.view` |
| Users | `user.view`, `user.create`, `user.update`, `user.delete`, `user.change_status` |
| Roles | `role.view`, `role.create`, `role.update`, `role.delete` |
| Permissions | `permission.view`, `permission.create`, `permission.update`, `permission.delete` |
| Menus | `menu.view`, `menu.create`, `menu.update`, `menu.delete` |

**Catatan:** Permission code tidak bisa diedit jika sudah digunakan oleh role (RBAC constraint).

## Development Rules

### ✅ WAJIB

1. **TypeScript** - Strict mode, no `any`
2. **DTOs** - Buat DTO untuk setiap request body
3. **Validation** - Pakai class-validator decorators
4. **Interfaces** - Definisikan response types
5. **Error Handling** - Pakai built-in exceptions
6. **Async** - Pakai `async/await`, return `Promise<T>`
7. **Dependency Injection** - Manfaatkan DI container

### ❌ JANGAN

1. Janganlogic di controller -lempar ke service
2. Jangan akses database langsung di controller
3. Jangan return entity langsung - pakai DTO/interface
4. Jangan skip validation
5. Jangan expose internal errors ke client
6. Jangan pakai magic strings - pakai constants/enums

### 🎯 Scope Terbatas

Task yang boleh dilakukan:
- CRUD operations dengan pattern yang ada
- Validasi input dengan DTOs
- Error handling dengan exceptions
- Basic authentication/authorization
- Database operations (TypeORM/Prisma)

Task yang perlu konfirmasi dulu:
- Ubah struktur folder
- Tambah middleware baru
- Ubah security configuration
- Modifikasi core architecture
- Tambah external integrations

### 🎯 MCP Database Usage

**WAJIB** check database via MCP sebelum bikin feature/module baru:

1. **Selalu gunakan `my-mcp-server-erp-lite`** untuk query database
2. Check existing tables sebelum buat module baru
3. Verify column names & types sebelum define Entity
4. Reference existing schema untuk consistency
5. Jangan buat table duplicate yang sudah ada

## File Patterns Summary

```
src/
├── main.ts                    # Bootstrap, global pipes, CORS
├── app.module.ts              # Root module
├── common/                    # Shared utilities
│   ├── decorators/            # Custom decorators
│   ├── guards/                # Auth guards
│   ├── interceptors/           # Logging, transform
│   └── filters/               # Exception filters
├── config/                    # Configuration
│   └── configuration.ts
└── modules/                   # Feature modules
    └── {feature}/
        ├── {feature}.module.ts
        ├── {feature}.controller.ts
        ├── {feature}.service.ts
        └── dto/
            ├── create-{feature}.dto.ts
            └── update-{feature}.dto.ts
```
