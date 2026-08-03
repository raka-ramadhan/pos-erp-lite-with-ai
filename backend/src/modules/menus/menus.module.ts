import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { Menu } from './entities/menu.entity';
import { Permission } from '../auth/entities/permission.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Permission, User])],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
