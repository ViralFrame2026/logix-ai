import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function KpiCard({ label, value, helper, icon: Icon, tone = "blue" }: {
  label: string; value: number; helper: string; icon: LucideIcon; tone?: "blue" | "green" | "amber" | "slate";
}) {
  const tones = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", slate: "bg-slate-100 text-slate-700" };
  return (
    <Card className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value.toLocaleString("es-AR")}</p><p className="mt-2 text-xs text-slate-500">{helper}</p></div><span className={`grid size-11 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" aria-hidden="true" /></span></div></Card>
  );
}
