begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.app_role as enum ('owner', 'admin', 'manager', 'operator', 'viewer');
create type public.member_status as enum ('active', 'invited', 'suspended');

create table public.organizations (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug extensions.citext not null unique check (slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, created_by)
);

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) between 2 and 100),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'viewer',
  status public.member_status not null default 'active',
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (id, organization_id)
);

create table public.warehouses (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  code extensions.citext not null check (code::text ~ '^[A-Za-z0-9_-]{2,20}$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code),
  unique (id, organization_id)
);

create table public.warehouse_locations (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  warehouse_id uuid not null,
  code extensions.citext not null check (char_length(code::text) between 1 and 40),
  name text not null check (char_length(name) between 1 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (warehouse_id, organization_id) references public.warehouses(id, organization_id) on delete cascade,
  unique (warehouse_id, code),
  unique (id, organization_id)
);

create table public.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  action text not null check (char_length(action) between 3 and 100),
  entity_type text not null check (char_length(entity_type) between 2 and 80),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table private.organization_onboarding_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);

create index organization_members_user_idx on public.organization_members (user_id, status);
create index organization_members_org_role_idx on public.organization_members (organization_id, role, status);
create index warehouses_org_idx on public.warehouses (organization_id, active);
create index warehouse_locations_org_idx on public.warehouse_locations (organization_id, warehouse_id, active);
create index audit_logs_org_created_idx on public.audit_logs (organization_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated_at before update on public.organizations for each row execute function private.set_updated_at();
create trigger profiles_updated_at before update on public.user_profiles for each row execute function private.set_updated_at();
create trigger members_updated_at before update on public.organization_members for each row execute function private.set_updated_at();
create trigger warehouses_updated_at before update on public.warehouses for each row execute function private.set_updated_at();
create trigger locations_updated_at before update on public.warehouse_locations for each row execute function private.set_updated_at();

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization_id and m.user_id = auth.uid() and m.status = 'active'
  );
$$;

create or replace function public.has_organization_role(p_organization_id uuid, p_roles public.app_role[])
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization_id and m.user_id = auth.uid()
      and m.status = 'active' and m.role = any(p_roles)
  );
$$;

create or replace function public.shares_organization(p_user_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members mine
    join public.organization_members theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid() and mine.status = 'active'
      and theirs.user_id = p_user_id and theirs.status = 'active'
  );
$$;

revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.has_organization_role(uuid, public.app_role[]) from public;
revoke all on function public.shares_organization(uuid) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_organization_role(uuid, public.app_role[]) to authenticated;
grant execute on function public.shares_organization(uuid) to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  -- Metadata is display data only. Authorization never reads it.
  insert into public.user_profiles (id, full_name)
  values (
    new.id,
    case
      when char_length(trim(new.raw_user_meta_data ->> 'full_name')) between 2 and 100
      then trim(new.raw_user_meta_data ->> 'full_name')
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.protect_last_owner()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_removing_owner boolean;
begin
  if tg_op = 'DELETE' then
    v_removing_owner := true;
  else
    v_removing_owner := new.role <> 'owner' or new.status <> 'active';
  end if;
  if old.role = 'owner' and old.status = 'active' and v_removing_owner
     and (select count(*) from public.organization_members m where m.organization_id = old.organization_id and m.role = 'owner' and m.status = 'active') <= 1
  then
    raise exception 'organization requires at least one active owner' using errcode = '23514';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger protect_last_owner before update or delete on public.organization_members for each row execute function private.protect_last_owner();

create or replace function public.create_organization_with_owner(
  p_name text,
  p_slug text,
  p_warehouse_name text,
  p_warehouse_code text,
  p_request_id uuid
)
returns table (organization_id uuid, warehouse_id uuid)
language plpgsql security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_warehouse_id uuid;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if char_length(trim(p_name)) not between 2 and 120 then raise exception 'invalid organization name' using errcode = '22023'; end if;
  if lower(trim(p_slug)) !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'invalid organization slug' using errcode = '22023'; end if;
  if char_length(trim(p_warehouse_name)) not between 2 and 120 then raise exception 'invalid warehouse name' using errcode = '22023'; end if;
  if upper(trim(p_warehouse_code)) !~ '^[A-Z0-9_-]{2,20}$' then raise exception 'invalid warehouse code' using errcode = '22023'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));
  select r.organization_id, r.warehouse_id into v_organization_id, v_warehouse_id
  from private.organization_onboarding_requests r where r.user_id = v_user_id and r.request_id = p_request_id;
  if found then return query select v_organization_id, v_warehouse_id; return; end if;

  insert into public.organizations (name, slug, created_by)
  values (trim(p_name), lower(trim(p_slug)), v_user_id) returning id into v_organization_id;
  insert into public.organization_members (organization_id, user_id, role, status)
  values (v_organization_id, v_user_id, 'owner', 'active');
  insert into public.warehouses (organization_id, name, code)
  values (v_organization_id, trim(p_warehouse_name), upper(trim(p_warehouse_code))) returning id into v_warehouse_id;
  insert into private.organization_onboarding_requests (user_id, request_id, organization_id, warehouse_id)
  values (v_user_id, p_request_id, v_organization_id, v_warehouse_id);
  insert into public.audit_logs (organization_id, actor_user_id, action, entity_type, entity_id)
  values (v_organization_id, v_user_id, 'organization.created', 'organization', v_organization_id);
  return query select v_organization_id, v_warehouse_id;
