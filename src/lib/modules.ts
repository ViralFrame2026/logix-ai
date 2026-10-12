import { BarChart3, Bot, Boxes, ClipboardList, PackageSearch, ReceiptText, ShoppingCart, type LucideIcon } from "lucide-react";

export type ModuleDefinition = { title: string; description: string; icon: LucideIcon; capabilities: string[]; nextStep: string };

export const modules: Record<string, ModuleDefinition> = {
  products: { title: "Productos", description: "Catálogo, SKUs y códigos asociados.", icon: PackageSearch, capabilities: ["Búsqueda por SKU y nombre", "Múltiples códigos por producto", "Umbral de stock crítico"], nextStep: "La edición del catálogo se habilitará en la siguiente iteración operativa." },
  inventory: { title: "Inventario", description: "Saldos por depósito y ubicación.", icon: Boxes, capabilities: ["Balances por ubicación", "Reservas de stock", "Alertas de disponibilidad"], nextStep: "Los saldos sólo cambiarán mediante movimientos transaccionales auditables." },
  orders: { title: "Pedidos", description: "Preparación y seguimiento de pedidos.", icon: ShoppingCart, capabilities: ["Estados de preparación", "Ítems y reservas", "Trazabilidad del despacho"], nextStep: "No hay operaciones simuladas: el flujo de pedidos todavía está pendiente." },
  receipts: { title: "Recepciones", description: "Ingreso controlado de mercadería.", icon: ReceiptText, capabilities: ["Recepción por proveedor", "Control de cantidades", "Ubicación de destino"], nextStep: "El registro de recepciones se habilitará junto con los movimientos de stock." },
  movements: { title: "Movimientos", description: "Historial inmutable de operaciones de stock.", icon: ClipboardList, capabilities: ["Ingresos y egresos", "Transferencias", "Ajustes con auditoría"], nextStep: "Las escrituras directas permanecen bloqueadas hasta implementar el servicio transaccional." },
  "ai-assistant": { title: "Asistente IA", description: "Espacio preparado para análisis logístico asistido.", icon: Bot, capabilities: ["Contrato de proveedor desacoplado", "Contexto aislado por organización", "Registro futuro de cuotas"], nextStep: "No se realizan llamadas a modelos ni se generan respuestas ficticias en esta fase." },
  reports: { title: "Reportes", description: "Indicadores y exportaciones operativas.", icon: BarChart3, capabilities: ["Filtros por depósito", "Indicadores verificables", "Exportación futura"], nextStep: "Los reportes se habilitarán cuando existan datos operativos suficientes." },
};
