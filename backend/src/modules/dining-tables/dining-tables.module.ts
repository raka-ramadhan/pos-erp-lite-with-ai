import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiningTable } from './entities/dining-table.entity';
import { DiningTablesService } from './dining-tables.service';
import { DiningTablesController } from './dining-tables.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiningTable])],
  controllers: [DiningTablesController],
  providers: [DiningTablesService],
  exports: [DiningTablesService],
})
export class DiningTablesModule {}
