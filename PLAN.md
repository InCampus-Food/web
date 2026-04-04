Perfect! Karena experienced dan web-nya full-featured (semua role), ini rekomendasiku:

## 🧱 Tech Stack Recommendation

**Core**
```
Next.js 15 (App Router)     ← routing, SSR, API routes
TypeScript                  ← type safety, wajib untuk project serius
Tailwind CSS + shadcn/ui    ← sesuai pilihan kamu
```

**State Management & Data Fetching**
```
TanStack Query (React Query) v5   ← server state, caching, auto refetch
Zustand                           ← client/global state (auth, cart, dll)
```

**Forms & Validation**
```
React Hook Form     ← performant forms
Zod                 ← schema validation, bisa share types dengan backend
```

**HTTP & Realtime**
```
Axios               ← HTTP client ke FastAPI backend
Socket.io-client    ← real-time order tracking & notifikasi
```

**Extras**
```
next-auth v5        ← auth session management
dayjs               ← date formatting
recharts            ← charts untuk admin dashboard
react-hot-toast     ← notifications/toast
```

## 📁 Folder Structure

```
incampus-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   ├── users/
│   │   │   │   ├── canteens/
│   │   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   ├── canteen/
│   │   │   │   ├── menu/
│   │   │   │   ├── orders/
│   │   │   │   └── page.tsx
│   │   │   ├── delivery/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (customer)/         ← kalau customer bisa order via web
│   │   │   ├── order/
│   │   │   └── track/
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                 ← shadcn components (auto-generated)
│   │   ├── common/             ← shared components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DataTable.tsx
│   │   ├── admin/
│   │   ├── canteen/
│   │   └── delivery/
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts       ← axios instance
│   │   │   ├── auth.ts
│   │   │   ├── orders.ts
│   │   │   ├── menu.ts
│   │   │   └── canteen.ts
│   │   ├── utils.ts
│   │   └── validators/         ← Zod schemas
│   │
│   ├── hooks/                  ← custom hooks
│   │   ├── useAuth.ts
│   │   ├── useOrders.ts
│   │   └── useSocket.ts
│   │
│   ├── stores/                 ← Zustand stores
│   │   ├── authStore.ts
│   │   └── cartStore.ts
│   │
│   └── types/                  ← TypeScript interfaces
│       ├── order.ts
│       ├── user.ts
│       └── menu.ts
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 🔐 Auth Flow (Role-based)

```
Login → JWT dari backend → simpan di httpOnly cookie (next-auth)
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              /admin/**       /canteen/**      /delivery/**
            (role: admin)  (role: canteen)   (role: delivery)
                    
Middleware Next.js → cek role dari token → redirect kalau unauthorized
```