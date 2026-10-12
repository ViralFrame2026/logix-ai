"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/validation";

export function LoginForm({ configured, nextPath }: { configured: boolean; nextPath: string }) {
  const [state, action, pending] = useActionState(loginAction, initialFormState);
  return (
    <form action={action} className="space-y-5">
      {!configured ? <Alert tone="warning">La conexión con Supabase todavía no está configurada. Consultá <code>.env.example</code>.</Alert> : null}
      {state.message ? <Alert tone={state.status === "error" ? "danger" : "success"}>{state.message}</Alert> : null}
      <input type="hidden" name="next" value={nextPath} />
      <div className="space-y-2">
        <Label htmlFor="email">Email laboral</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError messages={state.fields.email} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Contraseña</Label>
          <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:underline">¿La olvidaste?</Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
        <FieldError messages={state.fields.password} />
      </div>
      <Button className="w-full" size="lg" disabled={pending || !configured}>{pending ? "Ingresando…" : "Ingresar"}</Button>
    </form>
  );
}
