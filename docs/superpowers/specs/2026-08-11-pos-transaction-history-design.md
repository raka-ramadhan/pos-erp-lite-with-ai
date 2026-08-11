# POS Transaction History — Design Document

**Date:** 2026-08-11
**Author:** AI Assistant
**Status:** Approved

---

## 1. Overview

### 1.1 Purpose
Membuat sistem Transaction History di POS Cashier yang menyimpan **immutable snapshot** dari setiap transaksi yang completed. Historical data tidak akan berubah meskipun master data (products, modifiers, discounts, taxes, tables) diubah.

### 1.2 Scope
- **Sprint 8 — Receipt & Order Completion**
- POS Cashier Application (`/pos`)
- Focus: Transaction History → Search → Detail → Receipt

### 1.3 Key Principle
**No Customer Snapshot** — Customer data tidak perlu di-snapshot (tidak ada tabel customers di database).

---

## 2. Architecture Decision

### 2.1 Approach: Separate Transaction Entity with Full Snapshot

Menggunakan tabel baru `transactions` sebagai immutable snapshot terpisah dari `orders`.

**Alasan:**
1. **True Immutability** — Historical transaction tidak pernah berubah
2. **Audit Trail** — Bisa menunjukkan dengan pasti apa yang terjadi pada saat transaksi
3. **Performance** — Tidak perlu JOIN ke master tables saat read history
4. **Business Requirement** — POS production-ready standard

### 2.2 Data Flow

```
ORDER LIFECYCLE:
─────────────────────────────────────────────────────────────
[1] CREATE ORDER
    Order Created (status: open)
    ↓
[2] ADD ITEMS
    Order Items Added (live product data, live prices)
    ↓
[3] PAYMENT
    Payment Recorded (status: pending → completed)
    ↓
[4] COMPLETE ORDER (TRIGGER SNAPSHOT)
    ├─► CREATE Transaction Snapshot (freeze ALL data)
    ├─► CREATE Transaction Items (snapshot items + modifiers)
    ├─► CREATE Transaction Payment (snapshot payment detail)
    └─► UPDATE Order Status: completed
    ↓
[5] HISTORY
    Transaction available in History
    No changes possible (immutable)
─────────────────────────────────────────────────────────────
```

---

## 3. Database Schema

### 3.1 Tables

#### `transactions` (Main Transaction Table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `transaction_number` | VARCHAR(25) | Unique: TRX-YYYYMMDD-XXXXXX |
| `order_id` | UUID (FK) | Reference to original order |
| `order_number` | VARCHAR(20) | Snapshot of order number |
| `order_type` | ENUM | dine_in, take_away, delivery |
| `table_id` | UUID (nullable) | Snapshot of table reference |
| `table_code` | VARCHAR(20) | Snapshot: Table 01 |
| `table_name` | VARCHAR(50) | Snapshot: Meja Utama |
| `cashier_id` | UUID (nullable) | Snapshot of cashier |
| `cashier_name` | VARCHAR(100) | Snapshot: Raka Hikmah |
| `subtotal` | DECIMAL(15,2) | Snapshot of subtotal |
| `discount_id` | UUID (nullable) | Snapshot of discount |
| `discount_name` | VARCHAR(100) | Snapshot: Promo Weekend |
| `discount_type` | ENUM | percentage, fixed |
| `discount_value` | DECIMAL(10,2) | Snapshot: 10.00 |
| `discount_amount` | DECIMAL(15,2) | Snapshot: -Rp15.000 |
| `tax_id` | UUID (nullable) | Snapshot of tax |
| `tax_name` | VARCHAR(50) | Snapshot: PPN |
| `tax_rate` | DECIMAL(5,2) | Snapshot: 11.00 |
| `tax_amount` | DECIMAL(15,2) | Snapshot: Rp13.500 |
| `total_amount` | DECIMAL(15,2) | Grand total |
| `notes` | TEXT (nullable) | Order notes |
| `ordered_at` | TIMESTAMP | When order was created |
| `completed_at` | TIMESTAMP | When transaction completed |
| `created_at` | TIMESTAMP | Auto-managed |

