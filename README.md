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
