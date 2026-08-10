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
  type SyncStatus,
  type SyncedCartItem,
  type SyncQueueItem,
} from '../../types';
import type { Order } from '../../api/orders';
import {
  generateTempId,
  calculateItemTotal,
  calculateModifierTotal,
  areModifiersEqual,
} from '../../utils/cartPersistence';

// Generate unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate item total
function calculateCartItemTotal(
  basePrice: number,
  modifiers: SelectedModifier[],
  quantity: number
): number {
  const modifierTotal = calculateModifierTotal(modifiers);
  return calculateItemTotal(basePrice, modifierTotal, quantity);
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

  // Cart (Legacy - for backward compatibility)
  cartItems: CartItem[];
  appliedDiscount: Discount | null;

  // Synced Cart (Hybrid approach - PRIMARY)
  sessionId: string;
  syncedCartItems: SyncedCartItem[];
  syncQueue: SyncQueueItem[];
  syncStatus: SyncStatus;
  globalSyncError: string | null;

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
  // Synced Cart (Hybrid)
  sessionId: generateSessionId(),
  syncedCartItems: [],
  syncQueue: [],
  syncStatus: 'synced',
  globalSyncError: null,
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
      // Keep sessionId but reset synced cart
      state.syncedCartItems = [];
      state.syncQueue = [];
      state.syncStatus = 'synced';
      state.globalSyncError = null;
      state.lastTransaction = null;
      state.isCartOpen = false;
      state.isModifierModalOpen = false;
      state.selectedProductForModifier = null;
    },

    // ==================== SYNCED CART REDUCERS ====================

    // Set entire synced cart (for session recovery)
    setSyncedCartItems: (state, action: PayloadAction<SyncedCartItem[]>) => {
      state.syncedCartItems = action.payload;
    },

    // Add item to synced cart (optimistic)
    addToSyncedCart: (
      state,
      action: PayloadAction<{
        productId: string;
        productName: string;
        basePrice: number;
        quantity: number;
        modifiers: SelectedModifier[];
        notes?: string;
        variantName?: string;
      }>
    ) => {
      const { productId, productName, basePrice, quantity, modifiers, notes, variantName } = action.payload;

      // Check if same product with same modifiers already exists
      const existingItem = state.syncedCartItems.find((item) => {
        if (item.productId !== productId) return false;
        if (item.variantName !== variantName) return false;
        return areModifiersEqual(item.modifiers, modifiers);
      });

      if (existingItem) {
        // Update quantity (optimistic)
        existingItem.quantity += quantity;
        existingItem.itemTotal = calculateCartItemTotal(
          existingItem.basePrice,
          existingItem.modifiers,
          existingItem.quantity
        );
        existingItem.syncStatus = 'pending';
      } else {
        // Add new item (optimistic)
        const modifierTotal = calculateModifierTotal(modifiers);
        const newItem: SyncedCartItem = {
          tempId: generateTempId(),
          productId,
          productName,
          variantName,
          basePrice,
          quantity,
          modifiers,
          notes: notes || '',
          itemTotal: calculateItemTotal(basePrice, modifierTotal, quantity),
          syncStatus: 'pending',
        };
        state.syncedCartItems.push(newItem);
      }
    },

    // Update synced cart item
    updateSyncedCartItem: (
      state,
      action: PayloadAction<{ tempId: string; quantity: number; notes?: string }>
    ) => {
      const item = state.syncedCartItems.find((i) => i.tempId === action.payload.tempId);
      if (item) {
        if (action.payload.quantity <= 0) {
          // Mark for removal (optimistic)
          state.syncedCartItems = state.syncedCartItems.filter(
            (i) => i.tempId !== action.payload.tempId
          );
        } else {
          item.quantity = action.payload.quantity;
          item.itemTotal = calculateCartItemTotal(
            item.basePrice,
            item.modifiers,
            item.quantity
          );
          if (action.payload.notes !== undefined) {
            item.notes = action.payload.notes;
          }
          item.syncStatus = 'pending';
        }
      }
    },

    // Remove item from synced cart
    removeFromSyncedCart: (state, action: PayloadAction<string>) => {
      state.syncedCartItems = state.syncedCartItems.filter(
        (i) => i.tempId !== action.payload
      );
    },

    // Update item sync status
    updateItemSyncStatus: (
      state,
      action: PayloadAction<{ tempId: string; status: SyncStatus; serverId?: string; error?: string }>
    ) => {
      const item = state.syncedCartItems.find((i) => i.tempId === action.payload.tempId);
      if (item) {
        item.syncStatus = action.payload.status;
        if (action.payload.serverId) {
          item.serverId = action.payload.serverId;
        }
        if (action.payload.error) {
          item.error = action.payload.error;
        }
      }
    },

    // Set all items sync status
    setAllItemsSyncStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.syncedCartItems.forEach((item) => {
        item.syncStatus = action.payload;
      });
    },

    // Add to sync queue
    addToSyncQueue: (state, action: PayloadAction<SyncQueueItem>) => {
      state.syncQueue.push(action.payload);
    },

    // Remove from sync queue
    removeFromSyncQueue: (state, action: PayloadAction<string>) => {
      state.syncQueue = state.syncQueue.filter((item) => item.id !== action.payload);
    },

    // Clear sync queue
    clearSyncQueue: (state) => {
      state.syncQueue = [];
    },

    // Set global sync status
    setSyncStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.syncStatus = action.payload;
    },

    // Set global sync error
    setGlobalSyncError: (state, action: PayloadAction<string | null>) => {
      state.globalSyncError = action.payload;
      if (action.payload) {
        state.syncStatus = 'failed';
      }
    },

    // Clear synced cart
    clearSyncedCart: (state) => {
      state.syncedCartItems = [];
      state.syncQueue = [];
      state.syncStatus = 'synced';
      state.globalSyncError = null;
    },

    // New session ID
    regenerateSessionId: (state) => {
      state.sessionId = generateSessionId();
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
  // Synced cart actions
  setSyncedCartItems,
  addToSyncedCart,
  updateSyncedCartItem,
  removeFromSyncedCart,
  updateItemSyncStatus,
  setAllItemsSyncStatus,
  addToSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  setSyncStatus,
  setGlobalSyncError,
  clearSyncedCart,
  regenerateSessionId,
} = posSlice.actions;

export default posSlice.reducer;
