import type { Proveedor } from "@/lib/types";

export const ESTADO_PROVEEDOR: Record<Proveedor["estado"], { texto: string; cls: string }> = {
  pendiente: { texto: "Pendiente", cls: "bg-amber-100 text-amber-900" },
  aprobado: { texto: "Aprobado", cls: "bg-emerald-100 text-emerald-800" },
  rechazado: { texto: "Rechazado", cls: "bg-red-100 text-red-700" },
  suspendido: { texto: "Suspendido", cls: "bg-stone-200 text-stone-700" },
};
