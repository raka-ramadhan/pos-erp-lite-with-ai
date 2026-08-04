import { ModifierGroup } from '../entities/modifier-group.entity';

export class ModifierGroupResponseDto {
  id!: string;
  outletId!: string | null;
  name!: string;
  slug!: string;
  description!: string | null;
  selectionType!: string;
  isRequired!: boolean;
  minSelections!: number | null;
  maxSelections!: number | null;
  sortOrder!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(modifierGroup: ModifierGroup) {
    this.id = modifierGroup.id;
    this.outletId = modifierGroup.outletId;
    this.name = modifierGroup.name;
    this.slug = modifierGroup.slug;
    this.description = modifierGroup.description;
    this.selectionType = modifierGroup.selectionType;
    this.isRequired = modifierGroup.isRequired;
    this.minSelections = modifierGroup.minSelections;
    this.maxSelections = modifierGroup.maxSelections;
    this.sortOrder = modifierGroup.sortOrder;
    this.isActive = modifierGroup.isActive;
    this.createdAt = modifierGroup.createdAt;
    this.updatedAt = modifierGroup.updatedAt;
  }
}
