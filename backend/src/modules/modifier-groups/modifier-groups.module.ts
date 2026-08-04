import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModifierGroupsController } from './modifier-groups.controller';
import { ModifierGroupsService } from './modifier-groups.service';
import { ModifierGroup } from './entities/modifier-group.entity';
import { Modifier } from '../modifiers/entities/modifier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModifierGroup, Modifier])],
  controllers: [ModifierGroupsController],
  providers: [ModifierGroupsService],
  exports: [ModifierGroupsService],
})
export class ModifierGroupsModule {}
