# Nexus - React Frontend

Enterprise-ready React frontend dengan TypeScript dan arsitektur modular.

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | TypeScript check + Production build |
| `npm run preview` | Preview production build |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **React Hook Form** + **Zod** - Form handling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Router DOM v7** - Routing

## Structure

```
src/
├── components/
│   ├── ui/          # Button, Input, Card, Checkbox, etc.
│   ├── common/      # Logo
│   ├── layout/      # BrandSection
│   └── auth/        # SocialLoginButton
├── pages/
│   └── Login/       # Login feature module
├── routes/          # AppRoutes, route constants
├── utils/           # cn(), Zod validators
└── constants/       # Design tokens
```

## Pattern Guide

Lihat `CLAUDE.md` untuk pattern detail:
- Component pattern
- Form validation
- Routing setup
- Tailwind classes

## Routes

| Path | Page |
|------|------|
| `/login` | Login page |
| `/register` | Register (placeholder) |
| `/forgot-password` | Forgot password (placeholder) |
| `/dashboard` | Dashboard (placeholder) |

## Development Rules

1. **TypeScript only** - `.ts`/`.tsx` files
2. **Interface untuk props** - Tidak pakai `type` untuk props
3. **Zod validation** - Untuk semua form
4. **Tailwind classes** - Minimize custom CSS
5. **Barrel exports** - `index.ts` untuk setiap folder

## Pages

1. Buka `CLAUDE.md` untuk konvensi lengkap
2. Lihat `.claude/skills/login-page.md` untuk quick reference
3. Ikuti component pattern yang sudah ada
