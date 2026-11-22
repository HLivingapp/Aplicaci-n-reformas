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
const marca = (id: string, categoria: CategoriaMedia, m: string, nombre: string, detalle: string, url: string, imagen?: string, encajar = false): MaterialMedia =>
  ({ ...otra(id, categoria, m, nombre, detalle, undefined, url, imagen, imagen ? `Foto: web de ${m}` : undefined), encajar });
const OUTLET_FAUS = { texto: "Laminados Faus desde unos 22,34 €/m² en su tienda outlet", fuente: "Faus Outlet", url: "https://fausoutlet.es/" };

const ADC_URL = "https://almacendecocinas.com/producto/";
const enc = (id: string, m: string, modelo: string, detalle: string, euros: number, slug: string, foto: string): MaterialMedia =>
  ({ ...otra(id, "encimeras", m, `Encimera porcelánica ${modelo}`, `${detalle}, 12 mm`, { texto: `Unos ${euros} € el metro lineal`, fuente: ADC, url: ADC_URL + slug }, undefined, `https://almacendecocinas.com/wp-content/uploads/${foto}`, "Foto: web de Almacén de Cocinas"), encajar: false });

const ROCA_T = "https://www.rocatiles.com/";
const rocaT = (id: string, nombre: string, detalle: string, euros: string, cod: string): MaterialMedia =>
  ({ ...otra(id, "azulejos", "Roca Cerámica", nombre, detalle, { texto: `Unos ${euros} €/m² (precio de referencia)`, fuente: "Roca Cerámica", url: `${ROCA_T}es/colecciones/terre/` }, `${ROCA_T}es/colecciones/terre/`, `${ROCA_T}wp-content/uploads/2026/05/${cod}-1-600x424.jpg`, "Foto: web de Roca Cerámica"), encajar: false });
const LMFP = "https://www.leroymerlin.es/fp/";
const banera = (id: string, nombre: string, detalle: string, euros: string, ruta: string, img?: string): MaterialMedia =>
  otra(id, "bano", "Leroy Merlin", nombre, detalle, { texto: `${euros} €`, fuente: "Leroy Merlin", url: LMFP + ruta }, undefined, img && `https://media.adeo.com/${img}`, img && "Foto: web de Leroy Merlin");
const amazon = (id: string, nombre: string, detalle: string, euros: string, asin: string): MaterialMedia =>
  marca(id, "electricidad", "Amazon", nombre, `${detalle}. Unos ${euros} € en Amazon`, `https://www.amazon.es/dp/${asin}`);

const NAIS = "https://nais.es/es/azulejos/coleccion_";
const EQ = "https://pror2.equipeceramicas.com/cdn-cgi/image/width=600,height=450,fit=cover/";
const nais = (col: string, nombre: string, detalle: string, euros: string, foto: string): MaterialMedia =>
  ({ ...otra(`nais-${col}`, "azulejos", "Nais", nombre, detalle, { texto: `${euros} €/m²`, fuente: "Nais", url: `${NAIS}${col}/` }, `${NAIS}${col}/`, `${EQ}${foto}-mini.png`, "Foto: web de Nais"), encajar: false });

