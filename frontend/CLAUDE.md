# Frontend Project - React + TypeScript

> **⚠️ IMPORTANT:** Semua development WAJIB mengikuti `docs/RESTAURANT_POS_DATABASE_BLUEPRINT.md`. Jangan melebar dari blueprint.

## Overview

Project React frontend dengan TypeScript menggunakan Vite, Tailwind CSS v4, dan arsitektur modular enterprise-ready.

## Tech Stack

```json
{
  "framework": "React 19",
  "build": "Vite",
  "styling": "Tailwind CSS v4",
  "language": "TypeScript",
  "forms": "React Hook Form + Zod",
  "routing": "React Router DOM v7",
  "animation": "Framer Motion",
  "icons": "Lucide React",
  "utils": "clsx + tailwind-merge",
  "dataFetching": "TanStack Query v5"
}
```

## Project Structure

```
src/
├── App.tsx              # Main app dengan BrowserRouter
├── main.tsx             # Entry point
├── index.css            # Global styles + Tailwind
├── api/                 # API client functions
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── PasswordInput.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Select.tsx
│   │   ├── Spinner.tsx
│   │   ├── Drawer.tsx
│   │   └── Modal.tsx
│   ├── common/          # Shared components (Logo)
│   ├── layout/           # Layout components (BrandSection)
│   ├── master/          # MasterPage layout wrapper
│   └── auth/            # Auth-specific components
├── pages/
│   ├── Login/           # Login page
│   ├── Dashboard/        # Dashboard page
│   ├── Users/           # User management (CRUD)
│   ├── Roles/           # Role management (CRUD)
│   ├── Permissions/     # Permission management (Explorer UX)
│   └── Menus/           # Menu management (Tree view + CRUD)
├── hooks/               # Custom React hooks (TanStack Query wrappers)
├── routes/
│   ├── AppRoutes.tsx    # Route definitions
│   └── constants.ts     # Route constants
├── types/               # TypeScript type definitions
├── utils/
│   ├── cn.ts            # Class name utility
│   └── validators.ts    # Zod schemas
└── constants/           # Design tokens
```

## Konvensi Kode

### File Naming
- Components: `PascalCase.tsx`
- Utils/Helpers: `camelCase.ts`
- Constants: `camelCase.ts`
- Index files: `index.ts(x)`

### Component Pattern

```typescript
// components/ui/Button.tsx
import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // Implementation
});

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
```

### Export Pattern

```typescript
// barrel export dari index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

## Zod Validation Pattern

```typescript
// utils/validators.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password required').min(8, 'Min 8 characters'),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

## Form Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../utils';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    // handle submission
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

## Page Module Pattern

Each feature/page follows a consistent structure:

```
pages/{Feature}/
├── {Feature}Page.tsx       # Main page component
├── {Feature}Modal.tsx     # Create/Edit modal (optional)
└── {Feature}Detail.tsx   # Detail drawer (optional)
```

Example structure:
```
pages/Menus/
├── MenusPage.tsx          # Main tree view + CRUD
├── MenuModal.tsx          # Create/Edit menu modal
└── MenuDetailDrawer.tsx   # View menu details
```

## RBAC Pattern (Role-Based Access Control)

### Permission Codes
Format: `{action}_{resource}` (snake_case, sesuai database)

| Resource | Permissions |
|----------|-------------|
| Users | `view_users`, `create_users`, `update_users`, `delete_users`, `change_status_users` |
| Roles | `view_roles`, `create_roles`, `update_roles`, `delete_roles` |
| Permissions | `view_permissions`, `create_permissions`, `update_permissions`, `delete_permissions` |
| Menus | `view_menus`, `create_menus`, `update_menus`, `delete_menus` |
| Categories | `view_categories`, `create_categories`, `update_categories`, `delete_categories` |
| Dashboard | `view_dashboard` |

### Using Permissions in Components

```typescript
import { useHasPermission } from '../../hooks/usePermission';

// Check single permission
const canCreate = useHasPermission('create_menus');

// In JSX
{canCreate && <Button>Create</Button>}
```

### Permission-Based UI Visibility

Tombol/fitur harus hidden jika user tidak punya permission:

