-- ZOVO Supplier AI - Supabase schema
-- Safe to run more than once in the Supabase SQL editor.

-- This schema intentionally does not create extensions. Supabase provides
-- gen_random_uuid() on supported Postgres versions without requiring this
-- script to run CREATE EXTENSION.

-- ---------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles as p (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(p.full_name, excluded.full_name);

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Core identity and marketplace tables
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  website text,
  description text,
  country text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 180),
  website text,
  country text,
  category text,
  ai_summary text,
  status text not null default 'active'
    check (status in ('draft', 'active', 'archived')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 180),
  description text,
  sku text,
  unit text,
  min_order_quantity numeric(14, 2) check (min_order_quantity is null or min_order_quantity >= 0),
  price numeric(14, 2) check (price is null or price >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'quoted', 'closed', 'cancelled')),
  due_date date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rfq_items (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null check (char_length(name) between 1 and 180),
  specifications text,
  quantity numeric(14, 2) not null check (quantity > 0),
  unit text,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'accepted', 'rejected')),
  total_amount numeric(14, 2) check (total_amount is null or total_amount >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  valid_until date,
  notes text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rfq_id, supplier_id)
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  rfq_item_id uuid references public.rfq_items(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  quantity numeric(14, 2) not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  total_price numeric(14, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete set null,
  company_id uuid not null references public.companies(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  total_amount numeric(14, 2) check (total_amount is null or total_amount >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  ordered_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  quantity numeric(14, 2) not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  total_price numeric(14, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Membership helpers for RLS
-- ---------------------------------------------------------------------

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.is_company_admin(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin')
  );
$$;

create or replace function public.handle_new_company()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_members (company_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (company_id, user_id) do update
    set role = 'owner';

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists companies_created_by_idx on public.companies(created_by);
create index if not exists company_members_user_id_idx on public.company_members(user_id);
create index if not exists suppliers_company_id_idx on public.suppliers(company_id);
create index if not exists suppliers_created_by_idx on public.suppliers(created_by);
create index if not exists products_supplier_id_idx on public.products(supplier_id);
create index if not exists rfqs_company_id_idx on public.rfqs(company_id);
create index if not exists rfqs_created_by_idx on public.rfqs(created_by);
create index if not exists rfq_items_rfq_id_idx on public.rfq_items(rfq_id);
create index if not exists quotes_rfq_id_idx on public.quotes(rfq_id);
create index if not exists quotes_supplier_id_idx on public.quotes(supplier_id);
create index if not exists quote_items_quote_id_idx on public.quote_items(quote_id);
create index if not exists orders_company_id_idx on public.orders(company_id);
create index if not exists orders_supplier_id_idx on public.orders(supplier_id);
create index if not exists orders_ordered_by_idx on public.orders(ordered_by);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists companies_create_owner_member on public.companies;
create trigger companies_create_owner_member
  after insert on public.companies
  for each row execute function public.handle_new_company();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists rfqs_set_updated_at on public.rfqs;
create trigger rfqs_set_updated_at
  before update on public.rfqs
  for each row execute function public.set_updated_at();

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.rfqs enable row level security;
alter table public.rfq_items enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "companies_select_member" on public.companies;
create policy "companies_select_member" on public.companies
  for select using (public.is_company_member(id) or created_by = auth.uid());

drop policy if exists "companies_insert_creator" on public.companies;
create policy "companies_insert_creator" on public.companies
  for insert with check (created_by = auth.uid());

drop policy if exists "companies_update_admin" on public.companies;
create policy "companies_update_admin" on public.companies
  for update using (public.is_company_admin(id) or created_by = auth.uid())
  with check (public.is_company_admin(id) or created_by = auth.uid());

drop policy if exists "companies_delete_owner" on public.companies;
create policy "companies_delete_owner" on public.companies
  for delete using (public.is_company_admin(id) or created_by = auth.uid());

drop policy if exists "company_members_select_company" on public.company_members;
create policy "company_members_select_company" on public.company_members
  for select using (public.is_company_member(company_id) or user_id = auth.uid());

drop policy if exists "company_members_insert_admin" on public.company_members;
create policy "company_members_insert_admin" on public.company_members
  for insert with check (public.is_company_admin(company_id));

drop policy if exists "company_members_update_admin" on public.company_members;
create policy "company_members_update_admin" on public.company_members
  for update using (public.is_company_admin(company_id))
  with check (public.is_company_admin(company_id));

drop policy if exists "company_members_delete_admin" on public.company_members;
create policy "company_members_delete_admin" on public.company_members
  for delete using (public.is_company_admin(company_id));

drop policy if exists "suppliers_select_company" on public.suppliers;
create policy "suppliers_select_company" on public.suppliers
  for select using (public.is_company_member(company_id));

drop policy if exists "suppliers_insert_company" on public.suppliers;
create policy "suppliers_insert_company" on public.suppliers
  for insert with check (public.is_company_member(company_id) and created_by = auth.uid());

drop policy if exists "suppliers_update_company" on public.suppliers;
create policy "suppliers_update_company" on public.suppliers
  for update using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

drop policy if exists "suppliers_delete_company" on public.suppliers;
create policy "suppliers_delete_company" on public.suppliers
  for delete using (public.is_company_member(company_id));

drop policy if exists "products_select_company" on public.products;
create policy "products_select_company" on public.products
  for select using (
    exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "products_insert_company" on public.products;
create policy "products_insert_company" on public.products
  for insert with check (
    exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "products_update_company" on public.products;
create policy "products_update_company" on public.products
  for update using (
    exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  )
  with check (
    exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "products_delete_company" on public.products;
create policy "products_delete_company" on public.products
  for delete using (
    exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "rfqs_select_company" on public.rfqs;
create policy "rfqs_select_company" on public.rfqs
  for select using (public.is_company_member(company_id));

drop policy if exists "rfqs_insert_company" on public.rfqs;
create policy "rfqs_insert_company" on public.rfqs
  for insert with check (public.is_company_member(company_id) and created_by = auth.uid());

drop policy if exists "rfqs_update_company" on public.rfqs;
create policy "rfqs_update_company" on public.rfqs
  for update using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

drop policy if exists "rfqs_delete_company" on public.rfqs;
create policy "rfqs_delete_company" on public.rfqs
  for delete using (public.is_company_member(company_id));

drop policy if exists "rfq_items_select_company" on public.rfq_items;
create policy "rfq_items_select_company" on public.rfq_items
  for select using (
    exists (
      select 1
      from public.rfqs r
      where r.id = rfq_id
        and public.is_company_member(r.company_id)
    )
  );

drop policy if exists "rfq_items_insert_company" on public.rfq_items;
create policy "rfq_items_insert_company" on public.rfq_items
  for insert with check (
    exists (
      select 1
      from public.rfqs r
      where r.id = rfq_id
        and public.is_company_member(r.company_id)
    )
  );

drop policy if exists "rfq_items_update_company" on public.rfq_items;
create policy "rfq_items_update_company" on public.rfq_items
  for update using (
    exists (
      select 1
      from public.rfqs r
      where r.id = rfq_id
        and public.is_company_member(r.company_id)
    )
  )
  with check (
    exists (
      select 1
      from public.rfqs r
      where r.id = rfq_id
        and public.is_company_member(r.company_id)
    )
  );

drop policy if exists "rfq_items_delete_company" on public.rfq_items;
create policy "rfq_items_delete_company" on public.rfq_items
  for delete using (
    exists (
      select 1
      from public.rfqs r
      where r.id = rfq_id
        and public.is_company_member(r.company_id)
    )
  );

drop policy if exists "quotes_select_participants" on public.quotes;
create policy "quotes_select_participants" on public.quotes
  for select using (
    exists (
      select 1
      from public.rfqs r
      where r.id = rfq_id
        and public.is_company_member(r.company_id)
    )
    or exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "quotes_insert_supplier_company" on public.quotes;
create policy "quotes_insert_supplier_company" on public.quotes
  for insert with check (
    exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "quotes_update_participants" on public.quotes;
create policy "quotes_update_participants" on public.quotes
  for update using (
    exists (
      select 1
      from public.rfqs r
      where r.id = rfq_id
        and public.is_company_member(r.company_id)
    )
    or exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  )
  with check (
    exists (
      select 1
      from public.rfqs r
      where r.id = rfq_id
        and public.is_company_member(r.company_id)
    )
    or exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "quotes_delete_supplier_company" on public.quotes;
create policy "quotes_delete_supplier_company" on public.quotes
  for delete using (
    exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "quote_items_select_participants" on public.quote_items;
create policy "quote_items_select_participants" on public.quote_items
  for select using (
    exists (
      select 1
      from public.quotes q
      join public.rfqs r on r.id = q.rfq_id
      join public.suppliers s on s.id = q.supplier_id
      where q.id = quote_id
        and (public.is_company_member(r.company_id) or public.is_company_member(s.company_id))
    )
  );

drop policy if exists "quote_items_insert_supplier_company" on public.quote_items;
create policy "quote_items_insert_supplier_company" on public.quote_items
  for insert with check (
    exists (
      select 1
      from public.quotes q
      join public.suppliers s on s.id = q.supplier_id
      where q.id = quote_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "quote_items_update_supplier_company" on public.quote_items;
create policy "quote_items_update_supplier_company" on public.quote_items
  for update using (
    exists (
      select 1
      from public.quotes q
      join public.suppliers s on s.id = q.supplier_id
      where q.id = quote_id
        and public.is_company_member(s.company_id)
    )
  )
  with check (
    exists (
      select 1
      from public.quotes q
      join public.suppliers s on s.id = q.supplier_id
      where q.id = quote_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "quote_items_delete_supplier_company" on public.quote_items;
create policy "quote_items_delete_supplier_company" on public.quote_items
  for delete using (
    exists (
      select 1
      from public.quotes q
      join public.suppliers s on s.id = q.supplier_id
      where q.id = quote_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "orders_select_participants" on public.orders;
create policy "orders_select_participants" on public.orders
  for select using (
    public.is_company_member(company_id)
    or exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "orders_insert_company" on public.orders;
create policy "orders_insert_company" on public.orders
  for insert with check (public.is_company_member(company_id) and ordered_by = auth.uid());

drop policy if exists "orders_update_participants" on public.orders;
create policy "orders_update_participants" on public.orders
  for update using (
    public.is_company_member(company_id)
    or exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  )
  with check (
    public.is_company_member(company_id)
    or exists (
      select 1
      from public.suppliers s
      where s.id = supplier_id
        and public.is_company_member(s.company_id)
    )
  );

drop policy if exists "orders_delete_company" on public.orders;
create policy "orders_delete_company" on public.orders
  for delete using (public.is_company_member(company_id));

drop policy if exists "order_items_select_participants" on public.order_items;
create policy "order_items_select_participants" on public.order_items
  for select using (
    exists (
      select 1
      from public.orders o
      join public.suppliers s on s.id = o.supplier_id
      where o.id = order_id
        and (public.is_company_member(o.company_id) or public.is_company_member(s.company_id))
    )
  );

drop policy if exists "order_items_insert_company" on public.order_items;
create policy "order_items_insert_company" on public.order_items
  for insert with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and public.is_company_member(o.company_id)
    )
  );

drop policy if exists "order_items_update_company" on public.order_items;
create policy "order_items_update_company" on public.order_items
  for update using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and public.is_company_member(o.company_id)
    )
  )
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and public.is_company_member(o.company_id)
    )
  );

drop policy if exists "order_items_delete_company" on public.order_items;
create policy "order_items_delete_company" on public.order_items
  for delete using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and public.is_company_member(o.company_id)
    )
  );
