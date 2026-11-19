/** Selección múltiple con botones pequeños. */
export function Chips({ opciones, valores, cambiar }: { opciones: readonly { valor: string; texto: string }[]; valores: string[]; cambiar: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opciones.map((o) => {
        const on = valores.includes(o.valor);
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={on}
            onClick={() => cambiar(on ? valores.filter((x) => x !== o.valor) : [...valores, o.valor])}
            className={`rounded-full px-2.5 py-1 text-xs ${on ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}