export const CATALOGO_BASICO: MaterialMedia[] = [
  lm("lm-eleki", "cocina", "Leroy Merlin", "Cocina en kit Eleki blanca", "5 módulos altos y 4 bajos, 3 m de largo (sin encimera ni electrodomésticos)", "608,18 € la cocina", "cocina-en-kit-eleki-blanca-5-modulos-altos-4-bajos-l-300-x-h-217-x-p-58-cm-90581351.html", "4051619/media.png"),
  lm("lm-tokyo", "cocina", "Delinia (Leroy Merlin)", "Cocina en kit iD Tokyo", "Blanco mate, 3 m con muebles altos y bajos (sin encimera ni electrodomésticos)", "1.515,27 € la cocina", "cocina-en-kit-delinia-id-tokyo-blanco-mate-300-cm-con-muebles-altos-y-bajos-82466853.html", "2294371/media.png"),
  lm("lm-sensea-studio", "sanitarios", "Sensea", "Lavabo sobre encimera Studio", "Cerámica blanca, 50 × 36 cm", "58,99 €", "lavabo-sobre-encimera-de-ceramica-studio-50x12x36-cm-rectangular-blanco-brillante-82730376.html", "2877343/media.png"),
  lm("lm-sensea-neo", "sanitarios", "Sensea", "Pack WC Neo", "Inodoro con cisterna y tapa amortiguada", "199 €", "pack-wc-sensea-neo-con-tapa-amortiguada-blanco-83637062.html", "3085770/media.png"),
  lm("lm-duo", "bano", "Leroy Merlin", "Mueble de baño Duo 60 cm", "Roble claro, fondo reducido, con lavabo y espejo", "210,14 €", "conjunto-de-bano-con-lavabo-y-espejo-duo-roble-claro-mate-60x46-cm-fondo-reducido-con-2-puertas-84435598.html", "1995810/media.jpg"),
  lm("lm-mitos", "sanitarios", "Roca", "Pack WC Mitos compacto", "Inodoro con cisterna y tapa amortiguada", "215 €", "pack-wc-roca-mitos-compacto-con-tapa-amortiguada-93493844.html", "4529068/media.jpg"),
  lm("lm-rs-titanium", "griferia", "Ramon Soler", "Grifo de lavabo Titanium", "Monomando cromado", "36,99 €", "grifo-lavabo-monomando-ramon-soler-titanium-93371262.html", MKP + "355a7b6aea8b2d0a8a9bf06c000f6958/media.jpg"),
  lm("lm-valaz-ebro", "griferia", "Valaz", "Grifo de lavabo Ebro", "Monomando redondo, oro mate con protección PVD", "47,36 €", "valaz-grifo-de-lavabo-monomando-redondo-oro-mate-con-proteccion-pvd-serie-ebro-91449722.html", MKP + "52508e0e633b9a5e5a7e161b273c5700/media.jpg"),
  lm("lm-natu", "griferia", "Sensea", "Grifo de lavabo Natu", "Monomando cromado", "16,99 €", "grifo-de-lavabo-sensea-natu-monomando-cromo-brillo-laton-82712444.html", "1256541/media.png"),
  lm("lm-dylan", "bano", "Leroy Merlin", "Plato de ducha Dylan 140 × 80", "Blanco, de resina", "159 €", "plato-de-ducha-dylan-140x80-cm-blanco-91527695.html", "4580354/media.jpg"),
  otra("enc-seriestone", "encimeras", "Seriestone", "Encimera porcelánica Calacatta", "Tablero de 305 × 61 cm y 12 mm, para cortar a medida", { texto: "365 € el tablero de 3 m", fuente: "Obramat", url: "https://www.obramat.es/productos/encimera-acabado-calacatta-305-x-61-x-1-2-cm-25060365.html" }, undefined, "https://media.adeo.com/media/5556392/media.png?width=640", "Foto: web de Obramat"),
  lm("lm-lowa", "suelos", "Artens", "Laminado Lowa AC4 8 mm", "Efecto madera natural, resistente al uso doméstico", "9,90 €/m²", "suelo-laminado-forte-8mm-lowa-efecto-madera-natural-ac4-nat380-artens-85540152.html", "3374579/media.jpg"),
  lm("lm-meister-lc150", "suelos", "Meister", "Laminado LC 150 de 8 mm", "Roble Muscat, AC4", "24,90 €/m²", "suelo-laminado-8mm-roble-muscat-efecto-madera-natural-ac4-lc-150-meister-72437885.html", MKP + "9a4b904363e8c966c7662faff5d6a47a/media.jpg"),
  lm("lm-grespania-montana", "azulejos", "Grespania", "Azulejo Montana 30 × 60", "Relieve efecto piedra, color arena", "13,49 €/m²", "azulejo-ceramico-montana-efecto-relieve-piedra-arena-dawson-30x60-cm-grespania-90539692.html", "4795314/media.jpg"),
  marca("argenta-blancos", "azulejos", "Argenta", "Revestimientos blancos", "Azulejos blancos lisos y con relieve para baño y cocina", "https://www.argentaceramica.com/productos/", "https://d7rh5s3nxmpy4.cloudfront.net/CMP7091/Textur-BLANCOSv2.jpg"),
  marca("argenta-marmol", "azulejos", "Argenta", "Porcelánico efecto mármol", "Suelo y pared efecto mármol", "https://www.argentaceramica.com/productos/", "https://d7rh5s3nxmpy4.cloudfront.net/CMP7091/Textur-MARMOL.jpg"),
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
  // Selección del Excel de materiales generales
  banera("lm-nerea", "Bañera rectangular Nerea", "Acrílica, 140 x 70 cm", "145", "14868343/banera-rectangular-nerea-70x140x40-cm", "media/2037405/media.png"),
  banera("lm-roca-pluvia", "Bañera Roca Pluvia", "Acero, 100 x 70 cm, para baños pequeños", "115,70", "89168517/banera-rectangular-roca-roca-pluvia-100x70x37-4-cm", "media/1959013/media.jpg"),
  banera("lm-roca-sunia", "Bañera Roca Sunia", "Acrílica, 170 x 70 cm", "271", "89168526/banera-rectangular-roca-roca-sunia-170x70x41-5-cm"),
  amazon("amz-kyotech", "Focos LED de techo orientables", "Kyotech, superficie, blanco, negro o plateado", "19,99", "B088K5TX2P"),
  amazon("amz-vintage", "Lámpara colgante vintage E27", "Lixada, varias alturas de cable", "15", "B01FMB0EMA"),
  amazon("amz-starryol", "Colgante industrial doble", "Starryol, cuerda doble", "15", "B07BL3ZS9D"),
  amazon("amz-canamo", "Colgante vintage de cuerda de cáñamo", "Casquillo E27", "28", "B07XY1LS5D"),
  amazon("amz-led-madera", "Colgante LED metal y madera", "Varios colores", "21", "B09B1Y72LZ"),
];

