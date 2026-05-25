# Supplier OS — Architecture (Build 1)

> Production-ready SaaS foundation. Build 1 ships authentication, a dashboard,
> and a per-user Projects CRUD system backed by PostgreSQL (Supabase).

---

## 1. Goals (Build 1)

- A user can sign up, log in, and log out.
- A user lands on a dashboard after authenticating.
- A user can create, list, edit, and delete their own projects.
- Project data is strictly isolated per user (enforced at the DB layer via RLS).
- The app runs locally with `npm install && npm run dev` once env vars are set.

Out of scope for Build 1: billing, AI features, multi-tenancy beyond
per-user ownership, team invites, admin panel.

---

## 2. Tech Stack

| Layer        | Choice                                          |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 14 (App Router) + TypeScript            |
| Styling      | TailwindCSS 3                                   |
| Backend      | Next.js Route Handlers + Server Actions         |
| Database     | PostgreSQL (Supabase-managed)                   |
| Auth         | Supabase Auth (email + password) via `@supabase/ssr` |
| Validation   | Zod                                             |
| Deployment   | Any Node host (Vercel-friendly)                 |

We picked **Supabase Auth** (not NextAuth) because:

- The DB is already Postgres on Supabase, so RLS is the cleanest way to
  enforce per-user data isolation.
- `@supabase/ssr` integrates with the App Router cookie model out of the box.
- One credential surface (anon key + service role) instead of two.

---

## 3. Folder Structure

```
.
├── docs/
│   └── architecture.md
├── public/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   └── page.tsx                 # public landing
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── auth/
│   │   │   ├── callback/route.ts        # exchange ?code for session
│   │   │   └── signout/route.ts
│   │   ├── dashboard/
│   │   │   ├── layout.tsx               # protected shell
│   │   │   ├── page.tsx                 # overview
│   │   │   └── projects/
│   │   │       ├── page.tsx             # list
│   │   │       ├── new/page.tsx         # create
│   │   │       └── [id]/page.tsx        # edit / delete
│   │   ├── layout.tsx                   # root layout
│   │   ├── globals.css
│   │   └── error.tsx                    # global error boundary
│   ├── components/
│   │   ├── ui/                          # primitives (Button, Input, ...)
│   │   ├── nav/                         # Sidebar, Topbar
│   │   └── projects/                    # ProjectForm, ProjectCard
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # browser client
│   │   │   ├── server.ts                # RSC / route-handler client
│   │   │   └── middleware.ts            # session refresher
│   │   ├── auth.ts                      # requireUser() helper
│   │   ├── validation.ts                # zod schemas
│   │   └── utils.ts
│   ├── server/
│   │   └── projects.ts                  # server actions (create/update/delete)
│   ├── types/
│   │   └── database.ts                  # generated/hand-written DB types
│   └── middleware.ts                    # session refresh + route guard
├── supabase/
│   └── schema.sql                       # canonical DB schema + RLS
├── .env.example
├── README.md
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

The `src/app` tree uses **route groups** (`(marketing)`, `(auth)`) so the
public marketing and auth screens can share a different shell from the
authenticated `/dashboard` area without leaking into the URL.

---

## 4. Database Schema

Two tables: `profiles` (1-1 with `auth.users`) and `projects`.

```sql
-- profiles: 1-1 with auth.users, created automatically on signup
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- projects: owned by exactly one user
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  description text,
  status      text not null default 'active'
              check (status in ('active','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_user_id_idx on public.projects(user_id);
create index projects_user_updated_idx on public.projects(user_id, updated_at desc);
```

### Row Level Security

RLS is the **only** authorization layer for project rows. Application code
must not trust client-supplied `user_id` values; it always uses the
authenticated `auth.uid()`.

```sql
alter table public.projects enable row level security;

create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);

create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id)
             with check (auth.uid() = user_id);

