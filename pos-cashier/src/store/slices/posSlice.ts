import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  OrderType,
  type DiningTable,
  type CartItem,
  type SelectedModifier,
  type CartProduct,
  type Tax,
  type Discount,
  type PaymentMethod,
} from '../../types';
import type { Order } from '../../api/orders';

// Generate unique cart item ID
function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate item total
function calculateItemTotal(
  basePrice: number,
  modifiers: SelectedModifier[],
  quantity: number
): number {
  const modifierTotal = modifiers.reduce((sum, m) => sum + m.additionalPrice, 0);
  return (basePrice + modifierTotal) * quantity;
}

interface POSState {
  // Current Order Session
  currentOrder: Order | null;

  // Order setup
  orderType: OrderType | null;
  selectedTable: DiningTable | null;

  // Customer info (for takeaway/quick service)
  customerName: string;
  customerPhone: string;

  // Cart
  cartItems: CartItem[];
  appliedDiscount: Discount | null;

  // Tax
  activeTaxes: Tax[];

  // Current transaction (after payment)
  lastTransaction: {
    orderNumber: string;
    total: number;
    paymentMethod: string;
    completedAt: string;
  } | null;

  // UI state
  isCartOpen: boolean;
  isModifierModalOpen: boolean;
  selectedProductForModifier: CartProduct | null;
}

const initialState: POSState = {
  currentOrder: null,
  orderType: null,
  selectedTable: null,
  customerName: '',
  customerPhone: '',
  cartItems: [],
  appliedDiscount: null,
  activeTaxes: [],
  lastTransaction: null,
  isCartOpen: false,
  isModifierModalOpen: false,
  selectedProductForModifier: null,
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    // Current Order Session
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // Order type
    setOrderType: (state, action: PayloadAction<OrderType>) => {
      state.orderType = action.payload;
      // Clear table if switching to quick service or takeaway
      if (action.payload !== OrderType.DINE_IN_TABLE) {
        state.selectedTable = null;
      }
    },

    // Table selection
    setSelectedTable: (state, action: PayloadAction<DiningTable>) => {
      state.selectedTable = action.payload;
    },
    clearSelectedTable: (state) => {
      state.selectedTable = null;
    },

    // Customer info
    setCustomerInfo: (
      state,
      action: PayloadAction<{ name: string; phone: string }>
    ) => {
      state.customerName = action.payload.name;
      state.customerPhone = action.payload.phone;
    },

    // Add item to cart
    addToCart: (
      state,
      action: PayloadAction<{
        product: CartProduct;
        quantity: number;
        modifiers: SelectedModifier[];
        notes?: string;
      }>
    ) => {
      const { product, quantity, modifiers, notes } = action.payload;

      // Check if same product with same modifiers already exists
      const existingItem = state.cartItems.find((item) => {
        if (item.productId !== product.id) return false;
        if (item.modifiers.length !== modifiers.length) return false;

        const modifierIds = modifiers.map((m) => m.id).sort();
        const existingModifierIds = item.modifiers.map((m) => m.id).sort();

        return modifierIds.every(
          (id, index) => id === existingModifierIds[index]
        );
      });

      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
        existingItem.itemTotal = calculateItemTotal(
          existingItem.basePrice,
          existingItem.modifiers,
          existingItem.quantity
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: generateCartItemId(),
          productId: product.id,
          productName: product.name,
          basePrice: product.basePrice,
          imageUrl: product.imageUrl,
          quantity,
          modifiers,
          notes: notes || '',
          itemTotal: calculateItemTotal(product.basePrice, modifiers, quantity),
        };
        state.cartItems.push(newItem);
      }
    },

    // Update cart item quantity
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>
    ) => {
      const item = state.cartItems.find((i) => i.id === action.payload.itemId);
      if (item) {
        if (action.payload.quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.cartItems = state.cartItems.filter(
            (i) => i.id !== action.payload.itemId
          );
        } else {
          item.quantity = action.payload.quantity;
          item.itemTotal = calculateItemTotal(
            item.basePrice,
            item.modifiers,
            item.quantity
          );
        }
      }
    },

    // Update cart item notes
    updateCartItemNotes: (
      state,
      action: PayloadAction<{ itemId: string; notes: string }>
    ) => {
      const item = state.cartItems.find((i) => i.id === action.payload.itemId);
      if (item) {
        item.notes = action.payload.notes;
      }
    },

    // Update cart item modifiers
    updateCartItemModifiers: (
      state,
      action: PayloadAction<{ itemId: string; modifiers: SelectedModifier[] }>
    ) => {
      const item = state.cartItems.find((i) => i.id === action.payload.itemId);
      if (item) {
        item.modifiers = action.payload.modifiers;
        item.itemTotal = calculateItemTotal(
          item.basePrice,
          item.modifiers,
          item.quantity
        );
      }
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
    },

    // Clear entire cart
    clearCart: (state) => {
      state.cartItems = [];
      state.appliedDiscount = null;
    },

    // Apply discount
    applyDiscount: (state, action: PayloadAction<Discount>) => {
      state.appliedDiscount = action.payload;
    },

    // Remove discount
    removeDiscount: (state) => {
      state.appliedDiscount = null;
    },

    // Set active taxes
    setActiveTaxes: (state, action: PayloadAction<Tax[]>) => {
      state.activeTaxes = action.payload;
    },

    // Modifier modal
    openModifierModal: (state, action: PayloadAction<CartProduct>) => {
      state.isModifierModalOpen = true;
      state.selectedProductForModifier = action.payload;
    },
    closeModifierModal: (state) => {
      state.isModifierModalOpen = false;
      state.selectedProductForModifier = null;
    },

    // Cart sidebar
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },

    // Set last transaction (after payment)
    setLastTransaction: (
      state,
      action: PayloadAction<{
        orderNumber: string;
        total: number;
        paymentMethod: string;
      }>
    ) => {
      state.lastTransaction = {
        ...action.payload,
        completedAt: new Date().toISOString(),
      };
    },

    // Reset for new order
    startNewOrder: (state) => {
      state.orderType = null;
      state.selectedTable = null;
      state.customerName = '';
      state.customerPhone = '';
      state.cartItems = [];
      state.appliedDiscount = null;
      state.lastTransaction = null;
      state.isCartOpen = false;
      state.isModifierModalOpen = false;
      state.selectedProductForModifier = null;
    },

    // Full reset
    resetPOS: (state) => {
      state.currentOrder = null;
      state.orderType = null;
      state.selectedTable = null;
      state.customerName = '';
      state.customerPhone = '';
      state.cartItems = [];
      state.appliedDiscount = null;
      state.lastTransaction = null;
      state.isCartOpen = false;
      state.isModifierModalOpen = false;
      state.selectedProductForModifier = null;
    },
  },
});

export const {
  setCurrentOrder,
  clearCurrentOrder,
  setOrderType,
  setSelectedTable,
  clearSelectedTable,
  setCustomerInfo,
  addToCart,
  updateCartItemQuantity,
  updateCartItemNotes,
  updateCartItemModifiers,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount,
  setActiveTaxes,
  openModifierModal,
  closeModifierModal,
  openCart,
  closeCart,
  toggleCart,
  setLastTransaction,
  startNewOrder,
  resetPOS,
} = posSlice.actions;

export default posSlice.reducer;