end;
$$;

revoke all on function public.create_organization_with_owner(text, text, text, text, uuid) from public, anon;
grant execute on function public.create_organization_with_owner(text, text, text, text, uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.warehouses enable row level security;
alter table public.warehouse_locations enable row level security;
alter table public.audit_logs enable row level security;

create policy organizations_select on public.organizations for select to authenticated using (public.is_organization_member(id));
create policy organizations_update on public.organizations for update to authenticated using (public.has_organization_role(id, array['owner']::public.app_role[])) with check (public.has_organization_role(id, array['owner']::public.app_role[]));

create policy profiles_select on public.user_profiles for select to authenticated using (id = auth.uid() or public.shares_organization(id));
create policy profiles_update on public.user_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy members_select on public.organization_members for select to authenticated using (public.is_organization_member(organization_id));
create policy members_insert on public.organization_members for insert to authenticated with check (
  public.has_organization_role(organization_id, array['owner']::public.app_role[])
  or (role not in ('owner', 'admin') and public.has_organization_role(organization_id, array['admin']::public.app_role[]))
);
create policy members_update on public.organization_members for update to authenticated using (
  public.has_organization_role(organization_id, array['owner']::public.app_role[])
  or (role not in ('owner', 'admin') and public.has_organization_role(organization_id, array['admin']::public.app_role[]))
) with check (
  public.has_organization_role(organization_id, array['owner']::public.app_role[])
  or (role not in ('owner', 'admin') and public.has_organization_role(organization_id, array['admin']::public.app_role[]))
);
create policy members_delete on public.organization_members for delete to authenticated using (
  user_id <> auth.uid() and (
    public.has_organization_role(organization_id, array['owner']::public.app_role[])
    or (role not in ('owner', 'admin') and public.has_organization_role(organization_id, array['admin']::public.app_role[]))
  )
);

create policy warehouses_select on public.warehouses for select to authenticated using (public.is_organization_member(organization_id));
create policy warehouses_write on public.warehouses for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[]));
create policy locations_select on public.warehouse_locations for select to authenticated using (public.is_organization_member(organization_id));
create policy locations_write on public.warehouse_locations for all to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[])) with check (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[]));
create policy audit_select on public.audit_logs for select to authenticated using (public.has_organization_role(organization_id, array['owner','admin','manager']::public.app_role[]));

revoke all on all tables in schema public from anon;
grant select on public.organizations, public.user_profiles, public.organization_members, public.warehouses, public.warehouse_locations, public.audit_logs to authenticated;
grant update (full_name, avatar_url) on public.user_profiles to authenticated;
-- Sensitive administrative writes stay behind reviewed RPCs. The current UI is read-only.

commit;
