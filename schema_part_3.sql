-- ZOVO Supplier AI database schema - Part 3 of 3
-- Execute after schema_part_2.sql in the Supabase SQL Editor.
--
-- Contains:
--   1. ledger
--   2. indexes
--   3. triggers
--   4. verification queries
--   5. schema cache reload
--
-- Safe to run multiple times after Parts 1 and 2 have completed.

create table if not exists public.ledger (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  request_id uuid references public.requests(id) on delete set null,
  execution_id uuid references public.executions(id) on delete set null,
  entry_type text not null default 'expense',
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  description text not null default '',
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.ledger
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists business_id uuid,
  add column if not exists supplier_id uuid,
  add column if not exists request_id uuid,
  add column if not exists execution_id uuid,
  add column if not exists entry_type text not null default 'expense',
  add column if not exists amount numeric(14, 2),
  add column if not exists currency text not null default 'USD',
  add column if not exists description text not null default '',
  add column if not exists occurred_at timestamptz not null default timezone('utc', now()),
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.ledger
  alter column id set default gen_random_uuid(),
  alter column entry_type set default 'expense',
  alter column currency set default 'USD',
  alter column description set default '',
  alter column occurred_at set default timezone('utc', now()),
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

update public.ledger
set
  id = coalesce(id, gen_random_uuid()),
  entry_type = coalesce(entry_type, 'expense'),
  currency = coalesce(currency, 'USD'),
  description = coalesce(description, ''),
  occurred_at = coalesce(occurred_at, timezone('utc', now())),
  created_at = coalesce(created_at, timezone('utc', now())),
  updated_at = coalesce(updated_at, timezone('utc', now()));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ledger_pkey'
      and conrelid = 'public.ledger'::regclass
  ) then
    alter table public.ledger add constraint ledger_pkey primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ledger_business_id_fkey'
      and conrelid = 'public.ledger'::regclass
  ) then
    alter table public.ledger
      add constraint ledger_business_id_fkey
      foreign key (business_id) references public.businesses(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ledger_supplier_id_fkey'
      and conrelid = 'public.ledger'::regclass
  ) then
    alter table public.ledger
      add constraint ledger_supplier_id_fkey
      foreign key (supplier_id) references public.suppliers(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ledger_request_id_fkey'
      and conrelid = 'public.ledger'::regclass
  ) then
    alter table public.ledger
      add constraint ledger_request_id_fkey
      foreign key (request_id) references public.requests(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ledger_execution_id_fkey'
      and conrelid = 'public.ledger'::regclass
  ) then
    alter table public.ledger
      add constraint ledger_execution_id_fkey
      foreign key (execution_id) references public.executions(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ledger_entry_type_valid'
      and conrelid = 'public.ledger'::regclass
  ) then
    alter table public.ledger
      add constraint ledger_entry_type_valid check (entry_type in ('expense', 'payment', 'credit', 'adjustment'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ledger_amount_non_negative'
      and conrelid = 'public.ledger'::regclass
  ) then
    alter table public.ledger
      add constraint ledger_amount_non_negative check (amount >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'ledger_currency_iso_length'
      and conrelid = 'public.ledger'::regclass
  ) then
    alter table public.ledger
      add constraint ledger_currency_iso_length check (length(currency) = 3);
  end if;
end;
$$;

create index if not exists idx_businesses_status on public.businesses(status);
create index if not exists idx_businesses_created_at on public.businesses(created_at desc);

create index if not exists idx_suppliers_business_id on public.suppliers(business_id);
create index if not exists idx_suppliers_status on public.suppliers(status);
create index if not exists idx_suppliers_category on public.suppliers(category);
create index if not exists idx_suppliers_created_at on public.suppliers(created_at desc);

create index if not exists idx_requests_business_id on public.requests(business_id);
create index if not exists idx_requests_supplier_id on public.requests(supplier_id);
create index if not exists idx_requests_status on public.requests(status);
create index if not exists idx_requests_created_at on public.requests(created_at desc);

create index if not exists idx_executions_request_id on public.executions(request_id);
create index if not exists idx_executions_supplier_id on public.executions(supplier_id);
create index if not exists idx_executions_status on public.executions(status);
create index if not exists idx_executions_created_at on public.executions(created_at desc);

create index if not exists idx_ledger_business_id on public.ledger(business_id);
create index if not exists idx_ledger_supplier_id on public.ledger(supplier_id);
create index if not exists idx_ledger_request_id on public.ledger(request_id);
create index if not exists idx_ledger_execution_id on public.ledger(execution_id);
create index if not exists idx_ledger_occurred_at on public.ledger(occurred_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_businesses_updated_at on public.businesses;
create trigger set_businesses_updated_at
before update on public.businesses
for each row
execute function public.set_updated_at();

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
before update on public.suppliers
for each row
execute function public.set_updated_at();

drop trigger if exists set_requests_updated_at on public.requests;
create trigger set_requests_updated_at
before update on public.requests
for each row
execute function public.set_updated_at();

drop trigger if exists set_executions_updated_at on public.executions;
create trigger set_executions_updated_at
before update on public.executions
for each row
execute function public.set_updated_at();

drop trigger if exists set_ledger_updated_at on public.ledger;
create trigger set_ledger_updated_at
before update on public.ledger
for each row
execute function public.set_updated_at();

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table
  public.businesses,
  public.suppliers,
  public.requests,
  public.executions,
  public.ledger
to anon, authenticated, service_role;

-- The current MVP backend uses the Supabase anon key from a trusted backend
-- process. RLS is left disabled so the existing Express routes work immediately.
-- Before exposing Supabase directly to browsers, enable RLS and replace these
-- grants with authenticated tenant-scoped policies.

select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('businesses', 'suppliers', 'requests', 'executions', 'ledger')
order by table_name;

select table_schema, table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'requests'
  and column_name in ('id', 'title', 'description', 'budget', 'status', 'created_at')
order by ordinal_position;

notify pgrst, 'reload schema';
