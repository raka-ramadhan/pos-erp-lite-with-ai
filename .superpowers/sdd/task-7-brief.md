# Task 7: Add Cancel Order Button to OrderSessionPage

## Files
- Modify: `pos-cashier/src/pages/POS/OrderSessionPage.tsx`
- Modify: `pos-cashier/src/api/orders.ts`

## Interfaces
- Consumes: `orderId: string`, `reason: string`
- Produces: Backend call to cancelOrder endpoint

## Implementation

### Step 1: Add cancelOrder API function

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

### Step 2: Add cancel state and modal to OrderSessionPage

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
    dispatch(clearCurrentOrder());
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

### Step 3: Add Cancel button to header

In the header section, add a cancel button next to existing buttons:
```tsx
{canEdit && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setShowCancelModal(true)}
    className="text-red-600 hover:bg-red-50"
  >
    <AlertCircle className="w-4 h-4 mr-1" />
    Batal
  </Button>
)}
```

### Step 4: Add CancelOrderModal component

Before the closing `</div>`:
```tsx
<CancelOrderModal
  isOpen={showCancelModal}
  onClose={() => setShowCancelModal(false)}
  onConfirm={handleCancelOrder}
  orderNumber={order?.orderNumber || ''}
  isLoading={cancelling}
/>
```

## Steps
1. Add cancelOrder API function
2. Add cancel state and handler to OrderSessionPage
3. Add Cancel button to header
4. Add CancelOrderModal component
5. Verify frontend builds
6. Commit
