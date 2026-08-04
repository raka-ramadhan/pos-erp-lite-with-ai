import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModifiersController } from './modifiers.controller';
import { ModifiersService } from './modifiers.service';
import { Modifier } from './entities/modifier.entity';
import { ModifierGroup } from '../modifier-groups/entities/modifier-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Modifier, ModifierGroup])],
  controllers: [ModifiersController],
  providers: [ModifiersService],
  exports: [ModifiersService],
})
export class ModifiersModule {}
