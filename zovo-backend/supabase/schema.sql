create extension if not exists pgcrypto;

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  request_id uuid null,
  supplier_id uuid null,
  request_type text not null default 'unknown',
  success boolean not null default false,
  supplier_performance numeric not null default 0,
  notes text null,
  created_at timestamptz not null default now()
);

create index if not exists insights_request_type_idx on public.insights (request_type);
create index if not exists insights_request_id_idx on public.insights (request_id);
create index if not exists insights_supplier_id_idx on public.insights (supplier_id);
