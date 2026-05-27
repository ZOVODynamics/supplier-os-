# ZOVO Supplier AI Backend

AI-powered autonomous supplier intelligence system for B2B marketplace workflows between businesses and suppliers.

## Stack

- Node.js 20+
- Express
- Supabase PostgreSQL via `@supabase/supabase-js`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Set Supabase credentials in `.env`:

   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-service-role-or-anon-key
   ```

4. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

5. Start the API:

   ```bash
   npm start
   ```

## API

- `GET /health`
- `POST /business`
- `POST /supplier`
- `POST /request`
- `GET /requests`
- `POST /execution`
- `GET /executions`

## Health response

```json
{
  "status": "ok",
  "supabase": "connected"
}
```
