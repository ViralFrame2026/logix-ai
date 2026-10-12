import "server-only";

import { z } from "zod";
import { requireMembership } from "@/data/auth";
import { createClient } from "@/lib/supabase/server";

const balanceSchema = z.array(z.object({
  quantity: z.coerce.number(),
  products: z.union([
    z.object({ critical_stock: z.coerce.number() }),
    z.array(z.object({ critical_stock: z.coerce.number() })),
  ]),
}));

const movementsSchema = z.array(z.object({
  id: z.string().uuid(),
  movement_type: z.string(),
  quantity: z.coerce.number(),
  created_at: z.string(),
  products: z.union([z.object({ name: z.string() }), z.array(z.object({ name: z.string() }))]),
  warehouses: z.union([z.object({ name: z.string() }), z.array(z.object({ name: z.string() }))]),
}));

function firstRelation<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] as T : value;
}

export async function getDashboardData() {
  const membership = await requireMembership();
  const supabase = await createClient();
  const organizationId = membership.organizationId;

  const [products, orders, balances, movements, warehouses] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["draft", "confirmed", "picking"]),
    supabase.from("inventory_balances").select("quantity, products!inner(critical_stock)").eq("organization_id", organizationId),
    supabase.from("stock_movements").select("id, movement_type, quantity, created_at, products!inner(name), warehouses!inner(name)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(6),
    supabase.from("warehouses").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true),
  ]);

  const errors = [products.error, orders.error, balances.error, movements.error, warehouses.error].filter(Boolean);
  if (errors.length) throw new Error("No se pudieron consultar los indicadores operativos.");

  const parsedBalances = balanceSchema.parse(balances.data ?? []);
  const criticalStock = parsedBalances.filter((row) => {
    const product = firstRelation(row.products);
    return product ? row.quantity <= product.critical_stock : false;
  }).length;
  const parsedMovements = movementsSchema.parse(movements.data ?? []);

  return {
    products: products.count ?? 0,
    pendingOrders: orders.count ?? 0,
    criticalStock,
    warehouses: warehouses.count ?? 0,
    movements: parsedMovements.map((movement) => ({
      id: movement.id,
      type: movement.movement_type,
      quantity: movement.quantity,
      createdAt: movement.created_at,
      product: firstRelation(movement.products)?.name ?? "Producto",
      warehouse: firstRelation(movement.warehouses)?.name ?? "Depósito",
    })),
  };
}