export const CATALOGO_PREMIUM: MaterialMedia[] = [
  lm("lm-bosch-placa", "cocina", "Bosch", "Placa de inducción PXV875DV1E", "5 zonas y zona flex, 82 cm", "999 €", "placa-de-induccion-bosch-pxv875dv1e-con-5-zonas-de-coccion-y-zona-flex-7400-w-negro-82cm-82718567.html", "4081485/media.jpg"),
  lm("lm-bosch-horno", "cocina", "Bosch", "Horno HBA514ES3", "Multifunción 71 l con limpieza por hidrólisis", "289 €", "horno-bosch-hba514es3-multifuncion-71-litros-hidrolisis-negro-clase-a-93470587.html", "4625446/media.png"),
  otra("enc-dekton", "encimeras", "Dekton", "Encimera porcelánica Marina", "Blanca con vetas grises suaves, 12 mm", { texto: "Unos 234 € el metro lineal", fuente: ADC, url: "https://almacendecocinas.com/producto/dekton-marina-encimera-porcelanica-blanca-con-vetas-grises-suaves-precio-por-metro-lineal/" }, "https://www.cosentino.com/es/dekton/", "https://almacendecocinas.com/wp-content/uploads/2026/04/dekton-marina-mn.jpg", "Foto: web de Almacén de Cocinas"),
  otra("enc-laminam", "encimeras", "Laminam", "Encimera porcelánica Bianco Lasa", "Tipo mármol blanco con vetas doradas, acabado mate, 12 mm", { texto: "Unos 276 € el metro lineal", fuente: ADC, url: "https://almacendecocinas.com/producto/laminam-bianco-lasa-superficie-tipo-marmol-blanco-con-vetas-doradas-y-grises-suaves-en-acabado-mate-precio-por-metro-lineal/" }, "https://www.laminam.com/", "https://almacendecocinas.com/wp-content/uploads/2025/02/laminam-bianco-lasa.jpg", "Foto: web de Almacén de Cocinas"),
  enc("enc-dekton-moone", "Dekton", "Moone", "Gris claro uniforme", 268, "dekton-moone-encimera-porcelanica-gris-claro-uniforme-precio-por-metro-lineal/", "2026/04/dekton-moone-mn.jpg"),
  enc("enc-dekton-kairos", "Dekton", "Kairos", "Blanca con vetas grises tipo mármol", 268, "dekton-kairos-encimera-porcelanica-blanca-con-vetas-grises-tipo-marmol-precio-por-metro-lineal/", "2025/02/dekton-kairos-menu.jpg"),
  enc("enc-dekton-keon", "Dekton", "Keon", "Gris cemento industrial", 268, "dekton-keon-encimera-porcelanica-gris-cemento-industrial-precio-por-metro-lineal/", "2025/02/dekton-keon-muestra-2.jpg"),
  enc("enc-laminam-statuario", "Laminam", "Bianco Statuario Soft", "Tipo mármol blanco con vetas grises, acabado mate", 276, "laminam-bianco-statuario-soft-superficie-tipo-marmol-blanco-con-vetas-grises-elegantes-y-acabado-mate-precio-por-metro-lineal/", "2025/02/laminam-bianco-statuario.jpg"),
  enc("enc-laminam-calacatta", "Laminam", "Calacatta Brecciato", "Mármol blanco con vetas brechadas grises y doradas", 246, "laminam-calacatta-brecciato-superficie-tipo-marmol-blanco-con-vetas-brechadas-en-tonos-grises-y-dorados-acabado-mate-precio-por-metro-lineal/", "2026/05/laminam-calacatta-brecciato-mn.jpg"),
  enc("enc-laminam-noce", "Laminam", "Legno Venezia Noce", "Efecto madera de nogal, acabado mate", 246, "laminam-legno-venezia-noce-superficie-efecto-madera-nogal-veneciano-con-veta-lineal-y-acabado-mate-precio-por-metro-lineal/", "2026/05/laminam-legno-venecia-noce-m.jpg"),
  enc("enc-laminam-fokos", "Laminam", "Fokos Terra", "Efecto tierra en tono arcilla", 268, "laminam-fokos-terra-superficie-efecto-tierra-en-tono-arcilla-calida-con-acabado-mate-precio-por-metro-lineal/", "2025/02/laminam-terra-muestra.jpg"),
  enc("enc-ascale-aura", "Ascale", "Aura Lux", "Mármol blanco con vetas doradas", 312, "ascale-aura-lux-superficie-tipo-marmol-blanco-con-vetas-doradas-y-grises-en-acabado-mate-natural-precio-por-metro-lineal/", "2026/04/ascale-aura-lux-white.jpg"),
  enc("enc-ascale-onice", "Ascale", "Onice Black", "Ónice negro con vetas grises y blancas", 312, "ascale-onice-black-superficie-tipo-onice-negro-con-vetas-grises-y-blancas-en-acabado-mate-natural-precio-por-metro-lineal/", "2026/04/ascale-onice-black-m.jpg"),
  enc("enc-neolith-calixta", "Neolith", "Calixta", "Beige efecto mármol cálido", 399, "neolith-calixta-superficie-beige-efecto-marmol-calido-precio-por-metro-lineal/", "2026/04/neolith-calixta.jpg"),
  enc("enc-neolith-boheme", "Neolith", "La Bohème", "Efecto madera natural envejecida", 399, "neolith-la-boheme-superficie-efecto-madera-natural-envejecida-precio-por-metro-lineal/", "2026/04/neolith-la-boheme-m.jpg"),
  lm("lm-clova", "sanitarios", "Grohe", "Pack WC suspendido Clova", "Inodoro suspendido con tapa amortiguada (sin cisterna empotrada)", "375,99 €", "pack-wc-suspendido-grohe-clova-ceramic-con-tapa-amortiguada-93993789.html", "4679268/media.jpg"),
  lm("lm-versostat", "griferia", "Hansgrohe", "Grifo de ducha termostático Versostat2", "Cromado, temperatura constante", "189 €", "grifo-de-ducha-termostatico-hansgrohe-versostat2-cromo-laton-17941231.html", "2098501/media.jpg"),
  lm("lm-basetres", "griferia", "Tres", "Termostático de ducha Base-Tres Plus", "Mural de 2 vías con barra de ducha, negro mate", "476,05 €", "conjunto-grifo-termostatico-mural-2-vias-para-ducha-base-tres-plus-con-barra-de-ducha-de-longitud-variable-hasta-su-fijacion-negro-mate-89917759.html", MKP + "9544e434053f4b20c793183c67b3f966/media.jpg"),
  lm("lm-cuadrotres", "griferia", "Tres", "Grifo de lavabo Cuadro-Tres cascada", "Caño en cascada, cromo", "157,90 €", "cuadro-tres-00610102-grifo-lavabo-con-cano-cascada-cromo-87094547.html", MKP + "769339f516be4878d292c76a607316dc/media.jpg"),
  lm("lm-stockholm", "griferia", "Ramon Soler", "Columna de ducha termostática Stockholm", "Rociador de 30 cm extraplano, antical y antiquemaduras", "229 €", "columna-de-ducha-con-grifo-termostatico-industrias-ramon-soler-stockholm-cromo-brillo-rociador-30-cm-cuadrado-extraplano-barra-extensible-sistema-antical-con-ahorro-de-agua-cuerpo-frio-antiquemaduras-91786726.html", "4089055/media.jpg"),
  lm("lm-startclova", "griferia", "Grohe", "Grifo de lavabo Start Clova", "Monomando cromado, antical", "79,99 €", "grifo-de-lavabo-grohe-start-clova-monomando-cromo-brillo-antical-laton-82312202.html", "2016221/media.png"),
  lm("lm-pure", "suelos", "Leroy Merlin", "Parquet multicapa Pure roble", "Roble natural satinado, lamas de 228 cm", "40,23 €/m²", "parquet-multicapa-pure-roble-natural-satinado-228-1x19-4-cm-88759394.html", "3625983/media.jpg"),
  lm("lm-treviso", "suelos", "Artens", "Porcelánico Treviso 120 × 120", "Gran formato, efecto cemento natural", "33,99 €/m²", "suelo-porcelanico-treviso-efecto-cemento-natural-120x120-cm-artens-86215373.html", "3156846/media.jpg"),
  otra("k-ad76", "ventanas", "Kömmerling", "Ventana de PVC 76 AD Xtrem", "La serie de más aislamiento; 126 × 115 cm, con vidrio Climalit", { texto: "Instalada, unos 1.310 € la ventana", fuente: "guía de precios de Habitissimo", url: HAB_K }, "https://www.kommerling.es/", FOTO_K, "Foto: web de Kömmerling"),
  otra("c-vision", "ventanas", "Cortizo", "Corredera minimalista COR Vision Plus", "Perfil casi invisible y grandes vidrios Climalit, con RPT", undefined, "https://cortizoarch.cortizo.com/en/cor-vision-plus/"),
  ikea("ikea-tonstad-200", "Armario PAX / TONSTAD 200 cm", "Chapa de roble y vidrio, 200 × 60 × 236 cm, con interior", "938 €", "pax-tonstad-combinacion-armario-blanco-chapa-roble-vidrio-s49551217", "pax-tonstad-combinacion-armario-blanco-chapa-roble-vidrio__1304220_pe938668_s5.jpg"),
  faus("faus-masterpieces", "Laminado Masterpieces", "La colección de más nivel de Faus, con veta y relieve sincronizados", "Portada-SL-Masterpieces-1-380x380.jpg"),
  vives("vives-tandem", "Porcelánico Tandem", "Efecto cemento, para suelo y pared, con piezas decorativas", "productos/colecciones/tandem/", "A1090_Stripes_Lines_Squares_Blanco_Tandem_Ceniza_Tandem_Antracita.jpg"),
  vives("vives-sicilia", "Porcelánico Sicilia", "Efecto piedra natural, suelo y pared", "productos/colecciones/sicilia/", "A1164_Trapezio_Sicilia_Natural_Dirilo_Blanco_Multicolor_Iblei_Greige_Iblei_Blanco_Mosaico_Gela_Blanco.jpg"),
  marca("porcelanosa-taranto", "azulejos", "Porcelanosa", "Revestimiento Taranto Bianco", "Efecto mármol blanco para baños y cocinas", "https://www.porcelanosa.com/revestimiento/imitacion-marmol/", "https://www.porcelanosa.com/productfinder/resources/imgcom/thumbs/100371266.jpg"),
  marca("marazzi-grande", "azulejos", "Marazzi", "Grande Marble Look", "Porcelánico de gran formato efecto mármol, suelo y pared", "https://www.marazzi.es/colecciones/grande-marble-look-colecciones/", "https://www.marazzi.es/app/uploads/2023/10/Grande_Marble_look_Menu.jpg"),
  marca("cosentino-dekton", "azulejos", "Cosentino", "Revestimiento Dekton", "Grandes placas sin apenas juntas para paredes y suelos", "https://www.cosentino.com/es/dekton/", "https://www.cosentino.com/es/wp-content/uploads/2024/04/Living_Room_Down_to_Earth_Renders_001-1-scaled.jpg"),
  marca("santos-cocina", "cocina", "Santos", "Cocina Santos a medida", "Muebles de cocina de gama alta; se diseñan en sus tiendas", "https://santos.es/es/cocinas/", "https://santos.es/wp-content/uploads/2025/06/cocina-gris-con-isla-vitrina-y-comedor-santos.jpg"),
  marca("porcelanosa-cocina", "cocina", "Porcelanosa", "Cocina Gamadecor", "Cocinas de gama alta de Porcelanosa", "https://www.porcelanosa.com/cocinas/", "https://www.porcelanosa.com/recursos/og_image/cocinas.jpg"),
  lm("lm-smartcontrol", "griferia", "Grohe", "Termostático Grohtherm SmartControl", "Empotrado, 2 salidas, con mandos de pulsador", "443,33 €", "grohe-grohtherm-smartcontrol-mezclador-termostatico-empotrable-2-salidas-85153697.html", MKP + "d0fc0705ddec9383987e05244ef331e5/media.jpg"),
  lm("lm-essence", "griferia", "Grohe", "Grifo de lavabo Essence caño alto", "Monomando cromo, para lavabo sobre encimera", "162,97 €", "grifo-de-lavabo-grohe-essence-monomando-cano-alto-cromo-brillo-antical-laton-80158227.html", "5327864/media.jpg"),
  marca("vb-subway", "sanitarios", "Villeroy & Boch", "Inodoro Subway 3.0 sin bordes", "Suspendido, rimless, fácil de limpiar", "https://www.villeroy-boch.es/p/subway-3.0-inodoro-de-fondo-profundo-rimless-4670T0R7/", "https://www.villeroy-boch.es/dw/image/v2/BLGB_PRD/on/demandware.static/-/Sites-master-bw/default/dw9cf75f78/images/pictureType01/pic_4670T0R7_8M42S1.png?q=60&sw=600&sh=600&sm=fit", true),
  lm("lm-duofix", "sanitarios", "Geberit", "Cisterna empotrada Duofix", "Bastidor con cisterna empotrada y pulsador Delta 01, para inodoro suspendido", "239,90 €", "geberit-pack-duofix-bastidor-con-cisterna-empotrada-y-pulsador-delta-01-blanco-brillo-111-154-11-3-84792463.html", MKP + "4c7ff2f4793426c2d71df9e8efc4e516/media.jpg"),
  lm("lm-sigma20", "sanitarios", "Geberit", "Pulsador Sigma20", "Doble pulsador, blanco mate", "86,99 €", "placa-de-accionamiento-wc-geberit-sigma20-redonda-de-doble-pulsador-blanco-mate-aro-blanco-brillante-ref-115-882-01-1-73261234.html", MKP + "abad4a391ba71c024d2c667d8c7db50c/media.jpg"),
  lm("lm-maciza", "suelos", "Tarima maciza", "Tarima maciza de roble", "Roble barnizado mate, 18 mm, lamas de 125 mm", "88,83 €/m²", "parquet-de-madera-maciza-de-roble-barnizado-mate-18x125x400-1200mm-1-8-m2-aspecto-rustico-96032470.html", MKP + "e7a2f8966bcb2d05437b42d6b4b10c47/media.jpg"),
  lm("lm-meister-ll250", "suelos", "Meister", "Laminado LL 250 de 10 mm", "Roble Dakar, más grueso y silencioso", "40,50 €/m²", "suelo-laminado-10mm-roble-dakar-efecto-madera-gris-ac4-ll-250-meister-72437302.html", MKP + "b942622791ba8672f44eca206ae7a9f4/media.jpg"),
  marca("porcelanosa-lifewood", "suelos", "Porcelanosa", "Parquet Lifewood en espiga", "Madera natural en espiga", "https://www.porcelanosa.com/pavimentos/madera-natural/", "https://www.porcelanosa.com/productfinder/resources/imgcom/thumbs/100393956.jpg"),
  otra("armario-medida", "armarios", "A medida", "Armario empotrado a medida", "Hecho por carpintero a la medida del hueco, con interiores en madera", { texto: "Unos 1.400 € de media (de 700 a 2.200 €)", fuente: "guía de precios de Habitissimo", url: "https://www.habitissimo.es/presupuestos/hacer-armario-empotrado-interior" }),
  otra("corston-grove", "electricidad", "Corston", "Enchufe Grove en bronce", "Schuko con marco redondo de bronce macizo", { texto: "44,77 €", fuente: "Corston", url: "https://www.corston.com/es-es/products/grove-modulo-redondo-schuko-marco-simple-bronce-insercion-negra-1" }, "https://www.corston.com/es-es", "https://cdn.shopify.com/s/files/1/0081/6932/4641/files/media_b8ff186b-2158-4ce5-bb05-70f183e11b26.jpg?v=1791404790", "Foto: web de Corston"),
  lm("lm-fontini", "electricidad", "Fontini", "Conmutador Garby", "Porcelana blanca con lazo de haya", "41,99 €", "conmutador-fontini-garby-blanco-y-lazo-de-haya-color-miel-10ax-250v-84496912.html", "3976173/media.jpg"),
  lm("lm-simon82-cristal", "electricidad", "Simon", "Marco Simon 82 Nature cristal", "Marco de cristal de 1 elemento", "28,69 €", "marco-simon-82-con-1-elemento-nature-cristal-azul-blanco-simon-86288885.html", MKP + "3c8ebf3c0902ea08808ee510efc8d74f/media.jpg"),
  lm("lm-simon82-metal", "electricidad", "Simon", "Enchufe Simon 82 Detail metal", "Tapa de aluminio frío", "9,31 €", "tapa-para-base-de-enchufe-schuko-aluminio-frio-simon-82-detail-82041-93-87084511.html", MKP + "9198aa2ee6f5104e122b546b8f953e59/media.jpg"),
  lm("lm-simon82", "electricidad", "Simon", "Enchufe Simon 82 con 2 USB", "Mecanismo de la serie 82", "36,99 €", "mecanismo-enchufe-schucko-2xusb-s82-75-85763496.html", "3956945/media.jpg"),
  lm("lm-warmium", "climatizacion", "Vaeron", "Aerotermia Warmium 8 kW", "Monobloc R32 para calefacción y agua caliente", "1.929 € (sin instalar)", "aerotermia-vaeron-warmium-p84-8-kw-monobloc-r32-98935770.html", "5326554/media.jpg"),
  // Bañeras exentas (selección del Excel de materiales generales)
  otra("eb-boston", "bano", "Entorno Baño", "Bañera exenta Boston", "Varias medidas, de 142 a 180 cm", { texto: "Desde 799 €", fuente: "Entorno Baño", url: "https://www.entornobano.com/products/banera-exenta-boston-142-cm-156-cm-166-cm-180-cm" }),
  banera("lm-diane", "Bañera ovalada Sanycces Diane", "Exenta, 170 x 80 cm", "929", "81929312/banera-ovalada-sanycces-diane-80x58x170-cm", "media/2385713/media.jpg"),
  banera("lm-stori", "Bañera isla Stori", "Exenta, 156 x 70 cm", "999", "19284783/banera-isla-stori-exenta-156x70-cm", "media/2037606/media.jpg"),
  banera("lm-oleron", "Bañera isla Oleron", "Exenta, 170 x 54 cm", "1.207", "83071791/banera-isla-oleron-170x54-cm", "mkp/487206e7737f9db0f6ecb38d8c9b8782/media.jpg"),
  banera("lm-carmel", "Bañera isla Carmel", "Exenta, 175 x 80 cm", "989", "81929224/banera-isla-carmel-blanco-175x80-cm"),
  // Nais, colecciones decorativas
  nais("bamboo", "Colección Bamboo", "Azulejo 5,6 x 22,4 con textura de bambú, estilo japandi", "65,87", "8579ce20e64080b70ae7b0a214544ee5f7abeaa74d08a8274a0ddef45f425b6b"),
  nais("porto", "Colección Porto", "Piezas en cruz y estrella (12 x 12 y 16,8 x 16,8) en ocho colores", "65,87", "5084f078e48734676792fbba8628ec539e05c8a857c421c24959d6423417d830"),
  nais("elda", "Colección Elda", "Piezas en cruz y estrella en cinco colores", "65,87", "cc95852709782298a0ed1734927603c5663f978186d7ad7911973173ea1d6349"),
];

