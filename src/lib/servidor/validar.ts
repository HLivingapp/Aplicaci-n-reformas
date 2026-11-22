import { limpiarMateriales } from "../materiales";
import { limpiarDetalle } from "../detalle-reforma";
import { reformaVacia, viviendaVacia } from "../proyecto";
import type { ContactoCliente } from "../publico";
import { CERTIFICACIONES, CURSOS_PREVENCION, ESPECIALIDADES, INICIOS, nifValido, SERVICIOS_PREVENCION, TIPOS_PROYECTO, ZONAS, type AltaProveedor } from "../proveedores";
import type { DatosReforma, GrupoMaterial, Vivienda } from "../types";

const texto = (x: unknown, max: number) => (typeof x === "string" ? x.slice(0, max) : "");

/** Comprueba y limpia lo que llega del formulario público (no se confía en el navegador). */
export function validarProyecto(b: unknown, grupos: GrupoMaterial[] = []): { vivienda: Vivienda; reforma: DatosReforma } | null {
  const body = b as { vivienda?: Partial<Vivienda>; reforma?: Partial<DatosReforma> } | null;
  if (!body?.vivienda || !body.reforma || typeof body.vivienda !== "object" || typeof body.reforma !== "object") return null;
  const v = { ...viviendaVacia(), ...body.vivienda } as Vivienda;
  const r = { ...reformaVacia(), ...body.reforma } as DatosReforma;
  if (typeof v.m2 !== "number" || v.m2 <= 0 || v.m2 > 5000) return null;
  const n = (x: unknown, min: number, max: number) => typeof x === "number" && x >= min && x <= max;
  if (!n(v.dormitorios, 0, 20) || !n(v.banos, 0, 10) || !n(r.dormitoriosDeseados, 0, 20) || !n(r.banosDeseados, 0, 10)) return null;
  if (!Array.isArray(v.terrazas) || v.terrazas.length > 10 || !Array.isArray(r.estancias) || r.estancias.length > 30) return null;
  r.comentarios = texto(r.comentarios, 4000);
  r.materiales = limpiarMateriales(r.materiales, grupos);
  r.detalle = limpiarDetalle(r.detalle);
  return { vivienda: v, reforma: r };
}

export function validarContacto(b: unknown): ContactoCliente | null {
  const c = b as Partial<ContactoCliente> | null;
  const nombre = texto(c?.nombre, 120).trim();
  const telefono = texto(c?.telefono, 40).trim();
  const email = texto(c?.email, 120).trim();
  if (!nombre || (!telefono && !email)) return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { nombre, telefono, email };
}

const lista = (x: unknown, max: number, permitidos?: readonly string[]) =>
  Array.isArray(x) ? [...new Set(x.filter((v): v is string => typeof v === "string" && (!permitidos || permitidos.includes(v))).map((v) => v.slice(0, 80)))].slice(0, max) : [];
const numero = (x: unknown, min: number, max: number) => (typeof x === "number" && Number.isFinite(x) ? Math.min(Math.max(x, min), max) : min);

/** Cuestionario de homologación que llega del formulario público. */
export function validarAlta(b: unknown): AltaProveedor | null {
  const a = b as Partial<AltaProveedor> | null;
  if (!a || typeof a !== "object") return null;
  const r: AltaProveedor = {
    tipo: a.tipo === "autonomo" ? "autonomo" : "empresa",
    razonSocial: texto(a.razonSocial, 160).trim(),
    nif: texto(a.nif, 20).trim().toUpperCase().replace(/[\s-]/g, ""),
    contacto: texto(a.contacto, 120).trim(),
    telefono: texto(a.telefono, 40).trim(),
    email: texto(a.email, 120).trim(),
    web: texto(a.web, 200).trim(),
    trabajadores: Math.round(numero(a.trabajadores, 1, 1000)),
    rea: { inscrito: a.rea?.inscrito === true, numero: texto(a.rea?.numero, 40).trim() },
    rc: { aseguradora: texto(a.rc?.aseguradora, 120).trim(), capital: Math.round(numero(a.rc?.capital, 0, 100_000_000)) },
    zonas: lista(a.zonas, 60, ZONAS),
    especialidades: lista(a.especialidades, 30, ESPECIALIDADES.map((e) => e.valor)),
    obras: (Array.isArray(a.obras) ? a.obras : []).slice(0, 10).map((o) => ({
      descripcion: texto(o?.descripcion, 500).trim(),
      ano: Math.round(numero(o?.ano, 1990, 2100)),
      importe: Math.round(numero(o?.importe, 0, 100_000_000)),
      contacto: texto(o?.contacto, 200).trim(),
    })),
    presentacion: texto(a.presentacion, 2000).trim(),
    perfil: validarPerfil(a.perfil),
  };
  if (!r.razonSocial || !nifValido(r.nif) || !r.contacto || (!r.telefono && !r.email)) return null;
  if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return null;
  return r;
}

function validarPerfil(x: unknown): AltaProveedor["perfil"] {
  const p = (x ?? {}) as Partial<AltaProveedor["perfil"]>;
  const valores = <T extends string>(ops: { valor: T }[]) => ops.map((o) => o.valor);
  const sp = valores(SERVICIOS_PREVENCION).find((v) => v === p.servicioPrevencion) ?? "";
  const inicio = valores(INICIOS).find((v) => v === p.disponibilidad?.inicio) ?? "";
  return {
    proyectosEjecutados: Math.round(numero(p.proyectosEjecutados, 0, 100_000)),
    tiposProyecto: lista(p.tiposProyecto, 20, valores(TIPOS_PROYECTO)),
    cuentas: { ejercicio: Math.round(numero(p.cuentas?.ejercicio, 2000, 2100)), presentadas: typeof p.cuentas?.presentadas === "boolean" ? p.cuentas.presentadas : null },
    servicioPrevencion: sp,
    entidadPrevencion: texto(p.entidadPrevencion, 160).trim(),
    cursosPrevencion: lista(p.cursosPrevencion, 20, valores(CURSOS_PREVENCION)),
    certificaciones: lista(p.certificaciones, 20, valores(CERTIFICACIONES)),
    otrasCertificaciones: texto(p.otrasCertificaciones, 500).trim(),
    disponibilidad: { inicio, obrasSimultaneas: Math.round(numero(p.disponibilidad?.obrasSimultaneas, 1, 100)), visitas: texto(p.disponibilidad?.visitas, 200).trim() },
  };
}
