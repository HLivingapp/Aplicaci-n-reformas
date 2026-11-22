/**
 * Vídeos divulgativos de normativa y técnica (generados con IA en HeyGen), sin marca.
 * Son orientativos: cada uno lleva el aviso «Vídeo generado con IA · Contenido orientativo».
 */
export type VideoNormativa = { id: string; titulo: string; resumen: string; duracion: string; legal: boolean };

export const VIDEOS_NORMATIVA: VideoNormativa[] = [
  { id: "declaracion-responsable", titulo: "Declaración responsable vs. licencia", resumen: "Qué obras van sin trámite, cuáles con declaración responsable y cuáles con licencia en Madrid.", duracion: "1:30", legal: true },
  { id: "terraza-fachada", titulo: "Cerrar una terraza a fachada", resumen: "Plan General, proyecto de conjunto, comunidad de vecinos y Ayuntamiento.", duracion: "1:14", legal: true },
  { id: "terraza-patio", titulo: "Cerrar una terraza o tendedero a patio", resumen: "Por qué la luz y la ventilación de tus estancias deciden si se puede.", duracion: "1:30", legal: true },
  { id: "medidas-minimas", titulo: "Medidas mínimas de una vivienda en Madrid", resumen: "Superficies, alturas y estancias mínimas de las Normas Urbanísticas, para que tu distribución cumpla.", duracion: "1:30", legal: true },
  { id: "mover-bano", titulo: "Mover el baño: la bajante manda", resumen: "Distancias del Código Técnico, pendientes y cuándo tiene sentido un triturador.", duracion: "1:30", legal: false },
  { id: "aerotermia", titulo: "Aerotermia: en qué mejora de verdad", resumen: "Rendimiento, emisores de baja temperatura, RITE y dónde va la máquina en Madrid.", duracion: "1:30", legal: false },
  { id: "ventanas", titulo: "Ventanas nuevas: cuánto aíslan", resumen: "La U, marco y vidrio, permeabilidad, cajón de persiana y ventilación.", duracion: "1:30", legal: false },
  { id: "aislamiento-muros", titulo: "¿Trasdosar por dentro o aislar por fuera?", resumen: "Trasdosado, inyección en cámara o SATE, cuánto aislamiento y condensaciones.", duracion: "1:30", legal: false },
];

/** Vídeos para decidir a tiempo los acabados y entender el orden de la obra (carpeta /videos/decisiones). */
export const VIDEOS_DECISIONES: VideoNormativa[] = [
  { id: "pasos-reforma", titulo: "Los pasos de una reforma", resumen: "Del presupuesto al certificado final: qué se decide en cada momento y por qué todo debe estar elegido al acabar la demolición.", duracion: "1:30", legal: false },
  { id: "griferia", titulo: "Grifería: ¿empotrada o de superficie?", resumen: "La primera decisión del baño: cuándo se coloca, la ducha y el caño según el lavabo.", duracion: "1:30", legal: false },
  { id: "cocina", titulo: "Elegir la cocina", resumen: "Puertas, tirador, encimera, electrodomésticos y lo que suele tener sobrecoste.", duracion: "1:30", legal: false },
  { id: "bano", titulo: "Elegir el baño", resumen: "Azulejo, mueble de lavabo, mampara y sanitarios, en el orden en que se deciden.", duracion: "1:30", legal: false },
  { id: "suelo-puertas", titulo: "Suelo, rodapié y puertas de paso", resumen: "Laminado, rodapié y modelos de puerta, elegidos a la vez que el resto de acabados.", duracion: "0:55", legal: false },
  { id: "armarios", titulo: "Armarios empotrados modulares", resumen: "Fondos, alturas, módulos, interiores y puertas abatibles o correderas.", duracion: "1:30", legal: false },
];
