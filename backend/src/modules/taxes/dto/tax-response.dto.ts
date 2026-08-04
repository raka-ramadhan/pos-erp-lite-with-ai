import { Tax } from '../entities/tax.entity';

export class TaxResponseDto {
  id!: string;
  outletId!: string | null;
  code!: string;
  name!: string;
  description!: string | null;
  taxType!: string;
  rate!: number;
  isDefault!: boolean;
  calculationBase!: string;
  calculationOrder!: number;
  isInclusive!: boolean;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(tax: Tax) {
    this.id = tax.id;
    this.outletId = tax.outletId;
    this.code = tax.code;
    this.name = tax.name;
    this.description = tax.description;
    this.taxType = tax.taxType;
    this.rate = Number(tax.rate);
    this.isDefault = tax.isDefault;
    this.calculationBase = tax.calculationBase;
    this.calculationOrder = tax.calculationOrder;
    this.isInclusive = tax.isInclusive;
    this.isActive = tax.isActive;
    this.createdAt = tax.createdAt;
    this.updatedAt = tax.updatedAt;
  }
}
