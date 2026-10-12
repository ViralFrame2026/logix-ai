begin;

-- Supabase grants broad privileges to API roles on new public objects by
-- default. Keep future schema additions closed until a migration explicitly
-- exposes the required operations.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

-- Remove the defaults already inherited by the foundation tables, then restore
-- the deliberately supported read-only surface and profile self-service fields.
revoke all on all tables in schema public from anon, authenticated;

grant select on
  public.organizations,
  public.user_profiles,
  public.organization_members,
  public.warehouses,
  public.warehouse_locations,
  public.audit_logs,
  public.products,
  public.product_barcodes,
  public.orders,
  public.order_items,
  public.receipts,
  public.receipt_items,
  public.inventory_balances,
  public.stock_movements,
  public.stock_reservations,
  public.ai_insights
to authenticated;

grant update (full_name, avatar_url) on public.user_profiles to authenticated;

-- These functions support RLS internals and are not public RPC endpoints.
-- Moving them to the unexposed schema preserves policy dependencies by OID.
alter function public.is_organization_member(uuid) set schema private;
alter function public.has_organization_role(uuid, public.app_role[]) set schema private;
alter function public.shares_organization(uuid) set schema private;

revoke all on function private.is_organization_member(uuid) from public, anon;
revoke all on function private.has_organization_role(uuid, public.app_role[]) from public, anon;
revoke all on function private.shares_organization(uuid) from public, anon;
grant execute on function private.is_organization_member(uuid) to authenticated;
grant execute on function private.has_organization_role(uuid, public.app_role[]) to authenticated;
grant execute on function private.shares_organization(uuid) to authenticated;

commit;
