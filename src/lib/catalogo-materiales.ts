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
  imagen: img.startsWith("https://") ? img : `https://media.adeo.com/media/${img}?width=640`,
  encajar: true,
  credito: "Foto: web de Leroy Merlin",
  precio: { texto: precio, fuente: "Leroy Merlin", url: LM + ruta, fecha: FECHA },
  autor: "ReformaMejor",
  fecha: FECHA,
});

const HAB_K = "https://www.habitissimo.es/presupuestos/instalar-ventanas-kommerling";
const HAB_RPT = "https://www.habitissimo.es/presupuestos/ventanas-puente-termico";
const FOTO_K = "https://www.kommerling.es/sites/default/files/styles/image_360_360/public/system/K%C3%96MMERLING76-md-xtrem_0.png.webp?itok=O7AANYA_";

/** Ficha de otra tienda o guía de precios pública. */
const otra = (id: string, categoria: CategoriaMedia, marca: string, nombre: string, detalle: string, precio: { texto: string; fuente: string; url: string } | undefined, url?: string, imagen?: string, credito?: string): MaterialMedia => ({
  id, categoria, marca, nombre, detalle, url, imagen, encajar: true, credito, precio: precio && { ...precio, fecha: FECHA }, autor: "ReformaMejor", fecha: FECHA,
});
const ikea = (id: string, nombre: string, detalle: string, precio: string, ruta: string, img: string) =>
  otra(id, "armarios", "IKEA", nombre, detalle, { texto: precio, fuente: "IKEA", url: `https://www.ikea.com/es/es/p/${ruta}/` }, undefined, `https://www.ikea.com/es/es/images/products/${img}`, "Foto: web de IKEA");

const MKP = "https://media.adeo.com/mkp/";
const ADC = "Almacén de Cocinas";
const VIVES = "https://www.vivesceramica.com/";
const vives = (id: string, nombre: string, detalle: string, ruta: string, foto: string): MaterialMedia =>
  otra(id, "azulejos", "Vives", nombre, detalle, undefined, VIVES + ruta, `${VIVES}assets/images/a/midi-orig/${foto}`, "Foto: web de Vives Cerámica");
const FAUS = "https://faus.international/";
const faus = (id: string, nombre: string, detalle: string, foto: string, precio?: { texto: string; fuente: string; url: string }): MaterialMedia =>
  ({ ...otra(id, "suelos", "Faus", nombre, detalle, precio, `${FAUS}categoria-producto/suelos-laminados/`, `${FAUS}wp-content/uploads/${foto}`, "Foto: web de Faus"), encajar: false });
const OUTLET_FAUS = { texto: "Laminados Faus desde unos 22,34 €/m² en su tienda outlet", fuente: "Faus Outlet", url: "https://fausoutlet.es/" };

