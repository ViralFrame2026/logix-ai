import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, ChevronRight, ShieldCheck, Users, Warehouse } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireMembership } from "@/data/auth";
import { getMembers, getWarehouses } from "@/data/settings";
import { can, roleLabels } from "@/lib/permissions";

const sections = [
  { href: "/settings/company", title: "Empresa", description: "Identidad y configuración general", icon: Building2 },
  { href: "/settings/warehouses", title: "Depósitos", description: "Centros y códigos operativos", icon: Warehouse },
  { href: "/settings/users", title: "Usuarios y roles", description: "Membresías y permisos efectivos", icon: Users },
];

export default async function SettingsPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section } = await params;
  if (section && section.length > 1) notFound();
  const active = section?.[0];
  const membership = await requireMembership();

  if (!active) return <><PageHeader eyebrow="Administración" title="Configuración" description="Gestioná el espacio de trabajo de la organización activa." /><div className="grid gap-4 md:grid-cols-3">{sections.map(({ href, title, description, icon: Icon }) => <Link href={href} key={href} className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-brand"><Icon className="size-5" /></span><ChevronRight className="size-5 text-slate-300 transition group-hover:translate-x-1" /></div><h2 className="mt-5 font-semibold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></Link>)}</div></>;

  if (active === "company") return <><PageHeader eyebrow="Configuración" title="Empresa" description="Identidad de la organización seleccionada." /><Card className="max-w-3xl"><CardHeader><CardTitle>{membership.organizationName}</CardTitle><CardDescription>Datos leídos desde la membresía autorizada.</CardDescription></CardHeader><CardContent><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Identificador</dt><dd className="mt-2 font-mono text-sm">{membership.organizationSlug}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tu rol</dt><dd className="mt-2"><Badge tone="info">{roleLabels[membership.role]}</Badge></dd></div></dl><p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">La edición de datos societarios está pendiente. El backend ya exige permiso <code>organization.manage</code> para esa operación futura.</p></CardContent></Card></>;

  if (active === "warehouses") {
    const warehouses = await getWarehouses();
    return <><PageHeader eyebrow="Configuración" title="Depósitos" description="Depósitos reales visibles para tu organización." /><Card><CardHeader><CardTitle>Centros operativos</CardTitle><CardDescription>{can(membership.role, "warehouse.manage") ? "Tu rol podrá administrar depósitos cuando se habilite la edición." : "Tu rol dispone de acceso de lectura."}</CardDescription></CardHeader><CardContent>{warehouses.length ? <div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-left text-sm"><thead className="border-b text-xs uppercase text-slate-500"><tr><th className="px-2 py-3">Nombre</th><th className="px-2 py-3">Código</th><th className="px-2 py-3">Estado</th><th className="px-2 py-3">Alta</th></tr></thead><tbody>{warehouses.map((warehouse) => <tr key={warehouse.id} className="border-b last:border-0"><td className="px-2 py-4 font-medium">{warehouse.name}</td><td className="px-2 py-4 font-mono">{warehouse.code}</td><td className="px-2 py-4"><Badge tone={warehouse.active ? "success" : "neutral"}>{warehouse.active ? "Activo" : "Inactivo"}</Badge></td><td className="px-2 py-4 text-slate-500">{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(warehouse.created_at))}</td></tr>)}</tbody></table></div> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No hay depósitos configurados.</p>}</CardContent></Card></>;
  }

  if (active === "users") {
    const members = await getMembers();
    return <><PageHeader eyebrow="Configuración" title="Usuarios y roles" description="Membresías aisladas por organización y protegidas por RLS." /><Card><CardHeader><CardTitle>Equipo</CardTitle><CardDescription>{can(membership.role, "members.manage") ? "Tu rol tiene permiso para gestión de miembros; la interfaz de invitaciones está pendiente." : "Tu rol sólo puede consultar las membresías visibles."}</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-left text-sm"><thead className="border-b text-xs uppercase text-slate-500"><tr><th className="px-2 py-3">Usuario</th><th className="px-2 py-3">Rol</th><th className="px-2 py-3">Estado</th></tr></thead><tbody>{members.map((member) => <tr key={member.user_id} className="border-b last:border-0"><td className="px-2 py-4 font-medium">{member.fullName}</td><td className="px-2 py-4"><Badge tone="info">{roleLabels[member.role]}</Badge></td><td className="px-2 py-4"><Badge tone={member.status === "active" ? "success" : "warning"}>{member.status === "active" ? "Activo" : member.status}</Badge></td></tr>)}</tbody></table></div><div className="mt-5 flex gap-3 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900"><ShieldCheck className="mt-0.5 size-5 shrink-0" />Los permisos se validan en servidor y en políticas RLS, no sólo en esta interfaz.</div></CardContent></Card></>;
  }
  notFound();
}
