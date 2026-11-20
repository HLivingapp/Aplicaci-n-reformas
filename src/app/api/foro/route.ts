import { NextResponse } from "next/server";
import { aplicarAccion, autorProfesional, temasPublicos, type Accion } from "@/lib/foro";
import { homologado } from "@/lib/proveedores";
import { iaConfigurada, preguntarIA } from "@/lib/servidor/ia";
import { cargarTemas, guardarTemas } from "@/lib/servidor/foro";
import { cargarTodo } from "@/lib/servidor/repo";

/** Foro público: cualquiera lee; para escribir basta un alias. Los reformistas se identifican con su enlace. */
export async function GET() {
  return NextResponse.json({ temas: temasPublicos(await cargarTemas()), ia: iaConfigurada() }, { headers: { "Cache-Control": "no-store" } });
}

// Límite sencillo por IP para frenar el spam (en producción, mejor un servicio de límites)
const usos = new Map<string, number[]>();
function permitido(ip: string, tipo: string) {
  const ahora = Date.now();
  const clave = `${ip}:${tipo === "ia" ? "ia" : "w"}`;
  const lista = (usos.get(clave) ?? []).filter((x) => ahora - x < 3600_000);
  if (lista.length >= (tipo === "ia" ? 5 : 60)) return false;
  lista.push(ahora);
  usos.set(clave, lista);
  return true;
}

export async function POST(req: Request) {
  let body: { accion?: Accion; clave?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }
  const a = body.accion;
  const clave = typeof body.clave === "string" && /^[a-f0-9]{32,64}$/.test(body.clave) ? body.clave : "";
  if (!a || !clave) return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!permitido(ip, a.tipo)) return NextResponse.json({ error: "Demasiadas acciones seguidas. Prueba en un rato." }, { status: 429 });

  const antes = await cargarTemas();
  try {
    let despues: typeof antes;
    if (a.tipo === "ia") {
      if (!iaConfigurada()) return NextResponse.json({ error: "El asistente IA no está configurado todavía." }, { status: 503 });
      const t = antes.find((x) => x.id === a.temaId);
      if (!t) throw new Error("El tema no existe");
      if (t.respuestaIA) return NextResponse.json({ temas: temasPublicos(antes) });
      const respuestaIA = await preguntarIA(t);
      despues = antes.map((x) => (x.id === t.id ? { ...x, respuestaIA } : x));
    } else {
      let profesional;
      if (a.tipo === "responder" && a.tokenProfesional) {
        const p = /^[a-f0-9]{32}$/.test(a.tokenProfesional) ? (await cargarTodo()).proveedores.find((x) => x.token === a.tokenProfesional) : undefined;
        if (!p || !homologado(p)) return NextResponse.json({ error: "Tu empresa todavía no está homologada." }, { status: 403 });
        profesional = autorProfesional(p.zonas);
      }
      const huella = await sha256(`foro:${clave}`);
      despues = aplicarAccion(antes, a, huella, profesional);
    }
    await guardarTemas(antes, despues);
    return NextResponse.json({ temas: temasPublicos(despues) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "No se ha podido guardar" }, { status: 400 });
  }
}

async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
}
