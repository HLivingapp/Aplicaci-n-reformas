import type { Instalacion } from "@/lib/types";
import { Opciones } from "./Opciones";
import { inputCls } from "./ui";

/** Cambiar o mantener una instalación. Si es antigua, no se permite mantenerla. */
export function PreguntaInstalacion({
  titulo,
  valor,
  onChange,
  aniosMax,
  cambiaTabiques,
}: {
  titulo: string;
  valor: Instalacion;
  onChange: (v: Instalacion) => void;
  aniosMax: number;
  cambiaTabiques: boolean;
}) {
  const hoy = new Date().getFullYear();
  const antigua = valor.ano != null && hoy - valor.ano > aniosMax;
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-stone-600">{titulo}</h3>
      <Opciones
        valor={valor.accion}
        onChange={(accion) => onChange({ ...valor, accion })}
        opciones={[
          { valor: "cambiar", texto: "Cambiarla entera", detalle: "Instalación nueva" },
          { valor: "mantener", texto: "Mantenerla", detalle: "Solo adaptar lo necesario" },
        ]}
      />
      {(valor.accion === "mantener" || antigua) && (
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-stone-600">¿De qué año es, aproximadamente? {cambiaTabiques && "*"}</span>
          <input
            className={`${inputCls} max-w-40`}
            inputMode="numeric"
            placeholder="2010"
            value={valor.ano ?? ""}
            onChange={(e) => {
              const ano = Number(e.target.value) || null;
              const vieja = ano != null && ano > 1900 && hoy - ano > aniosMax;
              onChange({ accion: vieja ? "cambiar" : valor.accion, ano });
            }}
          />
        </label>
      )}
      {antigua && (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
          Tiene más de {aniosMax} años: por seguridad y garantía hay que renovarla{cambiaTabiques ? ", sobre todo porque se van a mover tabiques" : ""}. La incluimos como instalación nueva.
        </p>
      )}
      {!antigua && valor.accion === "mantener" && valor.ano == null && cambiaTabiques && (
        <p className="mt-2 text-xs text-stone-500">Como vas a cambiar la distribución, necesitamos saber su antigüedad para poder mantenerla.</p>
      )}
    </div>
  );
}
