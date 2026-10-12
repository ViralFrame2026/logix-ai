begin;

create type public.order_status as enum ('draft', 'confirmed', 'picking', 'ready', 'shipped', 'cancelled');
create type public.receipt_status as enum ('draft', 'in_progress', 'completed', 'cancelled');
create type public.stock_movement_type as enum ('receipt', 'shipment', 'adjustment_in', 'adjustment_out', 'transfer_in', 'transfer_out');
create type public.ai_insight_status as enum ('new', 'reviewed', 'dismissed');

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sku extensions.citext not null check (char_length(sku::text) between 1 and 80),
  name text not null check (char_length(name) between 1 and 200),
  description text,
  critical_stock numeric(18,3) not null default 0 check (critical_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku),
  unique (id, organization_id)
);

create table public.product_barcodes (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null,
  code text not null check (char_length(code) between 1 and 256),
  format text not null default 'unknown',
  created_at timestamptz not null default now(),
  foreign key (product_id, organization_id) references public.products(id, organization_id) on delete cascade,
  unique (organization_id, code)
);

create table public.orders (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  warehouse_id uuid not null,
  number extensions.citext not null check (char_length(number::text) between 1 and 80),
  status public.order_status not null default 'draft',
  customer_reference text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id),
  unique (organization_id, number),
  unique (id, organization_id)
);

create table public.order_items (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  order_id uuid not null,
  product_id uuid not null,
  requested_quantity numeric(18,3) not null check (requested_quantity > 0),
  fulfilled_quantity numeric(18,3) not null default 0 check (fulfilled_quantity >= 0 and fulfilled_quantity <= requested_quantity),
  created_at timestamptz not null default now(),
  foreign key (order_id, organization_id) references public.orders(id, organization_id) on delete cascade,
  foreign key (product_id, organization_id) references public.products(id, organization_id),
  unique (order_id, product_id)
);

create table public.receipts (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  warehouse_id uuid not null,
  number extensions.citext not null check (char_length(number::text) between 1 and 80),
  status public.receipt_status not null default 'draft',
  supplier_reference text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id),
  unique (organization_id, number),
  unique (id, organization_id)
);

create table public.receipt_items (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  receipt_id uuid not null,
  product_id uuid not null,
  expected_quantity numeric(18,3) not null check (expected_quantity > 0),
  received_quantity numeric(18,3) not null default 0 check (received_quantity >= 0),
  created_at timestamptz not null default now(),
  foreign key (receipt_id, organization_id) references public.receipts(id, organization_id) on delete cascade,
  foreign key (product_id, organization_id) references public.products(id, organization_id),
  unique (receipt_id, product_id)
);

create table public.inventory_balances (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  warehouse_id uuid not null,
  location_id uuid,
  product_id uuid not null,
  quantity numeric(18,3) not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id),
  foreign key (location_id, organization_id) references public.warehouse_locations(id, organization_id),
  foreign key (product_id, organization_id) references public.products(id, organization_id),
  unique nulls not distinct (organization_id, warehouse_id, location_id, product_id)
);

create table public.stock_movements (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  warehouse_id uuid not null,
  location_id uuid,
  product_id uuid not null,
  movement_type public.stock_movement_type not null,
  quantity numeric(18,3) not null check (quantity > 0),
  reference_type text,
  reference_id uuid,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id),
  foreign key (location_id, organization_id) references public.warehouse_locations(id, organization_id),
  foreign key (product_id, organization_id) references public.products(id, organization_id)
);

create table public.stock_reservations (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  warehouse_id uuid not null,
  product_id uuid not null,
  order_id uuid not null,
  quantity numeric(18,3) not null check (quantity > 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id),
  foreign key (product_id, organization_id) references public.products(id, organization_id),
  foreign key (order_id, organization_id) references public.orders(id, organization_id) on delete cascade,
  unique (order_id, product_id)
);

create table public.ai_insights (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  insight_type text not null check (char_length(insight_type) between 2 and 80),
  title text not null check (char_length(title) between 2 and 200),
  body text not null,
  source_metadata jsonb not null default '{}'::jsonb,
  status public.ai_insight_status not null default 'new',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index products_org_active_idx on public.products (organization_id, active);
create index product_barcodes_org_code_idx on public.product_barcodes (organization_id, code);
create index orders_org_status_idx on public.orders (organization_id, status, created_at desc);
create index receipts_org_status_idx on public.receipts (organization_id, status, created_at desc);
create index inventory_balances_lookup_idx on public.inventory_balances (organization_id, warehouse_id, product_id);
create index stock_movements_org_created_idx on public.stock_movements (organization_id, created_at desc);
create index reservations_org_product_idx on public.stock_reservations (organization_id, product_id);
create index ai_insights_org_status_idx on public.ai_insights (organization_id, status, created_at desc);

create trigger products_updated_at before update on public.products for each row execute function private.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function private.set_updated_at();
create trigger receipts_updated_at before update on public.receipts for each row execute function private.set_updated_at();
create trigger balances_updated_at before update on public.inventory_balances for each row execute function private.set_updated_at();

alter table public.products enable row level security;
alter table public.product_barcodes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;
alter table public.inventory_balances enable row level security;
alter table public.stock_movements enable row level security;
alter table public.stock_reservations enable row level security;
alter table public.ai_insights enable row level security;

create policy products_select on public.products for select to authenticated using (public.is_organization_member(organization_id));
create policy products_write on public.products for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[]));
create policy barcodes_select on public.product_barcodes for select to authenticated using (public.is_organization_member(organization_id));
create policy barcodes_write on public.product_barcodes for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[]));

create policy orders_select on public.orders for select to authenticated using (public.is_organization_member(organization_id));
create policy orders_write on public.orders for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager','operator']::public.app_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','manager','operator']::public.app_role[]) and created_by = auth.uid());
create policy order_items_select on public.order_items for select to authenticated using (public.is_organization_member(organization_id));
create policy order_items_write on public.order_items for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager','operator']::public.app_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','manager','operator']::public.app_role[]));

create policy receipts_select on public.receipts for select to authenticated using (public.is_organization_member(organization_id));
create policy receipts_write on public.receipts for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager','operator']::public.app_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','manager','operator']::public.app_role[]) and created_by = auth.uid());
create policy receipt_items_select on public.receipt_items for select to authenticated using (public.is_organization_member(organization_id));
create policy receipt_items_write on public.receipt_items for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager','operator']::public.app_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','manager','operator']::public.app_role[]));

create policy balances_select on public.inventory_balances for select to authenticated using (public.is_organization_member(organization_id));
create policy movements_select on public.stock_movements for select to authenticated using (public.is_organization_member(organization_id));
create policy reservations_select on public.stock_reservations for select to authenticated using (public.is_organization_member(organization_id));
create policy insights_select on public.ai_insights for select to authenticated using (public.is_organization_member(organization_id));

grant select on public.products, public.product_barcodes, public.orders, public.order_items, public.receipts, public.receipt_items, public.inventory_balances, public.stock_movements, public.stock_reservations, public.ai_insights to authenticated;
-- Operational mutations are intentionally not granted until transactional RPCs are implemented.

commit;
