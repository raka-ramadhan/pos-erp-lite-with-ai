# Task 2: Backend — Transaction Entities

## Goal
Create 4 TypeORM entity files for the transaction tables created in Task 1.

## Files to Create
1. `backend/src/modules/transactions/entities/transaction.entity.ts`
2. `backend/src/modules/transactions/entities/transaction-item.entity.ts`
3. `backend/src/modules/transactions/entities/transaction-item-modifier.entity.ts`
4. `backend/src/modules/transactions/entities/transaction-payment.entity.ts`

## Entity Details

### Transaction Entity (transaction.entity.ts)
- @Entity('transactions')
- Use @PrimaryGeneratedColumn('uuid') for id
- Use @Column with exact types matching migration
- Enums: TransactionOrderType (DINE_IN, TAKE_AWAY, DELIVERY), DiscountType (PERCENTAGE, FIXED)
- Relations: @OneToMany to TransactionItem, TransactionPayment
- Use CreateDateColumn for created_at

### TransactionItem Entity (transaction-item.entity.ts)
- @Entity('transaction_items')
- @ManyToOne to Transaction
- Columns match migration: productId, productName, variantName, quantity, unitPrice, subtotal, notes, sortOrder
- @OneToMany to TransactionItemModifier

### TransactionItemModifier Entity (transaction-item-modifier.entity.ts)
- @Entity('transaction_item_modifiers')
- @ManyToOne to TransactionItem
- Columns: modifierId, modifierName, quantity, unitPrice, totalAmount

### TransactionPayment Entity (transaction-payment.entity.ts)
- @Entity('transaction_payments')
- @ManyToOne to Transaction
- Enum: TransactionPaymentStatus (PENDING, COMPLETED, FAILED, REFUNDED)
- Columns match migration

## Global Constraints
- Follow existing entity patterns in: backend/src/modules/*/entities/*.ts
- Use TypeORM decorators
- Export enums from entity files

## Steps
1. Create the directory: backend/src/modules/transactions/entities/
2. Create all 4 entity files
3. Check existing entities for naming conventions and patterns
4. Commit

## Report Contract
Write implementation report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-2-report.md
