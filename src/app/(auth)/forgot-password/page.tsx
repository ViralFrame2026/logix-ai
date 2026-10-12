import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getSupabasePublicConfig } from "@/lib/env";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Recuperá tu acceso" description="Te enviaremos un enlace seguro si el email está registrado." footer={<Link href="/login" className="font-semibold text-brand hover:underline">Volver al ingreso</Link>}>
      <ForgotPasswordForm configured={Boolean(getSupabasePublicConfig())} />
    </AuthShell>
  );
}
