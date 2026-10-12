import Link from "next/link";
import { AlertTriangle, Boxes, ClipboardList, PackageSearch, ShoppingCart, Warehouse } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/data/dashboard";

const movementLabels: Record<string, string> = { receipt: "Recepción", adjustment_in: "Ajuste +", adjustment_out: "Ajuste −", transfer_in: "Transferencia +", transfer_out: "Transferencia −", shipment: "Despacho" };

export default async function DashboardPage() {
  const data = await getDashboardData();
  return (
    <>
      <PageHeader eyebrow="Vista general" title="Dashboard operativo" description="Indicadores reales de la organización activa. Los estados vacíos reflejan que todavía no hay operaciones registradas." actions={<Button asChild><Link href="/scanner">Abrir escáner</Link></Button>} />
      <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Productos activos" value={data.products} helper="Catálogo de la empresa" icon={PackageSearch} />
        <KpiCard label="Pedidos pendientes" value={data.pendingOrders} helper="Borrador, confirmados o en picking" icon={ShoppingCart} tone="amber" />
        <KpiCard label="Stock crítico" value={data.criticalStock} helper="Balances bajo su umbral" icon={AlertTriangle} tone={data.criticalStock ? "amber" : "green"} />
        <KpiCard label="Depósitos activos" value={data.warehouses} helper="Disponibles para operar" icon={Warehouse} tone="slate" />
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Movimientos recientes</CardTitle><CardDescription>Últimos movimientos visibles para tu organización.</CardDescription></CardHeader>
          <CardContent>
            {data.movements.length ? <div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm"><thead className="border-b text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-2 py-3 font-semibold">Producto</th><th className="px-2 py-3 font-semibold">Depósito</th><th className="px-2 py-3 font-semibold">Tipo</th><th className="px-2 py-3 text-right font-semibold">Cantidad</th><th className="px-2 py-3 text-right font-semibold">Fecha</th></tr></thead><tbody>{data.movements.map((movement) => <tr key={movement.id} className="border-b last:border-0"><td className="px-2 py-4 font-medium text-slate-950">{movement.product}</td><td className="px-2 py-4 text-slate-600">{movement.warehouse}</td><td className="px-2 py-4"><Badge>{movementLabels[movement.type] ?? movement.type}</Badge></td><td className="px-2 py-4 text-right font-mono">{movement.quantity}</td><td className="px-2 py-4 text-right text-slate-500">{new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(movement.createdAt))}</td></tr>)}</tbody></table></div> : <EmptyState icon={ClipboardList} title="Sin movimientos todavía" description="Los ingresos, transferencias y despachos aparecerán acá cuando los módulos operativos estén habilitados." />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Alertas operativas</CardTitle><CardDescription>Situaciones que requieren atención.</CardDescription></CardHeader>
          <CardContent>
            {data.criticalStock ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><p className="font-semibold text-amber-950">{data.criticalStock} balance{data.criticalStock === 1 ? "" : "s"} con stock crítico</p><p className="mt-1 text-sm leading-6 text-amber-800">Revisá inventario antes de confirmar nuevos pedidos.</p></div></div></div> : <EmptyState icon={Boxes} title="Sin alertas activas" description="No hay balances por debajo del umbral configurado." />}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
