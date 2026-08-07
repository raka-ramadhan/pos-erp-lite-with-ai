/**
 * Order Calculation Engine
 *
 * Business Flow:
 * Subtotal → Modifier Price → Product Discount → Order Discount →
 * Subtotal After Discount → Service Charge → Tax → Grand Total
 *
 * All calculations are performed in backend (Single Source of Truth)
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tax } from '../taxes/entities/tax.entity';
import { Discount, DiscountType } from '../discounts/entities/discount.entity';

export interface CalculationInput {
  subtotal: number;
  productDiscounts: ProductDiscountLine[];
  orderDiscountId?: string;
}

export interface ProductDiscountLine {
  productId: string;
  discountId: string;
  discountName: string;
  discountType: DiscountType;
  value: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
}

export interface TaxLine {
  id: string;
  name: string;
  code: string;
  taxType: string;
  rate: number;
  calculationBase: string; // 'subtotal' or 'after_discount'
  taxableAmount: number;
  taxAmount: number;
}

export interface OrderDiscountLine {
  discountId: string;
  discountCode: string | null;
  discountName: string;
  discountType: DiscountType;
  originalValue: number;
  discountAmount: number;
}

export interface OrderCalculation {
  // Subtotal (base price * quantity, includes modifiers)
  subtotal: number;

  // Product-level discounts (aggregated)
  productDiscountTotal: number;
  productDiscountLines: ProductDiscountLine[];

  // Subtotal after product discounts
  subtotalAfterProductDiscount: number;

  // Order-level discount
  orderDiscount: OrderDiscountLine | null;
  orderDiscountAmount: number;

  // Subtotal after all discounts
  subtotalAfterDiscount: number;

  // Service charge (if applicable)
  serviceChargePercent: number;
  serviceChargeAmount: number;

  // Tax lines
  taxLines: TaxLine[];
  totalTaxAmount: number;

  // Grand Total
  grandTotal: number;

  // Metadata
  calculationTimestamp: Date;
}

@Injectable()
export class CalculationEngineService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get active taxes for POS
   */
  async getActiveTaxes(): Promise<Tax[]> {
    return this.taxRepository.find({
      where: { isActive: true },
      order: { calculationOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get discount by ID
   */
  async getDiscountById(discountId: string): Promise<Discount | null> {
    return this.discountRepository.findOne({
      where: { id: discountId, isActive: true },
    });
  }

  /**
   * Calculate full order with all discounts and taxes
   */
  async calculate(input: CalculationInput): Promise<OrderCalculation> {
    const {
      subtotal,
      productDiscounts,
      orderDiscountId,
    } = input;

    // Step 1: Calculate product discounts
    let productDiscountTotal = 0;
    const productDiscountLines: ProductDiscountLine[] = [];

    for (const pd of productDiscounts) {
      const discountAmount = this.calculateDiscountAmount(
        pd.discountType,
        pd.value,
        subtotal, // For now, product discount applies to item subtotal
        pd.maxDiscountAmount,
      );

      productDiscountTotal += discountAmount;
      productDiscountLines.push({
        ...pd,
        maxDiscountAmount: pd.maxDiscountAmount ?? null,
        minOrderAmount: pd.minOrderAmount ?? null,
      });
    }

    // Step 2: Subtotal after product discounts
    const subtotalAfterProductDiscount = subtotal - productDiscountTotal;

    // Step 3: Calculate order discount
    let orderDiscount: OrderDiscountLine | null = null;
    let orderDiscountAmount = 0;

    if (orderDiscountId) {
      const discount = await this.getDiscountById(orderDiscountId);
      if (discount && this.isDiscountValid(discount, subtotalAfterProductDiscount)) {
        orderDiscountAmount = this.calculateDiscountAmount(
          discount.discountType,
          Number(discount.value),
          subtotalAfterProductDiscount,
          discount.maxDiscountAmount ? Number(discount.maxDiscountAmount) : null,
        );

        orderDiscount = {
          discountId: discount.id,
          discountCode: discount.code,
          discountName: discount.name,
          discountType: discount.discountType,
          originalValue: Number(discount.value),
          discountAmount: orderDiscountAmount,
        };
      }
    }

    // Step 4: Subtotal after all discounts
    const subtotalAfterDiscount = subtotalAfterProductDiscount - orderDiscountAmount;

    // Step 5: Calculate service charge (if any)
    // TODO: Service charge from outlet configuration (future)
    const serviceChargePercent = 0;
    const serviceChargeAmount = 0;

    // Step 6: Calculate taxes
    const activeTaxes = await this.getActiveTaxes();
    const { taxLines, totalTaxAmount } = await this.calculateTaxes(
      activeTaxes,
      subtotalAfterDiscount,
      subtotalAfterProductDiscount,
    );

    // Step 7: Calculate grand total
    const grandTotal = subtotalAfterDiscount + serviceChargeAmount + totalTaxAmount;

    return {
      subtotal,
      productDiscountTotal,
      productDiscountLines,
      subtotalAfterProductDiscount,
      orderDiscount,
      orderDiscountAmount,
      subtotalAfterDiscount,
      serviceChargePercent,
      serviceChargeAmount,
      taxLines,
      totalTaxAmount,
      grandTotal: Math.round(grandTotal * 100) / 100, // Round to 2 decimal places
      calculationTimestamp: new Date(),
    };
  }

  /**
   * Calculate discount amount based on type
   */
  private calculateDiscountAmount(
    discountType: DiscountType,
    value: number,
    baseAmount: number,
    maxDiscountAmount?: number | null,
  ): number {
    if (baseAmount <= 0) return 0;

    let discountAmount: number;

    if (discountType === DiscountType.PERCENTAGE) {
      discountAmount = baseAmount * (Number(value) / 100);
    } else {
      // Fixed amount
      discountAmount = Number(value);
    }

    // Apply max discount cap if applicable
    if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
      discountAmount = maxDiscountAmount;
    }

    // Ensure discount doesn't exceed base amount
    if (discountAmount > baseAmount) {
      discountAmount = baseAmount;
    }

    return Math.round(discountAmount * 100) / 100;
  }

  /**
   * Validate if discount is valid for current order
   */
  private isDiscountValid(discount: Discount, subtotal: number): boolean {
    // Check date validity
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return false;
    }
    if (discount.endDate && new Date(discount.endDate) < now) {
      return false;
    }

    // Check minimum order amount
    if (discount.minOrderAmount && Number(discount.minOrderAmount) > subtotal) {
      return false;
    }

    return true;
  }

  /**
   * Calculate taxes based on active tax configuration
   */
  private async calculateTaxes(
    taxes: Tax[],
    subtotalAfterDiscount: number,
    subtotalAfterProductDiscount: number,
  ): Promise<{ taxLines: TaxLine[]; totalTaxAmount: number }> {
    const taxLines: TaxLine[] = [];
    let totalTaxAmount = 0;

    for (const tax of taxes) {
      // Determine calculation base
      const taxableAmount = tax.calculationBase === 'after_discount'
        ? subtotalAfterDiscount
        : subtotalAfterProductDiscount;

      let taxAmount: number;

      if (tax.taxType === 'percentage') {
        taxAmount = taxableAmount * (Number(tax.rate) / 100);
      } else {
        // Fixed amount tax
        taxAmount = Number(tax.rate);
      }

      // For inclusive tax, we need to calculate differently
      // inclusive tax formula: taxAmount = (baseAmount * rate) / (1 + rate)
      if (tax.isInclusive) {
        taxAmount = taxableAmount - (taxableAmount / (1 + Number(tax.rate) / 100));
      }

      taxAmount = Math.round(taxAmount * 100) / 100;
      totalTaxAmount += taxAmount;

      taxLines.push({
        id: tax.id,
        name: tax.name,
        code: tax.code,
        taxType: tax.taxType,
        rate: Number(tax.rate),
        calculationBase: tax.calculationBase,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        taxAmount,
      });
    }

    return {
      taxLines,
      totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
    };
  }

  /**
   * Calculate simple order total from items (without discount)
   * Used for quick calculations
   */
  calculateSimpleTotal(itemsSubtotal: number): number {
    return itemsSubtotal;
  }
}
