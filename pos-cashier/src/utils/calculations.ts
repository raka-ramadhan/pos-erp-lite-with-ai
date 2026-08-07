import type { CartItem, SelectedModifier, Tax, Discount } from '../types';

// Format currency to Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with thousand separator
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ''));
}

// Calculate total price from modifiers
export function calculateModifiersTotal(modifiers: SelectedModifier[]): number {
  return modifiers.reduce((sum, mod) => sum + mod.additionalPrice, 0);
}

// Calculate single cart item total
export function calculateCartItemTotal(
  basePrice: number,
  modifiers: SelectedModifier[],
  quantity: number
): number {
  const modifierTotal = calculateModifiersTotal(modifiers);
  return (basePrice + modifierTotal) * quantity;
}

// Calculate cart subtotal (before tax and discount)
export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.itemTotal, 0);
}

// Calculate cart item count
export function calculateCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Calculate tax amount
export function calculateTax(subtotal: number, tax: Tax): number {
  if (tax.taxType === 'percentage') {
    return Math.round(subtotal * tax.rate);
  }
  // Fixed tax
  return tax.rate;
}

// Calculate total tax from multiple taxes
export function calculateTotalTax(subtotal: number, taxes: Tax[]): number {
  return taxes.reduce((sum, tax) => sum + calculateTax(subtotal, tax), 0);
}

// Calculate tax rate percentage (for display)
export function getTaxRatePercentage(tax: Tax): number {
  if (tax.taxType === 'percentage') {
    return tax.rate * 100;
  }
  return 0;
}

// Check if discount is applicable
export function isDiscountApplicable(
  discount: Discount,
  subtotal: number
): { applicable: boolean; reason?: string } {
  const now = new Date();
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);

  // Check if discount is active
  if (!discount.isActive) {
    return { applicable: false, reason: 'Diskon tidak aktif' };
  }

  // Check date range
  if (now < startDate) {
    return { applicable: false, reason: 'Diskon belum berlaku' };
  }
  if (now > endDate) {
    return { applicable: false, reason: 'Diskon sudah berakhir' };
  }

  // Check minimum order amount
  if (discount.minOrderAmount !== null && subtotal < discount.minOrderAmount) {
    return {
      applicable: false,
      reason: `Minimum order ${formatCurrency(discount.minOrderAmount)}`,
    };
  }

  return { applicable: true };
}

// Calculate discount amount
export function calculateDiscount(subtotal: number, discount: Discount): number {
  const applicability = isDiscountApplicable(discount, subtotal);
  if (!applicability.applicable) {
    return 0;
  }

  let discountAmount: number;

  if (discount.discountType === 'percentage') {
    discountAmount = subtotal * (discount.value / 100);
  } else {
    // Fixed amount
    discountAmount = discount.value;
  }

  // Apply max discount cap
  if (discount.maxDiscount !== null && discountAmount > discount.maxDiscount) {
    discountAmount = discount.maxDiscount;
  }

  return Math.round(discountAmount);
}

// Calculate grand total
export function calculateGrandTotal(params: {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
}): number {
  return params.subtotal + params.taxAmount - params.discountAmount;
}

// Calculate change for cash payment
export function calculateChange(amountTendered: number, total: number): number {
  const change = amountTendered - total;
  return change >= 0 ? change : 0;
}

// Calculate suggested cash denominations
export function getSuggestedDenominations(total: number): number[] {
  const denominations = [100000, 50000, 20000, 10000, 5000, 2000, 1000];
  const suggestions: number[] = [];

  let remaining = Math.ceil(total / 1000) * 1000; // Round up to nearest thousand

  for (const denom of denominations) {
    while (remaining >= denom) {
      suggestions.push(denom);
      remaining -= denom;
    }
  }

  return suggestions;
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Calculate item unit price including modifiers
export function calculateUnitPrice(
  basePrice: number,
  modifiers: SelectedModifier[]
): number {
  return basePrice + calculateModifiersTotal(modifiers);
}

// Round to nearest hundred (for cash payments)
export function roundToNearestHundred(amount: number): number {
  return Math.ceil(amount / 100) * 100;
}

// Validate cash amount
export function isValidCashAmount(amount: number, total: number): boolean {
  return amount >= total;
}
