import type { NivelMaterial } from "./types";

/** Fotos de materiales de cada gama. Fotos oficiales enlazadas desde la web de cada fabricante (no se copian). */
export interface FotoCalidad {
  src: string;
  texto: string;
  credito: string;
  /** Foto de producto recortada: se muestra entera */
  encajar?: boolean;
}

const DURAVIT = (img: string) =>
  `https://middleware.duravit.com/api/v0/image?format=WEBP&url=${encodeURIComponent(`https://duravitprod-media.e-spirit.cloud/75e15e67-f417-4084-8696-5e4151ad35b8/images/Startseite/${img}`)}&width=413&revision=6766`;

export const FOTOS_CALIDAD: Record<NivelMaterial, FotoCalidad[]> = {
  basico: [
    { src: "https://www.ikea.com/es/es/images/products/metod-cocina-blanco-veddinge-blanco__1457741_pe992796_s5.jpg", texto: "Cocina modular laminada", credito: "IKEA METOD", encajar: true },
    { src: "https://www.ikea.com/es/es/images/products/angsjon-orrsjon-mueble-lavabo-con-cajones-lavabo-efecto-roble__1550224_pe1022194_s5.jpg", texto: "Mueble de baño con lavabo", credito: "IKEA ÄNGSJÖN", encajar: true },
    { src: "https://d7rh5s3nxmpy4.cloudfront.net/CMP7091/Textur-BLANCOSv2.jpg", texto: "Azulejo blanco de baño y cocina", credito: "Argenta" },
    { src: "https://cdn.pimber.ly/public/asset/raw/61e53326b02781001c06e002/9e19aa0d/6482da79ace8bd0012b19ddb/aaf320d8/27472-65-main.jpg", texto: "Mecanismos eléctricos", credito: "Simon 27", encajar: true },
  ],
  medio: [
    { src: "/materiales/salgar-noja.jpg", texto: "Mueble de baño Noja", credito: "Salgar" },
    { src: "https://www.roca.es/RocaResourceServlet/resources/getTransformation?idObject=%7B040DF0D6-D27C-4DD0-9E80-C5FCA7BBE74F%7D&trName=TF_Web_Big", texto: "Inodoro Gap", credito: "Roca", encajar: true },
    { src: "https://alvic.com/wp-content/uploads/2022/06/118-dsc0927-alvic-1200x1680.jpg", texto: "Frentes de cocina Luxe", credito: "Alvic" },
    { src: "https://www.meister.com/_Resources/Persistent/0/c/0/f/0c0f1443aafb0c7630c41bda6e07db7ea2f2488c/462_laminate_LC150_Perspektive.jpg", texto: "Suelo laminado LC150", credito: "Meister" },
  ],
  premium: [
    { src: DURAVIT("homepage_category_washing_vitrium_1_1.jpg"), texto: "Lavabo y mueble de diseño", credito: "Duravit" },
    { src: DURAVIT("homepage_category_showering_tempano_1_1.jpg"), texto: "Ducha a ras de suelo", credito: "Duravit" },
    { src: DURAVIT("homepage_category_faucets_tulum2_1_1.jpg"), texto: "Grifería de diseño", credito: "Duravit" },
    { src: "https://media3.bsh-group.com/Images/600x/26800400_Siemens_Planning_1444x1800.webp", texto: "Electrodomésticos integrados de gama alta", credito: "Siemens iQ700" },
  ],
};

export const NIVEL_DE_CALIDAD: Record<string, NivelMaterial> = { basica: "basico", media: "medio", alta: "premium" };
