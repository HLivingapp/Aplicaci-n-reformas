import Link from "next/link";
import type { EstadoFase, EstadoPresupuesto, EstadoProyecto } from "@/lib/types";

export function Titulo({ children, accion }: { children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{children}</h1>
      {accion}
    </div>
  );
}

export function Tarjeta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm ${className}`}>{children}</div>;
}

type Variante = "primario" | "secundario" | "peligro" | "fantasma";
const estilos: Record<Variante, string> = {
  primario: "bg-teal-700 text-white hover:bg-teal-800",
  secundario: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50",
  peligro: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  fantasma: "text-stone-600 hover:bg-stone-100",
};
const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none";

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return <button type="button" className={`${base} ${estilos[variante]} ${className}`} {...props} />;
}

export function BotonLink({
  href,
  variante = "primario",
  children,
  className = "",
}: {
  href: string;
  variante?: Variante;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${estilos[variante]} ${className}`}>
      {children}
    </Link>
  );
}

export function Campo({ etiqueta, children, className = "" }: { etiqueta: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-stone-600">{etiqueta}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

const coloresPresupuesto: Record<EstadoPresupuesto, string> = {
  borrador: "bg-stone-100 text-stone-700",
  enviado: "bg-amber-100 text-amber-800",
  aceptado: "bg-emerald-100 text-emerald-800",
  rechazado: "bg-red-100 text-red-700",
};
const textosPresupuesto: Record<EstadoPresupuesto, string> = {
  borrador: "Borrador",
  enviado: "Pendiente de respuesta",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};

export function EstadoPresupuestoTag({ estado }: { estado: EstadoPresupuesto }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${coloresPresupuesto[estado]}`}>
      {textosPresupuesto[estado]}
    </span>
  );
}

const coloresFase: Record<EstadoFase, string> = {
  pendiente: "bg-stone-100 text-stone-600",
  en_curso: "bg-sky-100 text-sky-800",
  terminada: "bg-emerald-100 text-emerald-800",
};
export const textosFase: Record<EstadoFase, string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  terminada: "Terminada",
};

export function EstadoFaseTag({ estado }: { estado: EstadoFase }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${coloresFase[estado]}`}>{textosFase[estado]}</span>;
}

export function Barra({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">{children}</div>;
}

const coloresProyecto: Record<EstadoProyecto, string> = {
  nuevo: "bg-teal-100 text-teal-800",
  visita: "bg-sky-100 text-sky-800",
  presupuestado: "bg-emerald-100 text-emerald-800",
  descartado: "bg-stone-100 text-stone-500",
};
export const textosProyecto: Record<EstadoProyecto, string> = {
  nuevo: "Nueva",
  visita: "Visita programada",
  presupuestado: "Presupuestada",
  descartado: "Descartada",
};

export function EstadoProyectoTag({ estado }: { estado: EstadoProyecto }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${coloresProyecto[estado]}`}>{textosProyecto[estado]}</span>;
}
