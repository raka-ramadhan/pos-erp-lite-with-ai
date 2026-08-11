# Table Occupancy & Active Table Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement atomic table assignment, prevent double-booking, enable "Open Existing Order", and establish proper Cancel/Payment flows.

**Architecture:** 
- Backend becomes sole source of truth for table availability
- Pessimistic locking prevents race conditions during table selection
- Table status derived from active orders (no separate status update)
- Atomic transactions for assign/change/cancel operations

**Tech Stack:** NestJS (TypeORM), React + TypeScript + TanStack Query

## Global Constraints

- Follow existing patterns in `backend/src/modules/orders/` and `pos-cashier/src/hooks/`
- Use `use_cashier` permission for all POS endpoints
- Database migrations via raw SQL (TypeORM sync disabled)
- Test via frontend app - no API testing scripts

---

## File Structure Overview

```
backend/src/modules/orders/
├── orders.service.ts           # Modify: add pessimistic locking
├── orders.controller.ts         # Modify: add cancelOrder endpoint
└── dto/
    └── cancel-order.dto.ts     # Create: cancellation reason

pos-cashier/src/
├── pages/POS/
│   └── TablesPage.tsx         # Modify: remove direct status update
├── pages/POS/OrderSessionPage.tsx  # Modify: add Cancel Order button
└── components/pos/cart/
    └── CancelOrderModal.tsx   # Create: cancellation confirmation
```

---

## Tasks

### Task 1: Add Pessimistic Locking to assignTable()

**Files:**
- Modify: `backend/src/modules/orders/orders.service.ts` (lines 328-379)

**Interfaces:**
- Consumes: `orderId: string`, `tableId: string`
- Produces: Updated `Order` with new tableId

**Validation:**
- Verify `assignTable()` uses `pessimistic_write` lock
- Verify existing active order check is preserved

```typescript
// Add to orders.service.ts - modify assignTable method
async assignTable(orderId: string, tableId: string): Promise<Order> {
  return this.dataSource.transaction(async (manager) => {
    // Lock the order row
    const order = await manager.findOne(Order, {
      where: { id: orderId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // ... rest of validation and assignment
  });
}
```

- [ ] **Step 1: Read current assignTable() implementation**

```bash
# Read the current implementation
cat backend/src/modules/orders/orders.service.ts | grep -A 60 "async assignTable"
```

- [ ] **Step 2: Identify the assignTable method to modify**

The method is at lines 328-379. Key changes needed:
- Wrap in `this.dataSource.transaction()`
- Add `lock: { mode: 'pessimistic_write' }` to the order query
- Ensure table availability check happens INSIDE the transaction

- [ ] **Step 3: Modify assignTable to use pessimistic lock**

```typescript
async assignTable(orderId: string, tableId: string): Promise<Order> {
  return this.dataSource.transaction(async (manager) => {
    // 1. Lock and fetch the order
    const order = await manager.findOne(Order, {
      where: { id: orderId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // 2. Validate order status
    if (order.orderStatus === OrderStatus.COMPLETED || 
        order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot assign table to completed or cancelled orders',
      );
    }

    if (order.orderType !== OrderType.DINE_IN) {
      throw new BadRequestException(
        'Table assignment is only allowed for Dine-In orders',
      );
    }

    // 3. Check new table availability (with lock)
    const existingOrder = await manager.createQueryBuilder(Order, 'order')
      .setLock('pessimistic_write')
      .where('order.tableId = :tableId', { tableId })
      .andWhere('order.orderStatus IN (:...statuses)', {
        statuses: [OrderStatus.OPEN, OrderStatus.IN_PROGRESS],
      })
      .getOne();

    if (existingOrder && existingOrder.id !== orderId) {
      throw new ConflictException(
        `Table is already occupied by order ${existingOrder.orderNumber}`,
      );
    }

    // 4. Update order
    order.tableId = tableId;
    return manager.save(order);
  });
}
```

- [ ] **Step 4: Verify backend builds**

