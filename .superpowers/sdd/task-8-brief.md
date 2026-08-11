# Task 8: Verify Complete Flow

## Description

Manual testing task to verify the complete table occupancy and cancel order flow works correctly.

## Test Scenarios

### Test Scenario 1: New Order Flow
1. Login as cashier
2. Select Dine In
3. Select AVAILABLE table (e.g., A02)
4. Verify order created with tableId
5. Verify table shows as OCCUPIED
6. Navigate to products page
7. Verify order is active

### Test Scenario 2: Open Existing Order
1. From TablesPage, tap OCCUPIED table (e.g., A01)
2. Verify navigates to OrderSessionPage
3. Verify all items/modifiers/discount loaded
4. Verify table name is shown

### Test Scenario 3: Cancel Order
1. Open existing order
2. Click "Batal" button
3. Verify CancelOrderModal appears
4. Enter cancellation reason
5. Click "Batalkan Order"
6. Verify order cancelled
7. Verify table now AVAILABLE
8. Verify redirected to POS home

### Test Scenario 4: Double Booking Prevention
1. Open two browsers/incognito windows
2. Cashier A selects AVAILABLE table
3. While A's request is processing, Cashier B tries to select SAME table
4. Cashier B should see error message: "Meja sudah digunakan cashier lain"

## Expected Results

| Scenario | Expected Result |
|----------|----------------|
| New Order | Order created, table shows OCCUPIED |
| Open Existing | Order details loaded, navigate to session |
| Cancel Order | Order CANCELLED, table AVAILABLE |
| Double Booking | Second cashier gets conflict error |

## Steps
1. Run backend and frontend
2. Execute test scenarios
3. Document any issues
4. Mark task complete if all tests pass
