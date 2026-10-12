"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivateError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="grid min-h-[60vh] place-items-center"><div className="max-w-md text-center"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-red-50 text-red-700"><AlertTriangle /></span><h1 className="mt-5 text-xl font-semibold">No pudimos cargar esta vista</h1><p className="mt-2 text-sm leading-6 text-slate-500">Verificá la conexión con Supabase y que las migraciones estén aplicadas.</p><Button className="mt-6" onClick={reset}>Reintentar</Button></div></div>;
}
