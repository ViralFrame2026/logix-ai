"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/validation";

export function RegisterForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(registerAction, initialFormState);
  return (
    <form action={action} className="space-y-5">
      {!configured ? <Alert tone="warning">Configurá Supabase para habilitar el registro.</Alert> : null}
      {state.message ? <Alert tone={state.status === "error" ? "danger" : "success"}>{state.message}</Alert> : null}
      <div className="space-y-2"><Label htmlFor="fullName">Nombre completo</Label><Input id="fullName" name="fullName" autoComplete="name" required /><FieldError messages={state.fields.fullName} /></div>
      <div className="space-y-2"><Label htmlFor="email">Email laboral</Label><Input id="email" name="email" type="email" autoComplete="email" required /><FieldError messages={state.fields.email} /></div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label><Input id="password" name="password" type="password" autoComplete="new-password" required /><FieldError messages={state.fields.password} />
        <p className="text-xs leading-5 text-slate-500">10+ caracteres, mayúscula, minúscula y número.</p>
      </div>
      <Button className="w-full" size="lg" disabled={pending || !configured}>{pending ? "Creando cuenta…" : "Crear cuenta"}</Button>
    </form>
  );
}
