"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/data/auth";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema, type FormState, zodErrors } from "@/lib/validation";

export async function createOrganizationAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = onboardingSchema.safeParse({
    organizationName: formData.get("organizationName"),
    organizationSlug: formData.get("organizationSlug"),
    warehouseName: formData.get("warehouseName"),
    warehouseCode: formData.get("warehouseCode"),
    requestId: formData.get("requestId"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_organization_with_owner", {
    p_name: parsed.data.organizationName,
    p_slug: parsed.data.organizationSlug,
    p_warehouse_name: parsed.data.warehouseName,
    p_warehouse_code: parsed.data.warehouseCode,
    p_request_id: parsed.data.requestId,
  });
  if (error) {
    const duplicateSlug = error.code === "23505";
    return {
      status: "error",
      message: duplicateSlug ? "Ese identificador de empresa ya está en uso. Elegí otro." : "No pudimos crear la empresa de forma segura. Volvé a intentar.",
      fields: duplicateSlug ? { organizationSlug: ["El identificador ya existe."] } : {},
    };
  }
  redirect("/dashboard");
}
