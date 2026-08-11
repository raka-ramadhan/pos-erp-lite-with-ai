# Task 1: Database Migration — Create Transaction Tables

## Goal
Create migration file for 4 new tables: transactions, transaction_items, transaction_item_modifiers, transaction_payments

## Files to Create
- `backend/src/database/migrations/20260811120000-create-transactions-table.ts`

## Migration Details

### 1. transactions table
Columns:
- id (uuid, PK, auto-generate)
- transaction_number (varchar 25, unique)
- order_id (uuid)
- order_number (varchar 20)
- order_type (enum: dine_in, take_away, delivery)
- table_id (uuid, nullable)
- table_code (varchar 20, nullable)
- table_name (varchar 50, nullable)
- cashier_id (uuid, nullable)
- cashier_name (varchar 100, nullable)
- subtotal (decimal 15,2)
- discount_id (uuid, nullable)
- discount_name (varchar 100, nullable)
- discount_type (enum: percentage, fixed, nullable)
- discount_value (decimal 10,2, nullable)
- discount_amount (decimal 15,2)
- tax_id (uuid, nullable)
- tax_name (varchar 50, nullable)
- tax_rate (decimal 5,2, nullable)
- tax_amount (decimal 15,2)
- total_amount (decimal 15,2)
- notes (text, nullable)
- ordered_at (timestamp)
- completed_at (timestamp)
- created_at (timestamp)

Indexes:
- IDX_TRANSACTION_NUMBER on transaction_number
- IDX_ORDER_NUMBER on order_number
- IDX_COMPLETED_AT on completed_at
- IDX_ORDER_TYPE on order_type

### 2. transaction_items table
Columns:
- id (uuid, PK)
- transaction_id (uuid, FK to transactions)
- product_id (uuid)
- product_name (varchar 100)
- variant_name (varchar 100, nullable)
- quantity (int)
- unit_price (decimal 12,2)
- subtotal (decimal 12,2)
- notes (text, nullable)
- sort_order (int)
- created_at (timestamp)

FK: transaction_id references transactions(id) ON DELETE CASCADE

### 3. transaction_item_modifiers table
Columns:
- id (uuid, PK)
- transaction_item_id (uuid, FK)
- modifier_id (uuid)
- modifier_name (varchar 100)
- quantity (int)
- unit_price (decimal 12,2)
- total_amount (decimal 12,2)
- created_at (timestamp)

FK: transaction_item_id references transaction_items(id) ON DELETE CASCADE

### 4. transaction_payments table
Columns:
- id (uuid, PK)
- transaction_id (uuid, FK)
- payment_method_id (uuid)
- payment_method_name (varchar 50)
- payment_type (varchar 20)
- provider (varchar 50, nullable)
- amount (decimal 15,2)
- total_amount (decimal 15,2)
- change_amount (decimal 15,2)
- reference_number (varchar 100, nullable)
- card_number (varchar 20, nullable)
- card_holder (varchar 100, nullable)
- status (enum: pending, completed, failed, refunded)
- paid_at (timestamp)
- created_at (timestamp)

FK: transaction_id references transactions(id) ON DELETE CASCADE

## Global Constraints
- Backend Port: 3000
- Database: erp_lite via MCP
- Use TypeORM migration pattern from existing migrations

## Steps
1. Create migration file with complete code
2. Run migration: cd backend && npm run migration:run
3. Verify tables created successfully
4. Commit

## Report Contract
Write full implementation report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-1-report.md
