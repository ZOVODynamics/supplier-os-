-- ZOVO Supplier AI Supabase schema.
-- Uses pgcrypto/gen_random_uuid() for Supabase compatibility.

create extension if not exists pgcrypto;

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  phone text,
  industry text,
  location text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  phone text,
  website text,
  category text,
  location text,
  capabilities jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text not null,
  category text,
  status text not null default 'open' check (status in ('open', 'matching', 'matched', 'closed', 'cancelled')),
  budget_min numeric(12, 2),
  budget_max numeric(12, 2),
  deadline timestamptz,
  requirements jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists executions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_requests_business_id on requests(business_id);
create index if not exists idx_requests_status on requests(status);
create index if not exists idx_requests_created_at on requests(created_at desc);
create index if not exists idx_suppliers_category on suppliers(category);
create index if not exists idx_executions_request_id on executions(request_id);
create index if not exists idx_executions_supplier_id on executions(supplier_id);
create index if not exists idx_executions_status on executions(status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_businesses_updated_at on businesses;
create trigger set_businesses_updated_at
before update on businesses
for each row execute function set_updated_at();

drop trigger if exists set_suppliers_updated_at on suppliers;
create trigger set_suppliers_updated_at
before update on suppliers
for each row execute function set_updated_at();

drop trigger if exists set_requests_updated_at on requests;
create trigger set_requests_updated_at
before update on requests
for each row execute function set_updated_at();

drop trigger if exists set_executions_updated_at on executions;
create trigger set_executions_updated_at
before update on executions
for each row execute function set_updated_at();
