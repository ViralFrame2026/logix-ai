"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, Keyboard, Search, ShieldCheck } from "lucide-react";
import { resolveProductAction } from "@/app/actions/scanner";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialScannerState } from "@/lib/scanner/types";

type Location = { id: string; code: string; name: string; warehouse: string };
type DetectedBarcode = { rawValue: string };
type BarcodeDetectorLike = { detect(source: CanvasImageSource): Promise<DetectedBarcode[]> };
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

export function ScannerWorkspace({ locations }: { locations: Location[] }) {
  const [state, action, pending] = useActionState(resolveProductAction, initialScannerState);
  const [kind, setKind] = useState<"code" | "search">("code");
  const [query, setQuery] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play();
    }
  }, [cameraOpen]);

  async function startCamera() {
    setCameraError("");
    const Detector = (window as typeof window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!Detector) {
      setCameraError("Este navegador no ofrece BarcodeDetector. Usá un lector como teclado o ingresá el código manualmente.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
      const detector = new Detector({ formats: ["ean_13", "ean_8", "code_128", "qr_code"] });
      const detect = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            setKind("code"); setQuery(codes[0].rawValue); stopCamera(); setCameraOpen(false); return;
          }
        } catch { /* A frame can be unavailable while the camera initializes. */ }
        frameRef.current = requestAnimationFrame(() => void detect());
      };
      frameRef.current = requestAnimationFrame(() => void detect());
    } catch {
      setCameraError("No pudimos acceder a la cámara. Revisá el permiso del navegador e intentá nuevamente.");
      stopCamera();
    }
  }

  function handleDialog(open: boolean) {
    setCameraOpen(open);
    if (!open) stopCamera();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card><CardHeader><CardTitle>Resolver producto</CardTitle><CardDescription>Capturá un identificador. Esta pantalla no crea movimientos ni altera saldos.</CardDescription></CardHeader><CardContent>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setKind("code")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${kind === "code" ? "bg-white text-brand shadow-sm" : "text-slate-500"}`}><Keyboard className="mr-2 inline size-4" />Código / lector</button><button type="button" onClick={() => setKind("search")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${kind === "search" ? "bg-white text-brand shadow-sm" : "text-slate-500"}`}><Search className="mr-2 inline size-4" />SKU o nombre</button></div>
        <form action={action} className="space-y-5"><input type="hidden" name="kind" value={kind} /><div className="space-y-2"><Label htmlFor="query">{kind === "code" ? "Código de barras o QR" : "SKU o nombre"}</Label><div className="flex gap-2"><Input id="query" name="query" value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder={kind === "code" ? "Escaneá o escribí y presioná Enter" : "Ej. SKU-001 o producto"} /><Button type="submit" disabled={pending}>{pending ? "Buscando…" : "Resolver"}</Button></div></div>
          {state.message ? <Alert tone={state.status === "success" ? "success" : "warning"}>{state.message}</Alert> : null}
          {state.product ? <div className="rounded-xl border bg-slate-50 p-4"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold text-slate-950">{state.product.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{state.product.sku}</p></div><Badge tone="success">Identificado</Badge></div></div> : null}
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="quantity">Cantidad preparada</Label><Input id="quantity" type="number" min="1" defaultValue="1" inputMode="numeric" /><p className="text-xs text-slate-500">Dato local; no se registra en esta fase.</p></div><div className="space-y-2"><Label htmlFor="location">Ubicación</Label><select id="location" className="h-11 w-full rounded-lg border bg-white px-3 text-sm" defaultValue=""><option value="" disabled>{locations.length ? "Seleccionar ubicación" : "Sin ubicaciones configuradas"}</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.warehouse} · {location.code} · {location.name}</option>)}</select></div></div>
        </form>
        <div className="mt-5"><Button type="button" variant="secondary" onClick={() => void startCamera()}><Camera className="size-4" />Usar cámara</Button>{cameraError ? <p role="alert" className="mt-3 text-sm leading-6 text-red-700">{cameraError}</p> : null}</div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Captura segura</CardTitle><CardDescription>Controles aplicados en esta fase.</CardDescription></CardHeader><CardContent className="space-y-4 text-sm leading-6 text-slate-600"><p className="flex gap-3"><ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-600" />La organización se deriva de la sesión en servidor.</p><p className="flex gap-3"><ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-600" />La cámara sólo se solicita al tocar “Usar cámara”.</p><p className="flex gap-3"><ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-600" />Cerrar el modal detiene todas las pistas.</p><p className="rounded-xl bg-amber-50 p-4 text-amber-900">BarcodeDetector no está disponible en todos los navegadores. El ingreso manual y los lectores USB/Bluetooth que emulan teclado funcionan como alternativa.</p></CardContent></Card>
      <Dialog open={cameraOpen} onOpenChange={handleDialog}><DialogContent><DialogTitle>Escanear código</DialogTitle><DialogDescription>Enfocá un código de barras o QR. Podés cancelar en cualquier momento.</DialogDescription><video ref={videoRef} muted playsInline className="mt-5 aspect-video w-full rounded-xl bg-slate-950 object-cover" /><Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => handleDialog(false)}>Cancelar y cerrar cámara</Button></DialogContent></Dialog>
    </div>
  );
}
