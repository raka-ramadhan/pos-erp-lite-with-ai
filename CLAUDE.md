# CLAUDE.md - POS Portfolio Project

## Project Overview

This is a Point of Sale (POS) portfolio project with:

- **Backend**: NestJS API (Port 3000)
- **Frontend (Dashboard)**: React Admin Dashboard (Port 5173)
- **Frontend (POS)**: React POS Cashier (Port 5174)
- **Database**: MySQL via MCP Server

## Project Structure

```
pos-portfolio/
├── backend/               # NestJS API
│   └── src/
│       ├── modules/       # Feature modules (orders, payments, products, etc.)
│       ├── common/        # Guards, decorators, interceptors
│       └── database/      # Migrations
├── pos-cashier/          # React POS Cashier App
│   └── src/
│       ├── api/          # API clients
│       ├── components/   # UI components
│       ├── hooks/        # Custom hooks
│       ├── pages/        # Page components
│       └── store/        # Redux slices
└── docs/                 # Documentation
```

---

## MCP Server

This project uses `my-mcp-server-erp-lite-local` MCP server for database operations.

### Connection Details
- **Host**: 127.0.0.1
- **Database**: erp_lite
- **Port**: 3306
- **User**: superuser

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_tables` | List all tables in database |
| `describe_table` | View schema/structure of a table |
| `read_query` | Execute SELECT queries |
| `write_query` | Execute INSERT, UPDATE, DELETE |
| `create_table` | Create new tables |
| `alter_table` | Modify existing table schema |
| `drop_table` | Remove tables |
| `export_query` | Export query results to CSV/JSON |
| `list_insights` | List business insights |
| `append_insight` | Add business insights |

---

## Database First Principle

**WAJIB** - Setiap kali melakukan perubahan terkait module dan fitur, SELALU check database terlebih dahulu.

### Checklist Sebelum Coding
1. Identify tabel-tabel yang relevan dengan fitur
2. Jalankan `describe_table` untuk setiap tabel
3. Check data sample dengan `read_query` jika perlu
4. Pastikan column/field yang diperlukan sudah ada
5. Baru kemudian implementasikan kode frontend/backend

### Contoh Penggunaan
```bash
# Check table structure
describe_table("orders")

# Check sample data
read_query("SELECT * FROM orders LIMIT 5")

# Create table
create_table("CREATE TABLE ...")

# Modify table
alter_table("ALTER TABLE orders ADD COLUMN ...")
```

---

## Development Workflow

### Standard Feature Flow
1. **Database** - Check/create tables first (via MCP)
2. **Backend** - Create entities, DTOs, service, controller
3. **Integration** - Test API endpoints with curl
4. **Frontend** - Create API client, hooks, pages
5. **Testing** - End-to-end testing

### Sprint 8: Transaction History
Scope untuk fitur Riwayat Transaksi:
- Transaction snapshot tables (immutable)
- History API endpoints
- POS History pages
- Receipt preview & reprint

---

## Commands

```bash
# Backend
cd backend && npm run start:dev      # Development (watch mode)
cd backend && npm run start:prod    # Production
cd backend && npm run migration:run  # Run migrations

# POS Cashier
cd pos-cashier && npm run dev       # Port 5174

# Dashboard (if exists)
cd frontend && npm run dev          # Port 5173
```

---

## Important Patterns

### 1. Transaction Snapshot (Sprint 8)
Ketika order completed, data di-snapshot ke tabel `transactions`:
- **Immutable** - Data tidak berubah walau master berubah
- **Complete** - Simpan semua info saat transaksi terjadi
- **Atomic** - Create dalam satu transaction

### 2. EventEmitter Pattern
Untuk avoid circular dependency, gunakan EventEmitter:
```typescript
// In PaymentsService
this.eventEmitter.emit('payment.completed', { orderId });

// In TransactionsService constructor
this.eventEmitter.on('payment.completed', async (data) => {
  await this.createSnapshotFromOrder(data.orderId);
});
```

### 3. Pessimistic Locking
Untuk prevent race condition pada concurrent access:
```typescript
await manager
  .createQueryBuilder(Entity, 'e')
  .setLock('pessimistic_write')
  .where('e.id = :id', { id })
  .getOne();
```

### 4. Backend Response Wrapper
Semua response dibungkus dengan:
```json
{
  "success": true,
  "message": "Success",
  "data": {...},
  "timestamp": "2026-08-12T..."
}
```

---

## Permission System

### POS Cashier Permission
- `use_cashier` - Wajib untuk akses POS Cashier

### POS Endpoints (all use `use_cashier`)
- `/dining-tables/active`
- `/categories/active`
- `/products/active`
- `/payment-methods/active`
- `/taxes/active`
- `/discounts/active`
- `/orders/*`
- `/transactions/*`

---

## Naming Conventions

### Backend
| Type | Convention | Example |
|------|------------|---------|
| Module | `kebab-case.module.ts` | `transactions.module.ts` |
| Entity | `kebab-case.entity.ts` | `transaction.entity.ts` |
| Service | `kebab-case.service.ts` | `transactions.service.ts` |
| Controller | `kebab-case.controller.ts` | `transactions.controller.ts` |
| DTO | `kebab-case.dto.ts` | `create-transaction.dto.ts` |

### Database
| Type | Convention | Example |
|------|------------|---------|
| Table | `snake_case` | `transactions` |
| Column | `snake_case` | `transaction_number` |
| FK | `{table}_id` | `order_id` |

### Frontend
| Type | Convention | Example |
|------|------------|---------|
| Component | `PascalCase.tsx` | `HistoryPage.tsx` |
| Hook | `camelCase.ts` | `useTransactions.ts` |
| API Client | `camelCase.ts` | `transactions.ts` |

---

## Common Issues & Solutions

### Problem: "Unknown column" error
**Solution**: Entity tidak match dengan database. Check:
- Column name di entity vs migration
- Tambahkan `@Column({ name: 'column_name' })` jika beda

### Problem: Circular dependency
**Solution**: Gunakan EventEmitter pattern, bukan direct import

### Problem: Race condition pada order creation
**Solution**: Create order ONCE sebelum loop, gunakan sequential processing

### Problem: Snapshot tidak terbuat setelah payment
**Solution**: Check EventEmitter registration di module

---

## Database Blueprint

Untuk reference database structure lengkap, lihat:
`docs/RESTAURANT_POS_DATABASE_BLUEPRINT.md`

---

## Testing Checklist

### Backend API
```bash
# Test transactions list
curl http://localhost:3000/api/transactions

# Test transaction detail
curl http://localhost:3000/api/transactions/{id}

# Test with auth
curl -H "Authorization: Bearer {token}" http://localhost:3000/api/transactions
```

### Frontend
```bash
# POS History page
http://localhost:5174/pos/history

# POS Transaction Detail
http://localhost:5174/pos/history/{id}
```

### End-to-End Flow
1. Login ke POS Cashier
2. Buat order baru
3. Tambah items
4. Bayar
5. Verifikasi transaction muncul di History
6. Klik untuk lihat detail
7. Test receipt preview

---

## Documentation

| Document | Location |
|----------|----------|
| Database Blueprint | `docs/RESTAURANT_POS_DATABASE_BLUEPRINT.md` |
| API Flow | `pos-cashier/docs/POS_API_FLOW.md` |
| Design Specs | `docs/superpowers/specs/` |
| Implementation Plans | `docs/superpowers/plans/` |
