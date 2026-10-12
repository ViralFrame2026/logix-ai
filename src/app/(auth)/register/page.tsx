import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getSupabasePublicConfig } from "@/lib/env";

export default function RegisterPage() {
  return (
    <AuthShell title="Creá tu cuenta" description="Empezá con una organización y un depósito aislados por diseño." footer={<>¿Ya tenés cuenta? <Link href="/login" className="font-semibold text-brand hover:underline">Ingresar</Link></>}>
      <RegisterForm configured={Boolean(getSupabasePublicConfig())} />
    </AuthShell>
  );
}
