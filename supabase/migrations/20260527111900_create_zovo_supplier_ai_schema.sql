-- ZOVO Supplier AI core database schema
-- Supabase/PostgreSQL migration for operational requests, supplier execution,
-- verification-ready execution records, and commission-aware value flow.

create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  balance numeric(14, 2) not null default 0,
  created_at timestamp with time zone not null default now(),

  constraint businesses_name_not_blank check (length(btrim(name)) > 0),
  constraint businesses_email_not_blank check (length(btrim(email)) > 0),
  constraint businesses_balance_non_negative check (balance >= 0)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  skills text not null default '',
  rating numeric(3, 2) not null default 0,
  trust_score integer not null default 100,
  balance numeric(14, 2) not null default 0,
  created_at timestamp with time zone not null default now(),

  constraint suppliers_type_allowed check (type in ('human', 'ai')),
  constraint suppliers_rating_range check (rating >= 0 and rating <= 5),
  constraint suppliers_trust_score_range check (trust_score >= 0 and trust_score <= 100),
  constraint suppliers_balance_non_negative check (balance >= 0)
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  title text not null,
  description text not null,
  budget numeric(14, 2) not null,
  status text not null default 'open',
  created_at timestamp with time zone not null default now(),

  constraint requests_title_not_blank check (length(btrim(title)) > 0),
  constraint requests_budget_positive check (budget > 0),
  constraint requests_status_allowed check (status in ('open', 'assigned', 'completed', 'cancelled'))
);

create table if not exists public.executions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null default 'assigned',
  result_data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),

  constraint executions_status_allowed check (status in ('assigned', 'in_progress', 'done', 'failed'))
);

create table if not exists public.ledger (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete restrict,
  business_id uuid not null references public.businesses(id) on delete restrict,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  total_amount numeric(14, 2) not null,
  platform_fee numeric(14, 2) not null,
  supplier_payment numeric(14, 2) not null,
  created_at timestamp with time zone not null default now(),

  constraint ledger_one_entry_per_request unique (request_id),
  constraint ledger_total_amount_positive check (total_amount > 0),
  constraint ledger_platform_fee_matches_commission check (platform_fee = round(total_amount * 0.20, 2)),
  constraint ledger_supplier_payment_matches_commission check (supplier_payment = total_amount - platform_fee)
);

create index if not exists idx_suppliers_type on public.suppliers(type);
create index if not exists idx_suppliers_trust_score on public.suppliers(trust_score desc);
create index if not exists idx_requests_business_id on public.requests(business_id);
create index if not exists idx_requests_status on public.requests(status);
create index if not exists idx_executions_request_id on public.executions(request_id);
create index if not exists idx_executions_supplier_id on public.executions(supplier_id);
create index if not exists idx_executions_status on public.executions(status);
create index if not exists idx_ledger_business_id on public.ledger(business_id);
create index if not exists idx_ledger_supplier_id on public.ledger(supplier_id);
create index if not exists idx_ledger_created_at on public.ledger(created_at desc);

create or replace function public.set_ledger_amounts()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  request_business_id uuid;
  request_budget numeric(14, 2);
begin
  select r.business_id, r.budget
    into request_business_id, request_budget
  from public.requests r
  where r.id = new.request_id;

  if not found then
    raise exception 'Request % does not exist', new.request_id
      using errcode = 'foreign_key_violation';
  end if;

  if new.business_id is null then
    new.business_id := request_business_id;
  elsif new.business_id <> request_business_id then
    raise exception 'Ledger business_id % does not match request % business_id %',
      new.business_id, new.request_id, request_business_id
      using errcode = 'check_violation';
  end if;

  new.total_amount := request_budget;
  new.platform_fee := round(new.total_amount * 0.20, 2);
  new.supplier_payment := new.total_amount - new.platform_fee;
  new.created_at := coalesce(new.created_at, now());

  return new;
end;
$$;

drop trigger if exists set_ledger_amounts_before_insert_or_update on public.ledger;

create trigger set_ledger_amounts_before_insert_or_update
before insert or update of request_id, business_id, total_amount, platform_fee, supplier_payment
on public.ledger
for each row
execute function public.set_ledger_amounts();

create or replace function public.increment_balance(user_id uuid, amount numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  next_balance numeric(14, 2);
begin
  if user_id is null then
    raise exception 'user_id is required' using errcode = 'not_null_violation';
  end if;

  if amount is null or amount = 0 then
    raise exception 'amount must be non-zero' using errcode = 'check_violation';
  end if;

  select balance + amount
    into next_balance
  from public.businesses
  where id = user_id
  for update;

  if found then
    if next_balance < 0 then
      raise exception 'Business balance cannot be negative for id %', user_id
        using errcode = 'check_violation';
    end if;

    update public.businesses
    set balance = next_balance
    where id = user_id;

    return next_balance;
  end if;

  select balance + amount
    into next_balance
  from public.suppliers
  where id = user_id
  for update;

  if found then
    if next_balance < 0 then
      raise exception 'Supplier balance cannot be negative for id %', user_id
        using errcode = 'check_violation';
    end if;

    update public.suppliers
    set balance = next_balance
    where id = user_id;

    return next_balance;
  end if;

  raise exception 'No business or supplier found for id %', user_id
    using errcode = 'no_data_found';
end;
$$;

alter table public.businesses enable row level security;
alter table public.suppliers enable row level security;
alter table public.requests enable row level security;
alter table public.executions enable row level security;
alter table public.ledger enable row level security;

comment on table public.businesses is 'Companies creating operational requests on ZOVO Supplier AI.';
comment on table public.suppliers is 'Human and AI suppliers that execute operational requests.';
comment on table public.requests is 'Business-created operational work requests with positive budgets.';
comment on table public.executions is 'Supplier execution attempts and verification-ready result payloads.';
comment on table public.ledger is 'Commission-aware payment ledger: 20% platform fee and 80% supplier payment.';
comment on function public.increment_balance(uuid, numeric) is 'Atomically increments a business or supplier balance and prevents negative balances.';
