import type { PersistedCart, SyncedCartItem, OrderType } from '../types/cart';
import type { Order } from '../api/orders';

const CART_STORAGE_KEY = 'pos_draft_cart_v1';
const CART_VERSION = 1;

// Default expiration: 24 hours (in milliseconds)
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a persisted cart has expired
 */
export function isCartExpired(cart: PersistedCart, maxAgeMs: number = DEFAULT_MAX_AGE_MS): boolean {
  const now = Date.now();
  const cartAge = now - cart.savedAt;
  return cartAge > maxAgeMs;
}

/**
 * Save cart to localStorage
 */
export function saveCartToStorage(cart: PersistedCart): void {
  try {
    const serialized = JSON.stringify({
      ...cart,
      version: CART_VERSION,
      savedAt: Date.now(),
    });
    localStorage.setItem(CART_STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
}

/**
 * Load cart from localStorage
 */
export function loadCartFromStorage(): PersistedCart | null {
  try {
    const serialized = localStorage.getItem(CART_STORAGE_KEY);
    if (!serialized) return null;

    const cart = JSON.parse(serialized) as PersistedCart;

    // Version check
    if (cart.version !== CART_VERSION) {
      console.warn('Cart version mismatch, clearing storage');
      clearCartStorage();
      return null;
    }

    // Basic validation
    if (!cart.sessionId || !Array.isArray(cart.cartItems)) {
      console.warn('Invalid cart data, clearing storage');
      clearCartStorage();
      return null;
    }

    return cart;
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    clearCartStorage();
    return null;
  }
}

/**
 * Clear cart from localStorage
 */
export function clearCartStorage(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
  }
}

/**
 * Create a PersistedCart from current state
 */
export function createPersistedCart(params: {
  sessionId: string;
  orderId: string | null;
  orderType: OrderType | null;
  selectedTableId: string | null;
  cartItems: SyncedCartItem[];
}): PersistedCart {
  return {
    version: CART_VERSION,
    sessionId: params.sessionId,
    orderId: params.orderId,
    orderType: params.orderType,
    selectedTableId: params.selectedTableId,
    cartItems: params.cartItems,
    savedAt: Date.now(),
  };
}

/**
 * Debounced save function factory
 */
export function createDebouncedSave(delayMs: number = 500) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (cart: PersistedCart) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      saveCartToStorage(cart);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Generate a temp ID for cart items
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate item total
 */
export function calculateItemTotal(
  basePrice: number,
  modifierTotal: number,
  quantity: number
): number {
  return (basePrice + modifierTotal) * quantity;
}

/**
 * Calculate modifier total
 */
export function calculateModifierTotal(modifiers: { additionalPrice: number; quantity: number }[]): number {
  return modifiers.reduce((sum, m) => sum + (m.additionalPrice * m.quantity), 0);
}

/**
 * Check if two modifier arrays are equal
 * Works with both { id: string } and { modifierId: string } formats
 */
export function areModifiersEqual(
  mods1: { id?: string; modifierId?: string }[],
  mods2: { id?: string; modifierId?: string }[]
): boolean {
  if (mods1.length !== mods2.length) return false;
  // Support both id and modifierId formats
  const getId = (m: { id?: string; modifierId?: string }) => m.id || m.modifierId;
  const ids1 = mods1.map(getId).sort();
  const ids2 = mods2.map(getId).sort();
  return ids1.every((id, index) => id === ids2[index]);
}