export const CATALOGO_BASICO: MaterialMedia[] = [
  lm("lm-eleki", "cocina", "Leroy Merlin", "Cocina en kit Eleki blanca", "5 módulos altos y 4 bajos, 3 m de largo (sin encimera ni electrodomésticos)", "608,18 € la cocina", "cocina-en-kit-eleki-blanca-5-modulos-altos-4-bajos-l-300-x-h-217-x-p-58-cm-90581351.html", "4051619/media.png"),
  lm("lm-duo", "bano", "Leroy Merlin", "Mueble de baño Duo 60 cm", "Roble claro, fondo reducido, con lavabo y espejo", "210,14 €", "conjunto-de-bano-con-lavabo-y-espejo-duo-roble-claro-mate-60x46-cm-fondo-reducido-con-2-puertas-84435598.html", "1995810/media.jpg"),
  lm("lm-mitos", "bano", "Roca", "Pack WC Mitos compacto", "Inodoro con cisterna y tapa amortiguada", "215 €", "pack-wc-roca-mitos-compacto-con-tapa-amortiguada-93493844.html", "4529068/media.jpg"),
  lm("lm-rs-titanium", "bano", "Ramon Soler", "Grifo de lavabo Titanium", "Monomando cromado", "36,99 €", "grifo-lavabo-monomando-ramon-soler-titanium-93371262.html", MKP + "355a7b6aea8b2d0a8a9bf06c000f6958/media.jpg"),
  lm("lm-valaz-ebro", "bano", "Valaz", "Grifo de lavabo Ebro", "Monomando redondo, oro mate con protección PVD", "47,36 €", "valaz-grifo-de-lavabo-monomando-redondo-oro-mate-con-proteccion-pvd-serie-ebro-91449722.html", MKP + "52508e0e633b9a5e5a7e161b273c5700/media.jpg"),
  lm("lm-natu", "bano", "Sensea", "Grifo de lavabo Natu", "Monomando cromado", "16,99 €", "grifo-de-lavabo-sensea-natu-monomando-cromo-brillo-laton-82712444.html", "1256541/media.png"),
  lm("lm-dylan", "bano", "Leroy Merlin", "Plato de ducha Dylan 140 × 80", "Blanco, de resina", "159 €", "plato-de-ducha-dylan-140x80-cm-blanco-91527695.html", "4580354/media.jpg"),
  otra("enc-seriestone", "cocina", "Seriestone", "Encimera porcelánica Calacatta", "Tablero de 305 × 61 cm y 12 mm, para cortar a medida", { texto: "365 € el tablero de 3 m", fuente: "Obramat", url: "https://www.obramat.es/productos/encimera-acabado-calacatta-305-x-61-x-1-2-cm-25060365.html" }, undefined, "https://media.adeo.com/media/5556392/media.png?width=640", "Foto: web de Obramat"),
  lm("lm-lowa", "suelos", "Artens", "Laminado Lowa AC4 8 mm", "Efecto madera natural, resistente al uso doméstico", "9,90 €/m²", "suelo-laminado-forte-8mm-lowa-efecto-madera-natural-ac4-nat380-artens-85540152.html", "3374579/media.jpg"),
  lm("lm-arcano", "suelos", "Artens", "Porcelánico Arcano 60 × 60", "Efecto cemento gris mate", "9,99 €/m²", "suelo-porcelanico-arcano-efecto-cemento-gris-mate-60x60-cm-artens-83020657.html", "1942527/media.jpg"),
  lm("lm-frosty", "azulejos", "Artens", "Azulejo Frosty 30 × 60", "Cerámico blanco mate para paredes de baño y cocina", "8,99 €/m²", "azulejo-ceramico-frosty-blanco-mate-30x60-cm-artens-82213812.html", "520738/media.png"),
  lm("lm-promad", "puertas", "Leroy Merlin", "Puerta lacada Pro Mad", "Blanca, ciega y maciza, 72,5 cm", "90 € la hoja", "puerta-de-interior-abatible-ciega-maciza-lacada-pro-mad-blanco-apertura-izquierda-cerco-de-7x2-anchura-72-5cm-83542429.html", "1855032/media.jpg"),
  lm("lm-niloe", "electricidad", "Legrand", "Enchufe Niloé Step", "Blanco", "3,49 €", "enchufe-legrand-niloe-step-color-blanco-81950575.html", "1874836/media.png"),
  lm("lm-zenit", "electricidad", "Niessen", "Enchufe Zenit", "Blanco", "4,39 €", "enchufe-niessen-zenit-color-blanco-14787843.html", "5211794/media.jpg"),
  lm("lm-unica", "electricidad", "Schneider Electric", "Enchufe New Unica", "Blanco", "4,69 €", "enchufe-schneider-electric-new-unica-blanco-82125846.html", "2855383/media.jpg"),
  lm("lm-iris", "electricidad", "BJC", "Enchufe Iris", "Blanco", "5,39 €", "enchufe-bjc-iris-blanco-81898245.html", "1874626/media.png"),
  vives("vives-etnia", "Azulejo Etnia", "Pasta roja, para paredes de baño y cocina", "productos/azulejos-para-banos/", "A604_Etnia_siena-kitchen-bathroom-wall-tiles-VIVES-Ceramica.jpg"),
  otra("k-oscilo", "ventanas", "Kömmerling", "Ventana de PVC oscilobatiente", "1 × 1 m, con vidrio Climalit", { texto: "Unos 370 € la ventana (instalación aparte, 150–200 €)", fuente: "guía de precios de Habitissimo", url: HAB_K }, "https://www.kommerling.es/", FOTO_K, "Foto: web de Kömmerling"),
  otra("c-4200", "ventanas", "Cortizo", "Corredera de aluminio RPT COR 4200", "Con rotura de puente térmico y vidrio Climalit", { texto: "Instalada, desde unos 230 €/m²", fuente: "guía de precios de Habitissimo", url: HAB_RPT }, "https://www.cortizo.com/"),
  ikea("ikea-forsand-150", "Armario PAX / FORSAND 150 cm", "Blanco, 150 × 60 × 236 cm, con interior", "339 €", "pax-forsand-combinacion-armario-blanco-blanco-s69502768", "pax-forsand-combinacion-armario-blanco-blanco__1197032_pe903358_s5.jpg"),
  lm("lm-corbero", "climatizacion", "Corberó", "Termo eléctrico 80 l", "Multiposición", "149 €", "termo-electrico-corbero-80l-multiposicion-96461946.html", "4970774/media.jpg"),
  lm("lm-haier", "climatizacion", "Haier", "Split Perla 3000 fg", "Aire acondicionado con bomba de calor y wifi", "579 € (sin instalar)", "aire-acondicionado-split-1x1-haier-perla-a-wi-fi-3000-fg-90402654.html", "4684190/media.jpg"),
];

