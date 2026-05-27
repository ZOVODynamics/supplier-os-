# ZOVO Supplier AI

A production-style MVP foundation for a B2B supplier execution platform.

## Apps

- `zovo-backend` - Node.js, Express, dotenv, CORS, UUID, Supabase client
- `zovo-dashboard` - React dashboard built with Vite and Axios

## Backend

```bash
cd zovo-backend
npm install
node server.js
```

Set Supabase credentials in `zovo-backend/.env`:

```bash
SUPABASE_URL=
SUPABASE_KEY=
PORT=3000
```

Run `zovo-backend/schema.sql` in the Supabase SQL editor before using data endpoints.

### API endpoints

- `GET /health`
- `GET /requests`
- `POST /request`
- `POST /business`
- `POST /supplier`

## Frontend

```bash
cd zovo-dashboard
npm install
npm run dev
```

Optional dashboard API override:

```bash
VITE_API_URL=http://localhost:3000
```
