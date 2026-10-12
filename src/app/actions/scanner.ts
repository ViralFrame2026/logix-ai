"use server";

import { z } from "zod";
import { requireMembership } from "@/data/auth";
import { createClient } from "@/lib/supabase/server";
import type { ScannerState } from "@/lib/scanner/types";

const lookupSchema = z.object({ query: z.string().trim().min(1).max(256), kind: z.enum(["code", "search"]) });
const productSchema = z.object({ id: z.string().uuid(), sku: z.string(), name: z.string() });

export async function resolveProductAction(_: ScannerState, formData: FormData): Promise<ScannerState> {
  const parsed = lookupSchema.safeParse({ query: formData.get("query"), kind: formData.get("kind") });
  if (!parsed.success) return { status: "error", message: "Ingresá un código, SKU o nombre válido.", product: null };
  const membership = await requireMembership();
  const supabase = await createClient();

  if (parsed.data.kind === "code") {
    const { data, error } = await supabase.from("product_barcodes").select("products!inner(id, sku, name)").eq("organization_id", membership.organizationId).eq("code", parsed.data.query).maybeSingle();
    if (error) return { status: "error", message: "No pudimos resolver el código.", product: null };
    if (!data) return { status: "error", message: "No encontramos un producto para ese código.", product: null };
    const relation = data.products;
    const product = productSchema.safeParse(Array.isArray(relation) ? relation[0] : relation);
    return product.success ? { status: "success", message: "Producto identificado. No se modificó el stock.", product: product.data } : { status: "error", message: "El producto asociado no es válido.", product: null };
  }

  const escaped = parsed.data.query.replaceAll("%", "\\%").replaceAll("_", "\\_");
  const baseQuery = () => supabase.from("products").select("id, sku, name").eq("organization_id", membership.organizationId).eq("active", true).limit(1);
  const skuResult = await baseQuery().ilike("sku", `%${escaped}%`).maybeSingle();
  if (skuResult.error) return { status: "error", message: "No pudimos buscar el producto.", product: null };
  const nameResult = skuResult.data ? null : await baseQuery().ilike("name", `%${escaped}%`).maybeSingle();
  if (nameResult?.error) return { status: "error", message: "No pudimos buscar el producto.", product: null };
  const product = productSchema.safeParse(skuResult.data ?? nameResult?.data);
  return product.success ? { status: "success", message: "Producto encontrado. No se modificó el stock.", product: product.data } : { status: "error", message: "No encontramos coincidencias.", product: null };
}