export const CATALOGO_PREMIUM: MaterialMedia[] = [
  lm("lm-tokyo", "cocina", "Delinia", "Cocina en kit iD Tokyo", "Blanco mate, 3 m con muebles altos y bajos (sin encimera ni electrodomésticos)", "1.515,27 € la cocina", "cocina-en-kit-delinia-id-tokyo-blanco-mate-300-cm-con-muebles-altos-y-bajos-82466853.html", "2294371/media.png"),
  lm("lm-bosch-placa", "cocina", "Bosch", "Placa de inducción PXV875DV1E", "5 zonas y zona flex, 82 cm", "999 €", "placa-de-induccion-bosch-pxv875dv1e-con-5-zonas-de-coccion-y-zona-flex-7400-w-negro-82cm-82718567.html", "4081485/media.jpg"),
  lm("lm-bosch-horno", "cocina", "Bosch", "Horno HBA514ES3", "Multifunción 71 l con limpieza por hidrólisis", "289 €", "horno-bosch-hba514es3-multifuncion-71-litros-hidrolisis-negro-clase-a-93470587.html", "4625446/media.png"),
  otra("enc-dekton", "cocina", "Dekton", "Encimera porcelánica Marina", "Blanca con vetas grises suaves, 12 mm", { texto: "Unos 234 € el metro lineal", fuente: ADC, url: "https://almacendecocinas.com/producto/dekton-marina-encimera-porcelanica-blanca-con-vetas-grises-suaves-precio-por-metro-lineal/" }, "https://www.cosentino.com/es/dekton/", "https://almacendecocinas.com/wp-content/uploads/2026/04/dekton-marina-mn.jpg", "Foto: web de Almacén de Cocinas"),
  otra("enc-laminam", "cocina", "Laminam", "Encimera porcelánica Bianco Lasa", "Tipo mármol blanco con vetas doradas, acabado mate, 12 mm", { texto: "Unos 276 € el metro lineal", fuente: ADC, url: "https://almacendecocinas.com/producto/laminam-bianco-lasa-superficie-tipo-marmol-blanco-con-vetas-doradas-y-grises-suaves-en-acabado-mate-precio-por-metro-lineal/" }, "https://www.laminam.com/", "https://almacendecocinas.com/wp-content/uploads/2025/02/laminam-bianco-lasa.jpg", "Foto: web de Almacén de Cocinas"),
  lm("lm-clova", "bano", "Grohe", "Pack WC suspendido Clova", "Inodoro suspendido con tapa amortiguada (sin cisterna empotrada)", "375,99 €", "pack-wc-suspendido-grohe-clova-ceramic-con-tapa-amortiguada-93993789.html", "4679268/media.jpg"),
  lm("lm-versostat", "bano", "Hansgrohe", "Grifo de ducha termostático Versostat2", "Cromado, temperatura constante", "189 €", "grifo-de-ducha-termostatico-hansgrohe-versostat2-cromo-laton-17941231.html", "2098501/media.jpg"),
  lm("lm-basetres", "bano", "Tres", "Termostático de ducha Base-Tres Plus", "Mural de 2 vías con barra de ducha, negro mate", "476,05 €", "conjunto-grifo-termostatico-mural-2-vias-para-ducha-base-tres-plus-con-barra-de-ducha-de-longitud-variable-hasta-su-fijacion-negro-mate-89917759.html", MKP + "9544e434053f4b20c793183c67b3f966/media.jpg"),
  lm("lm-cuadrotres", "bano", "Tres", "Grifo de lavabo Cuadro-Tres cascada", "Caño en cascada, cromo", "157,90 €", "cuadro-tres-00610102-grifo-lavabo-con-cano-cascada-cromo-87094547.html", MKP + "769339f516be4878d292c76a607316dc/media.jpg"),
  lm("lm-stockholm", "bano", "Ramon Soler", "Columna de ducha termostática Stockholm", "Rociador de 30 cm extraplano, antical y antiquemaduras", "229 €", "columna-de-ducha-con-grifo-termostatico-industrias-ramon-soler-stockholm-cromo-brillo-rociador-30-cm-cuadrado-extraplano-barra-extensible-sistema-antical-con-ahorro-de-agua-cuerpo-frio-antiquemaduras-91786726.html", "4089055/media.jpg"),
  lm("lm-startclova", "bano", "Grohe", "Grifo de lavabo Start Clova", "Monomando cromado, antical", "79,99 €", "grifo-de-lavabo-grohe-start-clova-monomando-cromo-brillo-antical-laton-82312202.html", "2016221/media.png"),
  lm("lm-pure", "suelos", "Leroy Merlin", "Parquet multicapa Pure roble", "Roble natural satinado, lamas de 228 cm", "40,23 €/m²", "parquet-multicapa-pure-roble-natural-satinado-228-1x19-4-cm-88759394.html", "3625983/media.jpg"),
  lm("lm-treviso", "suelos", "Artens", "Porcelánico Treviso 120 × 120", "Gran formato, efecto cemento natural", "33,99 €/m²", "suelo-porcelanico-treviso-efecto-cemento-natural-120x120-cm-artens-86215373.html", "3156846/media.jpg"),
  otra("k-ad76", "ventanas", "Kömmerling", "Ventana de PVC 76 AD Xtrem", "La serie de más aislamiento; 126 × 115 cm, con vidrio Climalit", { texto: "Instalada, unos 1.310 € la ventana", fuente: "guía de precios de Habitissimo", url: HAB_K }, "https://www.kommerling.es/", FOTO_K, "Foto: web de Kömmerling"),
  otra("c-vision", "ventanas", "Cortizo", "Corredera minimalista COR Vision Plus", "Perfil casi invisible y grandes vidrios Climalit, con RPT", undefined, "https://cortizoarch.cortizo.com/en/cor-vision-plus/"),
  ikea("ikea-tonstad-200", "Armario PAX / TONSTAD 200 cm", "Chapa de roble y vidrio, 200 × 60 × 236 cm, con interior", "938 €", "pax-tonstad-combinacion-armario-blanco-chapa-roble-vidrio-s49551217", "pax-tonstad-combinacion-armario-blanco-chapa-roble-vidrio__1304220_pe938668_s5.jpg"),
  faus("faus-masterpieces", "Laminado Masterpieces", "La colección de más nivel de Faus, con veta y relieve sincronizados", "Portada-SL-Masterpieces-1-380x380.jpg"),
  vives("vives-tandem", "Porcelánico Tandem", "Efecto cemento, para suelo y pared, con piezas decorativas", "productos/colecciones/tandem/", "A1090_Stripes_Lines_Squares_Blanco_Tandem_Ceniza_Tandem_Antracita.jpg"),
  vives("vives-sicilia", "Porcelánico Sicilia", "Efecto piedra natural, suelo y pared", "productos/colecciones/sicilia/", "A1164_Trapezio_Sicilia_Natural_Dirilo_Blanco_Multicolor_Iblei_Greige_Iblei_Blanco_Mosaico_Gela_Blanco.jpg"),
  lm("lm-simon82", "electricidad", "Simon", "Enchufe Simon 82 con 2 USB", "Mecanismo de la serie 82", "36,99 €", "mecanismo-enchufe-schucko-2xusb-s82-75-85763496.html", "3956945/media.jpg"),
  lm("lm-warmium", "climatizacion", "Vaeron", "Aerotermia Warmium 8 kW", "Monobloc R32 para calefacción y agua caliente", "1.929 € (sin instalar)", "aerotermia-vaeron-warmium-p84-8-kw-monobloc-r32-98935770.html", "5326554/media.jpg"),
];

