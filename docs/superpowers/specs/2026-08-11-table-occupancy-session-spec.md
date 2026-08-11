# Table Occupancy & Active Table Session - Architecture Spec

## Context

This spec documents the recommended architecture for POS Table Occupancy and Active Table Session management based on brainstorming analysis.

---

## A. Current Architecture

### Database Level

**`dining_tables` table:**
- Has `DiningTableStatus` enum: AVAILABLE, RESERVED, CLEANING, INACTIVE
- NO `OCCUPIED` status - derived from active orders
- Table occupancy NOT stored in dining_tables

**`orders` table:**
- Has `OrderStatus` enum: OPEN, IN_PROGRESS, COMPLETED, CANCELLED
- Stores `tableId` FK to dining_tables
- One source of truth for "which table has active order"

### Backend Level

**`findAllForPOS()` method:**
- Derives OCCUPIED status by querying active orders
- Returns tables with activeOrder info

**`assignTable()` method:**
- Has validation logic but NOT used during order creation
- NOT wrapped in transaction

**`changeTable()` method:**
- Exists with validation
- NOT wrapped in transaction

### Frontend Level

**TablesPage:**
- Sets table in Redux → creates order → navigates
- Direct call to `updateTableStatus('occupied')` - bypasses backend validation

---

## B. Problems Identified

1. **No atomic table assignment** - Order created, THEN table status updated
2. **Race condition** - Two cashiers could create orders for same table
3. **`assignTable()` bypassed** - Backend validation exists but unused
4. **Frontend status update not transactional**
5. **No pessimistic locking** - Concurrent selection not prevented

---

## C. Recommended Business Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATE DINE-IN ORDER                      │
│                                                              │
│  1. Cashier selects AVAILABLE table                         │
│  2. Backend: BEGIN TRANSACTION                              │
│  3. Backend: SELECT table WITH LOCK (pessimistic_write)    │
│  4. Backend: Check no active order exists                    │
│  5. Backend: CREATE order with tableId                      │
│  6. Backend: COMMIT                                         │
│  7. Return order to frontend                                │
└─────────────────────────────────────────────────────────────┘
```

---

## D. Table Lifecycle

**DO NOT maintain separate `table.status` as source of truth.**

```
Table Status Logic (Computed, NOT Stored):
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   AVAILABLE ←── No active order has this tableId          │
│                                                            │
│   OCCUPIED ←── Active order (OPEN | IN_PROGRESS) exists  │
│               with this tableId                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Keep existing `DiningTableStatus` for Dashboard (reserved, cleaning, maintenance).**
**POS derives occupancy from orders.**

---

## E. Order Lifecycle

**No changes needed:**

```
OPEN → IN_PROGRESS → COMPLETED
         ↓
      CANCELLED
```

- **OPEN:** Initial order, being built
- **IN_PROGRESS:** Items being added/modified
- **COMPLETED:** Payment received
- **CANCELLED:** Order abandoned/cancelled

---

## F. Table ↔ Order Relationship

**One Order = One Table (Strict)**

```typescript
// 1 Order → 1 Dining Table (for DINE_IN)
// 1 Order → No Table (for TAKE_AWAY)
```

**Constraints:**
1. Unique active order per table via application logic
2. Use `assignTable()` as single entry point

---

## G. Cancel Flow

**Cancel Before Payment Only**

```
CANCEL ORDER:
┌────────────────────────────────────────────────────────────┐
│  PRECONDITION: Order status = OPEN | IN_PROGRESS           │
│  PRECONDITION: Order NOT paid (no payment record)          │
│                                                              │
│  1. BEGIN TRANSACTION                                       │
│  2. UPDATE order SET status = 'cancelled'                │
│  3. DELETE order_items (cascade)                           │
│  4. COMMIT                                                  │
│                                                              │
│  POST-CONDITION: Table = AVAILABLE (no active order)       │
└────────────────────────────────────────────────────────────┘
```

**Business Rules:**
- ✅ Cancel allowed before payment
- ❌ Cancel NOT allowed after payment (requires refund - Sprint 9)
- ✅ Cancellation reason required
- ✅ Any cashier can cancel (no additional permission for MVP)

---

## H. Payment Flow

**Two-Step Completion**

```
PAYMENT SUCCESS:
┌────────────────────────────────────────────────────────────┐
│                                                              │
│  Step 1: Payment Recorded                                  │
│    • Create payment record                                  │
│    • Order status → COMPLETED                              │
│    • Table still occupied (for receipt/review)              │
│                                                              │
│  Step 2: Order Completion (Sprint 8)                       │
│    • Print/Save receipt                                    │
│    • Table → AVAILABLE                                     │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## I. Change Table Flow

**Atomic Change with Transaction**

```
CHANGE TABLE (A01 → A05):
┌────────────────────────────────────────────────────────────┐
│  1. BEGIN TRANSACTION                                       │
│  2. SELECT Order for A01 WITH LOCK                         │
│  3. SELECT Table A05 WITH LOCK                             │
│  4. Verify A05 has no active order                         │
│  5. UPDATE order SET tableId = A05                         │
│  6. COMMIT                                                  │
│                                                              │
│  RESULT: A01 = AVAILABLE, A05 = OCCUPIED                   │
└────────────────────────────────────────────────────────────┘
```

---

## J. Open Existing Order

**Already implemented correctly:**

```
Backend: findAllForPOS() → returns tables with activeOrder
Frontend: handleSelectOccupiedTable() → navigate to order
```

---

## K. Concurrency Protection

**Pessimistic Locking + Application Logic**

```typescript
// In assignTable/changeTable
const order = await manager.findOne(Order, {
  where: { id: orderId },
  lock: { mode: 'pessimistic_write' },
});

// Check table availability with lock
const existingOrder = await manager.createQueryBuilder(Order, 'order')
  .setLock('pessimistic_write')
  .where('order.tableId = :tableId', { tableId })
  .andWhere('order.orderStatus IN (:...statuses)', { statuses })
  .getOne();
```

---

## L. Database Impact

**Minimal changes needed:**

1. Existing `orders` table has `table_id` column ✅
2. Existing `DiningTableStatus` enum ✅
3. Existing Payment table ✅

**No new tables or columns required.**

---

## M. Backend Impact

### Changes Needed:

1. **Modify `assignTable()`** - Add pessimistic lock + transaction
2. **Modify `changeTable()`** - Add pessimistic lock + transaction
3. **Create `cancelOrder()` endpoint** - With transaction + payment check
4. **Wire `createOrder`** - Use `assignTable()` for dine-in orders

---

## N. Frontend Impact

### Changes Needed:

1. **TablesPage** - Remove direct status update, use backend flow
2. **Add Cancel Order button** - To OrderSessionPage
3. **Add CancelOrderModal** - Confirmation dialog with reason

---

## O. Risks

1. **Race condition during rapid table selection** - Mitigated by pessimistic lock
2. **Stale state in TanStack Query** - Use `refetchOnWindowFocus: true`
3. **Concurrent payment + cancel** - Payment transaction checks order status first
4. **Browser back button** - Order persists in DB, user can navigate back

---

## P. Implementation Plan

See: `docs/superpowers/plans/2026-08-11-table-occupancy-session.md`

---

**Spec created:** 2026-08-11
**Status:** Ready for Implementation
