-- ZOVO Supplier AI (B2B AI supplier execution platform)
-- Supabase/PostgreSQL migration

create extension if not exists pgcrypto;

do $$
begin
  create type public.organization_member_role as enum ('owner', 'admin', 'operator', 'viewer');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.supplier_status as enum ('prospect', 'active', 'paused', 'blocked', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.supplier_risk_level as enum ('low', 'medium', 'high', 'critical');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.supplier_interaction_type as enum ('email', 'call', 'meeting', 'chat', 'system_note');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.sourcing_event_status as enum ('draft', 'active', 'awarded', 'cancelled', 'closed');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.purchase_order_status as enum ('draft', 'sent', 'acknowledged', 'in_production', 'shipped', 'delivered', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.shipment_status as enum ('planned', 'in_transit', 'delayed', 'delivered', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.task_status as enum ('open', 'in_progress', 'blocked', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.ai_agent_run_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  website text,
  industry text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_key unique (slug),
  constraint organizations_slug_not_blank check (btrim(slug) <> ''),
  constraint organizations_name_not_blank check (btrim(name) <> '')
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  role public.organization_member_role not null default 'viewer',
  invited_by uuid,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_members_organization_user_key unique (organization_id, user_id)
);

create table if not exists public.supplier_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_categories_organization_name_key unique (organization_id, name),
  constraint supplier_categories_name_not_blank check (btrim(name) <> '')
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid references public.supplier_categories(id) on delete set null,
  name text not null,
  legal_name text,
  status public.supplier_status not null default 'prospect',
  risk_level public.supplier_risk_level not null default 'low',
  website text,
  country_code char(2),
  tax_id text,
  primary_contact_name text,
  primary_contact_email text,
  primary_contact_phone text,
  capabilities jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  score numeric(5,2),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_organization_name_key unique (organization_id, name),
  constraint suppliers_name_not_blank check (btrim(name) <> ''),
  constraint suppliers_score_range check (score is null or (score >= 0 and score <= 100)),
  constraint suppliers_country_code_upper check (country_code is null or country_code = upper(country_code))
);

create table if not exists public.supplier_contacts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  name text not null,
  title text,
  email text,
  phone text,
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_contacts_name_not_blank check (btrim(name) <> '')
);

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  sku text,
  name text not null,
  description text,
  unit_of_measure text,
  minimum_order_quantity numeric(14,4),
  lead_time_days integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_products_supplier_sku_key unique (supplier_id, sku),
  constraint supplier_products_name_not_blank check (btrim(name) <> ''),
  constraint supplier_products_minimum_order_quantity_nonnegative check (minimum_order_quantity is null or minimum_order_quantity >= 0),
  constraint supplier_products_lead_time_days_nonnegative check (lead_time_days is null or lead_time_days >= 0)
);

create table if not exists public.supplier_interactions (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  organization_member_id uuid references public.organization_members(id) on delete set null,
  interaction_type public.supplier_interaction_type not null,
  subject text not null,
  body text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_interactions_subject_not_blank check (btrim(subject) <> '')
);

create table if not exists public.supplier_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  assessed_by uuid references public.organization_members(id) on delete set null,
  risk_level public.supplier_risk_level not null,
  score numeric(5,2),
  summary text,
  findings jsonb not null default '[]'::jsonb,
  assessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_risk_assessments_score_range check (score is null or (score >= 0 and score <= 100))
);

create table if not exists public.sourcing_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_member_id uuid references public.organization_members(id) on delete set null,
  title text not null,
  description text,
  status public.sourcing_event_status not null default 'draft',
  due_at timestamptz,
  requirements jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sourcing_events_title_not_blank check (btrim(title) <> '')
);

