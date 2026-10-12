import {
  BarChart3, Bot, Boxes, ClipboardList, LayoutDashboard, PackageSearch,
  QrCode, ReceiptText, Settings, ShoppingCart, SlidersHorizontal, Warehouse,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Productos", icon: PackageSearch },
  { href: "/inventory", label: "Inventario", icon: Boxes },
  { href: "/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/receipts", label: "Recepciones", icon: ReceiptText },
  { href: "/movements", label: "Movimientos", icon: ClipboardList },
  { href: "/scanner", label: "Escáner", icon: QrCode },
  { href: "/ai-assistant", label: "Asistente IA", icon: Bot },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
] as const;

export const settingsItems = [
  { href: "/settings", label: "Configuración", icon: Settings },
  { href: "/settings/company", label: "Empresa", icon: SlidersHorizontal },
  { href: "/settings/warehouses", label: "Depósitos", icon: Warehouse },
] as const;
