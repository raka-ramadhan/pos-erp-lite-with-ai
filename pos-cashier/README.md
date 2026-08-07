# POS Cashier

> Restaurant POS Cashier Application - Point of Sale Terminal

![POS Cashier](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.x-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6)

---

## 📋 Overview

POS Cashier adalah aplikasi Point of Sale terminal untuk restoran. Aplikasi ini adalah client React kedua dari backend Restaurant POS, menggunakan architecture yang SAMA dengan Dashboard Admin.

### Key Features

- ✅ **Authentication** - JWT-based authentication with role validation
- ✅ **Table Selection** - Visual table selection with status indicators
- ✅ **Product Catalog** - Category-based product browsing
- ✅ **Modifier Selection** - Product variants and options
- ✅ **Cart Management** - Real-time cart with calculations
- ✅ **Tax & Discount** - Automatic tax and discount calculations
- ✅ **Payment Processing** - Multiple payment methods
- ✅ **Receipt Generation** - Digital and printable receipts

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   React     │  │   Redux     │  │   TanStack   │       │
│  │   19.x      │  │   Toolkit   │  │   Query      │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────┬──────────────────────────────────┘
                         │ REST API
┌────────────────────────┴──────────────────────────────────┐
│                        Backend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   NestJS    │  │   TypeORM   │  │    MySQL    │       │
│  │   11.x      │  │             │  │             │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
src/
├── api/              # Axios client with interceptors
├── components/        # React components
│   ├── ui/          # Reusable UI (Button, Card, Input...)
│   ├── layout/      # POS-specific layouts
│   └── pos/         # POS-specific components
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── routes/           # React Router configuration
├── store/            # Redux store and slices
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 6.x |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS | 4.x |
| Routing | React Router | 7.x |
| State Management | Redux Toolkit | 2.x |
| Data Fetching | TanStack Query | 5.x |
| Form Handling | React Hook Form | 7.x |
| Validation | Zod | 3.x |
| Animations | Framer Motion | 13.x |
| Icons | Lucide React | 1.28.x |
| HTTP Client | Axios | 1.x |

---

## 📁 Folder Structure

```
pos-cashier/
├── src/
│   ├── api/                    # API client
│   │   └── client.ts          # Axios instance with interceptors
│   │
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── common/           # Shared components
│   │   │   └── Logo.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── POSLayout.tsx
│   │   │   └── BrandSection.tsx
│   │   └── pos/              # POS-specific components
│   │       ├── tables/
│   │       ├── products/
│   │       ├── modifiers/
│   │       ├── cart/
│   │       ├── payment/
│   │       └── receipt/
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePermission.ts
│   │   ├── useTables.ts
│   │   ├── useProducts.ts
│   │   └── ...
│   │
│   ├── pages/                 # Page components
│   │   ├── Login/
│   │   ├── Forbidden/
│   │   └── POS/
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx     # Route definitions
│   │   └── constants.ts      # Route constants
│   │
│   ├── store/                 # Redux store
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       └── posSlice.ts
│   │
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   │
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
│
├── docs/                      # Documentation
│   ├── POS_BUSINESS_FLOW.md
│   ├── POS_SCREEN_FLOW.md
│   ├── POS_API_FLOW.md
│   └── POS_BLUEPRINT.md
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── CLAUDE.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (http://localhost:3000)

### Installation

```bash
# Clone the repository
cd pos-cashier

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
# Start development server
npm run dev

# Open in browser
http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | Development guidelines and coding rules |
| [POS_BUSINESS_FLOW.md](docs/POS_BUSINESS_FLOW.md) | Complete business flow documentation |
| [POS_SCREEN_FLOW.md](docs/POS_SCREEN_FLOW.md) | Screen specifications and navigation |
| [POS_API_FLOW.md](docs/POS_API_FLOW.md) | API endpoints documentation |
| [POS_BLUEPRINT.md](docs/POS_BLUEPRINT.md) | Architecture and module blueprint |

---

## 🔐 Authentication

### Login Flow

```
1. Cashier opens POS → Enter credentials
2. POST /auth/login with { app: 'pos' }
3. Backend validates credentials and permission
4. JWT token returned on success
5. User redirected to POS Terminal
```

### Required Permission

- `use_cashier` - Required to access POS application
- `cashier` role - Required role for POS access

