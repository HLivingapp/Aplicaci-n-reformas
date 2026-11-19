export const UNIDADES = ["ud", "m²", "m²c", "m", "m³", "h", "pa", "kg"];

export const FASES_TIPO: { nombre: string; dias: number; tareas: string[] }[] = [
  { nombre: "Demolición", dias: 5, tareas: ["Proteger zonas comunes", "Demoler y retirar escombros"] },
  { nombre: "Instalaciones", dias: 10, tareas: ["Fontanería", "Electricidad", "Revisión de instalaciones"] },
  { nombre: "Albañilería", dias: 10, tareas: ["Tabiquería", "Recrecidos", "Alicatado y solado"] },
  { nombre: "Carpintería", dias: 5, tareas: ["Puertas", "Muebles"] },
  { nombre: "Pintura", dias: 4, tareas: ["Preparar superficies", "Pintar"] },
  { nombre: "Limpieza y entrega", dias: 2, tareas: ["Limpieza final", "Repaso con el cliente", "Entrega de llaves"] },
];

export const IVAS = [
  { pct: 10, texto: "10% (reforma de vivienda particular)" },
  { pct: 21, texto: "21% (general)" },
  { pct: 0, texto: "0% (exento / inversión del sujeto pasivo)" },
];
