# Task 3: Backend — Transaction DTOs

## Goal
Create DTOs for transaction API requests and responses.

## Files to Create
1. `backend/src/modules/transactions/dto/transaction-list-query.dto.ts`
2. `backend/src/modules/transactions/dto/transaction-response.dto.ts` (contains all DTOs)

## DTO Specifications

### TransactionListQueryDto (transaction-list-query.dto.ts)
```typescript
class TransactionListQueryDto {
  page?: number = 1
  limit?: number = 20
  search?: string
  dateFrom?: string  // ISO date string
  dateTo?: string    // ISO date string
  orderType?: TransactionOrderType  // from transaction.entity.ts
}
```
- Use @IsOptional, @Transform, @IsString, @IsDateString decorators
- Use class-transformer for number conversion

### DTOs in transaction-response.dto.ts
- TransactionSummaryDto
- TransactionItemModifierDto
- TransactionItemDto
- TransactionPaymentDto
- DiscountInfoDto
- TaxInfoDto
- TransactionDetailDto
- PaginatedTransactionDto

All types should match the entity structure from Task 2.

## Global Constraints
- Follow existing DTO patterns in: backend/src/modules/*/dto/
- Use class-validator decorators

## Steps
1. Create directory: backend/src/modules/transactions/dto/
2. Create DTO files
3. Export from index.ts
4. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-3-report.md