/** Medio: además de la selección de gama media de la app. */
export const CATALOGO_MEDIO_EXTRA: MaterialMedia[] = [
  enc("enc-dekton-argentium", "Dekton", "Argentium", "Gris plata veteada", 234, "dekton-argentium-encimera-porcelanica-gris-plata-veteada-precio-por-metro-lineal/", "2026/04/dekton-argentum-mn.jpg"),
  enc("enc-dekton-evok", "Dekton", "Evok", "Gris cemento oscuro", 234, "dekton-evok-encimera-porcelanica-gris-cemento-oscuro-precio-por-metro-lineal/", "2026/04/dekton-evok-mn.jpg"),
  enc("enc-dekton-thala", "Dekton", "Thala", "Beige piedra natural", 234, "dekton-thala-encimera-porcelanica-beige-piedra-natural-precio-por-metro-lineal/", "2026/04/dekton-thala-mn.jpg"),
  enc("enc-dekton-nacre", "Dekton", "Nacre", "Beige cálido con textura suave", 234, "dekton-nacre-encimera-porcelanica-beige-calido-con-textura-suave-precio-por-metro-lineal/", "2025/02/dekton-nacre-muestra-2.jpg"),
  enc("enc-ascale-croma", "Ascale", "Croma White", "Blanco uniforme, acabado mate", 199, "ascale-porcelanico-croma-white-1-metro-lineal-60-de-fondo/", "2025/01/ascale-croma-white-menu.jpg"),
  enc("enc-ascale-antalya", "Ascale", "Antalya Sand", "Piedra arenisca beige", 312, "ascale-antalya-sand-superficie-tipo-piedra-arenisca-en-tonos-beige-suaves-con-acabado-mate-natural-precio-por-metro-lineal/", "2026/04/ascale-antalya-sand-m.jpg"),
  enc("enc-laminam-mijas", "Laminam", "Bianco Mijas", "Blanca cálida, acabado mate", 275, "laminam-bianco-mijas-superficie-blanca-calida-con-matices-suaves-y-acabado-mate-precio-por-metro-lineal/", "2025/02/laminam-blanco-mijas-muestra.jpg"),
  enc("enc-neolith-taj", "Neolith", "Taj Mahal", "Beige dorada efecto cuarcita", 216, "neolith-taj-mahal-superficie-beige-dorada-efecto-cuarcita-precio-por-metro-lineal-2/", "2026/04/neolith-taj-majal-m.jpg"),
  lm("lm-alexia", "griferia", "Ramon Soler", "Grifo de bañera y ducha Alexia", "Monomando con ahorro de agua", "123,05 €", "grifo-monomando-banera-ducha-alexia-c2-ref-3605s-ramon-soler-89206503.html", MKP + "4eb2acee1a70960c6a77491f1a70bbdb/media.jpeg"),
  lm("lm-study", "griferia", "Tres", "Grifo de lavabo Study", "Monomando cromado", "151,75 €", "tres-26290301-study-grifo-monomando-lavabo-87094461.html", MKP + "84994155c7f05efeb16cf1976247a914/media.jpg"),
  lm("lm-valaz-segura", "griferia", "Valaz", "Grifo de lavabo alto Segura", "Para lavabo sobre encimera, dorado cepillado", "63,16 €", "valaz-grifo-lavabo-alto-para-pica-monomando-cuadrado-dorado-cepillado-serie-segura-89828315.html", MKP + "3ccbf38e022b21440a5d5fe7a0f0e34b/media.jpg"),
  lm("lm-finfloor-original", "suelos", "Finfloor", "Laminado Original V4 AC5", "Roble Sonata, alta resistencia, con bisel en 4 lados", "31,93 €/m²", "tarimas-diamond-suelo-laminado-ac5-finfloor-original-v4-roble-sonata-353b-95862464.html", MKP + "cc30de01368f0b405399d5e110a63c94/media.jpg"),
  faus("faus-harmony", "Laminado Harmony", "Colección de madera natural para toda la vivienda", "Portada-SL-Harmony-380x380.jpg", OUTLET_FAUS),
  faus("faus-cosmo", "Laminado Cosmo 4V", "Lamas con bisel en 4 lados", "Portada-SL-Cosmo-4V-380x380.jpg"),
  vives("vives-surf", "Revestimiento Surf", "Pasta blanca en colores lisos y mosaicos, para baño y cocina", "productos/colecciones/surf/", "A1140_Poipu_Blanco_Mosaico_Kaimu_Celeste_Amalfi_Azul.jpg"),
  vives("vives-zepto", "Revestimiento Zepto", "Pequeño formato en colores lisos", "productos/pequeno-formato-ceramico/", "A1001_Micra_grafito_Deca_grafito_Pizca_Cuark_blanco.jpg"),
  lm("lm-imex-line", "griferia", "Imex", "Columna de ducha termostática Line", "Rociador redondo de lluvia, teleducha y antical", "249,98 €", "imex-columna-de-ducha-line-termostatico-rociador-redondo-antical-ducha-de-lluvia-teleducha-y-flexo-serie-line-color-cromado-74203065.html", MKP + "6bf11689be0cf9274b9b7aa00d782e9c/media.jpg"),
  lm("lm-simon270", "electricidad", "Simon", "Enchufe Simon 270", "Negro mate", "6,99 €", "enchufe-con-toma-de-tierra-simon-270-negro-mate-85164195.html", "1874159/media.jpg"),
  lm("lm-valena", "electricidad", "Legrand", "Enchufe Valena Next", "Blanco", "6,79 €", "enchufe-legrand-valena-next-blanco-82117933.html", "1873616/media.png"),
  lm("lm-sky", "electricidad", "Niessen", "Enchufe Sky plano", "9 mm, blanco", "5,99 €", "enchufe-plano-9mm-sky-82834277.html", "1881485/media.jpg"),
  // Marcas que más usamos en obra (catálogos oficiales, sin tarifas)
  marca("alvic-frentes", "cocina", "Alvic", "Frentes de cocina Luxe, Zenit y Syncron", "Frentes en alto brillo, mate antihuellas y texturas madera", "https://alvic.com/es/descargas/"),
  marca("teka-placas", "cocina", "Teka", "Placas, campanas y fregaderos", "Catálogo Teka de electrodomésticos de cocina", "https://www.teka.com/es-es/"),
  marca("balay-electro", "cocina", "Balay", "Electrodomésticos de cocina", "Hornos, placas, lavavajillas y frigoríficos integrables", "https://www.balay.es/"),
  marca("imex-catalogos", "griferia", "Imex", "Grifería de baño y cocina", "Novedades 2026 en grifería, mamparas y accesorios", "https://imexproducts.es/descarga-catalogos/"),
  marca("salgar-muebles", "bano", "Salgar", "Muebles de baño", "Muebles suspendidos y de suelo con lavabo integrado", "https://www.salgar.net/"),
  marca("roca-sanitarios", "sanitarios", "Roca", "Inodoros, lavabos y platos de ducha", "Gama completa de sanitarios Roca", "https://www.roca.es/"),
  marca("parador-laminado", "suelos", "Parador", "Suelo laminado Parador", "Laminado alemán con clic, efecto madera", "https://parador.de/es/servicios/descargas/laminado"),
  marca("legrand-mecanismos", "electricidad", "Legrand", "Mecanismos Legrand", "Interruptores y enchufes en varios acabados", "https://www.legrand.es/"),
  marca("daikin-split", "climatizacion", "Daikin", "Aire acondicionado y aerotermia", "Splits con bomba de calor y aerotermia Altherma", "https://www.daikin.es/"),
  marca("panasonic-aquarea", "climatizacion", "Panasonic", "Aquarea y splits", "Aerotermia Aquarea y aire acondicionado", "https://www.aircon.panasonic.eu/ES_es/downloads/catalogues-and-leaflets/"),
  marca("saunier-calderas", "climatizacion", "Saunier Duval", "Calderas y aerotermia", "Calderas de condensación, aerotermia y agua caliente", "https://www.saunierduval.es/"),
  marca("ferroli-calderas", "climatizacion", "Ferroli", "Calderas y splits", "Calderas de condensación y aire acondicionado", "https://www.ferroli.com/es"),
  marca("ariston-termos", "climatizacion", "Ariston", "Termos eléctricos", "Termos Velis, Lydos y Andris", "https://www.ariston.com/es-es/"),
  // Roca Cerámica, colección Terre (selección del Excel de materiales generales)
  rocaT("roca-terre-blanco-3090", "Terre Blanco 30 x 90", "Revestimiento mate efecto piedra para baño y cocina", "28,92", "FDDA0AW011"),
  rocaT("roca-terre-beige-3090", "Terre Beige 30 x 90", "Revestimiento mate efecto piedra", "28,92", "FDDA0AW041"),
  rocaT("roca-terre-gris-3090", "Terre Gris 30 x 90", "Revestimiento mate efecto piedra", "28,92", "FDDA0AW021"),
  rocaT("roca-deko-terre-beige", "Deko Terre Beige 30 x 90", "Revestimiento decorado en relieve", "37,44", "FDDA2AW041"),
  rocaT("roca-deko-terre-gris", "Deko Terre Gris 30 x 90", "Revestimiento decorado en relieve", "37,44", "FDDA2AW021"),
  rocaT("roca-terre-beige-6060", "Terre Beige 60 x 60", "Suelo porcelánico efecto piedra", "33,88", "FDD0A60041"),
  rocaT("roca-terre-gris-6060", "Terre Gris 60 x 60", "Suelo porcelánico efecto piedra", "33,88", "FDD0A60021"),
  rocaT("roca-terre-grafito-6060", "Terre Grafito 60 x 60", "Suelo porcelánico efecto piedra", "33,88", "FDD7B60101"),
  otra("kave-kuveni", "bano", "Kave Home", "Mueble de baño Kuveni", "Madera maciza de teca, 70 x 80 cm", { texto: "499 €", fuente: "Kave Home", url: "https://kavehome.com/es/es/p/mueble-de-bano-rectangular-kuveni-de-madera-maciza-de-teca-70-x-80-cm" }),
  banera("lm-batz", "Bañera exenta Batz", "Isla de 170 x 56 cm", "905", "83730930/banera-isla-batz-170x56-cm", "mkp/3bda31a1c3619ce712c1b84a3b9cc2f1/media.jpg"),
  amazon("amz-tommy", "Colgante Reality Tommy LED 28 W", "Negro mate", "55,89", "B07FNWQV2N"),
  amazon("amz-comely", "Lámpara de techo de 3 luces", "Comely, colgante", "45,88", "B096MHCBY5"),
  amazon("amz-lywins", "Colgante moderno negro y oro", "Lywins, E27", "35,22", "B08CJ2XLLS"),
  amazon("amz-lightess", "Colgante vintage negro y oro 40 W", "Lightess", "34,99", "B07518TNQW"),
  // Nais (tienda de azulejos de Castellón), colecciones de Equipe
  nais("earth", "Colección Earth", "Revestimiento 7,5 x 60 en tonos tierra, ideal para cocinas y baños", "42,35", "63dda364ed15623144f50610b18692890fc8a94437156d097251196f74e4edce"),
  nais("stonella", "Colección Stonella", "Revestimiento 7,5 x 60 en seis colores", "42,35", "0f462990aad98bbbf7e560151888483f4b8ea78cbdaae41406a1f581ff13fa18"),
  nais("bohemian", "Colección Bohemian", "Azulejo decorativo 10 x 10 y 6 x 18,6 de inspiración mediterránea", "39,52", "50231c4a411eb1bb615e57e8891a702e50247cc740ec34b423e52ccf7f825e8a"),
  nais("hikari", "Colección Hikari", "Azulejo 10 x 10 y 6 x 18,6, con piezas decoradas", "39,52", "34b94d9dfee800b707a124d73941f6b300e224cd9f02eed100e09e7f0215b8ef"),
  nais("isola", "Colección Isola", "Azulejo alargado 5 x 30 en ocho colores", "42,35", "07e5a5e7b2868eb209ad891db118255eb8f1debc67df8c44060ac76c044c224a"),
  nais("lumina", "Colección Lumina", "Azulejo brillo 6 x 24,6 que refleja la luz, para baños y cocinas", "36,72", "c6564409d3d1bc1f032e5b67de7472b972a8bc2ac7a27d316d349e0227022e54"),
  nais("miyako", "Colección Miyako", "Azulejo 10 x 15 de inspiración japonesa y textura artesanal", "42,35", "070119dfcc406e7d745eedce5b9d1c5001c2b613e522c2ac9d91d9930f34c0c0"),
];

/** Medio: la selección de gama media de la app (con sus PVP públicos donde los hay) y lo añadido aquí. */
export const catalogoDe = (nivel: NivelCatalogo): MaterialMedia[] =>
  nivel === "basico" ? CATALOGO_BASICO : nivel === "premium" ? CATALOGO_PREMIUM : [...MATERIALES_MEDIA_INICIALES, ...CATALOGO_MEDIO_EXTRA];
