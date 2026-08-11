# Task 6: Backend — Integrate Snapshot Trigger

## Goal
Integrate transaction snapshot creation into the payment flow so snapshots are created automatically when payment is completed.

## Files to Modify
1. `backend/src/modules/payments/payments.service.ts`
2. `backend/src/modules/transactions/transactions.service.ts`

## Approach: EventEmitter Pattern

### Why EventEmitter?
- Avoids circular dependency between PaymentsModule and TransactionsModule
- Decouples payment completion from snapshot creation
- Follows NestJS best practices

### Implementation Steps

1. **Install EventEmitterModule** if not already installed
   - Check: backend/src/app.module.ts
   - Add EventEmitterModule if missing

2. **Modify PaymentsService (payments.service.ts)**
   - Inject EventEmitter2
   - After successful payment completion, emit event:
     ```
     this.eventEmitter.emit('payment.completed', { orderId, paymentId });
     ```

3. **Modify TransactionsService (transactions.service.ts)**
   - Inject EventEmitter2
   - In constructor, listen for event:
     ```typescript
     this.eventEmitter.on('payment.completed', async (data: { orderId: string }) => {
       try {
         await this.createSnapshotFromOrder(data.orderId);
       } catch (error) {
         this.logger.error('Failed to create transaction snapshot', error);
       }
     });
     ```

## Payment Flow Check
Find the method in payments.service.ts that handles completed payment and add the emit call there.

## Global Constraints
- Don't modify existing payment logic
- Only add event emission
- Handle errors gracefully in event listener

## Steps
1. Check if EventEmitterModule is installed
2. Modify PaymentsService to emit event
3. Modify TransactionsService to listen for event
4. Verify TypeScript compilation
5. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-6-report.md
