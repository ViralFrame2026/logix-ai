import { PageHeader } from "@/components/layout/page-header";
import { ScannerWorkspace } from "@/components/scanner/scanner-workspace";
import { getScannerLocations } from "@/data/settings";

export default async function ScannerPage() {
  const locations = await getScannerLocations();
  return <><PageHeader eyebrow="Captura" title="Escáner y registro manual" description="Resolución compartida para códigos, lectores como teclado y búsqueda manual." /><ScannerWorkspace locations={locations} /></>;
}