/** Medio: además de la selección de gama media de la app. */
export const CATALOGO_MEDIO_EXTRA: MaterialMedia[] = [
  lm("lm-alexia", "bano", "Ramon Soler", "Grifo de bañera y ducha Alexia", "Monomando con ahorro de agua", "123,05 €", "grifo-monomando-banera-ducha-alexia-c2-ref-3605s-ramon-soler-89206503.html", MKP + "4eb2acee1a70960c6a77491f1a70bbdb/media.jpeg"),
  lm("lm-study", "bano", "Tres", "Grifo de lavabo Study", "Monomando cromado", "151,75 €", "tres-26290301-study-grifo-monomando-lavabo-87094461.html", MKP + "84994155c7f05efeb16cf1976247a914/media.jpg"),
  lm("lm-valaz-segura", "bano", "Valaz", "Grifo de lavabo alto Segura", "Para lavabo sobre encimera, dorado cepillado", "63,16 €", "valaz-grifo-lavabo-alto-para-pica-monomando-cuadrado-dorado-cepillado-serie-segura-89828315.html", MKP + "3ccbf38e022b21440a5d5fe7a0f0e34b/media.jpg"),
  lm("lm-finfloor-original", "suelos", "Finfloor", "Laminado Original V4 AC5", "Roble Sonata, alta resistencia, con bisel en 4 lados", "31,93 €/m²", "tarimas-diamond-suelo-laminado-ac5-finfloor-original-v4-roble-sonata-353b-95862464.html", MKP + "cc30de01368f0b405399d5e110a63c94/media.jpg"),
  faus("faus-harmony", "Laminado Harmony", "Colección de madera natural para toda la vivienda", "Portada-SL-Harmony-380x380.jpg", OUTLET_FAUS),
  faus("faus-cosmo", "Laminado Cosmo 4V", "Lamas con bisel en 4 lados", "Portada-SL-Cosmo-4V-380x380.jpg"),
  vives("vives-surf", "Revestimiento Surf", "Pasta blanca en colores lisos y mosaicos, para baño y cocina", "productos/colecciones/surf/", "A1140_Poipu_Blanco_Mosaico_Kaimu_Celeste_Amalfi_Azul.jpg"),
  vives("vives-zepto", "Revestimiento Zepto", "Pequeño formato en colores lisos", "productos/pequeno-formato-ceramico/", "A1001_Micra_grafito_Deca_grafito_Pizca_Cuark_blanco.jpg"),
  lm("lm-simon270", "electricidad", "Simon", "Enchufe Simon 270", "Negro mate", "6,99 €", "enchufe-con-toma-de-tierra-simon-270-negro-mate-85164195.html", "1874159/media.jpg"),
  lm("lm-valena", "electricidad", "Legrand", "Enchufe Valena Next", "Blanco", "6,79 €", "enchufe-legrand-valena-next-blanco-82117933.html", "1873616/media.png"),
  lm("lm-sky", "electricidad", "Niessen", "Enchufe Sky plano", "9 mm, blanco", "5,99 €", "enchufe-plano-9mm-sky-82834277.html", "1881485/media.jpg"),
];

/** Medio: la selección de gama media de la app (con sus PVP públicos donde los hay) y lo añadido aquí. */
export const catalogoDe = (nivel: NivelCatalogo): MaterialMedia[] =>
  nivel === "basico" ? CATALOGO_BASICO : nivel === "premium" ? CATALOGO_PREMIUM : [...MATERIALES_MEDIA_INICIALES, ...CATALOGO_MEDIO_EXTRA];
