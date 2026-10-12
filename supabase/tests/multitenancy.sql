begin;

-- This script is executed by `supabase test db`. Any raised exception fails the test.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner-a@example.test', '', now(), '{}', '{"full_name":"Owner A"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'owner-b@example.test', '', now(), '{}', '{"full_name":"Owner B"}', now(), now());

insert into public.organizations (id, name, slug, created_by) values
  ('a0000000-0000-0000-0000-000000000001', 'Tenant A', 'tenant-a', '10000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Tenant B', 'tenant-b', '20000000-0000-0000-0000-000000000002');
insert into public.organization_members (organization_id, user_id, role) values
  ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'owner'),
  ('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'owner');
insert into public.products (organization_id, sku, name) values
  ('a0000000-0000-0000-0000-000000000001', 'A-1', 'Producto A'),
  ('b0000000-0000-0000-0000-000000000002', 'B-1', 'Producto B');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

do $$
begin
  if (select count(*) from public.organizations) <> 1 then raise exception 'tenant A can see another organization'; end if;
  if (select count(*) from public.products) <> 1 then raise exception 'tenant A can see another product'; end if;
  if exists (select 1 from public.products where sku = 'B-1') then raise exception 'cross-tenant product leaked'; end if;
  begin
    insert into public.warehouses (organization_id, name, code) values ('b0000000-0000-0000-0000-000000000002', 'Intrusión', 'NOPE');
    raise exception 'cross-tenant warehouse insert was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
