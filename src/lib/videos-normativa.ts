/**
 * Vídeos divulgativos de normativa y técnica (generados con IA en HeyGen), sin marca.
 * Son orientativos: cada uno lleva el aviso «Vídeo generado con IA · Contenido orientativo».
 */
export type VideoNormativa = { id: string; titulo: string; resumen: string; duracion: string; legal: boolean };

export const VIDEOS_NORMATIVA: VideoNormativa[] = [
  { id: "declaracion-responsable", titulo: "Declaración responsable vs. licencia", resumen: "Qué obras van sin trámite, cuáles con declaración responsable y cuáles con licencia en Madrid.", duracion: "1:30", legal: true },
  { id: "terraza-fachada", titulo: "Cerrar una terraza a fachada", resumen: "Plan General, proyecto de conjunto, comunidad y Ayuntamiento.", duracion: "1:14", legal: true },
  { id: "terraza-patio", titulo: "Cerrar una terraza o tendedero a patio", resumen: "Por qué la luz y la ventilación de tus estancias deciden si se puede.", duracion: "1:30", legal: true },
  { id: "mover-bano", titulo: "Mover el baño: la bajante manda", resumen: "Distancias del Código Técnico, pendientes y cuándo tiene sentido un triturador.", duracion: "1:30", legal: false },
  { id: "aerotermia", titulo: "Aerotermia: en qué mejora de verdad", resumen: "Rendimiento, emisores de baja temperatura, RITE y dónde va la máquina en Madrid.", duracion: "1:30", legal: false },
  { id: "ventanas", titulo: "Ventanas nuevas: cuánto aíslan", resumen: "La U, marco y vidrio, permeabilidad, cajón de persiana y ventilación.", duracion: "1:30", legal: false },
  { id: "aislamiento-muros", titulo: "¿Trasdosar por dentro o aislar por fuera?", resumen: "Trasdosado, inyección en cámara o SATE, cuánto aislamiento y condensaciones.", duracion: "1:30", legal: false },
];
