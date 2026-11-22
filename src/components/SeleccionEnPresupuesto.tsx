"use client";

import { CAPITULO_DE, useMiSeleccion } from "@/lib/mi-seleccion";

/** Materiales que el cliente eligió en el catálogo, escritos en la partida del presupuesto que les toca. */
export function SeleccionCapitulo({ capitulo }: { capitulo: string }) {
  const { materiales } = useMiSeleccion();
  const aqui = materiales.filter((x) => CAPITULO_DE[x.categoria] === capitulo);
  if (!aqui.length) return null;
  return <ListaElegidos titulo="Materiales que has elegido" lista={aqui} />;
}

/** Elegidos cuyo capítulo no está en este presupuesto (por ejemplo, ventanas si no se cambian). */
export function SeleccionSinCapitulo({ capitulos }: { capitulos: string[] }) {
  const { materiales } = useMiSeleccion();
  const fuera = materiales.filter((x) => !capitulos.includes(CAPITULO_DE[x.categoria]));
  if (!fuera.length) return null;
  return (
    <div className="mt-3">
      <ListaElegidos titulo="Otros materiales que has elegido (fuera de las partidas de este presupuesto)" lista={fuera} />
    </div>
  );
}

function ListaElegidos({ titulo, lista }: { titulo: string; lista: ReturnType<typeof useMiSeleccion>["materiales"] }) {
  return (
    <div className="mt-2 rounded-lg border border-teal-100 bg-teal-50/60 p-2">
      <div className="text-xs font-semibold text-teal-900">🧩 {titulo}</div>
      <ul className="mt-1 space-y-0.5 text-xs text-stone-700">
        {lista.map((x) => (
          <li key={x.id}>
            <span className="font-medium">{x.marca}</span> · {x.nombre}
            {x.precio ? <span className="text-amber-800"> · PVP orientativo: {x.precio.texto.replace(/^./, (c) => c.toLowerCase())}</span> : null}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[10px] text-stone-500">El reformista confirma en la visita si cambia el precio de la partida.</p>
    </div>
  );
}
