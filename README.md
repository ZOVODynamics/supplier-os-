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

No Prisma generation, native database packages, compiled binaries, watch scripts, or auto-restart loops are required.
