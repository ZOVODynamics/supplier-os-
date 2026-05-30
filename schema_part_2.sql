-- ZOVO Supplier AI database schema - Part 2 of 3
-- Execute after schema_part_1.sql in the Supabase SQL Editor.
--
-- Contains:
--   1. requests
--   2. executions
--
-- Safe to run multiple times after Part 1 has completed.

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  title text not null,
  description text not null default '',
  budget numeric(14, 2) not null,
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  due_at timestamptz
);

create table if not exists public.executions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  status text not null default 'pending',
  notes text not null default '',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.requests
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists business_id uuid,
  add column if not exists supplier_id uuid,
  add column if not exists title text,
  add column if not exists description text not null default '',
  add column if not exists budget numeric(14, 2),
  add column if not exists status text not null default 'new',
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists due_at timestamptz;

alter table public.executions
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists request_id uuid,
  add column if not exists supplier_id uuid,
  add column if not exists status text not null default 'pending',
  add column if not exists notes text not null default '',
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.requests
  alter column id set default gen_random_uuid(),
  alter column description set default '',
  alter column status set default 'new',
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

alter table public.executions
  alter column id set default gen_random_uuid(),
  alter column status set default 'pending',
  alter column notes set default '',
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

update public.requests
set
  id = coalesce(id, gen_random_uuid()),
  description = coalesce(description, ''),
  status = coalesce(status, 'new'),
  created_at = coalesce(created_at, timezone('utc', now())),
  updated_at = coalesce(updated_at, timezone('utc', now()));

update public.executions
set
  id = coalesce(id, gen_random_uuid()),
  status = coalesce(status, 'pending'),
  notes = coalesce(notes, ''),
  created_at = coalesce(created_at, timezone('utc', now())),
  updated_at = coalesce(updated_at, timezone('utc', now()));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'requests_pkey'
      and conrelid = 'public.requests'::regclass
  ) then
    alter table public.requests add constraint requests_pkey primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'requests_business_id_fkey'
      and conrelid = 'public.requests'::regclass
  ) then
    alter table public.requests
      add constraint requests_business_id_fkey
      foreign key (business_id) references public.businesses(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'requests_supplier_id_fkey'
      and conrelid = 'public.requests'::regclass
  ) then
    alter table public.requests
      add constraint requests_supplier_id_fkey
      foreign key (supplier_id) references public.suppliers(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'requests_title_not_empty'
      and conrelid = 'public.requests'::regclass
  ) then
    alter table public.requests
      add constraint requests_title_not_empty check (length(trim(title)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'requests_budget_positive'
      and conrelid = 'public.requests'::regclass
  ) then
    alter table public.requests
      add constraint requests_budget_positive check (budget > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'requests_status_valid'
      and conrelid = 'public.requests'::regclass
  ) then
    alter table public.requests
      add constraint requests_status_valid
      check (status in ('new', 'open', 'in_review', 'matched', 'executing', 'completed', 'cancelled'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'executions_pkey'
      and conrelid = 'public.executions'::regclass
  ) then
    alter table public.executions add constraint executions_pkey primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'executions_request_id_fkey'
      and conrelid = 'public.executions'::regclass
  ) then
    alter table public.executions
      add constraint executions_request_id_fkey
      foreign key (request_id) references public.requests(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'executions_supplier_id_fkey'
      and conrelid = 'public.executions'::regclass
  ) then
    alter table public.executions
      add constraint executions_supplier_id_fkey
      foreign key (supplier_id) references public.suppliers(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'executions_status_valid'
      and conrelid = 'public.executions'::regclass
  ) then
    alter table public.executions
      add constraint executions_status_valid
      check (status in ('pending', 'in_progress', 'blocked', 'completed', 'cancelled'));
  end if;
end;
$$;
