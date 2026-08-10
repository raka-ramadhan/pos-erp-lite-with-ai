import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import type { RootState } from '../store';
import type { PersistedCart, SyncedCartItem } from '../types/cart';
import {
  loadCartFromStorage,
  clearCartStorage,
  isCartExpired,
  createPersistedCart,
  createDebouncedSave,
} from '../utils/cartPersistence';
import {
  setSyncedCartItems,
  setCurrentOrder,
  setOrderType,
  setSelectedTable,
  clearSyncedCart,
  regenerateSessionId,
  setSyncStatus,
} from '../store/slices/posSlice';
import orderApi from '../api/orders';
import { OrderType } from '../types';

const CART_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hook to initialize cart from localStorage and validate with server
 * Call this once on app mount
 */
export function useInitializeCart() {
  const dispatch = useDispatch();
  const posState = useSelector((state: RootState) => state.pos);

  // Create debounced save function
  const debouncedSave = createDebouncedSave(500);

  // Query to validate order exists on server
  const validateOrderQuery = useQuery({
    queryKey: ['orders', posState.currentOrder?.id, 'validate'],
    queryFn: async () => {
      if (!posState.currentOrder?.id) return null;
      try {
        const order = await orderApi.getOrder(posState.currentOrder.id);
        return order;
      } catch {
        return null;
      }
    },
    enabled: false, // Only run manually
    staleTime: 0,
  });

  // Initialize cart from storage
  const initializeFromStorage = useCallback(() => {
    const stored = loadCartFromStorage();
    if (!stored) {
      return false;
    }

    // Check expiration
    if (isCartExpired(stored, CART_EXPIRY_MS)) {
      console.log('Cart expired, clearing storage');
      clearCartStorage();
      return false;
    }

    // Validate order on server if exists
    if (stored.orderId) {
      // For now, restore from storage without server validation
      // Server validation can be added later
      dispatch(setSyncedCartItems(stored.cartItems));

      if (stored.orderType) {
        dispatch(setOrderType(stored.orderType as OrderType));
      }

      // Set sync status based on items
      const hasPendingItems = stored.cartItems.some(
        (item) => item.syncStatus === 'pending'
      );
      if (hasPendingItems) {
        dispatch(setSyncStatus('syncing'));
      }

      return true;
    }

    // No order ID, but has items - this is unusual, clear it
    if (stored.cartItems.length > 0) {
      clearCartStorage();
      return false;
    }

    return false;
  }, [dispatch]);

  // Save cart to storage
  const saveToStorage = useCallback(() => {
    const persistedCart = createPersistedCart({
      sessionId: posState.sessionId,
      orderId: posState.currentOrder?.id || null,
      orderType: posState.orderType,
      selectedTableId: posState.selectedTable?.id || null,
      cartItems: posState.syncedCartItems,
    });

    debouncedSave(persistedCart);
  }, [posState, debouncedSave]);

  // Clear all cart data
  const clearAllCartData = useCallback(() => {
    clearCartStorage();
    dispatch(clearSyncedCart());
    dispatch(regenerateSessionId());
  }, [dispatch]);

  // Effect to initialize on mount
  useEffect(() => {
    const restored = initializeFromStorage();
    if (restored) {
      console.log('Cart restored from localStorage');
    }
  }, [initializeFromStorage]);

  // Effect to save on cart change
  useEffect(() => {
    if (posState.syncedCartItems.length > 0 || posState.currentOrder) {
      saveToStorage();
    }
  }, [
    posState.syncedCartItems,
    posState.currentOrder,
    posState.orderType,
    posState.selectedTable,
    saveToStorage,
  ]);

  return {
    initializeFromStorage,
    saveToStorage,
    clearAllCartData,
    isInitialized: posState.syncedCartItems.length > 0 || !!posState.currentOrder,
  };
}