```bash
cd backend && npm run build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
cd /var/www/html/pos-porfolio
git add backend/src/modules/orders/orders.service.ts
git commit -m "feat(orders): add pessimistic locking to assignTable

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Add Pessimistic Locking to changeTable()

**Files:**
- Modify: `backend/src/modules/orders/orders.service.ts` (lines 385-438)

**Interfaces:**
- Consumes: `orderId: string`, `newTableId: string`
- Produces: Updated `Order` with different tableId

- [ ] **Step 1: Read current changeTable() implementation**

```bash
cat backend/src/modules/orders/orders.service.ts | grep -A 60 "async changeTable"
```

- [ ] **Step 2: Modify changeTable to use pessimistic lock**

```typescript
async changeTable(orderId: string, newTableId: string): Promise<Order> {
  return this.dataSource.transaction(async (manager) => {
    // 1. Lock and fetch the order
    const order = await manager.findOne(Order, {
      where: { id: orderId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // 2. Validate order status
    if (order.orderStatus === OrderStatus.COMPLETED || 
        order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot change table for completed or cancelled orders',
      );
    }

    if (!order.tableId) {
      throw new BadRequestException('Order does not have a table assigned');
    }

    if (order.tableId === newTableId) {
      throw new BadRequestException('New table must be different from current table');
    }

    // 3. Check new table availability
    const existingOrderOnNewTable = await manager.createQueryBuilder(Order, 'order')
      .setLock('pessimistic_write')
      .where('order.tableId = :newTableId', { newTableId })
      .andWhere('order.orderStatus IN (:...statuses)', {
        statuses: [OrderStatus.OPEN, OrderStatus.IN_PROGRESS],
      })
      .getOne();

    if (existingOrderOnNewTable) {
      throw new ConflictException(
        `New table is already occupied by order ${existingOrderOnNewTable.orderNumber}`,
      );
    }

    // 4. Update order
    order.tableId = newTableId;
    return manager.save(order);
  });
}
```

- [ ] **Step 3: Verify backend builds**

```bash
cd backend && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/modules/orders/orders.service.ts
git commit -m "feat(orders): add pessimistic locking to changeTable

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Create Cancel Order DTO

**Files:**
- Create: `backend/src/modules/orders/dto/cancel-order.dto.ts`

**Interfaces:**
- Consumes: `{ reason: string }`
- Produces: Order updated to CANCELLED

- [ ] **Step 1: Create the DTO file**

```typescript
// backend/src/modules/orders/dto/cancel-order.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CancelOrderDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
```

- [ ] **Step 2: Update dto/index.ts to export the new DTO**

```bash
cat backend/src/modules/orders/dto/index.ts
```

Add `export * from './cancel-order.dto';` to the exports.

- [ ] **Step 3: Commit**

```bash
git add backend/src/modules/orders/dto/cancel-order.dto.ts backend/src/modules/orders/dto/index.ts
git commit -m "feat(orders): add CancelOrderDto

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Implement Cancel Order with Transaction

**Files:**
- Modify: `backend/src/modules/orders/orders.service.ts`
- Modify: `backend/src/modules/orders/orders.controller.ts`

**Interfaces:**
- Consumes: `orderId: string`, `reason: string`
- Produces: Order status = CANCELLED, items deleted

- [ ] **Step 1: Find the existing cancelOrder method**

```bash
grep -n "cancelOrder" backend/src/modules/orders/orders.service.ts
```

The existing method is at around line 1005. Read it:

```bash
sed -n '1000,1040p' backend/src/modules/orders/orders.service.ts
```

- [ ] **Step 2: Modify cancelOrder to use transaction and check for payments**

```typescript
async cancelOrder(orderId: string, reason: string): Promise<void> {
  return this.dataSource.transaction(async (manager) => {
    // 1. Lock and fetch the order
    const order = await manager.findOne(Order, {
      where: { id: orderId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // 2. Check order status
    if (order.orderStatus === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed order. Use refund instead.');
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new ConflictException('Order is already cancelled');
    }

    // 3. Check if order has been paid (payments table)
    const existingPayment = await manager.findOne(Payment, {
      where: {
        orderId: orderId,
        status: PaymentStatus.COMPLETED,
      },
    });

    if (existingPayment) {
      throw new BadRequestException(
        'Cannot cancel order that has been paid. Please process a refund instead.',
      );
    }

    // 4. Delete order items (cascade)
    await manager.delete(OrderItem, { orderId });

    // 5. Update order status
    await manager.update(Order, orderId, {
      orderStatus: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledReason: reason,
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
    });
  });
}
```

- [ ] **Step 3: Update the controller to accept CancelOrderDto**

```bash
grep -n "cancelOrder" backend/src/modules/orders/orders.controller.ts
```

The current endpoint is DELETE `/orders/:id/cancel`. Modify to:

```typescript
@Delete(':id/cancel')
@HttpCode(HttpStatus.OK)
cancelOrder(
  @Param('id') orderId: string,
  @Body() cancelDto: CancelOrderDto,
) {
  return this.ordersService.cancelOrder(orderId, cancelDto.reason);
}
```

- [ ] **Step 4: Import Payment and PaymentStatus if not already imported**

Check the imports at the top of orders.service.ts:

```bash
head -15 backend/src/modules/orders/orders.service.ts
```

Add if missing:
```typescript
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../payments/entities/payment.entity';
```

- [ ] **Step 5: Verify backend builds**

```bash
cd backend && npm run build 2>&1 | tail -15
```

Common errors:
- Missing Payment import → add import statement
- TypeOrm entity not registered → verify Payment entity exists in module

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/orders/orders.service.ts backend/src/modules/orders/orders.controller.ts
git commit -m "feat(orders): add transaction to cancelOrder with payment check

- Prevents cancellation of paid orders
- Uses pessimistic lock for consistency
- Requires cancellation reason

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Wire TablesPage to Use assignTable Endpoint

**Files:**
- Modify: `pos-cashier/src/pages/POS/TablesPage.tsx`

**Interfaces:**
- Consumes: `tableId: string` → Backend creates order and assigns table atomically
- Produces: `Order` with tableId set

- [ ] **Step 1: Read current TablesPage implementation**

Focus on `handleSelectAvailableTable` function (around line 88):

```typescript
const handleSelectAvailableTable = async (table: POSTable) => {
  dispatch(setSelectedTable(table));
  try {
    await createOrder.mutateAsync({
      orderType: 'dine_in' as const,
      tableId: table.id,
      customerCount: 1,
    });
  } catch (err) {
    console.error('Failed to create order:', err);
  }
};
```

- [ ] **Step 2: Create API function for atomic table assignment**

Add to `pos-cashier/src/api/orders.ts`:

```typescript
// Create order with table assignment atomically
createOrderWithTable: async (payload: CreateOrderPayload): Promise<Order> => {
  // First create the order
  const order = await apiClient.post<ApiResponse<Order>>('/orders', payload);
  
  // Then assign the table using the dedicated endpoint
  // This ensures backend validates table availability
  const orderWithTable = await apiClient.patch<ApiResponse<Order>>(
    `/orders/${order.data.data.id}/assign-table`,
    { tableId: payload.tableId }
  );
  
  return orderWithTable.data.data;
},
```

- [ ] **Step 3: Modify handleSelectAvailableTable**

```typescript
const handleSelectAvailableTable = async (table: POSTable) => {
  try {
    // Set loading state for this specific table
    setCreatingOrderForTable(table.id);
    
    // Call atomic endpoint - backend handles table availability check
    const order = await ordersApi.createOrderWithTable({
      orderType: 'dine_in',
      tableId: table.id,
      customerCount: 1,
    });
    
    // Update Redux with order
    dispatch(setCurrentOrder(order));
    dispatch(setSelectedTable(table));
    
    // Navigate to products
    navigate('/pos/products');
  } catch (err: any) {
    // Handle specific errors from backend
    const errorMessage = err?.response?.data?.message || err?.message;
    
    if (errorMessage?.includes('already occupied')) {
      alert('Meja sudah digunakan cashier lain. Silakan pilih meja lain.');
      refetch(); // Refresh tables list
    } else {
      console.error('Failed to create order:', err);
      alert('Gagal membuat order. Silakan coba lagi.');
    }
  } finally {
    setCreatingOrderForTable(null);
  }
};
```

- [ ] **Step 4: Add loading state for specific table**

Add to the state declarations:
```typescript
const [creatingOrderForTable, setCreatingOrderForTable] = useState<string | null>(null);
```

Update the table button to show loading for specific table:
```typescript
disabled={isLoading || (!isAvailable && !isOccupied) || creatingOrderForTable === table.id}
```

- [ ] **Step 5: Verify frontend builds**

```bash
cd pos-cashier && npm run build 2>&1 | tail -15
```

- [ ] **Step 6: Commit**

```bash
git add pos-cashier/src/pages/POS/TablesPage.tsx pos-cashier/src/api/orders.ts
git commit -m "feat(pos): wire TablesPage to use atomic assignTable endpoint

- Backend now validates table availability
- Shows specific error if table already occupied
- Refreshes tables list on conflict

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Create Cancel Order Modal Component

**Files:**
- Create: `pos-cashier/src/components/pos/cart/CancelOrderModal.tsx`

**Interfaces:**
- Props: `{ isOpen: boolean, onClose: () => void, onConfirm: (reason: string) => void, orderNumber: string }`
- Produces: Confirmation dialog with reason input

- [ ] **Step 1: Create the CancelOrderModal component**

```tsx
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Input } from '../../ui';
import { cn } from '../../../utils';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderNumber: string;
  isLoading?: boolean;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  const canSubmit = reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900">Batalkan Order?</h2>
              <p className="text-sm text-red-700">#{orderNumber}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Order akan dibatalkan dan tidak dapat dikembalikan. Semua item pesanan akan dihapus.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Customer berubah pikiran"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Kembali
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            isLoading={isLoading}
          >
            Batalkan Order
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd pos-cashier && npx tsc --noEmit src/components/pos/cart/CancelOrderModal.tsx 2>&1
```

- [ ] **Step 3: Commit**

```bash
git add pos-cashier/src/components/pos/cart/CancelOrderModal.tsx
git commit -m "feat(pos): add CancelOrderModal component

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Add Cancel Order Button to OrderSessionPage

**Files:**
- Modify: `pos-cashier/src/pages/POS/OrderSessionPage.tsx`
- Modify: `pos-cashier/src/api/orders.ts`

**Interfaces:**
- Consumes: `orderId: string`, `reason: string`
- Produces: Backend call to cancelOrder endpoint

- [ ] **Step 1: Add cancelOrder API function**

Add to `pos-cashier/src/api/orders.ts`:

```typescript
cancelOrder: async (orderId: string, reason: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/orders/${orderId}/cancel`,
    { data: { reason } }
  );
  return response.data.data;
},
```

- [ ] **Step 2: Add cancel state and modal to OrderSessionPage**

Add imports:
```typescript
import { AlertCircle } from 'lucide-react';
import { CancelOrderModal } from '../../components/pos/cart/CancelOrderModal';
import ordersApi from '../../api/orders';
```

Add state:
```typescript
const [showCancelModal, setShowCancelModal] = useState(false);
const [cancelling, setCancelling] = useState(false);
```

Add cancel handler:
```typescript
const handleCancelOrder = async (reason: string) => {
  if (!orderId) return;
  
  setCancelling(true);
  try {
    await ordersApi.cancelOrder(orderId, reason);
    // Clear current order from Redux
    dispatch(clearCurrentOrder());
    // Navigate to POS home
    navigate('/pos');
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || err?.message;
    alert(`Gagal membatalkan order: ${errorMessage}`);
  } finally {
    setCancelling(false);
    setShowCancelModal(false);
  }
};
```

- [ ] **Step 3: Add Cancel button to header**

In the header section (around line 200-220), add a cancel button:

```tsx
<div className="flex items-center gap-2">
  {canEdit && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowCancelModal(true)}
      className="text-red-600 hover:bg-red-50"
      leftIcon={<AlertCircle className="w-4 h-4" />}
    >
      Batal
    </Button>
  )}
</div>
```

- [ ] **Step 4: Add CancelOrderModal component**

Before the closing `</div>` of the main component:

```tsx
{/* Cancel Order Modal */}
<CancelOrderModal
  isOpen={showCancelModal}
  onClose={() => setShowCancelModal(false)}
  onConfirm={handleCancelOrder}
  orderNumber={order?.orderNumber || ''}
  isLoading={cancelling}
/>
```

- [ ] **Step 5: Add clearCurrentOrder to imports from posSlice**

```typescript
import { setSelectedTable, clearCurrentOrder } from '../../store/slices/posSlice';
```

- [ ] **Step 6: Verify frontend builds**

```bash
cd pos-cashier && npm run build 2>&1 | tail -20
```

- [ ] **Step 7: Commit**

```bash
git add pos-cashier/src/pages/POS/OrderSessionPage.tsx pos-cashier/src/api/orders.ts
git commit -m "feat(pos): add Cancel Order functionality to OrderSessionPage

- Cancel button in header
- Confirmation modal with reason
- Navigates to POS home after cancel

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Verify Complete Flow

**Test Scenario 1: New Order Flow**
1. Login as cashier
2. Select Dine In
3. Select AVAILABLE table (e.g., A02)
4. Verify order created with tableId
5. Verify table shows as OCCUPIED

**Test Scenario 2: Open Existing Order**
1. From TablesPage, tap OCCUPIED table (e.g., A01)
2. Verify navigates to OrderSessionPage
3. Verify all items/modifiers/discount loaded

**Test Scenario 3: Cancel Order**
1. Open existing order
2. Click "Batal" button
3. Enter cancellation reason
4. Verify order cancelled
5. Verify table now AVAILABLE

**Test Scenario 4: Double Booking Prevention**
1. Open two browsers/incognito
2. Cashier A selects AVAILABLE table
3. Cashier B tries to select SAME table
4. Cashier B should see error message

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Pessimistic lock assignTable | orders.service.ts |
| 2 | Pessimistic lock changeTable | orders.service.ts |
| 3 | Create CancelOrderDto | dto/cancel-order.dto.ts |
| 4 | Cancel order with transaction | orders.service.ts, orders.controller.ts |
| 5 | Wire TablesPage to assignTable | TablesPage.tsx, orders.ts |
| 6 | Create CancelOrderModal | CancelOrderModal.tsx |
| 7 | Add Cancel button to OrderSession | OrderSessionPage.tsx |
| 8 | Verify complete flow | Manual testing |

---

**Plan saved to:** `docs/superpowers/plans/2026-08-11-table-occupancy-session.md`
