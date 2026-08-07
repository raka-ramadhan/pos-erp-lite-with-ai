// Product types

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
}

export interface Modifier {
  id: string;
  name: string;
  sku?: string | null;
  additionalPrice: number;
  isDefault: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  sortOrder?: number;
  modifiers: Modifier[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  price: number;
  description: string | null;
  imageUrl: string | null;
  category?: { id: string; name: string } | null;
  hasVariants: boolean;
  isAvailable: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Full product with modifiers from /products/:id/with-modifiers endpoint
export interface ProductWithModifiers {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  unitType: string;
  hasVariants: boolean;
  isAvailable: boolean;
  modifierGroups: ModifierGroup[];
}

export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

// Cart product type (simplified for cart)
export interface CartProduct {
  id: string;
  name: string;
  basePrice: number;
  imageUrl: string | null;
  hasVariants: boolean;
  modifierGroups?: ModifierGroup[];
}

// Selected modifier in cart
export interface SelectedModifier {
  id: string;
  name: string;
  additionalPrice: number;
  groupId: string;
  groupName: string;
}

// Cart item
export interface CartItem {
  id: string; // Unique cart item ID
  productId: string;
  productName: string;
  basePrice: number;
  quantity: number;
  modifiers: SelectedModifier[];
  notes: string;
  itemTotal: number; // Calculated: (basePrice + sum(modifiers)) * quantity
}

// Product add payload
export interface AddToCartPayload {
  product: CartProduct;
  quantity: number;
  modifiers: SelectedModifier[];
  notes?: string;
}

// Product update payload
export interface UpdateCartItemPayload {
  itemId: string;
  quantity?: number;
  modifiers?: SelectedModifier[];
  notes?: string;
}
