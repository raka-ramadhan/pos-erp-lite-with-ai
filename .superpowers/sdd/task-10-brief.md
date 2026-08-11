# Task 10: Frontend — Transaction Detail Page

## Goal
Create the transaction detail page with receipt preview modal.

## Files to Create
1. `pos-cashier/src/pages/POS/TransactionDetailPage.tsx`
2. `pos-cashier/src/components/pos/history/ReceiptPreview.tsx`

## TransactionDetailPage Requirements

### Header
- Back button to /pos/history
- Title: "Detail Transaksi"
- Status badge: "COMPLETED" (green)

### Transaction Info Card
- Transaction number (large)
- Date/time (dd MMMM yyyy • HH:mm:ss)

### Order Info Card
- Kasir: {cashierName}
- Tipe Order: {Dine In/Take Away/Delivery}
- Meja: {tableName} (if dine_in)

### Items Card
- Title: "Item Pesanan"
- For each item:
  - {qty}x {productName}
  - variantName if present
  - Modifiers indented with bullet
  - Item notes in amber
  - Subtotal aligned right

### Price Breakdown Card
- Subtotal
- Discount (if any) - red text
- Tax (if any)
- Total (bold, larger)

### Payment Info Card
- Title: "Pembayaran"
- Metode: {paymentMethodName}
- Total Tagihan: {totalAmount}
- Dibayar: {amount}
- Kembalian: {changeAmount} (if cash)
- Reference (if exists)
- "✓ PAID • {date}" in green

### Notes Card (if notes exist)
- Amber background
- "Catatan Order" title
- Notes text

### Bottom Actions
- Fixed at bottom
- "Lihat Struk" button (outline) - opens ReceiptPreview modal
- "Cetak Ulang" button (primary) - calls window.print()

## ReceiptPreview Component Requirements
- Modal overlay with fixed positioning
- Header: "Preview Struk" with close button
- Receipt content styled for thermal printer (80mm width)
- Restaurant name placeholder
- Transaction details
- Items with modifiers
- Price breakdown
- Payment info
- Thank you message
- Bottom: "Tutup" and "Cetak" buttons

## Global Constraints
- Follow existing page patterns
- Use useTransactionDetail hook
- Use ReceiptPreview for modal

## Steps
1. Create ReceiptPreview.tsx
2. Create TransactionDetailPage.tsx
3. Update route to use this page at /pos/history/:id
4. Commit

## Report Contract
Write report to: /var/www/html/pos-porfolio/.superpowers/sdd/task-10-report.md
