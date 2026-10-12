import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabasePublicConfig } from "@/lib/env";
import { roles, type Role } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

const membershipSchema = z.object({
  organization_id: z.string().uuid(),
  role: z.enum(roles),
  organizations: z.object({ name: z.string(), slug: z.string() }),
});

const profileSchema = z.object({ full_name: z.string().nullable() }).nullable();

export type AuthenticatedUser = { id: string; email: string | null };
export type ActiveMembership = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: Role;
  fullName: string | null;
  email: string | null;
};

export const requireUser = cache(async (): Promise<AuthenticatedUser> => {
  if (!getSupabasePublicConfig()) redirect("/login?reason=configuration");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const subject = claims?.sub;
  if (error || typeof subject !== "string") redirect("/login");
  const email = claims?.email;
  return { id: subject, email: typeof email === "string" ? email : null };
});

export const getMembershipForUser = cache(
  async (user: AuthenticatedUser): Promise<ActiveMembership | null> => {
    const supabase = await createClient();
    const [membershipResult, profileResult] = await Promise.all([
      supabase
        .from("organization_members")
        .select("organization_id, role, organizations!inner(name, slug)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("user_profiles").select("full_name").eq("id", user.id).maybeSingle(),
    ]);

    if (membershipResult.error) throw new Error("No se pudo cargar la organización activa.");
    if (!membershipResult.data) return null;

    const membership = membershipSchema.parse(membershipResult.data);
    const profile = profileSchema.parse(profileResult.data);
    return {
      organizationId: membership.organization_id,
      organizationName: membership.organizations.name,
      organizationSlug: membership.organizations.slug,
      role: membership.role,
      fullName: profile?.full_name ?? null,
      email: user.email,
    };
  },
);

export const requireMembership = cache(async (): Promise<ActiveMembership> => {
  const user = await requireUser();
  const membership = await getMembershipForUser(user);
  if (!membership) redirect("/onboarding");
  return membership;
});
