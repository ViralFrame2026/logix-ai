"use client";

import { useActionState } from "react";
import { createOrganizationAction } from "@/app/actions/onboarding";
import { FieldError } from "@/components/auth/field-error";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/validation";

export function OnboardingForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(createOrganizationAction, initialFormState);
  return (
    <form action={action} className="space-y-6">
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <input type="hidden" name="requestId" value={requestId} />
      <fieldset className="space-y-5">
        <legend className="mb-4 text-sm font-semibold text-slate-950">1. Tu empresa</legend>
        <div className="space-y-2">
          <Label htmlFor="organizationName">Razón social o nombre</Label>
          <Input id="organizationName" name="organizationName" placeholder="Acme Distribuciones" required />
          <FieldError messages={state.fields.organizationName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organizationSlug">Identificador</Label>
          <Input id="organizationSlug" name="organizationSlug" placeholder="acme-distribuciones" required />
          <FieldError messages={state.fields.organizationSlug} />
          <p className="text-xs text-slate-500">Se usa como identificador estable y no contiene datos secretos.</p>
        </div>
      </fieldset>
      <fieldset className="space-y-5 border-t pt-6">
        <legend className="mb-4 text-sm font-semibold text-slate-950">2. Primer depósito</legend>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <div className="space-y-2"><Label htmlFor="warehouseName">Nombre</Label><Input id="warehouseName" name="warehouseName" placeholder="Depósito central" required /><FieldError messages={state.fields.warehouseName} /></div>
          <div className="space-y-2"><Label htmlFor="warehouseCode">Código</Label><Input id="warehouseCode" name="warehouseCode" placeholder="CENTRAL" required /><FieldError messages={state.fields.warehouseCode} /></div>
        </div>
      </fieldset>
      <Button className="w-full" size="lg" disabled={pending}>{pending ? "Creando espacio…" : "Crear empresa y depósito"}</Button>
      <p className="text-center text-xs leading-5 text-slate-500">La operación es atómica: nunca se crea una empresa sin su Owner y depósito inicial.</p>
    </form>
  );
}
