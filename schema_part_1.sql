-- ZOVO Supplier AI database schema - Part 1 of 3
-- Execute first in the Supabase SQL Editor.
--
-- Contains:
--   1. extensions
--   2. businesses
--   3. suppliers
--
-- Safe to run multiple times.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  website text,
  industry text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  name text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  category text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.businesses
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists website text,
  add column if not exists industry text,
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.suppliers
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists business_id uuid,
  add column if not exists name text,
  add column if not exists contact_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists website text,
  add column if not exists category text,
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.businesses
  alter column id set default gen_random_uuid(),
  alter column status set default 'active',
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

alter table public.suppliers
  alter column id set default gen_random_uuid(),
  alter column status set default 'active',
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

update public.businesses
set
  id = coalesce(id, gen_random_uuid()),
  status = coalesce(status, 'active'),
  created_at = coalesce(created_at, timezone('utc', now())),
  updated_at = coalesce(updated_at, timezone('utc', now()));

update public.suppliers
set
  id = coalesce(id, gen_random_uuid()),
  status = coalesce(status, 'active'),
  created_at = coalesce(created_at, timezone('utc', now())),
  updated_at = coalesce(updated_at, timezone('utc', now()));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_pkey'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses add constraint businesses_pkey primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_name_not_empty'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_name_not_empty check (length(trim(name)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_status_valid'
      and conrelid = 'public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_status_valid check (status in ('active', 'inactive', 'archived'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'suppliers_pkey'
      and conrelid = 'public.suppliers'::regclass
  ) then
    alter table public.suppliers add constraint suppliers_pkey primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'suppliers_business_id_fkey'
      and conrelid = 'public.suppliers'::regclass
  ) then
    alter table public.suppliers
      add constraint suppliers_business_id_fkey
      foreign key (business_id) references public.businesses(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'suppliers_name_not_empty'
      and conrelid = 'public.suppliers'::regclass
  ) then
    alter table public.suppliers
      add constraint suppliers_name_not_empty check (length(trim(name)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'suppliers_status_valid'
      and conrelid = 'public.suppliers'::regclass
  ) then
    alter table public.suppliers
      add constraint suppliers_status_valid check (status in ('active', 'inactive', 'pending', 'archived'));
  end if;
end;
$$;
