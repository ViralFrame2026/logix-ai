"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/app/actions/auth";
import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/validation";

export function ForgotPasswordForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialFormState);
  return (
    <form action={action} className="space-y-5">
      {state.message ? <Alert tone={state.status === "error" ? "danger" : "success"}>{state.message}</Alert> : null}
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /><FieldError messages={state.fields.email} /></div>
      <Button className="w-full" size="lg" disabled={pending || !configured}>{pending ? "Enviando…" : "Enviar enlace"}</Button>
    </form>
  );
}
