# CompensIQ — Compensation Intelligence System

Real, structured salary data for engineering and product roles in India — with level-first comparison, company pages, and anonymous submission.

> **Internship Assignment | Full Stack Engineer | Track C**

## Architecture

```
Next.js 16 App Router (TypeScript)
├── src/app/
│   ├── page.tsx                # Home — stats, feature links
│   ├── salaries/               # Searchable + filterable salary table
│   ├── companies/              # Company listing + detail pages
│   ├── compare/                # Side-by-side company comparison
│   ├── submit/                 # Anonymous salary submission form
│   ├── auth/                   # Login + register pages
│   └── api/
│       ├── compensations/      # GET (filter/search/paginate) + POST (ingest)
│       ├── companies/          # GET companies with TC aggregation
│       ├── companies/[slug]/   # GET per-company with level breakdown
│       ├── compare/            # GET multi-company comparison
│       ├── stats/              # GET platform-wide stats
│       └── auth/               # NextAuth v5 + register endpoint
├── src/components/
│   ├── compensation/           # SalaryTable, SubmitForm, CompareWidget, etc.
│   ├── layout/                 # Navbar
│   └── ui/                     # Badge, Button, Input, Select, Card
├── src/lib/
│   ├── prisma.ts               # Singleton Prisma client (Prisma 7 + adapter-pg)
│   ├── auth.ts                 # NextAuth v5 config (credentials provider)
│   └── utils.ts                # formatLakhs, percentile, levelToOrder, slugify
├── prisma/
│   ├── schema.prisma           # DB schema — Company, Compensation, User, Auth
│   └── seed/index.ts           # 19 companies, ~300 realistic entries
└── prisma.config.ts            # Prisma 7 datasource config
```

## Key Design Decisions

**Levels over titles** — `levelOrder` is a numeric field derived at write time from the level string via `levelToOrder()`. This allows sorting and grouping across heterogeneous level systems (L3-L7, SDE1-SDE3, Junior/Mid/Senior) without string comparison.

**Normalized company dedup** — `normalizedName` (lowercase, trimmed, punctuation-stripped) is the unique key. `"Google"`, `"google"`, `"Google Inc."` all resolve to the same record. Slug conflicts get numeric suffixes.

**TC computed on write** — `totalComp = base + bonus + stockPerYear` is stored, not derived at query time. Missing bonus/stock default to 0. Keeps aggregation fast and consistent.

**Percentile ranges, not just median** — compare and company APIs return P25/P50/P75. Salary distributions are right-skewed; ranges give more actionable negotiation data.

**Prisma 7** — uses the new driver adapter pattern (`@prisma/adapter-pg`) instead of the legacy `url = env(...)` in schema. Datasource URL lives in `prisma.config.ts` for migrations, adapter passed to constructor for runtime queries.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v5 beta (credentials) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL (Neon for deploy) |
| Charts | Recharts |
| Deployment | Vercel + Neon |

## Local Setup

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env.local
# Set DATABASE_URL and AUTH_SECRET

# 3. Apply schema + seed
npm run db:push
npm run db:seed

# 4. Dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Reference

### `GET /api/compensations`
Query: `company`, `role`, `level`, `location`, `minTC`, `maxTC`, `page`, `limit`, `sortBy`, `sortDir`

### `POST /api/compensations`
Body: `{ companyName, role, level, location, currency, baseSalary, bonus?, stockPerYear?, yearsExperience? }`
Auto-upserts company, computes TC, derives levelOrder.

### `GET /api/companies`
Returns companies with aggregated P25/P50/P75 TC.

### `GET /api/companies/[slug]`
Company detail + per-level TC breakdown.

### `GET /api/compare?company=google&company=flipkart`
Side-by-side comparison, optional `role` + `level` filters.

## Edge Cases

- Duplicate companies normalized via `normalizedName`
- Missing bonus/stock default to 0 (TC is always valid)
- Invalid sort fields fall back to `submittedAt:desc`
- `percentile([])` returns 0 safely
- Page/limit inputs are clamped
- Validation errors return structured field error objects
- DB unavailable: pages return empty state, no crash
- Unknown levels default to `levelOrder: 3` (mid-level)