### Test Credentials

| Email | Password | Role |
|-------|----------|------|
| cashier@nexus.com | cashier123 | Cashier |

---

## 📱 Application Screens

1. **Login** (`/login`) - Authentication
2. **Forbidden** (`/forbidden`) - Access denied
3. **POS Terminal** (`/pos`) - Main hub
4. **Table Selection** (`/pos/tables`) - Select dining table
5. **Product Catalog** (`/pos/products`) - Browse products
6. **Cart** (`/pos/cart`) - Review order
7. **Payment** (`/pos/payment`) - Process payment
8. **Receipt** (`/pos/receipt`) - Transaction receipt

---

## 🎯 Business Rules

### Table Selection
- Only `available` tables can be selected
- Table status: available, occupied, reserved, maintenance

### Product Selection
- Products must have `isAvailable = true`
- Products with `hasVariants = true` require modifier selection

### Cart Calculations
```
Subtotal = Sum of all item totals
Item Total = (Unit Price + Sum of Modifier Prices) × Quantity
Tax = Subtotal × Tax Rate
Total = Subtotal + Tax - Discount
```

### Payment
- Cash: Amount tendered must be >= Total
- Card/QRIS: Reference number required
- Multiple payments allowed (split bill)

---

## 📦 Dependencies

### Production
```json
{
  "react": "^19.x",
  "react-dom": "^19.x",
  "react-router-dom": "^7.x",
  "@reduxjs/toolkit": "^2.x",
  "react-redux": "^9.x",
  "@tanstack/react-query": "^5.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^5.x",
  "zod": "^3.x",
  "axios": "^1.x",
  "framer-motion": "^13.x",
  "lucide-react": "^1.28.x",
  "clsx": "^2.x",
  "tailwind-merge": "^3.x"
}
```

### Development
```json
{
  "typescript": "~6.x",
  "vite": "^8.x",
  "@vitejs/plugin-react": "^6.x",
  "tailwindcss": "^4.x",
  "@tailwindcss/vite": "^4.x"
}
```

---

## 🧩 Component Patterns

### UI Components (from Dashboard)

```typescript
// Button component
<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>

// Input component
<Input
  type="text"
  label="Email"
  placeholder="Enter email"
  error={errors.email?.message}
/>
```

### Custom Components

```typescript
// TableCard
<TableCard table={table} onSelect={handleSelect} />

// ProductCard
<ProductCard product={product} onSelect={handleSelect} />

// ModifierModal
<ModifierModal
  isOpen={isOpen}
  product={product}
  onClose={handleClose}
  onAdd={handleAdd}
/>
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login (with `app: 'pos'`) |
| GET | `/auth/me` | JWT | Get user profile |

### Master Data
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories/active` | JWT | Get categories |
| GET | `/products/active` | JWT | Get products |
| GET | `/products/:id` | JWT | Get product with modifiers |
| GET | `/dining-tables/active` | JWT | Get available tables |
| GET | `/taxes/active` | JWT | Get active taxes |
| GET | `/discounts/active` | JWT | Get active discounts |
| GET | `/payment-methods/active` | JWT | Get payment methods |

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login rejected for non-cashier users
- [ ] Table selection updates status
- [ ] Product selection works
- [ ] Modifier modal functions correctly
- [ ] Cart calculations are accurate
- [ ] Tax calculation is correct
- [ ] Discount application works
- [ ] Payment processing completes
- [ ] Receipt generates correctly
- [ ] Logout clears session

---

## 📈 Future Development

### Phase 2
- Order History
- Kitchen Display System (KDS)
- Order Status Tracking

### Phase 3
- Customer Loyalty
- Reports & Analytics
- Print Configuration

### Future
- Multi Outlet Support
- Inventory Management
- AI Assistant
- Mobile POS

---

## 📝 License

This project is part of Restaurant POS Portfolio.

---

## 🤝 Contributing

1. Follow the coding rules in CLAUDE.md
2. Use patterns from Dashboard Admin
3. Ensure TypeScript strict mode compliance
4. Write tests for new features
5. Update documentation for changes

---

## 📚 Related Projects

- [Backend API](../backend/) - NestJS backend server
- [Dashboard Admin](../frontend/) - Admin panel frontend

---

**Built with ❤️ for Restaurant POS**
