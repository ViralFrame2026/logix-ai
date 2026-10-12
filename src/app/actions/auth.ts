"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type FormState,
  zodErrors,
} from "@/lib/validation";

function safeNextPath(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return zodErrors(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", message: "No pudimos iniciar sesión. Revisá tus credenciales.", fields: {} };
  redirect(safeNextPath(formData.get("next"), "/dashboard"));
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"), email: formData.get("email"), password: formData.get("password"),
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const { fullName, email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      ...(siteUrl ? { emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding` } : {}),
    },
  });
  if (error) return { status: "error", message: "No pudimos crear la cuenta. Probá nuevamente o iniciá sesión.", fields: {} };
  if (data.session) redirect("/onboarding");
  return { status: "success", message: "Revisá tu email para confirmar la cuenta y continuar.", fields: {} };
}

export async function forgotPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return zodErrors(parsed.error);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    ...(siteUrl ? { redirectTo: `${siteUrl}/auth/callback?next=/reset-password` } : {}),
  });
  return { status: "success", message: "Si existe una cuenta con ese email, vas a recibir un enlace de recuperación.", fields: {} };
}

export async function resetPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"), confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: "El enlace venció o no es válido. Solicitá uno nuevo.", fields: {} };
  return { status: "success", message: "Contraseña actualizada. Ya podés continuar.", fields: {} };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
