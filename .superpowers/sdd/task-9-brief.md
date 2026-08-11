# Task 9: Frontend — History Page (List)

## Goal
Create the transaction history list page for POS Cashier.

## Files to Create/Modify
1. Create: `pos-cashier/src/pages/POS/HistoryPage.tsx`
2. Modify: `pos-cashier/src/routes/constants.ts` - Add POS_HISTORY, POS_TRANSACTION_DETAIL routes
3. Modify: `pos-cashier/src/AppRoutes.tsx` or router file - Add route for HistoryPage

## Page Requirements

### Header
- Back button to /pos
- Title: "Riwayat Transaksi"

### Search
- Input field with search icon
- Placeholder: "Cari nomor transaksi atau order..."
- Debounced search on change

### Date Filters
- Pill buttons: "Hari Ini", "Kemarin", "Minggu Ini", "Bulan Ini"
- Active state: amber background
- Calculates dateFrom/dateTo based on selection

### Transaction List
- Each item shows:
  - Transaction number (bold)
  - Date/time formatted (dd MMM yyyy • HH:mm)
  - Order type badge (Dine In, Take Away)
  - Table name if dine_in
  - Payment method badge
  - Total amount (formatted as currency)
- Clickable - navigates to detail page

### States
- Loading: Spinner with "Memuat riwayat..."
- Empty: Icon + "Belum ada transaksi"
- Error: Alert + retry button

### Pagination
- Previous/Next buttons
- Page indicator: "1 / 23"
- Disabled when at bounds

## Global Constraints
- Follow existing page patterns
- Use UI components: Spinner, Input, Button, Badge
- Use date-fns for formatting
- Mobile-first design with Tailwind

## Steps
1. Create HistoryPage.tsx with full implementation
2. Add routes to constants.ts
3. Add route to AppRoutes.tsx
4. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-9-report.md
