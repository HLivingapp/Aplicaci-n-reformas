/**
 * Datos ficticios para el modo demostración: un proyecto recibido y dos reformistas
 * (uno homologado y otro a medias). Ningún dato es real.
 */
import { sumarDias } from "./calc";
import { altaVacia, anadirDocumento, registrarProveedor } from "./proveedores";
import { reformaVacia, viviendaVacia } from "./proyecto";
import { estimar } from "./estimacion";
import { capitulosDesdeEstimacion, referenciaCapitulos } from "./presupuesto-estimacion";
import type { Datos, Presupuesto, Proyecto, TipoDocProveedor } from "./types";

export function proyectoDemo(clienteId: string, creado: string): Proyecto {
  const v = viviendaVacia();
  v.direccion = { ...v.direccion, tipoVia: "AV", calle: "VALENCIA", numero: "8", planta: "2", puerta: "A", municipio: "GETAFE", codigoPostal: "28901" };
  Object.assign(v, { m2: 78, anoConstruccion: 1972, planta: 2, ascensor: true, dormitorios: 3, banos: 1, terrazas: ["abierta"] });
  const r = reformaVacia(3, 1);
  Object.assign(r, {
    dormitoriosDeseados: 2,
    banosDeseados: 2,
    moverCocina: true,
    cambiarVentanas: true,
    techoActual: "yeso",
    sueloActual: "terrazo",
    climaActual: "ninguna",
    climaDeseado: "split",
    acsActual: "caldera_gas",
    acsDeseado: "termo_electrico",
    materiales: { suelo_laminado: "lam_premium", cocina: "co_premium" },
    cuando: "En 3 meses",
    comentarios: "Queremos la cocina abierta al salón y dos baños.",
  });
  return { id: "pr-demo", clienteId, creado, estado: "nuevo", vivienda: v, reforma: r, notasInternas: "", consentimiento: { fecha: `${creado}T10:00:00.000Z`, texto: "Ejemplo" } };
}

/** Presupuesto detallado de ejemplo: reforma integral de 80 m² con 2 baños en calidad media. */
export function presupuestoDemo(d: Datos, clienteId: string, fecha: string): Presupuesto {
  const v = viviendaVacia();
  Object.assign(v, { m2: 80, anoConstruccion: 1968, planta: 3, ascensor: true, dormitorios: 3, banos: 1, terrazas: [] });
  const r = reformaVacia(3, 1);
  Object.assign(r, {
    dormitoriosDeseados: 2,
    banosDeseados: 2,
    cambiarVentanas: true,
    techoActual: "yeso",
    sueloActual: "terrazo",
    climaActual: "ninguna",
    climaDeseado: "split",
    acsActual: "caldera_gas",
    acsDeseado: "caldera_gas",
    fontaneria: { accion: "cambiar", ano: null },
    electricidad: { accion: "cambiar", ano: null },
    calidad: "media",
  });
  d.contador += 1;
  const e = estimar(v, r, d.tarifas);
  return {
    id: "p-demo-detalle",
    numero: `${fecha.slice(0, 4)}-${String(d.contador).padStart(3, "0")}`,
    clienteId,
    titulo: "Reforma integral de piso · 80 m², 2 baños",
    direccionObra: "Madrid (dirección de ejemplo)",
    fecha,
    validezDias: 30,
    estado: "enviado",
    ivaPct: 10,
    descuentoPct: 0,
    notas: "Presupuesto de ejemplo generado con el tarifario genérico de la app.",
    capitulos: capitulosDesdeEstimacion(e),
    referenciaBase: e.base,
    referenciaCapitulos: referenciaCapitulos(e),
  };
}

export function proveedoresDemo(d: Datos, h: string) {
  const comun = { contacto: "Ana Gómez", telefono: "600 000 000", email: "reformas@ejemplo.es", zonas: ["Madrid capital", "Getafe"], especialidades: ["reforma_integral", "albanileria"] };
  const obras = [0, 1, 2].map((i) => ({ descripcion: `Reforma integral de piso de ejemplo ${i + 1}`, ano: 2025, importe: 60000 + i * 10000, contacto: "Cliente de ejemplo" }));

  // Homologado: REA comprobado y documentos en vigor
  const t1 = registrarProveedor(
    d,
    { ...altaVacia(), ...comun, razonSocial: "Reformas Ejemplo SL", nif: "B12345674", trabajadores: 8, rea: { inscrito: true, numero: "12/28/0000000" }, rc: { aseguradora: "Aseguradora de ejemplo", capital: 300000 }, obras, presentacion: "Empresa ficticia para probar la app." },
    { resultado: "alta", razonSocial: "REFORMAS EJEMPLO SL", numero: "12/28/0000000", estado: "ALTA", autonomia: "MADRID", fecha: `${h}T05:00:00.000Z` },
  );
  const docs: TipoDocProveedor[] = ["rc_poliza", "rc_recibo", "hacienda", "seguridad_social", "cuentas"];
  for (const tipo of docs)
    anadirDocumento(d, t1, { id: `demo-${tipo}`, tipo, ruta: "", nombre: `${tipo}.pdf`, caduca: sumarDias(h, 150), ...(tipo === "hacienda" ? { csv: "DEMO1234ABCD5678" } : {}) });

  // A medias: sin REA, le faltan documentos
  registrarProveedor(d, { ...altaVacia(), ...comun, tipo: "autonomo", razonSocial: "Instalaciones Prueba", nif: "12345678Z", contacto: "Luis Pérez", rea: { inscrito: false, numero: "" }, obras: obras.slice(0, 2) });

  d.proveedores[1].token = "demo-reformista-0000000000000002";
  d.proveedores[0].token = "demo-reformista-0000000000000001";
}
