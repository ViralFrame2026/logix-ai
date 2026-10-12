import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabasePublicConfig } from "@/lib/env";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";
  return (
    <AuthShell title="Bienvenido de nuevo" description="Ingresá a tu espacio operativo seguro." footer={<>¿Todavía no tenés cuenta? <Link href="/register" className="font-semibold text-brand hover:underline">Crear cuenta</Link></>}>
      <LoginForm configured={Boolean(getSupabasePublicConfig())} nextPath={next} />
    </AuthShell>
  );
}
