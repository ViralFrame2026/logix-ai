"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems, settingsItems } from "@/components/layout/nav-items";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const renderItems = (items: typeof navItems | typeof settingsItems) => items.map((item) => {
    const active = pathname === item.href || (item.href !== "/settings" && pathname.startsWith(`${item.href}/`));
    const Icon = item.icon;
    return (
      <Link key={item.href} href={item.href} {...(onNavigate ? { onClick: onNavigate } : {})} aria-current={active ? "page" : undefined}
        className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition", active ? "bg-blue-500/20 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white")}>
        <Icon className="size-[18px]" aria-hidden="true" />{item.label}
      </Link>
    );
  });
  return (
    <nav aria-label="Navegación principal" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      <div className="space-y-1">{renderItems(navItems)}</div>
      <div><p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Administración</p><div className="space-y-1">{renderItems(settingsItems)}</div></div>
    </nav>
  );
}