#### `transaction_items` (Snapshot of Order Items)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `transaction_id` | UUID (FK) | Reference to transaction |
| `product_id` | UUID | Snapshot of product |
| `product_name` | VARCHAR(100) | Snapshot: Nasi Goreng Special |
| `variant_name` | VARCHAR(100) | Snapshot: size, color, etc. |
| `quantity` | INT | Snapshot of quantity |
| `unit_price` | DECIMAL(12,2) | Snapshot: Rp35.000 |
| `subtotal` | DECIMAL(12,2) | Snapshot: Rp70.000 |
| `notes` | TEXT (nullable) | Item notes |
| `sort_order` | INT | Display order |

#### `transaction_item_modifiers` (Snapshot of Item Modifiers)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `transaction_item_id` | UUID (FK) | Reference to transaction_item |
| `modifier_id` | UUID | Snapshot of modifier |
| `modifier_name` | VARCHAR(100) | Snapshot: Extra Egg |
| `quantity` | INT | Snapshot of quantity |
| `unit_price` | DECIMAL(12,2) | Snapshot: Rp5.000 |
| `total_amount` | DECIMAL(12,2) | Snapshot: Rp5.000 |

#### `transaction_payments` (Snapshot of Payment)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `transaction_id` | UUID (FK) | Reference to transaction |
| `payment_method_id` | UUID | Snapshot of payment method |
| `payment_method_name` | VARCHAR(50) | Snapshot: Cash |
| `payment_type` | VARCHAR(20) | Snapshot: cash, card, qris |
| `provider` | VARCHAR(50) | Snapshot: DANA, OVO, GOPAY |
| `amount` | DECIMAL(15,2) | Amount tendered |
| `total_amount` | DECIMAL(15,2) | Total bill |
| `change_amount` | DECIMAL(15,2) | Change returned |
| `reference_number` | VARCHAR(100) | Payment reference |
| `card_number` | VARCHAR(20) | Card last 4 digits |
| `card_holder` | VARCHAR(100) | Cardholder name |
| `status` | ENUM | completed |
| `paid_at` | TIMESTAMP | When payment was made |

---

## 4. API Design

### 4.1 Backend Endpoints

#### Transaction History List
```
GET /api/transactions
Query Params:
  - page (default: 1)
  - limit (default: 20, max: 100)
  - search (optional): search by transaction_number, order_number
  - dateFrom (optional): ISO date
  - dateTo (optional): ISO date
  - orderType (optional): dine_in, take_away, delivery

Response: Paginated list of transactions (summary only)
```

#### Transaction Detail
```
GET /api/transactions/:id
Response: Full transaction with items, modifiers, payment
```

#### Reprint Receipt
```
POST /api/transactions/:id/receipt
Response: Receipt data for printing
```

### 4.2 Frontend Routes

```
/pos/history              → Transaction List
/pos/history/:id          → Transaction Detail
```

---

## 5. Frontend UX Design

