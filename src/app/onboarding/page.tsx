import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { getMembershipForUser, requireUser } from "@/data/auth";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await getMembershipForUser(user)) redirect("/dashboard");
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7 flex items-center justify-center gap-3 font-bold text-sidebar">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-white"><Boxes className="size-5" aria-hidden="true" /></span>LOGIX AI
        </div>
        <Card>
          <CardHeader className="border-b p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Configuración inicial</p>
            <CardTitle className="mt-2 text-2xl">Prepará tu espacio operativo</CardTitle>
            <CardDescription>Creá la empresa y el primer depósito. Vas a quedar registrado como Owner.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8"><OnboardingForm requestId={randomUUID()} /></CardContent>
        </Card>
      </div>
    </main>
  );
}
