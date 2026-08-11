# Task 5: Backend — Transaction Controller & Module

## Goal
Create the controller and module to expose the transaction API endpoints.

## Files to Create
1. `backend/src/modules/transactions/transactions.controller.ts`
2. `backend/src/modules/transactions/transactions.module.ts`

## Controller Endpoints
```
GET /api/transactions          - List transactions (paginated, filterable)
GET /api/transactions/:id      - Get transaction detail
GET /api/transactions/:id/receipt - Get receipt data
```

## Controller Requirements
- Use @Controller('transactions')
- Use @UseGuards(JwtAuthGuard, PermissionGuard)
- Use @RequirePermission('use_cashier')
- Use @Get, @Param, @Query decorators
- Inject TransactionsService
- Use ParseUUIDPipe for id parameter

## Module Requirements
- Use @Module decorator
- Import TypeOrmModule.forFeature with all 10 entities:
  - Transaction, TransactionItem, TransactionItemModifier, TransactionPayment
  - Order, OrderItem, Payment, Discount, Tax, User
- Register controller and service
- Export TransactionsService

## Registration
Add TransactionsModule to imports in: backend/src/app.module.ts

## Global Constraints
- Follow existing controller/module patterns
- Use same guards and decorators as other controllers

## Steps
1. Create transactions.controller.ts
2. Create transactions.module.ts
3. Update app.module.ts to import TransactionsModule
4. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-5-report.md
