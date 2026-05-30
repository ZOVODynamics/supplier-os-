# ZOVO Supplier OS

Investor-demo ready MVP for an AI-powered supplier marketplace. ZOVO lets buyers create sourcing
projects, suppliers publish profiles, and the AI matching engine ranks suppliers by fit.

## Architecture

```text
ZOVO/
|-- app/                    # Next.js dashboard routes
|   |-- login/
|   |-- register/
|   |-- dashboard/
|   |-- projects/
|   |-- suppliers/
|   `-- match/[projectId]/
|-- components/             # Reusable SaaS UI components
|-- services/               # Business logic + browser API client
|-- middleware/             # Auth and role enforcement
|-- pages/api/              # Vercel serverless API routes
|   |-- auth/
|   |-- projects/
|   |-- suppliers/
|   `-- ai/match/
|-- lib/                    # Core DB, auth token, validation, logging, AI engine
|-- data/db.json            # JSON database seed
|-- vercel.json
|-- deploy.sh
|-- .env.example
`-- package.json
```

## Constraints Met

- Vercel serverless compatible via Next.js API routes.
- No Prisma.
- No SQLite or native database modules.
- No `better-sqlite3`.
- No `node-gyp` dependencies.
- Uses pure JavaScript/TypeScript packages only.
- JSON database wrapper supports `read()`, `write()`, `insert()`, `find()`, and `update()`.

## Features

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- JWT bearer token middleware.
- Password hashing with `bcryptjs`.
- Roles: `BUYER`, `SUPPLIER`.

Seed login:

```text
email: amina@acme.example
password: password123
role: BUYER
```

### Core Entities

- `users`
- `suppliers`
- `projects`
- `bids`

### AI Matching

Supplier score:

- Rating: 40%
- Category match: 30%
- Budget fit: 30%

Output:

```json
{
  "projectId": "project_iot_sensors",
  "matches": [
    {
      "supplierId": "supplier_techsource",
      "name": "TechSource Components",
      "score": 98.4,
      "confidence": 98.67,
      "explanation": "TechSource Components directly matches the electronics category, fits the $45,000 budget range, has a 4.8/5 supplier rating. Overall score 98.4 with 98.67% confidence.",
      "breakdown": {
        "rating": 96,
        "categoryMatch": 100,
        "budgetFit": 100
      }
    }
  ]
}
```

## API Endpoints

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/projects
POST /api/projects
GET  /api/suppliers
POST /api/suppliers
GET  /api/ai/match/:projectId
GET  /api/bids
POST /api/bids
GET  /api/demo/stats
```

Protected routes require:

```http
Authorization: Bearer <token>
```

## Frontend Pages

- `/login`
- `/register`
- `/dashboard`
- `/projects`
- `/suppliers`
- `/match/[projectId]`

The dashboard displays investor KPIs, project pipeline, supplier count, system status, and AI supplier rankings with score bars, confidence, explanations, and supplier selection.

## Local Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm start
```

## Vercel Deployment

Set this environment variable in Vercel:

```text
JWT_SECRET=replace-with-a-long-random-secret
```

Deploy with:

```bash
npm run deploy
```

or directly:

```bash
vercel deploy
```

## Investor Demo Flow

1. Register or login with the seeded buyer.
2. Create a project on `/projects`.
3. Add supplier profiles on `/suppliers`.
4. Open `/match/[projectId]` from the project pipeline.
5. Review ranked AI results with confidence and explanations.
6. Select a supplier to complete the sourcing story.

## JSON DB Note

`data/db.json` is the seed database. On Vercel, API routes copy the seed to `/tmp/zovo-db.json`
for runtime writes. This keeps the MVP serverless-compatible and dependency-free. For long-term
production persistence, the `lib/db.ts` wrapper is the migration seam for Supabase/Postgres without
changing controllers or UI flows.
