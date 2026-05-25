# Supplier OS

A production-ready SaaS foundation for managing supplier projects.

Built with:

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** for styling
- **Supabase** for Postgres + Auth (cookie-based SSR via `@supabase/ssr`)
- **Server Actions** + **Zod** for the data layer

Build 1 ships:

- Email + password authentication (signup, login, signout, protected routes)
- A dashboard with navigation
- Full CRUD on **Projects** with strict per-user isolation (Postgres RLS)

See [`docs/architecture.md`](./docs/architecture.md) for the full design.

---

## 1. Prerequisites

- Node.js **18.18+** (Node 20 LTS recommended)
- npm 9+
- A [Supabase](https://supabase.com) project (free tier is fine)

## 2. Configure Supabase

1. Create a new Supabase project.
2. In the project, open **SQL Editor** → **New query** → paste the contents
   of [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
3. In **Authentication → Providers**, make sure **Email** is enabled. For the
   smoothest local dev experience, you can disable "Confirm email" so signup
   returns a session immediately.
4. In **Authentication → URL Configuration**, add
   `http://localhost:3000/auth/callback` to the **Redirect URLs**.
5. From **Project Settings → API**, copy:
   - `Project URL`
   - `anon` public key

## 3. Configure the app

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Hit **Get started** to create an account.
- You'll land on `/dashboard` once authenticated.
- Create, edit, archive, and delete projects from `/dashboard/projects`.

## 5. Useful scripts

| Command            | What it does                       |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start the Next.js dev server       |
| `npm run build`    | Production build                   |
| `npm run start`    | Run the production build           |
| `npm run typecheck`| Type-check the project             |
| `npm run lint`     | Lint with `next lint`              |

## 6. Project layout

```
src/
├── app/                       # Next.js App Router
│   ├── (marketing)/page.tsx
│   ├── (auth)/{login,signup}/
│   ├── auth/{callback,signout}/
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx
│       └── projects/{,new,[id]}/
├── components/                # UI + feature components
├── lib/                       # Supabase clients, env, validation, auth
├── server/projects.ts         # Server Actions for the Projects module
├── types/database.ts          # DB row types
└── middleware.ts              # Session refresh + protected-route guard
supabase/schema.sql            # Canonical DB schema + RLS
docs/architecture.md           # Full architecture document
```

## 7. Security model in one paragraph

The Next.js server holds nothing but the user's Supabase JWT (in HTTP-only
cookies). Every database read/write goes through the user-scoped Supabase
client, so Postgres Row Level Security is what actually authorizes access —
each table's policies require `auth.uid() = user_id`. There is no service
role key used in this codebase; even a compromised server cannot read or
mutate another user's projects.

## 8. License

MIT.
