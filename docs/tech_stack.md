# TransitOps — Tech Stack

## 1. Core Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend Framework | Next.js (App Router) | Server + client components, file-based routing, API routes for backend logic |
| Language | TypeScript | Used across frontend and backend for type safety |
| Styling | Tailwind CSS + Custom CSS | Tailwind utility classes for layout/spacing, custom CSS for shared design tokens and any component-specific styling not covered by utilities |
| Database | PostgreSQL | Relational integrity for statuses, foreign keys, and business-rule constraints |
| ORM | Prisma | Schema definition, migrations, type-safe query client |
| Authentication | Custom JWT Authentication stored in cookies | Email/password login, JWT tokens generated server-side and stored in secure, HTTP-only cookies |
| Password Hashing | bcrypt / argon2 | Secure password storage |
| API Layer | Next.js Route Handlers (`app/api/**`) | REST-style endpoints backed by Prisma |
| State Management (client) | React Server Components + React Query (TanStack Query) | Server components for initial data, React Query for client-side refetch/mutation |
| Form Handling | React Hook Form + Zod | Client-side validation mirroring server-side Zod schemas |
| Charts | Recharts | Bar/line charts for Analytics (revenue trend, cost breakdown) |
| CSV Export | papaparse / native CSV generation | Export analytics data client-side or via API route |
| Deployment Target | Vercel or Node.js server | Next.js standard deployment |

## 2. Supporting Libraries

| Purpose | Library |
|---|---|
| Schema validation (shared client/server) | Zod |
| Date handling | date-fns |
| Table rendering | TanStack Table |
| Toast/notifications | react-hot-toast (or equivalent) |
| Environment config | dotenv / Next.js built-in env handling |

## 3. Project Structure (high level)

```
transitops/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── fleet/
│   │   │   ├── drivers/
│   │   │   ├── trips/
│   │   │   ├── maintenance/
│   │   │   ├── fuel-expenses/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── vehicles/
│   │       ├── drivers/
│   │       ├── trips/
│   │       ├── maintenance/
│   │       ├── fuel-logs/
│   │       ├── expenses/
│   │       └── analytics/
│   ├── components/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── rbac.ts
│   │   └── validations/
│   ├── styles/
│   │   └── globals.css
│   └── types/
├── .env
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 4. Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | Secret key used to sign and verify JWT auth tokens |

## 5. Why This Stack
- **Next.js** gives a single codebase for UI and API routes, simplifying deployment
  for an 8-hour hackathon scope while remaining production-viable.
- **PostgreSQL + Prisma** enforces relational integrity (unique registration
  numbers, foreign keys between trips/vehicles/drivers) and gives type-safe
  queries that reduce runtime errors around status transitions.
- **Tailwind + Custom CSS** allows rapid UI construction while still permitting
  shared design tokens (colors, spacing) defined once in custom CSS.
- **JWT stored in HTTP-only cookies** provides a secure, stateless session authentication
  mechanism with role information attached directly inside the token payload, serving as
  the basis for RBAC route/module guarding.
- **Zod** shared between client forms and API route handlers keeps validation
  rules (e.g., cargo weight ≤ capacity) consistent in one place.
