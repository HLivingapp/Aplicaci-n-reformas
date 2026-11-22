/**
 * Catastro estatal (Dirección General del Catastro). Servicios públicos y gratuitos,
 * sin clave: https://ovc.catastro.meh.es/ovcservweb/ovcswlocalizacionrc/ovccallejero.asmx
 * Se llaman desde el servidor (el navegador no puede por CORS).
 */
import type { Direccion } from "../types";
import { normalizar } from "./provincias";
import type { DetalleInmueble, InmuebleCandidato, ProveedorCatastro, ResultadoBusqueda } from "./tipos";

const BASE = "https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero";

/* eslint-disable @typescript-eslint/no-explicit-any */
type J = any;

async function pedir(url: string): Promise<J> {
  const r = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { Accept: "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(`Catastro respondió ${r.status}`);
  return r.json();
}

/** El servicio envuelve la respuesta en una clave tipo "consulta_dnplocResult". */
function resultado(j: J): J {
  if (!j || typeof j !== "object") return {};
  const k = Object.keys(j).find((x) => /result$/i.test(x));
  return k ? j[k] : j;
}

const lista = <T>(x: T | T[] | undefined): T[] => (x == null ? [] : Array.isArray(x) ? x : [x]);

export function refCatastral(rc: J): string {
  if (!rc) return "";
  return [rc.pc1, rc.pc2, rc.car, rc.cc1, rc.cc2].filter(Boolean).join("");
}

function errores(r: J): string | null {
  const errs = lista(r?.lerr?.err);
  if (!errs.length) return null;
  return errs.map((e: J) => e.des).filter(Boolean).join(". ") || "El Catastro no encontró la dirección";
}

function loint(dt: J) {
  const l = dt?.locs?.lous?.lourb?.loint ?? {};
  return { escalera: l.es ? String(l.es) : undefined, planta: l.pt ? String(l.pt) : undefined, puerta: l.pu ? String(l.pu) : undefined };
}

const numero = (v: unknown) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Convierte un "bico" (bien inmueble con datos) en nuestro formato. */
/**
 * Reparte la superficie construida del inmueble por usos. El total del Catastro (debi.sfc) incluye la parte
 * proporcional de zonas comunes (portal, escaleras…); para la reforma nos interesa solo lo privativo de vivienda.
 */
export function superficiesPorUso(bico: J): { vivienda?: number; comunes?: number; otras?: number } {
  const raw = bico?.lcons?.cons ?? bico?.lcons;
  const cons = lista<J>(raw);
  if (!cons.length) return {};
  let vivienda = 0, comunes = 0, otras = 0;
  for (const c of cons) {
    const m2 = numero(c?.dfcons?.stl) ?? 0;
    const uso = normalizar(String(c?.lcd ?? ""));
    if (/COMUN/.test(uso)) comunes += m2;
    else if (/VIVIENDA/.test(uso)) vivienda += m2;
    else otras += m2;
  }
  const r = (n: number) => (n > 0 ? Math.round(n) : undefined);
  return { vivienda: r(vivienda), comunes: r(comunes), otras: r(otras) };
}

export function parsearBico(bico: J): DetalleInmueble | null {
  const bi = bico?.bi;
  const referencia = refCatastral(bi?.idbi?.rc);
  if (!referencia) return null;
  const total = numero(bi?.debi?.sfc);
  const usos = superficiesPorUso(bico);
  // Superficie útil para el presupuesto: la de vivienda sin zonas comunes; si no hay desglose, el total menos comunes.
  const superficie = usos.vivienda ?? (total && usos.comunes ? Math.round(total - usos.comunes) : total);
  return {
    referencia,
    superficie,
    superficieTotal: total,
    superficieComunes: usos.comunes,
    anoConstruccion: numero(bi?.debi?.ant),
    uso: bi?.debi?.luso ? String(bi.debi.luso) : undefined,
    direccion: bi?.ldt ? String(bi.ldt) : undefined,
  };
}

export function parsearBusqueda(j: J): ResultadoBusqueda {
  const r = resultado(j);
  if (r?.bico) {
    const detalle = parsearBico(r.bico);
    if (detalle) {
      const li = loint(r.bico.bi?.dt);
      return { estado: "ok", inmuebles: [{ referencia: detalle.referencia, descripcion: detalle.direccion ?? detalle.referencia, ...li }], detalle };
    }
  }
  const varios = lista(r?.lrcdnp?.rcdnp);
  if (varios.length) {
    const inmuebles: InmuebleCandidato[] = varios
      .map((x: J) => {
        const li = loint(x.dt);
        const partes = [li.escalera && `Esc. ${li.escalera}`, li.planta && `Planta ${li.planta}`, li.puerta && `Puerta ${li.puerta}`].filter(Boolean);
        return { referencia: refCatastral(x.rc), descripcion: partes.join(" · ") || "Inmueble", ...li };
      })
      .filter((x) => x.referencia);
    return { estado: "ok", inmuebles };
  }
  const e = errores(r);
  return { estado: "sin_resultados", mensaje: e ?? "El Catastro no encontró inmuebles en esa dirección" };
}

/** Quita el tipo de vía si el usuario lo escribió dentro del nombre ("Calle de Alcalá" → "ALCALA"). */
export function limpiarCalle(calle: string) {
  return normalizar(calle)
    .replace(/^(CALLE|CL|C\/|AVENIDA|AVDA\.?|AV\.?|PLAZA|PZA\.?|PASEO|Pº|CARRETERA|CTRA\.?|CAMINO|RONDA|GLORIETA|TRAVESIA)\s+/, "")
    .replace(/^(DE LA|DE LOS|DE LAS|DEL|DE)\s+/, "")
    .trim();
}

export const catastroEstatal: ProveedorCatastro = {
  nombre: "Catastro (Dirección General del Catastro)",

  async buscarPorDireccion(d: Direccion) {
    const q = new URLSearchParams({
      Provincia: normalizar(d.provincia),
      Municipio: normalizar(d.municipio),
      Sigla: d.tipoVia || "CL",
      Calle: limpiarCalle(d.calle),
      Numero: d.numero.trim(),
      Bloque: "",
      Escalera: d.escalera.trim(),
      Planta: d.planta.trim(),
      Puerta: d.puerta.trim(),
    });
    try {
      const res = parsearBusqueda(await pedir(`${BASE}/COVCCallejero.svc/json/Consulta_DNPLOC?${q}`));
      // Si hay varios inmuebles, intentamos quedarnos con el de la planta/puerta indicadas
      if (res.estado === "ok" && !res.detalle && res.inmuebles.length > 1 && d.planta) {
        const p = normalizar(d.planta).replace(/^0+(?=\d)/, "");
        const pu = normalizar(d.puerta).replace(/^0+(?=\w)/, "");
        const coincide = res.inmuebles.filter(
          (i) => (i.planta ?? "").replace(/^0+(?=\d)/, "") === p && (!pu || (i.puerta ?? "").replace(/^0+(?=\w)/, "") === pu),
        );
        if (coincide.length) res.inmuebles = coincide;
      }
      if (res.estado === "ok" && !res.detalle && res.inmuebles.length === 1) {
        res.detalle = (await this.detalle(res.inmuebles[0].referencia)) ?? undefined;
      }
      if (res.estado === "ok" && res.detalle) {
        Object.assign(res.detalle, await coordenadas(res.detalle.referencia, d));
      }
      return res;
    } catch (e) {
      console.error("Catastro:", e);
      return { estado: "error", mensaje: "No hemos podido conectar con el Catastro en este momento" };
    }
  },

  async detalle(referencia: string) {
    const rc = referencia.replace(/\s/g, "").toUpperCase();
    const q = new URLSearchParams({ Provincia: "", Municipio: "", RefCat: rc });
    const r = resultado(await pedir(`${BASE}/COVCCallejero.svc/json/Consulta_DNPRC?${q}`));
    const det = r?.bico ? parsearBico(r.bico) : null;
    if (!det) return null;
    return { ...det, ...(await coordenadas(det.referencia)) };
  },
};

/** Coordenadas del edificio a partir de la referencia catastral (primeros 14 caracteres = parcela). */
async function coordenadas(referencia: string, d?: Direccion): Promise<{ lat?: number; lng?: number }> {
  try {
    const q = new URLSearchParams({
      Provincia: d ? normalizar(d.provincia) : "",
      Municipio: d ? normalizar(d.municipio) : "",
      SRS: "EPSG:4326",
      RefCat: referencia.slice(0, 14),
    });
    const r = resultado(await pedir(`${BASE}/COVCCoordenadas.svc/json/Consulta_CPMRC?${q}`));
    const geo = lista(r?.coordenadas?.coord)[0]?.geo;
    const lng = Number(geo?.xcen);
    const lat = Number(geo?.ycen);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 ? { lat, lng } : {};
  } catch {
    return {};
  }
}
