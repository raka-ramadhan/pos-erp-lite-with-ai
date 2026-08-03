# Restaurant POS Single Outlet - Database Design Blueprint

> **Version:** 1.0  
> **Date:** 2026-08-03  
> **Scope:** Single Outlet Restaurant POS System

---

## Table of Contents

1. [Business Requirement Summary](#1-business-requirement-summary)
2. [Business Flow](#2-business-flow)
3. [Master Data Analysis](#3-master-data-analysis)
4. [Entity Relationship](#4-entity-relationship)
5. [Database Design](#5-database-design)
6. [Business Rules](#6-business-rules)
7. [Recommended Constraints](#7-recommended-constraints)
8. [Recommended Indexes](#8-recommended-indexes)
9. [Future Scalability](#9-future-scalability)
10. [Development Recommendation](#10-development-recommendation)

---

## 1. Business Requirement Summary

### 1.1 Project Scope

| Aspect | Current Scope | Future Scope |
|--------|---------------|--------------|
| **Outlet** | Single Outlet | Multi Outlet |
| **Inventory** | ❌ No | ✅ Yes |
| **Purchasing** | ❌ No | ✅ Yes |
| **Supplier** | ❌ No | ✅ Yes |
| **Finance** | ❌ No | ✅ Yes |
| **Kitchen Display** | ❌ No | ✅ Yes |
| **Recipe/BOM** | ❌ No | ✅ Yes |
| **Loyalty** | ❌ No | ✅ Yes |

### 1.2 Current Foundation

Project sudah memiliki module foundational:

- ✅ Authentication (JWT)
- ✅ RBAC (Role-Based Access Control)
- ✅ User Management
- ✅ Role Management
- ✅ Permission Management
- ✅ Menu Management

### 1.3 Core Business Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RESTAURANT POS FLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Master Data          Order Process            Payment Process         │
│   ──────────          ─────────────            ─────────────────       │
│                                                                         │
│   Category ─────┐                                                     │
│                 │                                                     │
│   Product ─────┼────► Order ─────► Order Items ───► Payment          │
│                 │         │                                             │
│   Modifier ────┘         │                                             │
│   Group                 Table                                           │
│                          │                                             │
│   Modifier              Customer                                        │
│                          │                                             │
│   Tax ◄─────────────────┘                                              │
│                          │                                             │
│   Discount ◄─────────────┘                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Business Flow

### 2.1 Master Data Flow

```
┌──────────────┐
│  Category    │  (Grouping products by type)
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│   Product    │  (Menu items being sold)
└──────┬───────┘
       │ M:N (via product_modifier_groups)
       ▼
┌──────────────────┐
│ Modifier Group   │  (e.g., "Coffee Size", "Toppings")
└──────┬───────────┘
       │ 1:N
       ▼
┌──────────────┐
│   Modifier   │  (e.g., "Small", "Medium", "Large")
└──────────────┘
```

### 2.2 Order Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Dining Table │────►│   Customer   │────►│    Order     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                    ┌─────────────────────────────┤
                    │                             │
                    ▼                             ▼
            ┌──────────────┐              ┌──────────────┐
            │ Order Items  │              │    Taxes     │
            │  (Products)  │              └──────────────┘
            └──────┬───────┘
                   │                             ┌──────────────┐
                   │ M:N                       │  Discounts   │
                   ▼                             └──────────────┘
            ┌──────────────┐
            │   Modifiers  │
            │  (Selected)  │
            └──────────────┘
                   │
                   ▼
            ┌──────────────┐
            │   Payment    │
            └──────────────┘
```

---

## 3. Master Data Analysis

### 3.1 Categories

**Purpose:** Mengelompokkan produk berdasarkan jenis untuk kemudahan navigasi dan pelaporan.

**Business Rules:**
- Category bisa memiliki parent category (sub-category)
- Product harus belong ke satu category
- Category bisa di-archive (tidak dihapus)

**Examples:**
```
Food
├── Main Course
│   ├── Rice
│   └── Noodles
├── Snacks
└── Desserts

Beverages
├── Coffee
├── Tea
└── Juice
```

### 3.2 Products

**Purpose:** Menu items yang dijual di restoran.

**Business Rules:**
- Product memiliki satu category
- Product bisa memiliki multiple modifier groups
- Product bisa memiliki multiple taxes
- Product bisa memiliki multiple discounts
- Product memiliki harga dasar (base price)
- Product bisa sold by unit atau weight
- Product bisa available atau unavailable (out of stock temporary)

**Variants:**
- Single Product (e.g., "Espresso")
- Product with variants (e.g., "Coffee" with size modifier)

### 3.3 Modifier Groups

**Purpose:** Mengelompokkan modifiers yang terkait (e.g., "Size", "Sugar Level").

**Business Rules:**
- Modifier group bisa required atau optional
- Modifier group bisa single-choice atau multi-choice
- Single-choice: hanya boleh pilih 1 modifier (e.g., size)
- Multi-choice: boleh pilih multiple modifiers (e.g., toppings)

**Examples:**
```
Coffee Size (Single Choice, Required)
├── Small (+0)
├── Medium (+3000)
└── Large (+5000)

Toppings (Multi Choice, Optional)
├── Whipped Cream (+2000)
├── Caramel (+1500)
└── Extra Shot (+3000)
```

### 3.4 Modifiers

**Purpose:** Opsi yang bisa dipilih dalam modifier group.

**Business Rules:**
- Modifier memiliki harga tambahan (additional price)
- Modifier bisa available atau unavailable
- Modifier belong ke satu modifier group

### 3.5 Dining Tables

**Purpose:** Mengidentifikasi lokasi duduk pelanggan.

**Business Rules:**
- Setiap table memiliki nomor unik
- Table memiliki kapasitas (jumlah kursi)
- Table bisa dikelompokkan berdasarkan area/zona
- Table memiliki status: Available, Occupied, Reserved, Cleaning
- Table bisa memiliki QR code untuk self-order

### 3.6 Customers

**Purpose:** Mengidentifikasi pelanggan untuk transaksi dan potential loyalty program.

**Business Rules:**
- Mendukung Walk-In (tanpa data customer)
- Mendukung Registered Member
- Member memiliki: name, phone, email
- Scope ini: Walk-In + Member (Belum Loyalty)

### 3.7 Payment Methods

**Purpose:** Mendefinisikan cara bayar yang diterima.

**Business Rules:**
- Payment method bisa Cash atau Non-Cash
- Non-cash membutuhkan reference number
- Beberapa payment methods butuh integration (e.g., QRIS, EDC)
- Payment method bisa memiliki minimum transaction amount

### 3.8 Taxes

**Purpose:** Menghitung pajak atas transaksi.

**Business Rules:**
- Tax bisa Percentage atau Fixed Amount
- Tax bisa di-apply ke specific products atau all products
- Default: PPN (11%) - tapi prepare untuk Tax API
- Product bisa memiliki multiple taxes
- Tax di-calculated sebelum discount

**Examples:**
```
PPN (11%, Percentage)
Service Charge (10%, Percentage)
```

### 3.9 Discounts

**Purpose:** Mengurangi total transaksi berdasarkan rules tertentu.

**Business Rules:**
- Discount bisa Percentage atau Fixed Amount
- Discount bisa global (semua produk) atau specific products
- Discount memiliki periode berlaku
- Discount bisa require membership atau public
- Discount tidak bisa di-apply bersamaan (jika configured)
- Discount calculated setelah tax (atau sebelumnya, tergantung config)

**Types:**
```
Percentage (e.g., 10% off)
Fixed Amount (e.g., Rp 10.000 off)
Voucher (kode spesifik)
Happy Hour (berdasarkan waktu)
Member Discount (berdasarkan membership)
```

---

## 4. Entity Relationship

### 4.1 ER Diagram

```
┌─────────────────┐
│    outlets      │ (Future: Multi Outlet)
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐         ┌─────────────────┐
│   categories    │────────►│    products     │
│                 │    1:N  │                 │
└─────────────────┘         └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
           ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
           │ product_taxes  │ │product_discounts││product_modifier│
           │   (Pivot)     │ │    (Pivot)     │ │   _groups     │
           └───────┬───────┘ └───────┬───────┘ │   (Pivot)     │
                   │                 │         └───────┬───────┘
                   ▼                 ▼                 ▼
           ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
           │     taxes     │ │   discounts   │ │modifier_groups│
           └───────────────┘ └───────────────┘ └───────┬───────┘
                                                      │ 1:N
                                                      ▼
                                              ┌───────────────┐
                                              │   modifiers   │
                                              └───────────────┘


┌─────────────────┐         ┌─────────────────┐
│  dining_tables  │────────►│     orders      │
│                 │    1:N  │                 │
└─────────────────┘         └────────┬────────┘
                                     │ 1:N
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
     ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
     │  order_items  │       │ order_taxes   │       │order_discounts│
     │               │       │   (Pivot)     │       │   (Pivot)     │
     └───────┬───────┘       └───────────────┘       └───────────────┘
             │ M:N (via order_item_modifiers)
             ▼
     ┌───────────────┐
     │ order_item_   │
     │ modifiers     │
     └───────┬───────┘

┌─────────────────┐         ┌─────────────────┐
│   customers     │────────►│     orders      │
│                 │    1:N  │                 │
└─────────────────┘         └────────┬────────┘
                                     │ 1:N
                                     ▼
                            ┌─────────────────┐
                            │    payments     │
                            │                 │
                            └────────┬────────┘
                                     │ N:1
                                     ▼
                            ┌─────────────────┐
                            │ payment_methods │
                            └─────────────────┘
```

### 4.2 Relationship Details

| Entity A | Entity B | Relationship | Type | Reason |
|----------|----------|--------------|------|--------|
| Category | Product | 1:N | One category has many products | Each product belongs to exactly one category |
| Product | Tax | M:N | Product can have multiple taxes | Different products may have different tax rules |
| Product | Discount | M:N | Product can have multiple discounts | Promotions can apply to specific products |
| Product | Modifier Group | M:N | Product can have multiple modifier groups | e.g., Coffee has Size AND Toppings |
| Modifier Group | Modifier | 1:N | One modifier group has many modifiers | e.g., Size has Small, Medium, Large |
| Order | Order Item | 1:N | One order has many order items | A transaction contains multiple products |
| Order Item | Modifier | M:N | Order item can have multiple modifiers | Coffee with Size + Toppings |
| Order | Customer | N:1 | Many orders can belong to one customer | A customer can have multiple orders |
| Order | Dining Table | N:1 | Many orders can use one table | Table can be reused for new orders |
| Order | Payment | 1:N | One order can have multiple payments | Split bill scenario |
| Payment | Payment Method | N:1 | Many payments use one method | Different payment types |

---

## 5. Database Design

### 5.1 `categories`

```sql
-- Table: categories
-- Purpose: Grouping products by type
-- Dependency: Independent table, referenced by products
-- Prepared for: Future sub-categories (self-referencing)

CREATE TABLE categories (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id       UUID            NOT NULL,  -- FK to outlets (Future)
    parent_id       UUID            NULL,       -- Self-reference for sub-categories
    name            VARCHAR(100)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL,
    description     TEXT            NULL,
    image_url       VARCHAR(500)    NULL,
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by      UUID            NULL,       -- FK to users
    updated_by      UUID            NULL,       -- FK to users
    
    CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    CONSTRAINT uq_categories_slug_outlet 
        UNIQUE (slug, outlet_id)
);

-- Indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_outlet_id ON categories(outlet_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Business Rules:
-- 1. Category slug must be unique within an outlet
-- 2. Sub-category can be nested up to 3 levels (enforced at application level)
-- 3. Deleting category does not delete products (products set category_id to NULL)
```

### 5.2 `products`

```sql
-- Table: products
-- Purpose: Menu items sold at the restaurant
-- Dependency: References categories
-- Prepared for: Inventory, Recipe/BOM, Multi Outlet

CREATE TABLE products (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id           UUID            NOT NULL,  -- FK to outlets (Future)
    category_id         UUID            NOT NULL,  -- FK to categories
    sku                 VARCHAR(50)     NULL,       -- Stock Keeping Unit
    name                VARCHAR(200)    NOT NULL,
    slug                VARCHAR(200)    NOT NULL,
    description         TEXT            NULL,
    image_url           VARCHAR(500)    NULL,
    price               DECIMAL(12,2)   NOT NULL DEFAULT 0,
    cost_price          DECIMAL(12,2)   NULL,       -- For future profit calculation
    unit_type           VARCHAR(20)     NOT NULL DEFAULT 'unit',  -- unit, gram, ml
    has_variants        BOOLEAN         NOT NULL DEFAULT FALSE,
    is_available        BOOLEAN         NOT NULL DEFAULT TRUE,  -- Temporary out of stock
    is_featured         BOOLEAN         NOT NULL DEFAULT FALSE,
    preparation_time    INTEGER         NULL,       -- Minutes (for KDS)
    sort_order          INTEGER         NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            NULL,
    updated_by          UUID            NULL,
    
    CONSTRAINT fk_products_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    
    CONSTRAINT uq_products_sku_outlet 
        UNIQUE (sku, outlet_id),
    
    CONSTRAINT uq_products_slug_outlet 
        UNIQUE (slug, outlet_id),
    
    CONSTRAINT chk_products_price 
        CHECK (price >= 0),
    
    CONSTRAINT chk_products_cost_price 
        CHECK (cost_price IS NULL OR cost_price >= 0),
    
    CONSTRAINT chk_products_unit_type 
        CHECK (unit_type IN ('unit', 'gram', 'ml', 'slice', 'portion'))
);

-- Indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_outlet_id ON products(outlet_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_sort_order ON products(sort_order);
CREATE INDEX idx_products_price ON products(price);

-- Business Rules:
-- 1. Product slug must be unique within an outlet
-- 2. Price must be >= 0
-- 3. has_variants = TRUE when product has modifier groups
-- 4. Deleting category is restricted (must reassign products first)
```

### 5.3 `modifier_groups`

```sql
-- Table: modifier_groups
-- Purpose: Group of modifiers (e.g., "Coffee Size", "Toppings")
-- Dependency: Independent table
-- Prepared for: Recipe management

CREATE TABLE modifier_groups (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id           UUID            NOT NULL,  -- FK to outlets (Future)
    name                VARCHAR(100)    NOT NULL,
    slug                VARCHAR(100)    NOT NULL,
    description         TEXT            NULL,
    selection_type      VARCHAR(20)     NOT NULL DEFAULT 'single',  -- single, multiple
    is_required         BOOLEAN         NOT NULL DEFAULT FALSE,
    min_selections      INTEGER         NULL,       -- For multiple selection
    max_selections      INTEGER         NULL,       -- For multiple selection
    sort_order          INTEGER         NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            NULL,
    updated_by          UUID            NULL,
    
    CONSTRAINT uq_modifier_groups_slug_outlet 
        UNIQUE (slug, outlet_id),
    
    CONSTRAINT chk_modifier_groups_selection_type 
        CHECK (selection_type IN ('single', 'multiple')),
    
    CONSTRAINT chk_modifier_groups_min_max 
        CHECK (
            (selection_type = 'single' AND min_selections IS NULL AND max_selections IS NULL)
            OR
            (selection_type = 'multiple' AND min_selections >= 0 AND max_selections >= min_selections)
        )
);

-- Indexes
CREATE INDEX idx_modifier_groups_outlet_id ON modifier_groups(outlet_id);
CREATE INDEX idx_modifier_groups_is_active ON modifier_groups(is_active);
CREATE INDEX idx_modifier_groups_sort_order ON modifier_groups(sort_order);

-- Business Rules:
-- 1. selection_type = 'single': Customer must pick exactly 1 modifier
-- 2. selection_type = 'multiple': Customer can pick 0 to max_selections modifiers
-- 3. min_selections and max_selections only apply when selection_type = 'multiple'
-- 4. Example: Toppings (multiple, min=0, max=5) - pick 0 to 5 toppings
```

### 5.4 `modifiers`

```sql
-- Table: modifiers
-- Purpose: Individual options within a modifier group
-- Dependency: References modifier_groups
-- Prepared for: Inventory deduction

CREATE TABLE modifiers (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_group_id   UUID            NOT NULL,
    sku                 VARCHAR(50)     NULL,
    name                VARCHAR(100)    NOT NULL,
    description         TEXT            NULL,
    additional_price   DECIMAL(12,2)   NOT NULL DEFAULT 0,
    cost_price          DECIMAL(12,2)   NULL,       -- For future inventory
    is_default          BOOLEAN         NOT NULL DEFAULT FALSE,  -- Pre-selected
    is_available        BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order          INTEGER         NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            NULL,
    updated_by          UUID            NULL,
    
    CONSTRAINT fk_modifiers_group 
        FOREIGN KEY (modifier_group_id) REFERENCES modifier_groups(id) ON DELETE CASCADE,
    
    CONSTRAINT uq_modifiers_sku_group 
        UNIQUE (sku, modifier_group_id),
    
    CONSTRAINT chk_modifiers_additional_price 
        CHECK (additional_price >= 0),
    
    CONSTRAINT chk_modifiers_cost_price 
        CHECK (cost_price IS NULL OR cost_price >= 0)
);

-- Indexes
CREATE INDEX idx_modifiers_group_id ON modifiers(modifier_group_id);
CREATE INDEX idx_modifiers_is_available ON modifiers(is_available);
CREATE INDEX idx_modifiers_is_active ON modifiers(is_active);
CREATE INDEX idx_modifiers_sort_order ON modifiers(sort_order);

-- Business Rules:
-- 1. Deleting modifier group cascades to delete all modifiers
-- 2. is_default = TRUE means this modifier is pre-selected in POS
-- 3. additional_price can be 0 (no extra charge)
```

### 5.5 `product_modifier_groups`

```sql
-- Table: product_modifier_groups
-- Purpose: Pivot table linking products to their available modifier groups
-- Dependency: References products and modifier_groups
-- Type: Many-to-Many (Pivot Table)

CREATE TABLE product_modifier_groups (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID            NOT NULL,
    modifier_group_id   UUID            NOT NULL,
    sort_order          INTEGER         NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            NULL,
    
    CONSTRAINT fk_pmg_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_pmg_modifier_group 
        FOREIGN KEY (modifier_group_id) REFERENCES modifier_groups(id) ON DELETE CASCADE,
    
    CONSTRAINT uq_pmg_product_modifier_group 
        UNIQUE (product_id, modifier_group_id)
);

-- Indexes
CREATE INDEX idx_pmg_product_id ON product_modifier_groups(product_id);
CREATE INDEX idx_pmg_modifier_group_id ON product_modifier_groups(modifier_group_id);

-- Business Rules:
-- 1. One product can have many modifier groups (e.g., Coffee has Size AND Toppings)
-- 2. One modifier group can be used by many products (e.g., "Size" for Coffee AND Juice)
-- 3. Deleting product or modifier group removes the association
-- 4. Example: Product "Espresso" -> Modifier Groups "coffee_size", "sugar_level"
```

### 5.6 `dining_tables`

```sql
-- Table: dining_tables
-- Purpose: Identify customer seating location
-- Dependency: Independent table, referenced by orders
-- Prepared for: Table reservation, KDS routing

CREATE TABLE dining_tables (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id       UUID            NOT NULL,  -- FK to outlets (Future)
    area_id         UUID            NULL,       -- FK to areas (Future: zones)
    table_number    VARCHAR(20)     NOT NULL,
    qr_code         VARCHAR(255)    NULL,       -- For self-order scanning
    capacity        INTEGER         NOT NULL DEFAULT 4,
    min_capacity    INTEGER         NULL,       -- Minimum for reservations
    position_x      INTEGER         NULL,       -- For floor plan (Future)
    position_y      INTEGER         NULL,       -- For floor plan (Future)
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by      UUID            NULL,
    updated_by      UUID            NULL,
    
    CONSTRAINT uq_dining_tables_outlet_number 
        UNIQUE (table_number, outlet_id),
    
    CONSTRAINT chk_dining_tables_capacity 
        CHECK (capacity > 0 AND capacity <= 20),
    
    CONSTRAINT chk_dining_tables_min_capacity 
        CHECK (min_capacity IS NULL OR (min_capacity > 0 AND min_capacity <= capacity))
);

-- Indexes
CREATE INDEX idx_dining_tables_outlet_id ON dining_tables(outlet_id);
CREATE INDEX idx_dining_tables_area_id ON dining_tables(area_id);
CREATE INDEX idx_dining_tables_is_active ON dining_tables(is_active);

-- Business Rules:
-- 1. Table number must be unique within an outlet
-- 2. QR code links to self-ordering page (Future)
-- 3. Table status (available/occupied) managed separately in orders
-- 4. capacity = maximum number of customers
```

### 5.7 `customers`

```sql
-- Table: customers
-- Purpose: Identify customers for transactions
-- Dependency: Independent table, referenced by orders
-- Prepared for: Loyalty program, Customer analytics

CREATE TABLE customers (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id       UUID            NULL,       -- NULL for walk-in
    customer_type   VARCHAR(20)     NOT NULL DEFAULT 'walk_in',  -- walk_in, member, vip
    member_code     VARCHAR(50)     NULL,       -- Loyalty member code
    name            VARCHAR(200)    NULL,
    email           VARCHAR(255)    NULL,
    phone           VARCHAR(20)     NULL,
    date_of_birth   DATE            NULL,
    gender          VARCHAR(10)     NULL,
    address         TEXT            NULL,
    notes           TEXT            NULL,
    points          INTEGER         NOT NULL DEFAULT 0,  -- Future: Loyalty
    total_spent     DECIMAL(15,2)   NOT NULL DEFAULT 0,
    visit_count     INTEGER         NOT NULL DEFAULT 0,
    last_visit_at   TIMESTAMPTZ     NULL,
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by      UUID            NULL,
    updated_by      UUID            NULL,
    
    CONSTRAINT uq_customers_email_outlet 
        UNIQUE (email, outlet_id),
    
    CONSTRAINT uq_customers_phone_outlet 
        UNIQUE (phone, outlet_id),
    
    CONSTRAINT uq_customers_member_code 
        UNIQUE (member_code),
    
    CONSTRAINT chk_customers_type 
        CHECK (customer_type IN ('walk_in', 'member', 'vip')),
    
    CONSTRAINT chk_customers_points 
        CHECK (points >= 0)
);

-- Indexes
CREATE INDEX idx_customers_outlet_id ON customers(outlet_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_member_code ON customers(member_code);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- Business Rules:
-- 1. Walk-in customers have NULL outlet_id, name, phone
-- 2. Member customers must have unique phone OR email within outlet
-- 3. member_code is unique across all outlets (for loyalty)
-- 4. points are accumulated for future redemption
-- 5. visit_count and total_spent for customer analytics
```

### 5.8 `payment_methods`

```sql
-- Table: payment_methods
-- Purpose: Define accepted payment types
-- Dependency: Independent table, referenced by payments
-- Prepared for: Payment gateway integration

CREATE TABLE payment_methods (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id           UUID            NOT NULL,  -- FK to outlets (Future)
    code                VARCHAR(30)     NOT NULL,
    name                VARCHAR(100)    NOT NULL,
    description         TEXT            NULL,
    payment_type        VARCHAR(20)     NOT NULL,  -- cash, e_wallet, bank_transfer, card, qris
    provider            VARCHAR(50)     NULL,       -- GoPay, OVO, DANA, Bank BCA, etc.
    icon_url            VARCHAR(500)    NULL,
    is_integration      BOOLEAN         NOT NULL DEFAULT FALSE,  -- Needs external integration
    min_amount          DECIMAL(12,2)   NULL,       -- Minimum transaction
    max_amount          DECIMAL(12,2)   NULL,       -- Maximum transaction
    sort_order          INTEGER         NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            NULL,
    updated_by          UUID            NULL,
    
    CONSTRAINT uq_payment_methods_code_outlet 
        UNIQUE (code, outlet_id),
    
    CONSTRAINT chk_payment_methods_type 
        CHECK (payment_type IN ('cash', 'e_wallet', 'bank_transfer', 'card', 'qris', 'other')),
    
    CONSTRAINT chk_payment_methods_min_amount 
        CHECK (min_amount IS NULL OR min_amount >= 0),
    
    CONSTRAINT chk_payment_methods_max_amount 
        CHECK (max_amount IS NULL OR max_amount >= 0)
);

-- Indexes
CREATE INDEX idx_payment_methods_outlet_id ON payment_methods(outlet_id);
CREATE INDEX idx_payment_methods_payment_type ON payment_methods(payment_type);
CREATE INDEX idx_payment_methods_is_integration ON payment_methods(is_integration);
CREATE INDEX idx_payment_methods_is_active ON payment_methods(is_active);

-- Business Rules:
-- 1. Cash payments don't need reference number
-- 2. Non-cash payments require reference_number in payments table
-- 3. is_integration = TRUE for QRIS, EDC, payment gateways
-- 4. Each outlet can have different payment methods enabled
```

### 5.9 `taxes`

```sql
-- Table: taxes
-- Purpose: Define tax rates applied to transactions
-- Dependency: Independent table, referenced by product_taxes
-- Prepared for: Tax API, multi-tax scenarios

CREATE TABLE taxes (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id       UUID            NOT NULL,  -- FK to outlets (Future)
    code            VARCHAR(30)     NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT            NULL,
    tax_type        VARCHAR(20)     NOT NULL,  -- percentage, fixed_amount
    rate            DECIMAL(8,4)    NOT NULL DEFAULT 0,  -- Percentage: 11.00 = 11%, Fixed: amount
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,  -- Applied to all products
    calculation_base VARCHAR(20)     NOT NULL DEFAULT 'subtotal',  -- subtotal, after_discount
    calculation_order INTEGER        NOT NULL DEFAULT 1,  -- Tax calculation sequence
    is_inclusive    BOOLEAN         NOT NULL DEFAULT FALSE,  -- Tax included in price
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    effective_from  TIMESTAMPTZ     NULL,
    effective_until TIMESTAMPTZ     NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by      UUID            NULL,
    updated_by      UUID            NULL,
    
    CONSTRAINT uq_taxes_code_outlet 
        UNIQUE (code, outlet_id),
    
    CONSTRAINT chk_taxes_type 
        CHECK (tax_type IN ('percentage', 'fixed_amount')),
    
    CONSTRAINT chk_taxes_rate 
        CHECK (rate >= 0),
    
    CONSTRAINT chk_taxes_calculation_base 
        CHECK (calculation_base IN ('subtotal', 'after_discount'))
);

-- Indexes
CREATE INDEX idx_taxes_outlet_id ON taxes(outlet_id);
CREATE INDEX idx_taxes_is_default ON taxes(is_default);
CREATE INDEX idx_taxes_is_active ON taxes(is_active);
CREATE INDEX idx_taxes_effective_dates ON taxes(effective_from, effective_until);

-- Business Rules:
-- 1. is_default = TRUE means tax applies to all products unless excluded
-- 2. calculation_base determines when tax is calculated
-- 3. calculation_order determines sequence (e.g., PPN first, then service charge)
-- 4. is_inclusive = TRUE for tax-included pricing (e.g., in some countries)
-- 5. Future: Tax can have effective date range
```

### 5.10 `product_taxes`

```sql
-- Table: product_taxes
-- Purpose: Pivot table linking products to applicable taxes
-- Dependency: References products and taxes
-- Type: Many-to-Many (Pivot Table)

CREATE TABLE product_taxes (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID            NOT NULL,
    tax_id          UUID            NOT NULL,
    is_exclusive    BOOLEAN         NOT NULL DEFAULT FALSE,  -- Override product's default
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by      UUID            NULL,
    
    CONSTRAINT fk_pt_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_pt_tax 
        FOREIGN KEY (tax_id) REFERENCES taxes(id) ON DELETE CASCADE,
    
    CONSTRAINT uq_pt_product_tax 
        UNIQUE (product_id, tax_id)
);

-- Indexes
CREATE INDEX idx_pt_product_id ON product_taxes(product_id);
CREATE INDEX idx_pt_tax_id ON product_taxes(tax_id);

-- Business Rules:
-- 1. If product has no entries, apply default taxes from taxes table
-- 2. If product has entries, only apply those specified taxes
-- 3. is_exclusive = TRUE means this tax replaces default taxes
```

### 5.11 `discounts`

```sql
-- Table: discounts
-- Purpose: Define promotional discounts
-- Dependency: Independent table, referenced by product_discounts and order_discounts
-- Prepared for: Complex promo rules, voucher system

CREATE TABLE discounts (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id           UUID            NOT NULL,  -- FK to outlets (Future)
    code                VARCHAR(50)     NULL,       -- NULL for automatic discounts
    name                VARCHAR(200)    NOT NULL,
    description         TEXT            NULL,
    discount_type       VARCHAR(20)     NOT NULL,  -- percentage, fixed_amount, buy_x_get_y
    value               DECIMAL(12,2)   NOT NULL,  -- Percentage: 10.00 = 10%, Fixed: amount
    min_order_amount    DECIMAL(12,2)   NULL,       -- Minimum transaction
    max_discount_amount DECIMAL(12,2)   NULL,       -- Cap for percentage discounts
    customer_type       VARCHAR(20)     NULL,       -- NULL = public, member, vip
    applicable_days     VARCHAR(50)     NULL,       -- e.g., "1,2,3,4,5" for weekdays
    applicable_hours_start TIME         NULL,       -- e.g., 14:00 for happy hour
    applicable_hours_end   TIME         NULL,
    usage_limit         INTEGER         NULL,       -- Total usage limit
    usage_count         INTEGER         NOT NULL DEFAULT 0,  -- Times used
    per_customer_limit  INTEGER         NULL,       -- Limit per customer
    start_date          DATE            NULL,
    end_date            DATE            NULL,
    is_auto_apply       BOOLEAN         NOT NULL DEFAULT FALSE,  -- Auto apply or requires code
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            NULL,
    updated_by          UUID            NULL,
    
    CONSTRAINT uq_discounts_code_outlet 
        UNIQUE (code, outlet_id),
    
    CONSTRAINT chk_discounts_type 
        CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
    
    CONSTRAINT chk_discounts_value 
        CHECK (value > 0),
    
    CONSTRAINT chk_discounts_min_order 
        CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
    
    CONSTRAINT chk_discounts_max_discount 
        CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0),
    
    CONSTRAINT chk_discounts_usage 
        CHECK (usage_limit IS NULL OR usage_count <= usage_limit),
    
    CONSTRAINT chk_discounts_dates 
        CHECK (end_date IS NULL OR start_date <= end_date)
);

-- Indexes
CREATE INDEX idx_discounts_outlet_id ON discounts(outlet_id);
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_discount_type ON discounts(discount_type);
CREATE INDEX idx_discounts_customer_type ON discounts(customer_type);
CREATE INDEX idx_discounts_is_auto_apply ON discounts(is_auto_apply);
CREATE INDEX idx_discounts_is_active ON discounts(is_active);
CREATE INDEX idx_discounts_dates ON discounts(start_date, end_date);

-- Business Rules:
-- 1. code = NULL for automatic discounts (applied without code)
-- 2. code = unique for voucher-style discounts
-- 3. max_discount_amount prevents too-high discounts on percentage type
-- 4. applicable_days = NULL means every day
-- 5. applicable_hours = NULL means all day
-- 6. usage_limit = NULL means unlimited
```

### 5.12 `product_discounts`

```sql
-- Table: product_discounts
-- Purpose: Link discounts to specific products
-- Dependency: References products and discounts
-- Type: Many-to-Many (Pivot Table)

CREATE TABLE product_discounts (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID            NOT NULL,
    discount_id     UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_pd_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_pd_discount 
        FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    
    CONSTRAINT uq_pd_product_discount 
        UNIQUE (product_id, discount_id)
);

-- Indexes
CREATE INDEX idx_pd_product_id ON product_discounts(product_id);
CREATE INDEX idx_pd_discount_id ON product_discounts(discount_id);

-- Business Rules:
-- 1. If discount has no product entries, applies to all products
-- 2. If discount has product entries, only applies to those products
-- 3. Example: "10% off Coffee" - discount linked to Coffee product
```

---

## 6. Transaction Tables

### 6.1 `orders`

```sql
-- Table: orders
-- Purpose: Record customer transactions
-- Dependency: References customers, dining_tables
-- Prepared for: Split bill, order tracking, kitchen display

CREATE TABLE orders (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(20)     NOT NULL,
    outlet_id           UUID            NOT NULL,  -- FK to outlets (Future)
    customer_id         UUID            NULL,       -- FK to customers
    table_id            UUID            NULL,       -- FK to dining_tables
    order_type          VARCHAR(20)     NOT NULL DEFAULT 'dine_in',  -- dine_in, take_away, delivery
    order_status        VARCHAR(20)     NOT NULL DEFAULT 'pending',  -- pending, confirmed, preparing, ready, served, completed, cancelled
    subtotal            DECIMAL(15,2)   NOT NULL DEFAULT 0,
    tax_amount          DECIMAL(15,2)   NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(15,2)   NOT NULL DEFAULT 0,
    total_amount        DECIMAL(15,2)   NOT NULL DEFAULT 0,
    total_paid          DECIMAL(15,2)   NOT NULL DEFAULT 0,
    change_amount       DECIMAL(15,2)   NOT NULL DEFAULT 0,
    customer_count      INTEGER         NOT NULL DEFAULT 1,
    notes               TEXT            NULL,
    internal_notes      TEXT            NULL,       -- For kitchen/staff
    ordered_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    confirmed_at        TIMESTAMPTZ     NULL,
    completed_at        TIMESTAMPTZ     NULL,
    cancelled_at        TIMESTAMPTZ     NULL,
    cancelled_reason    TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            NULL,
    updated_by          UUID            NULL,
    
    CONSTRAINT uq_orders_order_number_outlet 
        UNIQUE (order_number, outlet_id),
    
    CONSTRAINT fk_orders_customer 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_orders_table 
        FOREIGN KEY (table_id) REFERENCES dining_tables(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_orders_type 
        CHECK (order_type IN ('dine_in', 'take_away', 'delivery')),
    
    CONSTRAINT chk_orders_status 
        CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    
    CONSTRAINT chk_orders_amounts 
        CHECK (
            subtotal >= 0 AND
            tax_amount >= 0 AND
            discount_amount >= 0 AND
            total_amount >= 0 AND
            total_paid >= 0 AND
            change_amount >= 0
        )
);

-- Indexes
CREATE INDEX idx_orders_outlet_id ON orders(outlet_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Business Rules:
-- 1. order_number is unique within an outlet (format: YYYYMMDD-XXXX)
-- 2. subtotal = sum of all order_items (before tax/discount)
-- 3. tax_amount = calculated tax on subtotal or after-discount
-- 4. discount_amount = total discount applied
-- 5. total_amount = subtotal + tax_amount - discount_amount
-- 6. change_amount = total_paid - total_amount (for cash)
```

### 6.2 `order_items`

```sql
-- Table: order_items
-- Purpose: Individual items in an order
-- Dependency: References orders and products
-- Prepared for: Order item modifications, refunds

CREATE TABLE order_items (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID            NOT NULL,
    product_id      UUID            NOT NULL,
    variant_name    VARCHAR(100)    NULL,       -- e.g., "Large, Extra Shot"
    quantity        DECIMAL(10,2)  NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2)  NOT NULL,  -- Price at time of order
    subtotal        DECIMAL(12,2)  NOT NULL,  -- quantity * unit_price
    tax_amount      DECIMAL(12,2)  NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2)  NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,2)  NOT NULL,
    notes           TEXT            NULL,
    item_status     VARCHAR(20)     NOT NULL DEFAULT 'pending',  -- pending, preparing, ready, served
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_oi_order 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_oi_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    
    CONSTRAINT chk_oi_quantity 
        CHECK (quantity > 0),
    
    CONSTRAINT chk_oi_unit_price 
        CHECK (unit_price >= 0),
    
    CONSTRAINT chk_oi_amounts 
        CHECK (
            subtotal >= 0 AND
            tax_amount >= 0 AND
            discount_amount >= 0 AND
            total_amount >= 0
        )
);

-- Indexes
CREATE INDEX idx_oi_order_id ON order_items(order_id);
CREATE INDEX idx_oi_product_id ON order_items(product_id);
CREATE INDEX idx_oi_item_status ON order_items(item_status);

-- Business Rules:
-- 1. unit_price is stored (not calculated) for historical accuracy
-- 2. Deleting product is restricted if referenced by order_items
-- 3. variant_name stores selected modifiers for display
-- 4. item_status for KDS (kitchen display system) tracking
```

### 6.3 `order_item_modifiers`

```sql
-- Table: order_item_modifiers
-- Purpose: Store selected modifiers for each order item
-- Dependency: References order_items and modifiers
-- Type: Many-to-Many (Pivot Table)

CREATE TABLE order_item_modifiers (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id   UUID            NOT NULL,
    modifier_id     UUID            NOT NULL,
    modifier_name   VARCHAR(100)    NOT NULL,  -- Store name at time of order
    quantity        INTEGER         NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2)   NOT NULL,  -- Additional price at time of order
    total_amount    DECIMAL(12,2)   NOT NULL,  -- quantity * unit_price
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_oim_order_item 
        FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_oim_modifier 
        FOREIGN KEY (modifier_id) REFERENCES modifiers(id) ON DELETE RESTRICT,
    
    CONSTRAINT chk_oim_quantity 
        CHECK (quantity > 0),
    
    CONSTRAINT chk_oim_unit_price 
        CHECK (unit_price >= 0)
);

-- Indexes
CREATE INDEX idx_oim_order_item_id ON order_item_modifiers(order_item_id);
CREATE INDEX idx_oim_modifier_id ON order_item_modifiers(modifier_id);

-- Business Rules:
-- 1. modifier_name and unit_price stored for historical accuracy
-- 2. Deleting modifier is restricted if referenced
-- 3. Example: Order Item "Coffee" with modifiers "Large (+5000)", "Extra Shot (+3000)"
```

### 6.4 `order_taxes`

```sql
-- Table: order_taxes
-- Purpose: Store calculated taxes for an order
-- Dependency: References orders and taxes
-- Type: Many-to-Many (Pivot Table)

CREATE TABLE order_taxes (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID            NOT NULL,
    tax_id          UUID            NOT NULL,
    tax_name        VARCHAR(100)    NOT NULL,
    tax_rate        DECIMAL(8,4)    NOT NULL,
    tax_type        VARCHAR(20)     NOT NULL,
    taxable_amount  DECIMAL(15,2)   NOT NULL,
    tax_amount      DECIMAL(15,2)   NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_ot_order 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_ot_tax_amount 
        CHECK (tax_amount >= 0)
);

-- Indexes
CREATE INDEX idx_ot_order_id ON order_taxes(order_id);
CREATE INDEX idx_ot_tax_id ON order_taxes(tax_id);

-- Business Rules:
-- 1. tax_name, tax_rate, tax_type stored for historical accuracy
-- 2. Calculated based on order's subtotal or after-discount (based on tax config)
```

### 6.5 `order_discounts`

```sql
-- Table: order_discounts
-- Purpose: Store applied discounts for an order
-- Dependency: References orders and discounts
-- Type: Many-to-Many (Pivot Table)

CREATE TABLE order_discounts (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID            NOT NULL,
    discount_id     UUID            NULL,       -- NULL for automatic discounts
    discount_code   VARCHAR(50)     NULL,
    discount_name   VARCHAR(200)    NOT NULL,
    discount_type   VARCHAR(20)     NOT NULL,
    original_value  DECIMAL(12,2)   NOT NULL,  -- Original discount value
    discount_amount DECIMAL(15,2)   NOT NULL,  -- Actual amount applied
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_od_order 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_od_discount 
        FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_od_discount_amount 
        CHECK (discount_amount >= 0)
);

-- Indexes
CREATE INDEX idx_od_order_id ON order_discounts(order_id);
CREATE INDEX idx_od_discount_id ON order_discounts(discount_id);

-- Business Rules:
-- 1. discount_name stored for historical accuracy
-- 2. discount_id can be NULL for automatic discounts
-- 3. discount_amount may be less than original_value if capped
```

### 6.6 `payments`

```sql
-- Table: payments
-- Purpose: Record payment transactions
-- Dependency: References orders and payment_methods
-- Prepared for: Split payments, refunds

CREATE TABLE payments (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID            NOT NULL,
    payment_method_id   UUID            NOT NULL,
    payment_number      VARCHAR(30)     NOT NULL,
    amount              DECIMAL(15,2)   NOT NULL,
    reference_number    VARCHAR(100)    NULL,       -- For non-cash payments
    card_last_four     VARCHAR(4)      NULL,       -- For card payments
    notes               TEXT            NULL,
    payment_status      VARCHAR(20)     NOT NULL DEFAULT 'completed',  -- pending, completed, failed, refunded
    paid_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    refunded_at         TIMESTAMPTZ     NULL,
    refunded_amount     DECIMAL(15,2)   NULL,
    refund_reason       TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            NULL,
    
    CONSTRAINT fk_payments_order 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_payments_method 
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT,
    
    CONSTRAINT uq_payments_number 
        UNIQUE (payment_number),
    
    CONSTRAINT chk_payments_amount 
        CHECK (amount > 0),
    
    CONSTRAINT chk_payments_status 
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    
    CONSTRAINT chk_payments_refunded 
        CHECK (
            (payment_status != 'refunded' AND refunded_at IS NULL AND refunded_amount IS NULL)
            OR
            (payment_status = 'refunded' AND refunded_at IS NOT NULL AND refunded_amount IS NOT NULL AND refunded_amount > 0)
        )
);

-- Indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_method_id ON payments(payment_method_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- Business Rules:
-- 1. One order can have multiple payments (split bill)
-- 2. Total of all payments should equal or exceed order total
-- 3. Cash payments don't need reference_number
-- 4. Card payments should store card_last_four
-- 5. payment_number is unique across all payments
```

---

## 7. Business Rules

### 7.1 Product Rules

| Rule | Description |
|------|-------------|
| PR-001 | Product must belong to exactly one category |
| PR-002 | Product price must be >= 0 |
| PR-003 | Product with modifier groups must have `has_variants = TRUE` |
| PR-004 | Deleting category is restricted if it has products |
| PR-005 | Product can be temporarily unavailable (`is_available = FALSE`) |

### 7.2 Modifier Rules

| Rule | Description |
|------|-------------|
| MR-001 | Modifier must belong to exactly one modifier group |
| MR-002 | Single-choice modifier group: exactly 1 modifier selected |
| MR-003 | Multi-choice modifier group: 0 to max_selections modifiers |
| MR-004 | Deleting modifier group cascades to delete all modifiers |
| MR-005 | Only one modifier can be marked as default per group |

### 7.3 Order Rules

| Rule | Description |
|------|-------------|
| OR-001 | Order number must be unique within an outlet |
| OR-002 | Order subtotal = sum of all order items |
| OR-003 | Tax is calculated before discount (configurable) |
| OR-004 | Total = subtotal + tax - discount |
| OR-005 | Deleting customer is allowed (set to NULL) |
| OR-006 | Order status follows: pending → completed/cancelled |

### 7.4 Payment Rules

| Rule | Description |
|------|-------------|
| PY-001 | Order must have at least one payment |
| PY-002 | Cash payments don't require reference number |
| PY-003 | Non-cash payments require reference number |
| PY-004 | Multiple payments allowed for split bill |
| PY-005 | Refund must have reason and timestamp |

### 7.5 Discount Rules

| Rule | Description |
|------|-------------|
| DR-001 | Discount code must be unique within outlet |
| DR-002 | Percentage discount can have maximum cap |
| DR-003 | Discount usage is tracked and can be limited |
| DR-004 | Discount can have date/time restrictions |
| DR-005 | Discount can be public or customer-type specific |

---

## 8. Recommended Constraints

### 8.1 Unique Constraints

| Table | Constraint | Columns |
|-------|------------|---------|
| categories | uq_categories_slug_outlet | slug, outlet_id |
| products | uq_products_sku_outlet | sku, outlet_id |
| products | uq_products_slug_outlet | slug, outlet_id |
| modifier_groups | uq_modifier_groups_slug_outlet | slug, outlet_id |
| dining_tables | uq_dining_tables_outlet_number | table_number, outlet_id |
| customers | uq_customers_email_outlet | email, outlet_id |
| customers | uq_customers_phone_outlet | phone, outlet_id |
| customers | uq_customers_member_code | member_code |
| payment_methods | uq_payment_methods_code_outlet | code, outlet_id |
| taxes | uq_taxes_code_outlet | code, outlet_id |
| discounts | uq_discounts_code_outlet | code, outlet_id |
| orders | uq_orders_order_number_outlet | order_number, outlet_id |
| payments | uq_payments_number | payment_number |

### 8.2 Foreign Key Constraints

| Child Table | Parent Table | ON DELETE |
|-------------|--------------|-----------|
| products | categories | RESTRICT |
| product_modifier_groups | products | CASCADE |
| product_modifier_groups | modifier_groups | CASCADE |
| modifiers | modifier_groups | CASCADE |
| product_taxes | products | CASCADE |
| product_taxes | taxes | CASCADE |
| product_discounts | products | CASCADE |
| product_discounts | discounts | CASCADE |
| order_items | orders | CASCADE |
| order_items | products | RESTRICT |
| order_item_modifiers | order_items | CASCADE |
| order_item_modifiers | modifiers | RESTRICT |
| order_taxes | orders | CASCADE |
| order_discounts | orders | CASCADE |
| order_discounts | discounts | SET NULL |
| payments | orders | RESTRICT |
| payments | payment_methods | RESTRICT |
| orders | customers | SET NULL |
| orders | dining_tables | SET NULL |

---

## 9. Recommended Indexes

### 9.1 Primary Indexes (Foreign Keys)

```sql
-- products
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_outlet_id ON products(outlet_id);

-- modifier_groups
CREATE INDEX idx_modifier_groups_outlet_id ON modifier_groups(outlet_id);

-- modifiers
CREATE INDEX idx_modifiers_group_id ON modifiers(modifier_group_id);

-- dining_tables
CREATE INDEX idx_dining_tables_outlet_id ON dining_tables(outlet_id);

-- orders
CREATE INDEX idx_orders_outlet_id ON orders(outlet_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);

-- order_items
CREATE INDEX idx_oi_order_id ON order_items(order_id);
CREATE INDEX idx_oi_product_id ON order_items(product_id);

-- payments
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_method_id ON payments(payment_method_id);
```

### 9.2 Query Performance Indexes

```sql
-- Dashboard queries
CREATE INDEX idx_orders_daily ON orders(outlet_id, DATE(ordered_at));

-- Customer lookup
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

-- Product availability
CREATE INDEX idx_products_available ON products(category_id, is_available) WHERE is_available = TRUE;

-- Open orders per table
CREATE INDEX idx_orders_open_table ON orders(table_id) WHERE order_status NOT IN ('completed', 'cancelled');
```

---

## 10. Future Scalability

### 10.1 Multi Outlet Support

```sql
-- Required: Add outlet_id to all tables marked with (Future)
-- Tables with outlet_id:
--   categories, products, modifier_groups, modifiers,
--   dining_tables, customers, payment_methods, taxes,
--   discounts, orders

-- outlets table (Future):
CREATE TABLE outlets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    code        VARCHAR(30) NOT NULL UNIQUE,
    address     TEXT,
    phone       VARCHAR(20),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.2 Inventory Support

```sql
-- Add to products table:
stock_quantity    DECIMAL(10,2) DEFAULT 0,
low_stock_alert  DECIMAL(10,2) DEFAULT 10,
reorder_point    DECIMAL(10,2) DEFAULT 20,

-- New table: inventory
CREATE TABLE inventory (
    id              UUID PRIMARY KEY,
    product_id      UUID REFERENCES products(id),
    variant_id      UUID,
    current_stock   DECIMAL(10,2) DEFAULT 0,
    reserved_stock  DECIMAL(10,2) DEFAULT 0,
    available_stock DECIMAL(10,2) GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    unit_cost       DECIMAL(12,2),
    last_restocked_at TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.3 Recipe/BOM Support

```sql
-- New table: recipes
CREATE TABLE recipes (
    id          UUID PRIMARY KEY,
    product_id  UUID REFERENCES products(id),
    name        VARCHAR(200),
    is_default  BOOLEAN DEFAULT TRUE,
    yield_qty   DECIMAL(10,2),
    yield_unit  VARCHAR(20),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- New table: recipe_ingredients
CREATE TABLE recipe_ingredients (
    id              UUID PRIMARY KEY,
    recipe_id       UUID REFERENCES recipes(id),
    ingredient_id   UUID REFERENCES ingredients(id),
    quantity        DECIMAL(10,2) NOT NULL,
    unit            VARCHAR(20),
    is_optional     BOOLEAN DEFAULT FALSE,
    substitution_id UUID REFERENCES ingredients(id)
);
```

### 10.4 Kitchen Display System (KDS)

```sql
-- Already prepared in orders table:
-- item_status: pending, preparing, ready, served

-- New table: kitchen_stations (Future)
CREATE TABLE kitchen_stations (
    id          UUID PRIMARY KEY,
    name        VARCHAR(100),
    outlet_id   UUID,
    categories  UUID[],
    is_active   BOOLEAN DEFAULT TRUE
);

-- New table: order_item_routing (Future)
CREATE TABLE order_item_routing (
    id              UUID PRIMARY KEY,
    order_item_id   UUID REFERENCES order_items(id),
    station_id      UUID REFERENCES kitchen_stations(id),
    routed_at       TIMESTAMPTZ DEFAULT NOW(),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ
);
```

### 10.5 Loyalty Program

```sql
-- Already prepared in customers table:
-- points, total_spent, visit_count, last_visit_at

-- New table: loyalty_tiers
CREATE TABLE loyalty_tiers (
    id              UUID PRIMARY KEY,
    name            VARCHAR(50),
    min_points      INTEGER,
    discount_pct    DECIMAL(5,2),
    points_multiplier DECIMAL(3,2) DEFAULT 1.0
);

-- New table: point_transactions
CREATE TABLE point_transactions (
    id              UUID PRIMARY KEY,
    customer_id     UUID REFERENCES customers(id),
    order_id        UUID REFERENCES orders(id),
    points          INTEGER NOT NULL,
    type            VARCHAR(20),
    description     TEXT,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. Development Recommendation

### 11.1 Phased Development Approach

```
Phase 1: Foundation (Current)
├── Master Data Setup
│   ├── Categories
│   ├── Products
│   ├── Modifier Groups & Modifiers
│   └── Dining Tables
│
Phase 2: Core POS
│   ├── Order Creation
│   ├── Order Items
│   ├── Modifiers Selection
│   ├── Tax Calculation
│   └── Payment Processing
│
Phase 3: Customer & Promo
│   ├── Customer Management
│   ├── Discounts
│   └── Basic Reports
│
Phase 4: Advanced (Future)
│   ├── Inventory
│   ├── Recipe/BOM
│   ├── Kitchen Display
│   └── Multi Outlet
```

### 11.2 Module Dependencies

```
Master Data (No Dependencies)
├── Categories ← Products
├── Products ← Order Items
├── Modifier Groups ← Modifiers
├── Modifiers ← Order Item Modifiers
├── Dining Tables ← Orders
├── Customers ← Orders
├── Payment Methods ← Payments
├── Taxes ← Product Taxes, Order Taxes
└── Discounts ← Product Discounts, Order Discounts

Transactions
├── Orders ← Customers, Dining Tables
├── Order Items ← Orders, Products
├── Order Item Modifiers ← Order Items, Modifiers
├── Order Taxes ← Orders, Taxes
├── Order Discounts ← Orders, Discounts
└── Payments ← Orders, Payment Methods
```

### 11.3 Database Selection

| Option | Recommendation | Reason |
|--------|---------------|--------|
| PostgreSQL | ✅ **Recommended** | Advanced JSON support, UUID native, better constraints, PostGIS for multi-outlet mapping |
| MySQL | Alternative | If team is more familiar, but less feature-rich |
| MongoDB | Not Recommended | No multi-table transactions, complex joins for RBAC |

### 11.4 Implementation Priority

| Priority | Tables | Reason |
|----------|--------|--------|
| 1 (Critical) | categories, products, modifier_groups, modifiers, product_modifier_groups | Core menu structure |
| 2 (High) | dining_tables, payment_methods, taxes | POS operations |
| 3 (Medium) | discounts, product_discounts | Promotional features |
| 4 (Medium) | customers | Customer tracking |
| 5 (High) | orders, order_items, order_item_modifiers | Transaction recording |
| 6 (High) | order_taxes, order_discounts, payments | Financial accuracy |

---

## 12. Summary

### Database Summary

| Category | Tables |
|----------|--------|
| **Master Data** | categories, products, modifier_groups, modifiers, product_modifier_groups, dining_tables, customers, payment_methods, taxes, product_taxes, discounts, product_discounts |
| **Transactions** | orders, order_items, order_item_modifiers, order_taxes, order_discounts, payments |
| **Reference** | outlets (future), ingredients (future), recipes (future) |

### Total Tables: 17 (Core) + 4 (Future)

### Key Design Decisions

1. **UUID Primary Keys**: Scalable, secure, merge-friendly
2. **Soft Deletes**: Using `deleted_at` for audit trail (where applicable)
3. **Pivot Tables**: Many-to-Many relationships for flexibility
4. **Audit Columns**: All tables have `created_at`, `updated_at`, `created_by`, `updated_by`
5. **outlet_id**: All tables ready for multi-outlet
6. **Decimal Precision**: `DECIMAL(12,2)` for money, `DECIMAL(8,4)` for percentages
7. **Status Fields**: Enums with CHECK constraints
8. **Historical Data**: Prices and names stored (not referenced) for accuracy

---

## Appendix A: Naming Convention

| Entity | Table Name | Slug/Code Pattern |
|--------|-----------|-------------------|
| Category | categories | kebab-case |
| Product | products | kebab-case |
| Modifier Group | modifier_groups | snake_case |
| Modifier | modifiers | snake_case |
| Dining Table | dining_tables | snake_case |
| Customer | customers | snake_case |
| Payment Method | payment_methods | snake_case |
| Tax | taxes | snake_case |
| Discount | discounts | snake_case |
| Order | orders | snake_case |
| Order Item | order_items | snake_case |
| Order Item Modifier | order_item_modifiers | snake_case |

---

## Appendix B: Data Types Reference

| Data Type | PostgreSQL | Usage |
|-----------|------------|-------|
| UUID | `UUID` | Primary keys |
| String | `VARCHAR(n)` | Names, codes |
| Text | `TEXT` | Descriptions, notes |
| Boolean | `BOOLEAN` | Flags, status |
| Integer | `INTEGER` | Counts, quantities |
| Decimal (Money) | `DECIMAL(12,2)` | Prices, amounts |
| Decimal (Percentage) | `DECIMAL(8,4)` | Tax rates |
| Timestamp | `TIMESTAMPTZ` | Date/time with timezone |
| Date | `DATE` | Birth dates, effective dates |
| Time | `TIME` | Operating hours |

---

**Blueprint Version:** 1.0  
**Date:** 2026-08-03  
**Status:** Ready for Implementation

---

*Blueprint ini adalah fondasi utama. Seluruh development berikutnya WAJIB mengikuti struktur dan konvensi yang telah didefinisikan di atas.*
