import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Menu } from './entities/menu.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig().secret,
      signOptions: {
        expiresIn: '24h',
      } as JwtSignOptions,
    }),
    TypeOrmModule.forFeature([User, Role, Permission, Menu]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule, TypeOrmModule],
})
export class AuthModule {}
