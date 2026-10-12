import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50 px-5 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-white text-slate-500 shadow-sm"><Icon className="size-5" /></span>
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>{action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
