export default function DashboardLoading() {
  return <div aria-label="Cargando dashboard" className="animate-pulse space-y-6"><div className="h-20 max-w-xl rounded-xl bg-slate-200" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 rounded-2xl bg-slate-200" />)}</div><div className="h-80 rounded-2xl bg-slate-200" /></div>;
}
