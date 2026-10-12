export type ProductResolution = { id: string; sku: string; name: string };
export type ScannerState = {
  status: "idle" | "success" | "error";
  message: string;
  product: ProductResolution | null;
};
export const initialScannerState: ScannerState = { status: "idle", message: "", product: null };
