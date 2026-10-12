import "server-only";

import { z } from "zod";
import { requireMembership } from "@/data/auth";
import { createClient } from "@/lib/supabase/server";
import { roles } from "@/lib/permissions";

const warehouseSchema = z.array(z.object({
  id: z.string().uuid(), name: z.string(), code: z.string(), active: z.boolean(), created_at: z.string(),
}));

const memberSchema = z.array(z.object({
  user_id: z.string().uuid(), role: z.enum(roles), status: z.string(),
  user_profiles: z.union([z.object({ full_name: z.string().nullable() }), z.array(z.object({ full_name: z.string().nullable() }))]).nullable(),
}));

const locationSchema = z.array(z.object({
  id: z.string().uuid(), code: z.string(), name: z.string(),
  warehouses: z.union([z.object({ name: z.string() }), z.array(z.object({ name: z.string() }))]),
}));

function relation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getWarehouses() {
  const membership = await requireMembership();
  const supabase = await createClient();
  const { data, error } = await supabase.from("warehouses").select("id, name, code, active, created_at").eq("organization_id", membership.organizationId).order("created_at");
  if (error) throw new Error("No se pudieron cargar los depósitos.");
  return warehouseSchema.parse(data ?? []);
}

export async function getMembers() {
  const membership = await requireMembership();
  const supabase = await createClient();
  const { data, error } = await supabase.from("organization_members").select("user_id, role, status, user_profiles!inner(full_name)").eq("organization_id", membership.organizationId).order("created_at");
  if (error) throw new Error("No se pudieron cargar los usuarios.");
  return memberSchema.parse(data ?? []).map((member) => ({ ...member, fullName: relation(member.user_profiles)?.full_name ?? "Usuario" }));
}

export async function getScannerLocations() {
  const membership = await requireMembership();
  const supabase = await createClient();
  const { data, error } = await supabase.from("warehouse_locations").select("id, code, name, warehouses!inner(name)").eq("organization_id", membership.organizationId).eq("active", true).order("code");
  if (error) throw new Error("No se pudieron cargar las ubicaciones.");
  return locationSchema.parse(data ?? []).map((location) => ({
    id: location.id, code: location.code, name: location.name, warehouse: relation(location.warehouses)?.name ?? "Depósito",
  }));
}
