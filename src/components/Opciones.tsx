/** Botones grandes de opción, cómodos en el móvil. */
export function Opciones<T extends string | number | boolean>({
  valor,
  opciones,
  onChange,
  columnas = 2,
}: {
  valor: T | null | undefined;
  opciones: { valor: T; texto: string; detalle?: string }[];
  onChange: (v: T) => void;
  columnas?: 2 | 3 | 4;
}) {
  const cols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[columnas];
  return (
    <div className={`grid gap-2 ${cols}`}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={String(o.valor)}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(o.valor)}
            className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
              activo ? "border-teal-600 bg-teal-50 font-medium text-teal-900 ring-2 ring-teal-600/20" : "border-stone-300 bg-white hover:border-stone-400"
            }`}
          >
            {o.texto}
            {o.detalle && <span className="mt-0.5 block text-xs font-normal text-stone-500">{o.detalle}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Contador({ valor, onChange, min = 0, max = 10 }: { valor: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-stone-300 bg-white">
      <button type="button" className="h-10 w-10 text-xl text-stone-600 disabled:opacity-30" onClick={() => onChange(valor - 1)} disabled={valor <= min} aria-label="Menos">−</button>
      <span className="w-9 text-center text-lg font-semibold">{valor}</span>
      <button type="button" className="h-10 w-10 text-xl text-stone-600 disabled:opacity-30" onClick={() => onChange(valor + 1)} disabled={valor >= max} aria-label="Más">+</button>
    </div>
  );
}
