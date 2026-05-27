-- ZOVO Supplier AI database schema
-- Supabase-compatible PostgreSQL schema for the B2B supplier execution platform.
-- Safe to run multiple times: creates missing tables, columns, constraints, indexes,
-- grants, and timestamp triggers without dropping existing data.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

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

alter table public.ledger
  alter column id set default gen_random_uuid(),
  alter column entry_type set default 'expense',
  alter column currency set default 'USD',
  alter column description set default '',
  alter column occurred_at set default timezone('utc', now()),
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
