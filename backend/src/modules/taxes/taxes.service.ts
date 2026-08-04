import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tax } from './entities/tax.entity';

@Injectable()
export class TaxesService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  async findAllActive(): Promise<Tax[]> {
    return this.taxRepository.find({
      where: { isActive: true },
      order: { calculationOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tax | null> {
    return this.taxRepository.findOne({ where: { id } });
  }
}
