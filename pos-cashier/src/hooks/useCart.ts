import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import type {
  CartProduct,
  SelectedModifier,
  Tax,
  Discount,
  CartItem,
} from '../types';
import {
  addToCart as addToCartAction,
  updateCartItemQuantity,
  updateCartItemNotes,
  updateCartItemModifiers,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount,
  setActiveTaxes,
} from '../store/slices/posSlice';
import {
  calculateCartSubtotal,
  calculateCartItemCount,
  calculateTotalTax,
  calculateDiscount,
  calculateGrandTotal,
  calculateUnitPrice,
} from '../utils';

// Hook: Cart operations
export function useCart() {
  const dispatch = useDispatch();

  // Get cart state from Redux
  const cartItems = useSelector((state: RootState) => state.pos.cartItems);
  const appliedDiscount = useSelector((state: RootState) => state.pos.appliedDiscount);
  const activeTaxes = useSelector((state: RootState) => state.pos.activeTaxes);
  const orderType = useSelector((state: RootState) => state.pos.orderType);
  const selectedTable = useSelector((state: RootState) => state.pos.selectedTable);
  const customerName = useSelector((state: RootState) => state.pos.customerName);
  const customerPhone = useSelector((state: RootState) => state.pos.customerPhone);
  const isCartOpen = useSelector((state: RootState) => state.pos.isCartOpen);

  // Calculate cart summary
  const summary = useMemo(() => {
    const subtotal = calculateCartSubtotal(cartItems);
    const itemCount = calculateCartItemCount(cartItems);
    const taxAmount = calculateTotalTax(subtotal, activeTaxes);
    const discountAmount = appliedDiscount
      ? calculateDiscount(subtotal, appliedDiscount)
      : 0;
    const total = calculateGrandTotal({
      subtotal,
      taxAmount,
      discountAmount,
    });

    // Get the effective tax rate (for display)
    const effectiveTaxRate = subtotal > 0 ? taxAmount / subtotal : 0;

    return {
      subtotal,
      itemCount,
      taxAmount,
      taxRate: effectiveTaxRate,
      discountAmount,
      discountCode: appliedDiscount?.code || null,
      discountName: appliedDiscount?.name || null,
      total,
    };
  }, [cartItems, activeTaxes, appliedDiscount]);

  // Check if cart is empty
  const isEmpty = cartItems.length === 0;

  // Add item to cart
  const addToCart = useCallback(
    (product: CartProduct, quantity: number, modifiers: SelectedModifier[] = [], notes?: string) => {
      dispatch(
        addToCartAction({
          product,
          quantity,
          modifiers,
          notes,
        })
      );
    },
    [dispatch]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      dispatch(updateCartItemQuantity({ itemId, quantity }));
    },
    [dispatch]
  );

  // Increment quantity
  const incrementQuantity = useCallback(
    (itemId: string) => {
      const item = cartItems.find((i) => i.id === itemId);
      if (item) {
        dispatch(updateCartItemQuantity({ itemId, quantity: item.quantity + 1 }));
      }
    },
    [dispatch, cartItems]
  );

  // Decrement quantity
  const decrementQuantity = useCallback(
    (itemId: string) => {
      const item = cartItems.find((i) => i.id === itemId);
      if (item && item.quantity > 1) {
        dispatch(updateCartItemQuantity({ itemId, quantity: item.quantity - 1 }));
      }
    },
    [dispatch, cartItems]
  );

  // Update item notes
  const updateNotes = useCallback(
    (itemId: string, notes: string) => {
      dispatch(updateCartItemNotes({ itemId, notes }));
    },
    [dispatch]
  );

  // Update item modifiers
  const updateModifiers = useCallback(
    (itemId: string, modifiers: SelectedModifier[]) => {
      dispatch(updateCartItemModifiers({ itemId, modifiers }));
    },
    [dispatch]
  );

  // Remove item from cart
  const removeItem = useCallback(
    (itemId: string) => {
      dispatch(removeFromCart(itemId));
    },
    [dispatch]
  );

  // Clear entire cart
  const clear = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  // Apply discount
  const apply = useCallback(
    (discount: Discount) => {
      dispatch(applyDiscount(discount));
    },
    [dispatch]
  );

  // Remove discount
  const remove = useCallback(() => {
    dispatch(removeDiscount());
  }, [dispatch]);

  // Set active taxes
  const setTaxes = useCallback(
    (taxes: Tax[]) => {
      dispatch(setActiveTaxes(taxes));
    },
    [dispatch]
  );

  // Get item by ID
  const getItem = useCallback(
    (itemId: string): CartItem | undefined => {
      return cartItems.find((item) => item.id === itemId);
    },
    [cartItems]
  );

  // Calculate item unit price
  const getItemUnitPrice = useCallback((item: CartItem): number => {
    return calculateUnitPrice(item.basePrice, item.modifiers);
  }, []);

  // Check if a product with same modifiers exists in cart
  const findExistingItem = useCallback(
    (
      productId: string,
      modifiers: SelectedModifier[]
    ): CartItem | undefined => {
      return cartItems.find((item) => {
        if (item.productId !== productId) return false;
        if (item.modifiers.length !== modifiers.length) return false;

        const modifierIds = modifiers.map((m) => m.id).sort();
        const existingModifierIds = item.modifiers.map((m) => m.id).sort();

        return modifierIds.every((id, index) => id === existingModifierIds[index]);
      });
    },
    [cartItems]
  );

  return {
    // State
    cartItems,
    summary,
    isEmpty,
    isCartOpen,
    appliedDiscount,
    activeTaxes,
    orderType,
    selectedTable,
    customerName,
    customerPhone,

    // Actions
    addToCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    updateNotes,
    updateModifiers,
    removeItem,
    clear,
    applyDiscount: apply,
    removeDiscount: remove,
    setTaxes,

    // Helpers
    getItem,
    getItemUnitPrice,
    findExistingItem,
  };
}
