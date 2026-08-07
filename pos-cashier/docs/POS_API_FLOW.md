# POS API Flow Documentation

> **Document Version**: 1.0.0
> **Last Updated**: 2026-08-06
> **Reference**: RESTAURANT_POS_DATABASE_BLUEPRINT.md

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication API](#authentication-api)
3. [Master Data APIs](#master-data-apis)
4. [POS-Specific APIs](#pos-specific-apis)
5. [API Response Formats](#api-response-formats)
6. [Error Handling](#error-handling)

---

## Overview

### Base Configuration

| Property | Value |
|----------|-------|
| Base URL | `http://localhost:3000/api` |
| Authentication | JWT Bearer Token |
| Content-Type | `application/json` |

### POS API Categories

| Category | Purpose | Authentication |
|----------|---------|---------------|
| Authentication | Login, Profile | Public (login) / JWT (profile) |
| Master Data | Products, Categories, Tables | JWT |
| POS Operations | Orders, Payments | JWT |

---

## Authentication API

### 1. Login

Authenticate cashier and obtain JWT token.

#### Request
```http
POST /auth/login
Content-Type: application/json

{
  "email": "cashier@nexus.com",
  "password": "cashier123",
  "app": "pos"
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Cashier Name",
      "email": "cashier@nexus.com",
      "phone": "+62xxx",
      "avatar": null,
      "role": {
        "id": "uuid",
        "code": "cashier",
        "name": "Cashier",
        "permissions": ["use_cashier", "create_orders", ...]
      }
    }
  },
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Response (Error - Invalid Credentials)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Response (Error - No Permission)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You do not have permission to access POS Cashier. Please contact your administrator.",
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Business Rules
| Rule | Description |
|------|-------------|
| AUTH-001 | `app` parameter must be `"pos"` for POS login |
| AUTH-002 | User must have `use_cashier` permission |
| AUTH-003 | User must have `cashier` role |
| AUTH-004 | JWT token valid for 24 hours |

---

### 2. Get Profile

Get current authenticated user profile.

#### Request
```http
GET /auth/me
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "Cashier Name",
    "email": "cashier@nexus.com",
    "phone": "+62xxx",
    "avatar": null,
    "role": {
      "id": "uuid",
      "code": "cashier",
      "name": "Cashier",
      "permissions": ["use_cashier", "create_orders"]
    },
    "permissions": ["use_cashier", "create_orders"],
    "menu": []
  },
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

---

## Master Data APIs

### 3. Categories

Get product categories for POS navigation.

#### Request
```http
GET /categories/active
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "name": "Rice",
      "slug": "rice",
      "description": null,
      "imageUrl": null,
      "sortOrder": 1,
      "isActive": true,
      "parentId": null
    },
    {
      "id": "uuid",
      "name": "Noodle",
      "slug": "noodle",
      "description": null,
      "imageUrl": null,
      "sortOrder": 2,
      "isActive": true,
      "parentId": null
    }
  ],
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Business Rules
| Rule | Description |
|------|-------------|
| CAT-001 | Only return categories with `isActive = true` |
| CAT-002 | Sort by `sortOrder` ascending |

---

### 4. Products

Get products by category.

#### Request
```http
GET /products/active?category_id={category_id}
Authorization: Bearer {token}
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category_id | string (UUID) | No | Filter by category |
| search | string | No | Search by name |

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "name": "Nasi Goreng",
      "slug": "nasi-goreng",
      "sku": "NG001",
      "price": 25000,
      "description": "Classic fried rice",
      "imageUrl": "https://example.com/nasi-goreng.jpg",
      "category": {
        "id": "uuid",
        "name": "Rice"
      },
      "hasVariants": true,
      "isAvailable": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Business Rules
| Rule | Description |
|------|-------------|
| PRD-001 | Only return products with `isAvailable = true` |
| PRD-002 | `hasVariants = true` means product has modifier groups |

---

### 5. Product Detail with Modifiers

Get product detail including all modifier groups.

#### Request
```http
GET /products/{id}
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "Nasi Goreng",
    "slug": "nasi-goreng",
    "sku": "NG001",
    "price": 25000,
    "description": "Classic fried rice",
    "imageUrl": "https://example.com/nasi-goreng.jpg",
    "category": {
      "id": "uuid",
      "name": "Rice"
    },
    "hasVariants": true,
    "isAvailable": true,
    "modifierGroups": [
      {
        "id": "uuid",
        "name": "Level Pedas",
        "selectionType": "single",
        "isRequired": true,
        "minSelections": 1,
        "maxSelections": 1,
        "modifiers": [
          {
            "id": "uuid",
            "name": "Normal",
            "additionalPrice": 0,
            "isDefault": true
          },
          {
            "id": "uuid",
            "name": "Pedas",
            "additionalPrice": 0,
            "isDefault": false
          },
          {
            "id": "uuid",
            "name": "Sangat Pedas",
            "additionalPrice": 2000,
            "isDefault": false
          }
        ]
      },
      {
        "id": "uuid",
        "name": "Level Gula",
        "selectionType": "multiple",
        "isRequired": false,
        "minSelections": 0,
        "maxSelections": 2,
        "modifiers": [
          {
            "id": "uuid",
            "name": "Gula Merah",
            "additionalPrice": 1000,
            "isDefault": false
          },
          {
            "id": "uuid",
            "name": "Gula Pasir",
            "additionalPrice": 0,
            "isDefault": true
          }
        ]
      }
    ]
  },
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

---

### 6. Modifier Groups

Get all modifier groups (for menu configuration).

#### Request
```http
GET /modifier-groups/active
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "name": "Level Pedas",
      "selectionType": "single",
      "isRequired": true,
      "minSelections": 1,
      "maxSelections": 1,
      "sortOrder": 1,
      "modifiers": [...]
    }
  ],
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

---

### 7. Dining Tables

Get available dining tables.

#### Request
```http
GET /dining-tables/active
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "tableCode": "T01",
      "tableName": "Table 1",
      "areaName": "Indoor",
      "capacity": 4,
      "status": "available",
      "description": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Table Status Values
| Status | Description | Selectable |
|--------|-------------|------------|
| `available` | Ready for customers | ✅ Yes |
| `occupied` | Currently in use | ❌ No |
| `reserved` | Reserved | ❌ No |
| `maintenance` | Not available | ❌ No |

---

### 8. Get Table Areas

Get distinct table areas.

#### Request
```http
GET /dining-tables/areas
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    { "areaName": "Indoor" },
    { "areaName": "Outdoor" },
    { "areaName": "VIP" }
  ],
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

---

### 9. Taxes

Get active tax configurations.

#### Request
```http
GET /taxes/active
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "code": "PPN",
      "name": "Pajak Pertambahan Nilai",
      "taxType": "percentage",
      "rate": 0.11,
      "isDefault": true,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Tax Calculation
```typescript
// For percentage tax
taxAmount = subtotal * tax.rate

// Example
subtotal = 91000
taxRate = 0.11
taxAmount = 91000 * 0.11 = 10010
```

---

### 10. Discounts

Get active discount configurations.

#### Request
```http
GET /discounts/active
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "code": "DISKON10",
      "name": "Diskon 10%",
      "discountType": "percentage",
      "value": 10,
      "minOrderAmount": 50000,
      "maxDiscount": null,
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-12-31T23:59:59.000Z",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Discount Types
| Type | Description | Calculation |
|------|-------------|-------------|
| `percentage` | Percentage off | `discount = subtotal * (value / 100)` |
| `fixed` | Fixed amount off | `discount = value` |

#### Validation
```typescript
// Check minimum order
if (subtotal < discount.minOrderAmount) {
  throw new Error('Minimum order amount not met');
}

// Check date range
const now = new Date();
if (now < discount.startDate || now > discount.endDate) {
  throw new Error('Discount is not valid');
}
```

---

### 11. Payment Methods

Get active payment methods.

#### Request
```http
GET /payment-methods/active
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "code": "CASH",
      "name": "Cash",
      "paymentType": "cash",
      "provider": null,
      "isIntegration": false,
      "isActive": true,
      "icon": "cash",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "code": "QRIS",
      "name": "QRIS",
      "paymentType": "qris",
      "provider": "dana",
      "isIntegration": true,
      "isActive": true,
      "icon": "qris",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

#### Payment Types
| Type | Requires Reference | Example |
|------|-------------------|---------|
| `cash` | No | Cash payment |
| `card` | Yes | Debit/Credit |
| `qris` | Yes | DANA, OVO, GoPay |
| `ewallet` | Yes | ShopeePay |

---

## POS-Specific APIs

> ⚠️ **Note**: The following APIs will be implemented in future phases. Currently, POS operations are managed client-side.

### 12. Create Order (Future)

Create a new order transaction.

#### Request
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "tableId": "uuid",
  "customerId": "uuid",
  "customerName": "Walk-in",
  "customerType": "walk_in",
  "items": [
    {
      "productId": "uuid",
      "productName": "Nasi Goreng",
      "quantity": 2,
      "unitPrice": 25000,
      "modifiers": [
        {
          "id": "uuid",
          "name": "Pedas",
          "additionalPrice": 0
        }
      ],
      "notes": "No onion",
      "itemTotal": 50000
    }
  ],
  "subtotal": 101010,
  "taxes": [
    {
      "id": "uuid",
      "code": "PPN",
      "rate": 0.11,
      "amount": 11111
    }
  ],
  "discounts": [],
  "total": 112121,
  "status": "completed"
}
```

#### Response
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-20260806-001",
    "tableId": "uuid",
    "customerId": "uuid",
    "status": "completed",
    "total": 112121,
    "createdAt": "2026-08-06T14:30:00.000Z"
  },
  "timestamp": "2026-08-06T14:30:00.000Z"
}
```

---

### 13. Update Table Status (Future)

Update dining table status.

#### Request
```http
PATCH /dining-tables/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "occupied"
}
```

#### Response
```json
{
  "success": true,
  "message": "Table status updated",
  "data": {
    "id": "uuid",
    "tableCode": "T01",
    "status": "occupied"
  },
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

---

### 14. Get Order History (Future)

Get orders for current shift.

#### Request
```http
GET /orders?status={status}&date={date}
Authorization: Bearer {token}
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status |
| date | string | No | Filter by date (YYYY-MM-DD) |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-20260806-001",
      "table": {
        "id": "uuid",
        "tableCode": "T01",
        "tableName": "Table 1"
      },
      "customerName": "Walk-in",
      "status": "completed",
      "itemCount": 3,
      "total": 112121,
      "paymentMethod": "cash",
      "cashier": {
        "id": "uuid",
        "name": "John Doe"
      },
      "createdAt": "2026-08-06T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "timestamp": "2026-08-06T10:00:00.000Z"
}
```

---

## API Response Formats

### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiPaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}
```

### Error Response
```typescript
interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Process new resource |
| 400 | Bad Request | Show validation error |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show not found message |
| 422 | Unprocessable | Show business rule error |
| 500 | Server Error | Show generic error |

### Error Handling in Frontend

```typescript
// api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          store.dispatch(logout());
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - show error
          store.dispatch(setAuthError('Access denied'));
          break;
        case 404:
          // Not found
          store.dispatch(setError('Resource not found'));
          break;
        case 500:
          // Server error
          store.dispatch(setError('Server error occurred'));
          break;
        default:
          // Other errors
          break;
      }
    }
    return Promise.reject(error);
  }
);
```

### POS-Specific Error Messages

| Error Type | Message | User Action |
|------------|---------|-------------|
| `PRODUCT_NOT_AVAILABLE` | "This item is currently sold out" | Remove from cart |
| `TABLE_NOT_AVAILABLE` | "This table is not available" | Select another table |
| `MIN_ORDER_NOT_MET` | "Minimum order Rp X for discount" | Increase order |
| `PAYMENT_FAILED` | "Payment could not be processed" | Retry or use another method |

---

## Appendix

### Related Documents

1. [CLAUDE.md](../CLAUDE.md)
2. [POS_BUSINESS_FLOW.md](./POS_BUSINESS_FLOW.md)
3. [POS_SCREEN_FLOW.md](./POS_SCREEN_FLOW.md)
4. [POS_BLUEPRINT.md](./POS_BLUEPRINT.md)
5. [RESTAURANT_POS_DATABASE_BLUEPRINT.md](../../docs/RESTAURANT_POS_DATABASE_BLUEPRINT.md)

### Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-06 | System | Initial document |
