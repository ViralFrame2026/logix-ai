import { notFound } from "next/navigation";
import { CheckCircle2, Clock3 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { modules } from "@/lib/modules";

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const definition = modules[slug];
  if (!definition) notFound();
  const Icon = definition.icon;
  return <><PageHeader eyebrow="Módulo" title={definition.title} description={definition.description} /><div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><Card><CardContent className="p-6"><EmptyState icon={Icon} title="Módulo preparado, operaciones pendientes" description={definition.nextStep} /></CardContent></Card><Card><CardHeader><CardTitle>Arquitectura prevista</CardTitle></CardHeader><CardContent><ul className="space-y-4">{definition.capabilities.map((capability) => <li key={capability} className="flex gap-3 text-sm text-slate-600"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />{capability}</li>)}</ul><div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><Clock3 className="mt-0.5 size-4 shrink-0" />Sin datos ficticios ni acciones simuladas.</div></CardContent></Card></div></>;
}
