import { hoy, sumarDias } from "./calc";
import { FASES_TIPO } from "./catalogo";
import { presupuestoDemo, proveedoresDemo, proyectoDemo } from "./demo";
import { tarifasPorDefecto } from "./tarifas";
import type { Datos, Fase } from "./types";

/** Datos de ejemplo para probar la aplicación. */
export function datosIniciales(): Datos {
  const h = hoy();
  const inicio = sumarDias(h, -12);
  let cursor = inicio;
  const fases: Fase[] = FASES_TIPO.map((f, i) => {
    const ini = cursor;
    const fin = sumarDias(ini, f.dias - 1);
    cursor = sumarDias(fin, 1);
    const estado = i === 0 ? "terminada" : i === 1 ? "en_curso" : "pendiente";
    return {
      id: `f${i}`,
      nombre: f.nombre,
      inicio: ini,
      fin,
      estado,
      tareas: f.tareas.map((t, j) => ({ id: `f${i}t${j}`, texto: t, hecha: i === 0 || (i === 1 && j === 0) })),
    };
  });

  const d: Datos = {
    version: 3,
    contador: 2,
    proyectos: [proyectoDemo("c3", sumarDias(h, -1))],
    fotos: [],
    proveedores: [],
    tarifas: tarifasPorDefecto(),
    empresa: {
      nombre: "Reformas Ejemplo SL",
      cif: "B00000000",
      telefono: "600 000 000",
      email: "info@ejemplo.es",
      direccion: "Calle Ejemplo 1, Madrid",
    },
    clientes: [
      { id: "c1", token: "demo-laura-0000000000000000000001", nombre: "Laura Martín", telefono: "611 111 111", email: "laura@ejemplo.es", direccion: "C/ Alcalá 120, 3ºB, Madrid", creado: sumarDias(h, -40) },
      { id: "c2", token: "demo-javier-000000000000000000002", nombre: "Javier Ruiz", telefono: "622 222 222", email: "javier@ejemplo.es", direccion: "Av. Valencia 8, Getafe", creado: sumarDias(h, -5) },
      { id: "c4", token: "demo-carlos-000000000000000000004", nombre: "Carlos Pérez", telefono: "644 444 444", email: "carlos@ejemplo.es", direccion: "Madrid (dirección de ejemplo)", creado: sumarDias(h, -3) },
      { id: "c3", token: "demo-marta-0000000000000000000003", nombre: "Marta López", telefono: "633 333 333", email: "marta@ejemplo.es", direccion: "Av. Valencia 8, 2ºA, Getafe", creado: sumarDias(h, -1) },
    ],
    presupuestos: [
      {
        id: "p1",
        numero: `${h.slice(0, 4)}-001`,
        clienteId: "c1",
        titulo: "Reforma integral de baño",
        direccionObra: "C/ Alcalá 120, 3ºB, Madrid",
        fecha: sumarDias(h, -30),
        validezDias: 30,
        estado: "aceptado",
        ivaPct: 10,
        descuentoPct: 0,
        notas: "Material cerámico a elegir por el cliente dentro del precio indicado.",
        obraId: "o1",
        respuestaCliente: { fecha: sumarDias(h, -20), comentario: "Adelante, cuando podáis empezar." },
        capitulos: [
          {
            id: "ch1",
            nombre: "Demoliciones",
            partidas: [
              { id: "i1", descripcion: "Demolición de alicatado de paredes con retirada de escombros", unidad: "m²", cantidad: 22, precio: 14, coste: 9 },
              { id: "i2", descripcion: "Levantado de pavimento cerámico existente", unidad: "m²", cantidad: 5, precio: 16, coste: 10 },
            ],
          },
          {
            id: "ch2",
            nombre: "Fontanería",
            partidas: [
              { id: "i3", descripcion: "Instalación de fontanería completa de baño (agua fría, caliente y desagües)", unidad: "ud", cantidad: 1, precio: 1350, coste: 900 },
              { id: "i4", descripcion: "Suministro y colocación de plato de ducha de resina 120x80", unidad: "ud", cantidad: 1, precio: 420, coste: 290 },
            ],
          },
          {
            id: "ch3",
            nombre: "Revestimientos",
            partidas: [
              { id: "i5", descripcion: "Alicatado con azulejo porcelánico (material incluido hasta 25 €/m²)", unidad: "m²", cantidad: 22, precio: 58, coste: 38 },
              { id: "i6", descripcion: "Solado con gres porcelánico (material incluido hasta 25 €/m²)", unidad: "m²", cantidad: 5, precio: 55, coste: 36 },
            ],
          },
        ],
      },
      {
        id: "p2",
        numero: `${h.slice(0, 4)}-002`,
        clienteId: "c2",
        titulo: "Pintura de vivienda y cambio de puertas",
        direccionObra: "Av. Valencia 8, Getafe",
        fecha: sumarDias(h, -2),
        validezDias: 30,
        estado: "enviado",
        ivaPct: 10,
        descuentoPct: 5,
        notas: "",
        capitulos: [
          {
            id: "ch4",
            nombre: "Pintura",
            partidas: [{ id: "i7", descripcion: "Pintura plástica lisa en paredes y techos, dos manos", unidad: "m²", cantidad: 240, precio: 9, coste: 5 }],
          },
          {
            id: "ch5",
            nombre: "Carpintería",
            partidas: [{ id: "i8", descripcion: "Puerta de paso lacada blanca, colocada", unidad: "ud", cantidad: 6, precio: 320, coste: 210 }],
          },
        ],
      },
    ],
    obras: [
      {
        id: "o1",
        clienteId: "c1",
        presupuestoId: "p1",
        titulo: "Reforma integral de baño",
        direccion: "C/ Alcalá 120, 3ºB, Madrid",
        inicio,
        fases,
        novedades: [
          { id: "n1", fecha: sumarDias(h, -8), texto: "Terminada la demolición. Escombros retirados.", visibleCliente: true },
          { id: "n2", fecha: sumarDias(h, -2), texto: "Fontanería instalada. Mañana empieza el electricista.", visibleCliente: true },
          { id: "n3", fecha: sumarDias(h, -1), texto: "Pedir azulejo al proveedor antes del viernes.", visibleCliente: false },
        ],
        hitos: [
          { id: "h-firma", nombre: "A la firma del contrato", pct: 30, estado: "pagado", solicitado: inicio, pagado: inicio },
          { id: "h-instalaciones", nombre: "Al terminar demoliciones e instalaciones", pct: 30, estado: "solicitado", solicitado: sumarDias(h, -1) },
          { id: "h-acabados", nombre: "Al terminar alicatados y suelos", pct: 30, estado: "pendiente" },
          { id: "h-entrega", nombre: "A la entrega, con la obra revisada", pct: 10, estado: "pendiente" },
        ],
        extras: [{ id: "x1", descripcion: "Hornacina en la ducha con iluminación LED", importe: 240, referencia: 220, fecha: sumarDias(h, -1), estado: "propuesto" }],
      },
    ],
  };
  d.presupuestos.unshift(presupuestoDemo(d, "c4", sumarDias(h, -1)));
  proveedoresDemo(d, h);
  return d;
}