create table if not exists public.sourcing_event_suppliers (
  id uuid primary key default gen_random_uuid(),
  sourcing_event_id uuid not null references public.sourcing_events(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  invited_at timestamptz,
  responded_at timestamptz,
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sourcing_event_suppliers_event_supplier_key unique (sourcing_event_id, supplier_id)
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  sourcing_event_id uuid references public.sourcing_events(id) on delete set null,
  order_number text not null,
  status public.purchase_order_status not null default 'draft',
  currency_code char(3) not null default 'USD',
  subtotal_amount numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  issued_at timestamptz,
  expected_delivery_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_orders_organization_order_number_key unique (organization_id, order_number),
  constraint purchase_orders_order_number_not_blank check (btrim(order_number) <> ''),
  constraint purchase_orders_currency_code_upper check (currency_code = upper(currency_code)),
  constraint purchase_orders_amounts_nonnegative check (subtotal_amount >= 0 and tax_amount >= 0 and total_amount >= 0)
);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  supplier_product_id uuid references public.supplier_products(id) on delete set null,
  line_number integer not null,
  description text not null,
  quantity numeric(14,4) not null,
  unit_price numeric(14,4) not null default 0,
  total_amount numeric(14,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_order_items_order_line_key unique (purchase_order_id, line_number),
  constraint purchase_order_items_description_not_blank check (btrim(description) <> ''),
  constraint purchase_order_items_quantity_positive check (quantity > 0),
  constraint purchase_order_items_amounts_nonnegative check (unit_price >= 0 and total_amount >= 0)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status public.shipment_status not null default 'planned',
  carrier text,
  tracking_number text,
  origin text,
  destination text,
  estimated_departure_at timestamptz,
  estimated_arrival_at timestamptz,
  actual_departure_at timestamptz,
  actual_arrival_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.execution_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  purchase_order_id uuid references public.purchase_orders(id) on delete cascade,
  assigned_member_id uuid references public.organization_members(id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'open',
  priority integer not null default 3,
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint execution_tasks_title_not_blank check (btrim(title) <> ''),
  constraint execution_tasks_priority_range check (priority between 1 and 5)
);

create table if not exists public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  configuration jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_agents_organization_name_key unique (organization_id, name),
  constraint ai_agents_name_not_blank check (btrim(name) <> '')
);

create table if not exists public.ai_agent_runs (
  id uuid primary key default gen_random_uuid(),
  ai_agent_id uuid not null references public.ai_agents(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  execution_task_id uuid references public.execution_tasks(id) on delete set null,
  status public.ai_agent_run_status not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete cascade,
  ai_agent_run_id uuid references public.ai_agent_runs(id) on delete set null,
  title text not null,
  recommendation text not null,
  confidence numeric(5,2),
  accepted_at timestamptz,
  dismissed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_recommendations_title_not_blank check (btrim(title) <> ''),
  constraint ai_recommendations_confidence_range check (confidence is null or (confidence >= 0 and confidence <= 100))
);

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id);

create index if not exists supplier_categories_organization_id_idx
  on public.supplier_categories (organization_id);

create index if not exists suppliers_organization_id_idx
  on public.suppliers (organization_id);

create index if not exists suppliers_category_id_idx
  on public.suppliers (category_id);

create index if not exists suppliers_status_idx
  on public.suppliers (status);

create index if not exists suppliers_risk_level_idx
  on public.suppliers (risk_level);

create index if not exists suppliers_metadata_gin_idx
  on public.suppliers using gin (metadata);

create index if not exists supplier_contacts_supplier_id_idx
  on public.supplier_contacts (supplier_id);

create unique index if not exists supplier_contacts_one_primary_idx
  on public.supplier_contacts (supplier_id)
  where is_primary;

create index if not exists supplier_products_supplier_id_idx
  on public.supplier_products (supplier_id);

create index if not exists supplier_interactions_supplier_occurred_at_idx
  on public.supplier_interactions (supplier_id, occurred_at desc);

create index if not exists supplier_interactions_organization_member_id_idx
  on public.supplier_interactions (organization_member_id);

create index if not exists supplier_risk_assessments_supplier_assessed_at_idx
  on public.supplier_risk_assessments (supplier_id, assessed_at desc);

create index if not exists supplier_risk_assessments_assessed_by_idx
  on public.supplier_risk_assessments (assessed_by);

create index if not exists sourcing_events_organization_status_idx
  on public.sourcing_events (organization_id, status);

create index if not exists sourcing_events_owner_member_id_idx
  on public.sourcing_events (owner_member_id);

create index if not exists sourcing_event_suppliers_supplier_id_idx
  on public.sourcing_event_suppliers (supplier_id);

create index if not exists purchase_orders_organization_status_idx
  on public.purchase_orders (organization_id, status);

create index if not exists purchase_orders_supplier_id_idx
  on public.purchase_orders (supplier_id);

create index if not exists purchase_orders_sourcing_event_id_idx
  on public.purchase_orders (sourcing_event_id);

create index if not exists purchase_order_items_purchase_order_id_idx
  on public.purchase_order_items (purchase_order_id);

create index if not exists purchase_order_items_supplier_product_id_idx
  on public.purchase_order_items (supplier_product_id);

create index if not exists shipments_purchase_order_id_idx
  on public.shipments (purchase_order_id);

create index if not exists shipments_supplier_status_idx
  on public.shipments (supplier_id, status);

create index if not exists execution_tasks_organization_status_idx
  on public.execution_tasks (organization_id, status);

create index if not exists execution_tasks_supplier_id_idx
  on public.execution_tasks (supplier_id);

create index if not exists execution_tasks_purchase_order_id_idx
  on public.execution_tasks (purchase_order_id);

create index if not exists execution_tasks_assigned_member_id_idx
  on public.execution_tasks (assigned_member_id);

create index if not exists ai_agents_organization_id_idx
  on public.ai_agents (organization_id);

create index if not exists ai_agent_runs_agent_status_idx
  on public.ai_agent_runs (ai_agent_id, status);

create index if not exists ai_agent_runs_organization_created_at_idx
  on public.ai_agent_runs (organization_id, created_at desc);

create index if not exists ai_agent_runs_supplier_id_idx
  on public.ai_agent_runs (supplier_id);

create index if not exists ai_agent_runs_execution_task_id_idx
  on public.ai_agent_runs (execution_task_id);

create index if not exists ai_recommendations_organization_id_idx
  on public.ai_recommendations (organization_id);

create index if not exists ai_recommendations_supplier_id_idx
  on public.ai_recommendations (supplier_id);

create index if not exists ai_recommendations_ai_agent_run_id_idx
  on public.ai_recommendations (ai_agent_run_id);

do $$
begin
  create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_organization_members_updated_at
  before update on public.organization_members
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_supplier_categories_updated_at
  before update on public.supplier_categories
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_supplier_contacts_updated_at
  before update on public.supplier_contacts
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_supplier_products_updated_at
  before update on public.supplier_products
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_supplier_interactions_updated_at
  before update on public.supplier_interactions
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_supplier_risk_assessments_updated_at
  before update on public.supplier_risk_assessments
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_sourcing_events_updated_at
  before update on public.sourcing_events
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_sourcing_event_suppliers_updated_at
  before update on public.sourcing_event_suppliers
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_purchase_orders_updated_at
  before update on public.purchase_orders
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_purchase_order_items_updated_at
  before update on public.purchase_order_items
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_shipments_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_execution_tasks_updated_at
  before update on public.execution_tasks
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_ai_agents_updated_at
  before update on public.ai_agents
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_ai_agent_runs_updated_at
  before update on public.ai_agent_runs
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create trigger set_ai_recommendations_updated_at
  before update on public.ai_recommendations
  for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;
