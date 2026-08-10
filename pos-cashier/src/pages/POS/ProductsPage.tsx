import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  UtensilsCrossed,
  Coffee,
  Search,
  Star,
  Settings2,
  X,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui';
import { ModifierModal, type SelectedModifierPayload } from '../../components/pos/modifiers/ModifierModal';
import { OrderSummary } from '../../components/pos/cart/OrderSummary';
import { DiscountPickerModal } from '../../components/pos/cart/DiscountPickerModal';
import type { RootState } from '../../store';
import {
  useProducts,
  useCategories,
  useProductWithModifiers,
  useAddToCart,
  useOrderWithItems,
  useOrderCalculation,
  useInitializeCart,
} from '../../hooks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { cn } from '../../utils';
import { OrderType } from '../../types';
import type { Product, ProductWithModifiers } from '../../types';

// Placeholder image
const PLACEHOLDER_IMAGE = '/placeholder-food.png';

export function ProductsPage() {
  useDocumentTitle('Pilih Menu - POS');
  const navigate = useNavigate();
  const posState = useSelector((state: RootState) => state.pos);

  // Initialize cart from localStorage and sync with server
  useInitializeCart();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Modifier modal state
  const [modifierProductId, setModifierProductId] = useState<string | null>(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);

  // Discount picker modal state
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Fetch product with modifiers for the modal
  const { data: productWithModifiers } = useProductWithModifiers(modifierProductId || '');

  // Optimistic add to cart
  const addToCartMutation = useAddToCart();

  // Fetch order with items for cart preview (backend data)
  const { data: orderWithItems } = useOrderWithItems(posState.currentOrder?.id || null);

  // Fetch order calculation for discount picker
  const { data: calculation } = useOrderCalculation(posState.currentOrder?.id || null);

  // Fetch categories (filtered to active only)
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Filter active categories
  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  // Fetch products based on selected category and search
  const { data: products = [], isLoading: productsLoading } = useProducts({
    category_id: selectedCategoryId || undefined,
    search: searchQuery || undefined,
  });

  // Filter and sort products (frontend filtering - backend needs update for production)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query (name or sku)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query))
      );
    }

    // Filter by category (if selected)
    if (selectedCategoryId) {
      result = result.filter((p) => p.category?.id === selectedCategoryId);
    }

    // Sort: Featured first, then by name
    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [products, searchQuery, selectedCategoryId]);

  // Handle back
  const handleBack = () => {
    if (posState.orderType === OrderType.DINE_IN_TABLE) {
      navigate('/pos/tables');
    } else {
      navigate('/pos');
    }
  };

  // Handle product click
  const handleProductClick = useCallback(
    async (product: Product) => {
      // If product has variants (modifiers), open the modifier modal
      if (product.hasVariants) {
        setModifierProductId(product.id);
        setIsModifierModalOpen(true);
        return;
      }

      // Optimistic add to cart (creates order if needed)
      setAddedProductId(product.id);
      try {
        await addToCartMutation.mutateAsync({
          productId: product.id,
          productName: product.name,
          basePrice: product.price,
          quantity: 1,
          modifiers: [],
        });
      } catch (error) {
        console.error('Failed to add item:', error);
      } finally {
        setAddedProductId(null);
      }
    },
    [addToCartMutation]
  );

  // Handle add to order from modifier modal
  const handleAddToOrderWithModifiers = useCallback(
    async (
      productId: string,
      quantity: number,
      unitPrice: number,
      modifiers: SelectedModifierPayload[]
    ) => {
      setAddedProductId(productId);
      try {
        await addToCartMutation.mutateAsync({
          productId,
          productName: '', // Will be filled from product data
          basePrice: unitPrice,
          quantity,
          modifiers: modifiers.map((m) => ({
            id: m.modifierId,
            name: m.modifierName,
            additionalPrice: m.unitPrice,
            groupId: m.groupId || '',
            groupName: m.groupName || '',
          })),
        });
        setIsModifierModalOpen(false);
        setModifierProductId(null);
      } catch (error) {
        console.error('Failed to add item with modifiers:', error);
      } finally {
        setAddedProductId(null);
      }
    },
    [addToCartMutation]
  );

  // Get order type label and icon
  const getOrderTypeInfo = () => {
    switch (posState.orderType) {
      case OrderType.DINE_IN_TABLE:
        return {
          icon: UtensilsCrossed,
          label: `Meja ${posState.selectedTable?.tableName || '-'}`,
        };
      case OrderType.DINE_IN_QUICK:
        return { icon: Coffee, label: 'Quick Service' };
      case OrderType.TAKEAWAY:
        return { icon: ShoppingBag, label: 'Takeaway' };
      default:
        return { icon: ShoppingCart, label: 'Order' };
    }
  };

  const orderTypeInfo = getOrderTypeInfo();
  const OrderIcon = orderTypeInfo.icon;

  // Cart totals - use synced cart for immediate feedback, fallback to backend
  const syncedItems = posState.syncedCartItems;
  const cartItemCount = syncedItems.length > 0 ? syncedItems.length : (orderWithItems?.items.length || 0);
  const cartSubtotal = syncedItems.length > 0
    ? syncedItems.reduce((sum, item) => sum + Number(item.itemTotal), 0)
    : (orderWithItems?.order?.subtotal || 0);

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Pilih Menu</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <OrderIcon className="w-3 h-3" />
                  {orderTypeInfo.label}
                </p>
              </div>
            </div>

            {/* Cart Summary */}
            <button
              onClick={() => {
                if (posState.currentOrder?.id) {
                  navigate(`/pos/orders/${posState.currentOrder.id}`);
                }
              }}
              disabled={!posState.currentOrder?.id}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl transition-all',
                cartItemCount > 0 && posState.currentOrder?.id
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer'
                  : 'bg-slate-100 text-slate-600 cursor-not-allowed'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">{cartItemCount}</span>
              {cartItemCount > 0 && posState.currentOrder?.id && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-sm">
                    Rp {cartSubtotal.toLocaleString('id-ID')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Two Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Product Catalog */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 pb-0 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-10 py-3 rounded-xl',
                  'bg-white border border-slate-200',
                  'text-slate-900 placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent',
                  'transition-all'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 py-3 flex-shrink-0 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {/* All Categories */}
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  selectedCategoryId === null
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                )}
              >
                Semua
              </button>

              {/* Category buttons */}
              {categoriesLoading ? (
                <div className="flex items-center gap-2 px-4 py-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Memuat...</span>
                </div>
              ) : (
                activeCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                      selectedCategoryId === category.id
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    )}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4 pt-0">
            {productsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Menu tidak ditemukan
                </h3>
                <p className="text-sm text-slate-500">
                  Coba ubah kata kunci pencarian atau pilih kategori lain
                </p>
              </div>
            ) : (
              <motion.div
                key={selectedCategoryId || 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.button
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => handleProductClick(product)}
                      disabled={addedProductId === product.id}
                      className={cn(
                        'relative flex flex-col bg-white rounded-2xl overflow-hidden',
                        'border-2 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400',
                        product.isAvailable
                          ? 'hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                          : 'opacity-60 cursor-not-allowed',
                        addedProductId === product.id && 'opacity-50 cursor-wait'
                      )}
                    >
                      {/* Featured Badge */}
                      {product.isFeatured && (
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow">
                          <Star className="w-3 h-3" />
                          Favorit
                        </div>
                      )}

                      {/* Modifier Badge */}
                      {product.hasVariants && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow">
                          <Settings2 className="w-3 h-3" />
                          Varian
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative aspect-square bg-slate-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed className="w-12 h-12 text-slate-300" />
                          </div>
                        )}

                        {/* Sold Out Overlay */}
                        {!product.isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                              HABIS
                            </span>
                          </div>
                        )}

                        {/* Add Indicator */}
                        {addedProductId === product.id && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        {product.category && (
                          <p className="text-xs text-slate-400 mb-2">
                            {product.category.name}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between">
                          <span className="font-bold text-amber-600">
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                          {product.hasVariants && product.isAvailable && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Plus className="w-3 h-3" />
                              Pilih
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="hidden lg:block w-80 bg-white border-l border-slate-200 flex-shrink-0">
          <OrderSummary
            onCheckout={() => navigate(`/pos/orders/${posState.currentOrder?.id}`)}
            onApplyDiscount={() => setIsDiscountModalOpen(true)}
          />
        </div>
      </div>

      {/* Modifier Modal */}
      <ModifierModal
        product={productWithModifiers || null}
        isOpen={isModifierModalOpen}
        onClose={() => {
          setIsModifierModalOpen(false);
          setModifierProductId(null);
        }}
        onAddToOrder={handleAddToOrderWithModifiers}
        isAdding={addedProductId !== null}
      />

      {/* Discount Picker Modal */}
      <DiscountPickerModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        orderId={posState.currentOrder?.id || null}
        currentSubtotal={calculation?.subtotal || orderWithItems?.order?.subtotal || 0}
      />
    </div>
  );
}

export default ProductsPage;