```typescript
// Di page component
const canCreate = useHasPermission('create_categories');
const canUpdate = useHasPermission('update_categories');
const canDelete = useHasPermission('delete_categories');

// Toolbar - Add button
{canCreate && <Button onClick={handleCreate}>Add Category</Button>}

// Table actions - Edit/Delete buttons
{canUpdate && <button onClick={handleEdit}><Pencil /></button>}
{canDelete && <button onClick={handleDelete}><Trash /></button>}

// Detail Drawer - Edit button
<CategoryDetailDrawer onEdit={canUpdate ? handleEdit : undefined} />
```

### Custom Hook Pattern (TanStack Query)

```typescript
// hooks/useMenus.ts
export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: () => getMenus(),
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
```

## Routing Pattern

```typescript
// routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/Login';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
```

## Tailwind CSS v4 Pattern

```typescript
// index.css
@import "tailwindcss";

@theme {
  --color-primary-50: #eef2ff;
  --color-primary-600: #4f46e5;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

## Design Tokens (Tailwind Classes)

| Purpose | Classes |
|---------|---------|
| Primary | `indigo-600`, `indigo-700` |
| Background | `bg-slate-50` |
| Text | `text-slate-900`, `text-slate-500` |
| Border | `border-slate-200` |
| Card | `bg-white rounded-2xl shadow-xl` |
| Focus | `focus:ring-indigo-500 focus:border-indigo-500` |



## Aturan Development

### ✅ WAJIB

1. **TypeScript** - Semua file harus `.ts` atau `.tsx`
2. **Interfaces** - Definisikan prop types dengan `interface`
3. **Barrel exports** - Gunakan `index.ts` untuk exports
4. **Zod validation** - Validasi form dengan Zod schema
5. **Responsive** - Mobile-first dengan Tailwind breakpoints
6. **Accessibility** - `aria-label`, `htmlFor`, `role` where needed

### ❌ JANGAN

1. Jangan pakai `.js` atau `.jsx`
2. Jangan buat CSS manual kalau Tailwind bisa
3. Jangan ignore TypeScript errors
4. Jangan hardcode magic strings - pakai constants
5. Jangan buat component terlalu besar - pecah jadi kecil

### 🎯 Scope Terbatas

Task yang boleh dilakukan:
- Modifikasi component yang sudah ada
- Tambah page/fitur baru dengan pattern yang sama
- Fix bugs
- Tambah validasi baru
- Refactor dalam scope kecil

Task yang perlu konfirmasi dulu:
- Ubah struktur folder
- Tambah library baru
- Ubah arsitektur routing
- Modifikasi build config
- Hapus file yang sudah ada

## Route Constants

```typescript
// routes/constants.ts
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
} as const;
```

# Development Rules

Before creating or modifying any feature, always:

1. Analyze the existing project structure.
2. Reuse existing components whenever possible.
3. Do not create duplicate components.
4. Follow existing naming conventions.
5. Keep components small and single responsibility.
6. Maintain consistency with the current codebase.
7. If an existing component can be extended, prefer extending it over creating a new one.
8. Do not introduce breaking changes without explicit confirmation.
9. Ensure the project builds successfully after every change.
10. Ensure TypeScript and ESLint pass without errors.

## Doc Blueprint Rules

### API Response Type

Setiap module API harus ada type definition:

```typescript
// api/category.api.ts
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCategoriesResponse {
  data: CategoryResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### API Client Function

```typescript
// api/category.api.ts
export const getCategories = async (params?: CategoriesParams): Promise<PaginatedCategoriesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  // ... other params

  const response = await apiClient.get(`/categories?${searchParams}`);
  return response.data;
};
```

### Hook Pattern

```typescript
// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/category.api';

export function useCategories(params?: CategoriesParams) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ... exports untuk useUpdateCategory, useDeleteCategory
```

### Page Module Blueprint

```
pages/{Feature}/
├── {Feature}Page.tsx        # Main page (table, filters, modals)
├── {Feature}Modal.tsx       # Create/Edit modal
└── {Feature}DetailDrawer.tsx # View detail drawer (optional)
```

### Checklist Doc Module Baru

- [ ] `api/{feature}.api.ts` - Type definitions + API functions
- [ ] `hooks/use{Feature}.ts` - TanStack Query hooks
- [ ] `pages/{Feature}/{Feature}Page.tsx` - Main page
- [ ] `pages/{Feature}/{Feature}Modal.tsx` - Create/Edit modal
- [ ] `pages/{Feature}/{Feature}DetailDrawer.tsx` - Detail drawer (optional)
- [ ] RBAC permission checks di page component