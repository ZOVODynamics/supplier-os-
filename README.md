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
- Manual build-and-run workflow with no watcher or auto-restart scripts

## Folder Structure

```text
ZOVO/
|-- apps/
|   `-- api/
|       |-- src/
|       |   |-- server.ts
|       |   |-- app.ts
|       |   |-- routes/
|       |   |-- controllers/
|       |   |-- services/
|       |   |-- ai/
|       |   |-- db/
|       |   |-- types/
|       |   |-- middleware/
|       |   `-- utils/
|       |-- db.json
|       |-- package.json
|       `-- tsconfig.json
|-- package.json
|-- tsconfig.json
`-- README.md
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
- `apps/api/src/middleware/auth.ts` verifies JWT bearer tokens and enforces roles.
- `apps/api/src/services/authService.ts` handles registration, login, bcrypt password hashing, and JWT generation.

## Data Entities

The JSON database stores:

1. `User` with bcrypt password hash and role `BUYER` or `SUPPLIER`
2. `Supplier`
3. `Project`
4. `Bid`

## Authentication

Set a strong JWT secret outside source control for production:

```bash
export JWT_SECRET=replace-with-a-long-random-secret
```

If `JWT_SECRET` is not set, the API uses a local development fallback so Termux can still run
without extra setup. Production deployments should always set `JWT_SECRET`.

Supported roles:

- `BUYER`: can create projects and request AI supplier matches.
- `SUPPLIER`: can create supplier profiles.

Public auth endpoints:

```http
POST /auth/register
POST /auth/login
```

Protected auth endpoint:

```http
GET /auth/me
```

Register payload:

```json
{
  "name": "Amina Patel",
  "email": "amina@acme.example",
  "password": "password123",
  "role": "BUYER",
  "company": "Acme Manufacturing"
}
```

Login payload:

```json
{
  "email": "amina@acme.example",
  "password": "password123"
}
```

Use the returned token on protected routes:

```http
Authorization: Bearer <token>
```

A seeded demo buyer is available with `amina@acme.example` / `password123`.

## API Endpoints

### Health

```http
GET /health
```

### Projects

```http
GET /projects                 # authenticated
POST /projects                # BUYER only
```

Example project payload:

```json
{
  "title": "IoT sensor assembly",
  "description": "Find a supplier for pilot production.",
  "category": "electronics",
  "budget": 45000
}
```

### Suppliers

```http
GET /suppliers                # authenticated
POST /suppliers               # SUPPLIER only
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
GET /ai/match/:projectId      # BUYER only
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

Build first, then start manually:

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
npm run build
npm start
```

No Prisma generation, native database packages, compiled binaries, watch scripts, auto-restart loops, or native password modules are required.
