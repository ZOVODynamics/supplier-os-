# ZOVO Supplier OS

Production-ready Supplier Marketplace backend for ZOVO. The project has been rebuilt as a
Termux-safe Node.js 20+ monorepo with a clean TypeScript Express API, zero native modules, and
JSON-file persistence.

## Hard Constraints Met

- Node.js 20+ compatible
- Runs in Linux and Android Termux ARM64 environments
- No Prisma
- No native modules, `node-gyp`, SQLite bindings, or compiled database binaries
- Pure JavaScript/TypeScript runtime dependencies
- Single-command build-and-run workflow

## Folder Structure

```text
ZOVO/
├── apps/
│   └── api/
│       ├── src/
│       │   ├── server.ts
│       │   ├── app.ts
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── ai/
│       │   ├── db/
│       │   ├── types/
│       │   └── utils/
│       ├── db.json
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── tsconfig.json
└── README.md
```

## Source Code Overview

- `apps/api/src/server.ts` starts the HTTP server on port `3001`.
- `apps/api/src/app.ts` wires Express, CORS, JSON body parsing, routes, and error handling.
- `apps/api/src/db/jsonDb.ts` provides zero-dependency JSON storage with:
  - `read()`
  - `write()`
  - `insert()`
  - `find()`
  - `update()`
- `apps/api/src/ai/supplierMatcher.ts` scores supplier matches using:
  - rating: 40%
  - category match: 30%
  - budget compatibility: 30%
- `apps/api/src/controllers` keeps request/response logic out of services and server startup.
- `apps/api/src/services` owns application use cases and is ready for a future Postgres/Supabase
  repository swap.

## Data Entities

The JSON database stores:

1. `User`
2. `Supplier`
3. `Project`
4. `Bid`

## API Endpoints

### Health

```http
GET /health
```

### Projects

```http
GET /projects
POST /projects
```

Example project payload:

```json
{
  "title": "IoT sensor assembly",
  "description": "Find a supplier for pilot production.",
  "category": "electronics",
  "budget": 45000,
  "createdByUserId": "user_demo_company"
}
```

### Suppliers

```http
GET /suppliers
POST /suppliers
```

Example supplier payload:

```json
{
  "name": "TechSource Components",
  "categories": ["electronics", "iot", "components"],
  "rating": 4.8,
  "location": "Bengaluru, India",
  "minBudget": 5000,
  "maxBudget": 150000
}
```

### AI Matching

```http
GET /ai/match/:projectId
```

Output format:

```json
{
  "projectId": "project_iot_sensors",
  "matches": [
    {
      "supplierId": "supplier_techsource",
      "name": "TechSource Components",
      "score": 98.4,
      "breakdown": {
        "rating": 96,
        "categoryMatch": 100,
        "budgetFit": 100
      }
    }
  ]
}
```

## Install Commands

```bash
npm install
```

## Run Command

Build and start the API with one command:

```bash
npm run dev
```

For production-style execution:

```bash
npm run build
npm start
```

The API listens on `http://localhost:3001` by default. Override with `PORT=4000 npm start`.

## Termux Notes

Install Node.js 20+ in Termux, then run the same commands:

```bash
pkg install nodejs
npm install
npm run dev
```

No Prisma generation, native database packages, or compiled binaries are required.
# ZOVO Supplier OS

AI-powered B2B supplier execution platform where companies post supply requests, suppliers respond with offers, and AI helps match requests to the best suppliers.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM with SQLite (easily migrates to PostgreSQL)
- **Auth**: NextAuth.js v5 with credentials provider
- **UI**: Custom components with dark/light mode support

## Features

- **Authentication**: Email/password login with role-based access (company, supplier, admin)
- **Dashboard**: Modern SaaS-style dashboard with sidebar navigation
- **Request System**: Create, track, and manage supply requests with status workflow
- **Supplier Marketplace**: Browse suppliers, view profiles, and respond to requests
- **AI Matching**: Intelligent keyword-based matching algorithm that scores suppliers

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed the database with demo data
npx tsx prisma/seed.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Demo Accounts

After seeding, you can log in with these accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@zovo.io | password123 | Admin |
| company@acme.com | password123 | Company |
| supplier@techsupply.com | password123 | Supplier |

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── requests/        # Request CRUD
│   │   ├── suppliers/       # Supplier endpoints
│   │   └── matching/        # AI matching API
│   ├── dashboard/           # Protected dashboard pages
│   │   ├── requests/        # Request management
│   │   ├── suppliers/       # Supplier marketplace
│   │   ├── matching/        # AI matching panel
│   │   └── settings/        # User settings
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── page.tsx             # Landing page
├── components/
│   ├── auth/                # Auth components
│   ├── dashboard/           # Dashboard UI components
│   ├── requests/            # Request-related components
│   └── matching/            # AI matching components
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   ├── ai-matching.ts       # AI matching algorithm
│   └── utils.ts             # Utility functions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
└── types/
    └── next-auth.d.ts       # Auth type extensions
```

## Database Models

- **User**: id, name, email, password, role, company
- **Request**: id, title, description, status, budget, category, priority, deadline
- **Supplier**: id, name, description, skills, rating, location, certifications
- **Match**: requestId, supplierId, score, status, notes

## Request Status Flow

```
OPEN → MATCHED → IN_PROGRESS → COMPLETED
                     ↓
                  CANCELLED
```

## Migrating to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/zovo_supplier_os"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

## License

MIT