### 5.1 Transaction History List (`/pos/history`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [← Back]              Riwayat Transaksi                │
├─────────────────────────────────────────────────────────┤
│  🔍 Search transaction number or order...              │
├─────────────────────────────────────────────────────────┤
│  [Today] [Yesterday] [This Week] [This Month] [Custom]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TRX-20260811-000001                                    │
│  11 Aug 2026 • 13:21                                    │
│  Dine In • Table 05 • Cash                              │
│                                    Rp 156.000           │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  TRX-20260811-000002                                    │
│  11 Aug 2026 • 12:45                                    │
│  Take Away • QRIS                                       │
│                                    Rp 80.000            │
│                                                         │
└─────────────────────────────────────────────────────────┘
│                    [< 1 / 23 >]                         │
└─────────────────────────────────────────────────────────┘
```

**List Item Fields:**
- Transaction Number (bold)
- Date & Time
- Order Type badge
- Table (if dine_in)
- Payment Method badge
- Grand Total (right-aligned)

**States:**
- Loading: Skeleton list
- Empty: "Belum ada transaksi hari ini"
- Error: "Gagal memuat riwayat" + Retry button

### 5.2 Transaction Detail (`/pos/history/:id`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [← Kembali]           Detail Transaksi                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ══════════════════════════════════════════════════════  │
│  Transaction #TRX-20260811-000001                       │
│                                                         │
│  ✓ COMPLETED                                            │
│                                                         │
│  11 August 2026 • 13:21:35 WIB                           │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Cashier: Raka Hikmah                                    │
│  Order Type: Dine In • Table 05                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ITEM PEMESANAN                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  1x Nasi Goreng Special                   Rp 70.000      │
│     └─ Extra Egg (+Rp5.000)                             │
│     └─ Spicy Level 3 (+Rp0)                             │
│                                                         │
│  2x Es Teh Manis                        Rp 16.000       │
│     └─ Less Ice (+Rp0)                                  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Subtotal                         Rp 150.000             │
│  Promo Weekend (-10%)               -Rp 15.000          │
│  PPN (11%)                             Rp 13.500        │
│  ══════════════════════════════════════════════════════  │
│                                                         │
│  TOTAL                          Rp 156.000              │
│  ══════════════════════════════════════════════════════  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  PEMBAYARAN                                             │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Cash                                                   │
│  Total:                                    Rp 156.000   │
│  Bayar:                                   Rp 200.000   │
│  Kembalian:                                Rp  44.000   │
│                                                         │
│  PAID • 11 Aug 2026 13:21:35                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [👁 Lihat Struk]  [🖨 Cetak Ulang]                     │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Receipt Preview Modal

```
┌─────────────────────────────────────┐
│           STRUK PEMBELIAN           │
│         Restaurant Name             │
│  ─────────────────────────────────  │
│  TRX: TRX-20260811-000001           │
│  Date: 11 Aug 2026 13:21:35         │
│  Cashier: Raka Hikmah               │
│  Type: Dine In • Table 05           │
│  ─────────────────────────────────  │
│                                     │
│  1x Nasi Goreng Special   Rp 70.000 │
│     Extra Egg              +Rp5.000  │
│     Spicy Level 3         +Rp0       │
│                                     │
│  2x Es Teh Manis          Rp 16.000  │
│     Less Ice              +Rp0       │
│                                     │
│  ─────────────────────────────────  │
│  Subtotal                Rp150.000   │
│  Promo Weekend (-10%)     -Rp15.000  │
│  PPN (11%)               Rp 13.500   │
│  ─────────────────────────────────  │
│  TOTAL                   Rp156.000   │
│  ─────────────────────────────────  │
│  Cash                    Rp200.000   │
│  Kembalian                Rp44.000   │
│  ─────────────────────────────────  │
│                                     │
│       Thank You! See You Again!      │
└─────────────────────────────────────┘
         [Tutup]   [🖨 Cetak]
```

---

## 6. Backend Changes

### 6.1 New Module: Transactions

```
backend/src/modules/transactions/
├── transactions.module.ts
├── transactions.controller.ts
├── transactions.service.ts
├── dto/
│   ├── transaction-list.dto.ts
│   ├── transaction-detail.dto.ts
│   └── create-transaction.dto.ts
└── entities/
    ├── transaction.entity.ts
    ├── transaction-item.entity.ts
    ├── transaction-item-modifier.entity.ts
    └── transaction-payment.entity.ts
