import { MATERIALES_MEDIA_INICIALES, type CategoriaMedia, type MaterialMedia } from "@/lib/gama-media";

/**
 * Catálogo de materiales por nivel (básico, medio y premium) con foto y PVP público de tiendas en internet.
 * Precios con IVA consultados en la web de la tienda en la fecha indicada; pueden cambiar.
 * Nunca son tarifas de proveedor: el precio de tu reforma es el de tu presupuesto.
 */
export type NivelCatalogo = "basico" | "medio" | "premium";

export const NIVELES_CATALOGO: { id: NivelCatalogo; texto: string; detalle: string }[] = [
  { id: "basico", texto: "Básico", detalle: "Buenos materiales a buen precio" },
  { id: "medio", texto: "Medio", detalle: "La gama más elegida" },
  { id: "premium", texto: "Premium", detalle: "Marcas y acabados de más nivel" },
];

const FECHA = "2026-11-22";
const LM = "https://www.leroymerlin.es/productos/";

const lm = (id: string, categoria: CategoriaMedia, marca: string, nombre: string, detalle: string, precio: string, ruta: string, img: string): MaterialMedia => ({
  id,
  categoria,
  marca,
  nombre,
  detalle,
  imagen: `https://media.adeo.com/media/${img}?width=640`,
  encajar: true,
  credito: "Foto: web de Leroy Merlin",
  precio: { texto: precio, fuente: "Leroy Merlin", url: LM + ruta, fecha: FECHA },
  autor: "ReformaMejor",
  fecha: FECHA,
});

export const CATALOGO_BASICO: MaterialMedia[] = [
  lm("lm-eleki", "cocina", "Leroy Merlin", "Cocina en kit Eleki blanca", "5 módulos altos y 4 bajos, 3 m de largo (sin encimera ni electrodomésticos)", "608,18 € la cocina", "cocina-en-kit-eleki-blanca-5-modulos-altos-4-bajos-l-300-x-h-217-x-p-58-cm-90581351.html", "4051619/media.png"),
  lm("lm-duo", "bano", "Leroy Merlin", "Mueble de baño Duo 60 cm", "Roble claro, fondo reducido, con lavabo y espejo", "210,14 €", "conjunto-de-bano-con-lavabo-y-espejo-duo-roble-claro-mate-60x46-cm-fondo-reducido-con-2-puertas-84435598.html", "1995810/media.jpg"),
  lm("lm-mitos", "bano", "Roca", "Pack WC Mitos compacto", "Inodoro con cisterna y tapa amortiguada", "215 €", "pack-wc-roca-mitos-compacto-con-tapa-amortiguada-93493844.html", "4529068/media.jpg"),
  lm("lm-natu", "bano", "Sensea", "Grifo de lavabo Natu", "Monomando cromado", "16,99 €", "grifo-de-lavabo-sensea-natu-monomando-cromo-brillo-laton-82712444.html", "1256541/media.png"),
  lm("lm-dylan", "bano", "Leroy Merlin", "Plato de ducha Dylan 140 × 80", "Blanco, de resina", "159 €", "plato-de-ducha-dylan-140x80-cm-blanco-91527695.html", "4580354/media.jpg"),
  lm("lm-lowa", "suelos", "Artens", "Laminado Lowa AC4 8 mm", "Efecto madera natural, resistente al uso doméstico", "9,90 €/m²", "suelo-laminado-forte-8mm-lowa-efecto-madera-natural-ac4-nat380-artens-85540152.html", "3374579/media.jpg"),
  lm("lm-arcano", "suelos", "Artens", "Porcelánico Arcano 60 × 60", "Efecto cemento gris mate", "9,99 €/m²", "suelo-porcelanico-arcano-efecto-cemento-gris-mate-60x60-cm-artens-83020657.html", "1942527/media.jpg"),
  lm("lm-frosty", "suelos", "Artens", "Azulejo Frosty 30 × 60", "Cerámico blanco mate para paredes de baño y cocina", "8,99 €/m²", "azulejo-ceramico-frosty-blanco-mate-30x60-cm-artens-82213812.html", "520738/media.png"),
  lm("lm-promad", "puertas", "Leroy Merlin", "Puerta lacada Pro Mad", "Blanca, ciega y maciza, 72,5 cm", "90 € la hoja", "puerta-de-interior-abatible-ciega-maciza-lacada-pro-mad-blanco-apertura-izquierda-cerco-de-7x2-anchura-72-5cm-83542429.html", "1855032/media.jpg"),
  lm("lm-corbero", "climatizacion", "Corberó", "Termo eléctrico 80 l", "Multiposición", "149 €", "termo-electrico-corbero-80l-multiposicion-96461946.html", "4970774/media.jpg"),
  lm("lm-haier", "climatizacion", "Haier", "Split Perla 3000 fg", "Aire acondicionado con bomba de calor y wifi", "579 € (sin instalar)", "aire-acondicionado-split-1x1-haier-perla-a-wi-fi-3000-fg-90402654.html", "4684190/media.jpg"),
];

