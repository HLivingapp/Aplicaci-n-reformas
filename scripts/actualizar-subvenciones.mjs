// Trae de la BDNS (Sistema Nacional de Publicidad de Subvenciones) los datos de las convocatorias
// que seguimos y los guarda en public/datos/bdns.json. Lo ejecuta GitHub Actions cada día.
// Si la BDNS no responde, deja el fichero anterior tal cual (no rompe la publicación).
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const fuente = readFileSync(new URL("../src/lib/subvenciones.ts", import.meta.url), "utf8");
const codigos = [...new Set([...fuente.matchAll(/bdns: \[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/"(\d+)"/g)].map((x) => x[1])))];
const salida = new URL("../public/datos/bdns.json", import.meta.url);
const anterior = existsSync(salida) ? JSON.parse(readFileSync(salida, "utf8")) : { actualizado: null, convocatorias: {} };

// Busca un campo por nombre aproximado, porque la API no está documentada oficialmente.
const campo = (o, re) => {
  for (const [k, v] of Object.entries(o ?? {})) if (re.test(k) && v != null && typeof v !== "object") return v;
  return undefined;
};
const fecha = (v) => {
  if (!v) return undefined;
  const s = String(v);
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : s.slice(0, 10);
};

let ok = 0;
const convocatorias = { ...anterior.convocatorias };
for (const c of codigos) {
  try {
    const r = await fetch(`https://www.infosubvenciones.es/bdnstrans/api/convocatorias?numConv=${c}&vpd=GE`, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    const d = Array.isArray(j) ? j[0] : j.content?.[0] ?? j;
    convocatorias[c] = {
      titulo: campo(d, /^descripcion$|titulo/i),
      presupuesto: Number(campo(d, /presupuestoTotal/i)) || undefined,
      desde: fecha(campo(d, /fechaInicioSolicitud/i)),
      hasta: fecha(campo(d, /fechaFinSolicitud/i)),
    };
    ok++;
  } catch (e) {
    console.warn(`BDNS ${c}: ${e.message}`);
  }
}
if (ok) {
  writeFileSync(salida, JSON.stringify({ actualizado: new Date().toISOString(), convocatorias }, null, 1) + "\n");
  console.log(`BDNS: ${ok}/${codigos.length} convocatorias actualizadas`);
} else {
  if (!existsSync(salida)) writeFileSync(salida, JSON.stringify(anterior, null, 1) + "\n");
  console.warn("BDNS sin respuesta: se mantienen los datos anteriores");
}