```

### 6.2 Snapshot Creation Trigger

Modifikasi di `payments.service.ts` atau `orders.service.ts`:

```typescript
// Saat payment completed, trigger snapshot creation
async onPaymentCompleted(orderId: string) {
  // 1. Lock order
  // 2. Verify order is ready (has items, total matches)
  // 3. Create transaction snapshot
  // 4. Update order status to completed
  // 5. Commit all in transaction
}
```

### 6.3 Service Methods

| Method | Purpose |
|--------|---------|
| `createSnapshot(orderId)` | Create all transaction records |
| `findAll(query)` | List with pagination & filters |
| `findOne(id)` | Full detail with items & payment |
| `getReceipt(id)` | Format data for receipt printing |

---

## 7. Performance Considerations

### 7.1 Database Indexes

```sql
-- Primary indexes for transaction list query
CREATE INDEX idx_transactions_number ON transactions(transaction_number);
CREATE INDEX idx_transactions_order_number ON transactions(order_number);
CREATE INDEX idx_transactions_completed_at ON transactions(completed_at);
CREATE INDEX idx_transactions_order_type ON transactions(order_type);
```

### 7.2 Pagination Strategy

- Default: 20 items per page
- Maximum: 100 items per page
- Use cursor-based pagination for better performance with large datasets
- Pre-calculate totals for date range queries

### 7.3 Query Optimization

```typescript
// Use select specific fields for list view
const listQuery = repository
  .createQueryBuilder('t')
  .select(['t.id', 't.transactionNumber', 't.orderType', 't.totalAmount', 't.completedAt'])
  .orderBy('t.completedAt', 'DESC')
  .skip(offset)
  .take(limit);

// Use relations only for detail view
const detailQuery = repository.findOne({
  where: { id },
  relations: ['items', 'items.modifiers', 'payment'],
});
```

---

## 8. Error Handling

### 8.1 Backend Errors

| Scenario | HTTP Code | Message |
|----------|-----------|---------|
| Transaction not found | 404 | Transaction tidak ditemukan |
| Invalid date range | 400 | Format tanggal tidak valid |
| Database error | 500 | Gagal memuat data |

### 8.2 Frontend States

| State | UI |
|-------|-----|
| Loading | Skeleton placeholders |
| Empty | Illustration + message |
| Error | Alert + retry button |
| Success | Transaction list/detail |

---

## 9. Edge Cases

| Case | Handling |
|------|----------|
| Payment failed after order | No snapshot created, order remains open |
| Order cancelled after payment | Payment should be refunded first |
| Duplicate payment attempt | Check existing completed payment before creating |
| Product deleted after order | Product ID still stored, name = "Deleted Product" |
| Table renamed after order | Table name snapshot preserved |
| Discount expired after order | Discount name/rate snapshot preserved |
| Tax rate changed after order | Tax snapshot preserved |

---

## 10. Files Expected to Change

### Backend
| File | Change |
|------|--------|
| `modules/transactions/*` | NEW MODULE |
| `modules/orders/orders.service.ts` | Add snapshot trigger in complete flow |
| `modules/payments/payments.service.ts` | Add payment completion hook |
| `app.module.ts` | Register transactions module |

### Frontend
| File | Change |
|------|--------|
| `routes/constants.ts` | Add history routes |
| `pages/POS/HistoryPage.tsx` | NEW |
| `pages/POS/TransactionDetailPage.tsx` | NEW |
| `api/transactions.ts` | NEW API client |
| `components/pos/history/*` | NEW components |
| `hooks/useTransactions.ts` | NEW hook |
| `store/slices/posSlice.ts` | Add history state if needed |

---

## 11. Implementation Order

1. **Database Migration** — Create transaction tables
2. **Backend: Entity** — Create transaction entities
3. **Backend: Service** — Snapshot creation logic
4. **Backend: Controller** — API endpoints
5. **Backend: Integration** — Hook into payment completion
6. **Frontend: API** — API client for transactions
7. **Frontend: List** — History list page
8. **Frontend: Detail** — Transaction detail page
9. **Frontend: Receipt** — Receipt preview & print
10. **Testing** — Integration testing

---

## 12. Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Snapshot vs Live? | **Separate Transaction Entity** (Snapshot) |
| Include Customer? | **No** — Customer snapshot not needed |
| Snapshot Scope? | **All relevant data** except customer |

---

## 13. Approval

- [x] Transaction snapshot approach approved
- [x] All relevant data to snapshot (except customer)
- [ ] Design document approved
- [ ] Implementation plan approved