create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);
```

A trigger creates a `profiles` row on `auth.users` insert, and an
`updated_at` trigger keeps that column fresh on every project update.

The full DDL (including triggers) lives in `supabase/schema.sql`.

---

## 5. Authentication Flow

We use cookie-based SSR auth via `@supabase/ssr`.

```
┌────────────┐   POST /auth/v1/token   ┌────────────────┐
│  Browser   │ ──────────────────────▶ │  Supabase Auth │
└────────────┘                         └────────────────┘
       │                                       │
       │ Set-Cookie: sb-access-token, sb-refresh-token
       │ ◀─────────────────────────────────────┘
       ▼
┌────────────────────────────────────────────────────────┐
│ src/middleware.ts                                      │
│   - reads cookies, refreshes the session if needed     │
│   - if the route is /dashboard/** and no user → /login │
│   - if the route is /login|/signup and user → /dashboard│
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Server Components / Route Handlers                     │
│   createServerSupabaseClient() reads the same cookies. │
│   requireUser() throws to /login if no session.        │
└────────────────────────────────────────────────────────┘
```

- **Signup** and **login** are submitted to the browser Supabase client,
  which sets HTTP-only cookies. After success we `router.refresh()` and
  redirect to `/dashboard`.
- **Logout** hits `POST /auth/signout`, which calls `supabase.auth.signOut()`
  on the server (clearing cookies) and redirects to `/login`.
- **Email confirmation** redirects come back through `/auth/callback`,
  which exchanges the `?code` for a session.

---

## 6. API Surface

All write operations are Server Actions colocated in `src/server/projects.ts`
and called directly from React Server Components / forms — no separate
fetch layer needed. Two route handlers exist for auth side-effects:

| Method | Path                  | Purpose                              |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/auth/callback`      | Exchange OAuth/magic-link `code`     |
| POST   | `/auth/signout`       | Sign out + redirect                  |

### Server Actions (`src/server/projects.ts`)

| Action              | Input                              | Output / Effect              |
| ------------------- | ---------------------------------- | ---------------------------- |
| `createProject`     | `{ name, description? }`           | inserts; redirects to detail |
| `updateProject`     | `{ id, name, description?, status }` | updates own row             |
| `deleteProject`     | `{ id }`                           | deletes own row              |

All actions:

1. Call `requireUser()` (which fetches `supabase.auth.getUser()`).
2. Validate input with a Zod schema.
3. Perform the DB write with the **user-scoped** SSR client so RLS applies.
4. `revalidatePath('/dashboard/projects')` and redirect when appropriate.

---

## 7. Plugin / Module Architecture

Build 1 keeps modules simple but laid out so future verticals (e.g.
"Suppliers", "Orders") can be added without restructuring.

```
src/server/<module>.ts         # server actions / queries for the module
src/app/dashboard/<module>/    # routes for the module
src/components/<module>/       # UI for the module
```

A "module" is the triple of (server actions, routes, components) named the
same. To add a new module:

1. Add table + RLS policies in `supabase/schema.sql`.
2. Add `src/server/<module>.ts` with actions returning typed rows.
3. Add `src/app/dashboard/<module>/...` routes.
4. Add a nav entry to `src/components/nav/sidebar.tsx`.

No central registry is required — the file system *is* the registry —
which keeps things obvious for Build 1 while leaving room for a real
plugin loader later.

---

## 8. Security Baseline

- `SUPABASE_SERVICE_ROLE_KEY` is **never** imported from a client component.
  Build 1 does not need it at all; everything is enforced by RLS using the
  user's JWT.
- All forms run on the server side (Server Actions), so the anon key alone
  cannot be used to bypass validation.
- Cookies are HTTP-only, `Secure` in production, `SameSite=Lax`.
- Input is validated with Zod on every server action.
- Middleware protects `/dashboard/**` so unauthenticated requests never
  reach a server component that assumes a user.
- DB constraints (`check`, `not null`, FK `on delete cascade`) protect
  against malformed rows even if a future caller forgets validation.

---

## 9. Local Dev & Deploy

```bash
cp .env.example .env.local        # fill in Supabase URL + anon key
# In Supabase SQL editor: paste supabase/schema.sql once
npm install
npm run dev
```

Deployment is a standard Next.js build (`npm run build && npm start`).
The only required runtime env vars are:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
