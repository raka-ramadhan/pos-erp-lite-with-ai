# Task 4: Backend — Transaction Service (Snapshot Creation)

## Goal
Create the TransactionsService with snapshot creation logic.

## File to Create
- `backend/src/modules/transactions/transactions.service.ts`

## Service Methods Required

### 1. generateTransactionNumber()
- Format: TRX-YYYYMMDD-XXXXXX
- Use pessimistic lock for concurrency
- Return next sequence number

### 2. createSnapshotFromOrder(orderId: string): Promise<Transaction>
- Check if transaction already exists for order
- Use DataSource.transaction for atomic operation
- Fetch order with items and modifiers
- Fetch completed payment with payment method
- Get cashier name from User
- Create transaction record with ALL snapshot data
- Create transaction items with modifiers
- Create transaction payment record
- Return saved transaction

### 3. findAll(query: TransactionListQueryDto): Promise<PaginatedTransactionDto>
- Pagination with page, limit
- Search by transaction_number or order_number
- Date range filter (completedAt)
- Order type filter
- Return paginated results

### 4. findOne(id: string): Promise<TransactionDetailDto>
- Fetch with relations: items.modifiers, payments
- Order items by sortOrder, modifiers by createdAt
- Map to detail DTO

### 5. getReceipt(id: string): Promise<TransactionDetailDto>
- Same as findOne

### 6. hasTransactionForOrder(orderId: string): Promise<boolean>
- Check if transaction exists for order

## Dependencies to Inject
- Transaction, TransactionItem, TransactionItemModifier, TransactionPayment (repos)
- Order, OrderItem (repos)
- Payment, PaymentMethod (repos)
- Discount, Tax (repos)
- User (repo)
- DataSource

## Global Constraints
- Follow existing service patterns
- Use Logger from @nestjs/common
- All async methods return Promise

## Steps
1. Create transactions.service.ts with all methods
2. Verify TypeScript compilation
3. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-4-report.md
