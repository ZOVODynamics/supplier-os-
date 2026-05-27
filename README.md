# ZOVO Supplier AI Backend

Production-ready Express API foundation for a B2B marketplace connecting businesses with suppliers.

## Requirements

- Node.js 20+
- Supabase project with PostgreSQL enabled

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

3. Run `supabase/schema.sql` in the Supabase SQL editor. The schema is idempotent and uses `gen_random_uuid()` from `pgcrypto`.

4. Start the API:

   ```bash
   npm start
   ```

## Environment variables

- `SUPABASE_URL` - Supabase project URL.
- `SUPABASE_KEY` - Supabase API key for server-side database access.
- `PORT` - API port, defaults to `3000`.
- `CORS_ORIGIN` - Optional comma-separated list of allowed origins.
- `RATE_LIMIT_PER_MINUTE` - Optional request limit per minute, defaults to `120`.

## Endpoints

- `GET /health`
- `POST /business`
- `POST /supplier`
- `POST /request`
- `GET /requests`
- `POST /execution`