export const CATALOGO_PREMIUM: MaterialMedia[] = [
  lm("lm-tokyo", "cocina", "Delinia", "Cocina en kit iD Tokyo", "Blanco mate, 3 m con muebles altos y bajos (sin encimera ni electrodomésticos)", "1.515,27 € la cocina", "cocina-en-kit-delinia-id-tokyo-blanco-mate-300-cm-con-muebles-altos-y-bajos-82466853.html", "2294371/media.png"),
  lm("lm-bosch-placa", "cocina", "Bosch", "Placa de inducción PXV875DV1E", "5 zonas y zona flex, 82 cm", "999 €", "placa-de-induccion-bosch-pxv875dv1e-con-5-zonas-de-coccion-y-zona-flex-7400-w-negro-82cm-82718567.html", "4081485/media.jpg"),
  lm("lm-bosch-horno", "cocina", "Bosch", "Horno HBA514ES3", "Multifunción 71 l con limpieza por hidrólisis", "289 €", "horno-bosch-hba514es3-multifuncion-71-litros-hidrolisis-negro-clase-a-93470587.html", "4625446/media.png"),
  lm("lm-clova", "bano", "Grohe", "Pack WC suspendido Clova", "Inodoro suspendido con tapa amortiguada (sin cisterna empotrada)", "375,99 €", "pack-wc-suspendido-grohe-clova-ceramic-con-tapa-amortiguada-93993789.html", "4679268/media.jpg"),
  lm("lm-versostat", "bano", "Hansgrohe", "Grifo de ducha termostático Versostat2", "Cromado, temperatura constante", "189 €", "grifo-de-ducha-termostatico-hansgrohe-versostat2-cromo-laton-17941231.html", "2098501/media.jpg"),
  lm("lm-startclova", "bano", "Grohe", "Grifo de lavabo Start Clova", "Monomando cromado, antical", "79,99 €", "grifo-de-lavabo-grohe-start-clova-monomando-cromo-brillo-antical-laton-82312202.html", "2016221/media.png"),
  lm("lm-pure", "suelos", "Leroy Merlin", "Parquet multicapa Pure roble", "Roble natural satinado, lamas de 228 cm", "40,23 €/m²", "parquet-multicapa-pure-roble-natural-satinado-228-1x19-4-cm-88759394.html", "3625983/media.jpg"),
  lm("lm-treviso", "suelos", "Artens", "Porcelánico Treviso 120 × 120", "Gran formato, efecto cemento natural", "33,99 €/m²", "suelo-porcelanico-treviso-efecto-cemento-natural-120x120-cm-artens-86215373.html", "3156846/media.jpg"),
  lm("lm-simon82", "electricidad", "Simon", "Enchufe Simon 82 con 2 USB", "Mecanismo de la serie 82", "36,99 €", "mecanismo-enchufe-schucko-2xusb-s82-75-85763496.html", "3956945/media.jpg"),
  lm("lm-warmium", "climatizacion", "Vaeron", "Aerotermia Warmium 8 kW", "Monobloc R32 para calefacción y agua caliente", "1.929 € (sin instalar)", "aerotermia-vaeron-warmium-p84-8-kw-monobloc-r32-98935770.html", "5326554/media.jpg"),
];

/** Medio: la selección de gama media de la app (con sus PVP públicos donde los hay). */
export const catalogoDe = (nivel: NivelCatalogo): MaterialMedia[] =>
  nivel === "basico" ? CATALOGO_BASICO : nivel === "premium" ? CATALOGO_PREMIUM : MATERIALES_MEDIA_INICIALES;
