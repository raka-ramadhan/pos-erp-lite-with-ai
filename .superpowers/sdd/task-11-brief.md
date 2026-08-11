# Task 11: Frontend — Navigation & Integration

## Goal
Add History navigation to POS layout and update PaymentPage flow.

## Files to Modify
1. `pos-cashier/src/components/layout/POSLayout.tsx` - Add History menu item
2. `pos-cashier/src/pages/POS/PaymentPage.tsx` - Update payment success flow

## POSLayout Changes
Add a navigation link to History:
- Icon: Clock/History icon (from Lucide)
- Label: "Riwayat"
- Route: /pos/history
- Use NavLink for active state styling

Find the existing navigation section and add the History link.

## PaymentPage Changes
After successful payment, update the success state:
1. Show success message
2. Add link/button to view transaction history
3. Optionally show the transaction number

The goal is to guide the cashier to the history page after completing a payment.

## Global Constraints
- Follow existing POSLayout patterns
- Use ROUTES.POS_HISTORY from constants

## Steps
1. Add History nav link to POSLayout.tsx
2. Update PaymentPage.tsx to show history link after success
3. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-11-report.md
