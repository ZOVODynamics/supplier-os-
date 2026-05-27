# ZOVO Supplier AI Backend

AI-powered autonomous supplier intelligence system for ZOVO's B2B supplier marketplace.

## Environment

Copy `.env.example` to `.env` and set real Supabase credentials:

```bash
SUPABASE_URL=<<PUT_HERE>>
SUPABASE_KEY=<<PUT_HERE>>
```

The `.env` file is intentionally ignored by git. Keep Supabase service-role keys and other backend secrets out of frontend code.

## Scripts

```bash
npm start
npm run dev
npm run check:supabase
```

On startup, the backend checks Supabase connectivity and prints `Supabase connected` only after the connection succeeds.
