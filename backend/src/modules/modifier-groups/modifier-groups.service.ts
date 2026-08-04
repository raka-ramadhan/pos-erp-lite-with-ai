import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModifierGroup } from './entities/modifier-group.entity';

@Injectable()
export class ModifierGroupsService {
  constructor(
    @InjectRepository(ModifierGroup)
    private readonly modifierGroupRepository: Repository<ModifierGroup>,
  ) {}

  async findAllActive(): Promise<ModifierGroup[]> {
    return this.modifierGroupRepository.find({
      where: { isActive: true },
      relations: { modifiers: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ModifierGroup | null> {
    return this.modifierGroupRepository.findOne({
      where: { id },
      relations: { modifiers: true },
    });
  }
}
