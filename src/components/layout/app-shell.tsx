import { Building2, Boxes, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActiveMembership } from "@/data/auth";
import { roleLabels } from "@/lib/permissions";

function Brand() {
  return <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5"><span className="grid size-9 place-items-center rounded-xl bg-blue-500 text-white"><Boxes className="size-5" /></span><span className="font-bold tracking-tight text-white">LOGIX AI</span></div>;
}

export function AppShell({ membership, children }: { membership: ActiveMembership; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden h-screen flex-col bg-sidebar lg:sticky lg:top-0 lg:flex">
        <Brand /><SidebarNav />
        <div className="border-t border-white/10 p-4 text-xs text-slate-400"><p className="truncate font-semibold text-slate-200">{membership.organizationName}</p><p className="mt-1">Entorno operativo</p></div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><MobileNavigation brand={<Brand />} /><Building2 className="hidden size-5 text-slate-400 sm:block" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-950">{membership.organizationName}</p><p className="truncate text-xs text-slate-500">{membership.organizationSlug}</p></div></div>
          <div className="flex items-center gap-3"><Badge tone="info" className="hidden sm:inline-flex">{roleLabels[membership.role]}</Badge><div className="hidden text-right md:block"><p className="max-w-52 truncate text-sm font-semibold">{membership.fullName ?? "Usuario"}</p><p className="max-w-52 truncate text-xs text-slate-500">{membership.email}</p></div><form action={logoutAction}><Button type="submit" variant="ghost" size="icon" aria-label="Cerrar sesión"><LogOut className="size-4" /></Button></form></div>
        </header>
        <main className="mx-auto w-full max-w-[96rem] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
