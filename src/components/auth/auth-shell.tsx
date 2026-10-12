import Link from "next/link";
import { Boxes } from "lucide-react";

export function AuthShell({ title, description, children, footer }: {
  title: string; description: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-blue-500/20 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3 text-lg font-bold tracking-tight">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-500"><Boxes className="size-5" aria-hidden="true" /></span>
          LOGIX AI
        </Link>
        <div className="relative max-w-xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Operación logística inteligente</p>
          <h2 className="text-4xl font-semibold leading-tight">Una base segura para operar cada depósito con claridad.</h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">Organizaciones aisladas, permisos efectivos y trazabilidad desde el primer movimiento.</p>
        </div>
        <p className="relative text-xs text-slate-400">LOGIX AI · Plataforma B2B</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-3 font-bold text-sidebar lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-white"><Boxes className="size-5" aria-hidden="true" /></span>
            LOGIX AI
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-7 text-center text-sm text-slate-600">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
