"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction } from "@/app/actions/auth";
import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/validation";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initialFormState);
  return (
    <form action={action} className="space-y-5">
      {state.message ? <Alert tone={state.status === "error" ? "danger" : "success"}>{state.message}</Alert> : null}
      <div className="space-y-2"><Label htmlFor="password">Nueva contraseña</Label><Input id="password" name="password" type="password" autoComplete="new-password" required /><FieldError messages={state.fields.password} /></div>
      <div className="space-y-2"><Label htmlFor="confirmation">Confirmar contraseña</Label><Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required /><FieldError messages={state.fields.confirmation} /></div>
      <Button className="w-full" size="lg" disabled={pending}>{pending ? "Actualizando…" : "Actualizar contraseña"}</Button>
      {state.status === "success" ? <Button asChild variant="secondary" className="w-full"><Link href="/dashboard">Continuar</Link></Button> : null}
    </form>
  );
}
