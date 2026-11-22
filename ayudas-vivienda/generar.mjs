// Genera la web estática AyudasParaVivienda: portada con las ayudas de vivienda más relevantes de España
// y una ficha por ayuda (en qué consiste, requisitos, bancos, checklist de documentación, enlaces y vídeo).
// Uso: node ayudas-vivienda/generar.mjs [carpeta-salida]
// Variables opcionales:
//   SITE_URL         URL pública final (canonical, sitemap). Sin barra final.
//   REFORMAMEJOR_URL Portada de ReformaMejor (presupuesto de la reforma).
//   NOMBRE_WEB       Nombre de la web.
//   INDEXAR=1        Solo en el dominio definitivo; la vista previa lleva noindex.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FECHA, AYUDAS, CATEGORIAS, ESTADOS } from "./datos/ayudas.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const salida = process.argv[2] || join(aqui, "dist");
const SITE = (process.env.SITE_URL || "https://ayudasparavivienda.com").replace(/\/$/, "");
const RM = (process.env.REFORMAMEJOR_URL || "https://hlivingapp.github.io/Aplicaci-n-reformas/").replace(/\/?$/, "/");
const NOMBRE = process.env.NOMBRE_WEB || "AyudasParaVivienda";
const INDEXAR = process.env.INDEXAR === "1";
const css = readFileSync(join(aqui, "estilos.css"), "utf8");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fechaTxt = (f) => { const [a, m, d] = f.split("-").map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };
const mesTxt = (() => { const [a, m] = FECHA.split("-").map(Number); return `${MESES[m - 1]} ${a}`; })();
const marca = () => (/^Ayudas/.test(NOMBRE) ? esc(NOMBRE).replace(/^(Ayudas)/, "$1<span>") + "</span>" : esc(NOMBRE));
const estadoHtml = (e) => `<span class="estado ${esc(e)}">${esc(ESTADOS[e])}</span>`;

function pagina({ titulo, descripcion, ruta, cuerpo, jsonld, raiz, script = "" }) {
  const canonical = SITE + "/" + ruta;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
${INDEXAR ? "" : '<meta name="robots" content="noindex, follow">\n'}<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="es_ES">
<meta name="theme-color" content="#1d4f91">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M4 15 16 5l12 10v12H4z' fill='%231d4f91'/%3E%3Cpath d='M11 18l4 4 7-8' stroke='%23e8772e' stroke-width='3' fill='none'/%3E%3C/svg%3E">
<style>${css}</style>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>
<body>
<header class="barra"><div class="ancho">
  <a class="marca" href="${raiz}">${marca()}</a>
  <span class="lema">Ayudas, subvenciones e hipotecas para comprar o reformar tu casa</span>
</div></header>
<main class="ancho">
${cuerpo}
</main>
<footer class="pie"><div class="ancho">
  <p>Información pública de fuentes oficiales (BOE, ICO, Ministerio de Vivienda, Agencia Tributaria, MITECO y Comunidad de Madrid), revisada el ${fechaTxt(FECHA)} y redactada con nuestras palabras. No es asesoramiento financiero ni fiscal: los requisitos y la concesión los deciden la Administración y cada banco. Comprueba siempre la fuente oficial antes de firmar.</p>
  <p>${esc(NOMBRE)} no es un banco ni cobra a las entidades citadas. Las marcas pertenecen a sus dueños. Web de VIVIENDA HL CENTRO S.L., CIF B72840291, Calle Arrieta 5, 1.º dcha., 28013 Madrid.</p>
</div></footer>
${script}
</body>
</html>
`;
}

function ctaReforma(texto) {
  return `<aside class="cta">
  <div>
    <h2>¿Compras para reformar o vas a reformar?</h2>
    <p>${esc(texto || "Muchas ayudas y préstamos te piden el presupuesto de la obra. En ReformaMejor lo ves al momento, partida a partida, con los precios de reformistas homologados.")}</p>
  </div>
  <a class="boton" href="${esc(RM)}nuevo/" rel="noopener">Calcular mi reforma gratis</a>
</aside>`;
}

function tarjeta(a, raiz) {
  return `<li class="tarjeta" data-cat="${esc(a.categorias.join(" "))}">
  <div class="fila">${estadoHtml(a.estado)}<span class="tag">${esc(a.ambito)}</span></div>
  <h3><a href="${raiz}${a.slug}/">${esc(a.nombre)}</a></h3>
  <div class="cifra">${esc(a.cifra)}<small>${esc(a.cifraNota)}</small></div>
  <p>${esc(a.resumen)}</p>
</li>`;
}

function portada() {
  const titulo = `Ayudas para comprar o reformar vivienda en España (${mesTxt}): aval ICO, hipoteca 100 %, ventanas y más`;
  const descripcion = `Las ayudas de vivienda más útiles de España explicadas fácil: aval ICO para la hipoteca joven, Mi Primera Vivienda de Madrid, préstamo TU CASA, reforma en tu hipoteca, cambio de ventanas, deducciones por eficiencia energética y bono alquiler joven. Con checklist de documentación para tu banco.`;
  const destacadas = AYUDAS.filter((a) => a.destacada);
  const resto = AYUDAS.filter((a) => !a.destacada);
  const lista = {
    "@context": "https://schema.org", "@type": "ItemList", name: titulo,
    itemListElement: AYUDAS.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/${a.slug}/`, name: a.nombre })),
  };
  const web = { "@context": "https://schema.org", "@type": "WebSite", name: NOMBRE, url: SITE + "/", inLanguage: "es-ES" };
  const cuerpo = `
<section class="hero">
  <h1>Las ayudas para comprar o reformar tu casa, claras y listas para pedir</h1>
  <p class="sub">Qué ayuda te encaja, qué requisitos piden, qué bancos la tramitan y qué papeles llevar. Con un checklist que puedes marcar e imprimir para presentarlo en el banco que elijas.</p>
  <ol class="pasos">
    <li><b>Elige la ayuda</b><span>Mira las más importantes de España y su estado hoy.</span></li>
    <li><b>Comprueba si cumples</b><span>Edad, ingresos, precio de la vivienda: los requisitos, sin letra pequeña.</span></li>
    <li><b>Prepara los papeles</b><span>Marca el checklist y llévalo impreso o en el móvil.</span></li>
    <li><b>Pídela en tu banco</b><span>O en Hacienda o la Comunidad, según la ayuda. Te dejamos los enlaces oficiales.</span></li>
  </ol>
</section>
<section class="bloque" aria-labelledby="t-dest">
  <h2 id="t-dest">Las más relevantes ahora</h2>
  <div class="filtros no-imprimir" role="group" aria-label="Filtrar ayudas">
    <button type="button" aria-pressed="true" data-f="todas">Todas</button>
    ${CATEGORIAS.map((c) => `<button type="button" aria-pressed="false" data-f="${c.id}">${esc(c.texto)}</button>`).join("\n    ")}
  </div>
  <ul class="tarjetas" id="lista">
    ${destacadas.map((a) => tarjeta(a, "")).join("\n")}
    ${resto.map((a) => tarjeta(a, "")).join("\n")}
  </ul>
  <p class="nota">Estado revisado el ${fechaTxt(FECHA)}. «Pendiente» significa aprobada pero aún no se puede pedir; «Agotada» o «Cerrada», que ahora no admite solicitudes y conviene vigilar la próxima convocatoria.</p>
</section>
${ctaReforma()}
<section class="bloque">
  <h2>Antes de ir al banco</h2>
  <ul>
    <li>Las ayudas de compra (aval ICO, Mi Primera Vivienda) se piden <b>en el banco, a la vez que la hipoteca</b>. El banco decide si te concede la hipoteca; la ayuda no obliga a dártela.</li>
    <li>Pide oferta en <b>al menos dos o tres bancos adheridos</b>: el aval es el mismo, pero el tipo de interés y las vinculaciones cambian mucho.</li>
    <li>Las ayudas de reforma suelen exigir <b>el presupuesto antes de empezar</b> y, en eficiencia energética, el <b>certificado energético antes y después</b>. No empieces la obra sin comprobarlo.</li>
    <li>Paga siempre <b>por transferencia o tarjeta</b> y guarda facturas: en efectivo se pierden las deducciones.</li>
  </ul>
</section>
`;
  const script = `<script>
(function(){var b=document.querySelectorAll('.filtros button'),l=document.querySelectorAll('#lista .tarjeta');
b.forEach(function(x){x.addEventListener('click',function(){var f=x.dataset.f;b.forEach(function(y){y.setAttribute('aria-pressed',y===x?'true':'false')});
l.forEach(function(t){t.hidden=!(f==='todas'||t.dataset.cat.split(' ').indexOf(f)>=0)})})})})();
</script>`;
  return pagina({ titulo, descripcion, ruta: "", cuerpo, jsonld: [web, lista], raiz: "./", script });
}

function bloqueBancos(a) {
  const b = a.bancos;
  if (!b) return "";
  const lista = b.lista?.length
    ? `${b.lista.length > 15 ? `<input class="buscar no-imprimir" type="search" placeholder="Busca tu banco (${b.lista.length} entidades)" aria-label="Buscar entidad" data-buscar="bancos-${a.slug}">` : ""}
  <ul class="bancos" id="bancos-${a.slug}">${b.lista.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`
    : "";
  return `<section class="bloque" id="bancos">
  <h2>${esc(b.titulo || "Bancos adheridos")}</h2>
  ${b.texto ? `<p>${esc(b.texto)}</p>` : ""}
  ${lista}
  ${b.anunciadas?.length ? `<p class="nota">Anunciadas, aún sin confirmar: ${b.anunciadas.map(esc).join(", ")}.</p>` : ""}
  ${b.fuente ? `<p class="nota">Lista oficial: <a href="${esc(b.fuente.url)}" rel="noopener" target="_blank">${esc(b.fuente.texto)}</a> (consultada el ${fechaTxt(b.fuente.fecha || FECHA)}).</p>` : ""}
</section>`;
}

function bloqueChecklist(a) {
  const c = a.checklist;
  if (!c) return "";
  const opciones = a.bancos?.lista?.length ? a.bancos.lista : c.destinos || [];
  let n = 0;
  return `<section class="bloque" id="checklist">
  <h2>Checklist de documentación</h2>
  <p>${esc(c.intro || "Marca lo que ya tienes. Se guarda en este dispositivo y puedes imprimirlo para llevarlo.")}</p>
  <div class="check" data-clave="av-${a.slug}">
    <div class="controles no-imprimir">
      ${opciones.length ? `<label for="dest-${a.slug}" style="padding:0">${esc(c.destinoTexto || "Lo presento en")}</label>
      <select id="dest-${a.slug}" data-destino><option value="">Elige ${esc(c.destinoNombre || "tu banco")}</option>${opciones.map((o) => `<option>${esc(o)}</option>`).join("")}</select>` : ""}
      <button type="button" class="boton sec" data-imprimir>Imprimir o guardar en PDF</button>
      <button type="button" class="boton sec" data-limpiar>Desmarcar todo</button>
    </div>
    <p class="solo-impresion"><b>${esc(a.nombre)}</b> · Para presentar en: <span data-destino-txt>________________</span> · ${esc(NOMBRE)}, ${fechaTxt(FECHA)}</p>
    <div class="progreso no-imprimir" aria-hidden="true"><i></i></div>
    <p class="nota no-imprimir" data-cuenta></p>
    ${c.grupos.map((g) => `<fieldset><legend>${esc(g.titulo)}</legend>
      ${g.items.map((it) => { const id = `${a.slug}-${n++}`; const [t, nota] = Array.isArray(it) ? it : [it]; return `<label><input type="checkbox" data-id="${id}"><span>${esc(t)}${nota ? `<small>${esc(nota)}</small>` : ""}</span></label>`; }).join("\n      ")}
    </fieldset>`).join("\n    ")}
  </div>
  ${c.nota ? `<p class="nota">${esc(c.nota)}</p>` : ""}
</section>`;
}

function bloqueVideo(a, raiz) {
  const v = a.video || {};
  const fichero = `videos/${a.slug}.mp4`;
  const hay = existsSync(join(aqui, "public", fichero));
  return `<section class="bloque" id="video">
  <h2>Vídeo explicativo</h2>
  <div class="video">${hay
    ? `<video controls preload="metadata" playsinline ${existsSync(join(aqui, "public", `videos/${a.slug}.jpg`)) ? `poster="${raiz}videos/${a.slug}.jpg"` : ""} src="${raiz}${fichero}"></video>`
    : `<div><b>${esc(v.titulo || "Próximamente: " + a.nombre + " en 90 segundos")}</b>Estamos preparando un vídeo corto que lo explica con ejemplos.</div>`}</div>
  ${hay ? `<p class="nota">Vídeo generado con IA. Orientativo: manda la fuente oficial.</p>` : ""}
</section>`;
}

function paginaAyuda(a) {
  const ruta = `${a.slug}/`;
  const raiz = "../";
  const titulo = `${a.tituloSeo || a.nombre} (${mesTxt}): requisitos, ${a.bancos?.lista?.length ? "bancos y " : ""}documentación`;
  const descripcion = a.descripcionSeo || a.resumen;
  const otras = AYUDAS.filter((x) => x.slug !== a.slug && x.categorias.some((c) => a.categorias.includes(c))).slice(0, 6);
  const faq = a.faq?.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: a.faq.map(([q, r]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: r } })),
  } : null;
  const migas = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ayudas de vivienda", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: a.nombre, item: SITE + "/" + ruta },
    ],
  };
  const secciones = [
    ["consiste", "En qué consiste"], ["video", "Vídeo"], ["requisitos", "Requisitos"], a.bancos && ["bancos", a.bancos.titulo || "Bancos adheridos"],
    a.checklist && ["checklist", "Checklist de documentación"], ["pasos", "Cómo se pide"], ["enlaces", "Enlaces útiles"],
  ].filter(Boolean);

  const cuerpo = `
<nav class="migas"><a href="${raiz}">Ayudas de vivienda</a> › ${esc(CATEGORIAS.find((c) => c.id === a.categorias[0])?.texto || "")}</nav>
<section class="cabeza">
  <div class="fila">${estadoHtml(a.estado)}<span class="tag">${esc(a.ambito)}</span><span class="tag">Revisado el ${fechaTxt(a.comprobado || FECHA)}</span></div>
  <h1>${esc(a.nombre)}</h1>
  <p class="sub">${esc(a.resumen)}</p>
  ${a.cifras?.length ? `<div class="cifras">${a.cifras.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>` : ""}
  ${a.aviso ? `<p class="aviso">${esc(a.aviso)}</p>` : ""}
</section>
<div class="dos">
  <div class="col">
    <section class="bloque" id="consiste">
      <h2>En qué consiste</h2>
      ${a.consiste.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
      ${a.ejemplo ? `<p class="aviso" style="background:var(--pend);color:var(--pendTx)"><b>Ejemplo:</b> ${esc(a.ejemplo)}</p>` : ""}
    </section>
    ${bloqueVideo(a, raiz)}
    <section class="bloque" id="requisitos">
      <h2>Requisitos</h2>
      <ul>${a.requisitos.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
    </section>
    ${bloqueBancos(a)}
    ${bloqueChecklist(a)}
    <section class="bloque" id="pasos">
      <h2>Cómo se pide, paso a paso</h2>
      <ol>${a.pasos.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
    </section>
    ${a.faq?.length ? `<section class="bloque"><h2>Preguntas frecuentes</h2>${a.faq.map(([q, r]) => `<h3>${esc(q)}</h3><p>${esc(r)}</p>`).join("")}</section>` : ""}
    <section class="bloque" id="enlaces">
      <h2>Enlaces útiles oficiales</h2>
      <ul class="enlaces">${a.enlaces.map((e) => `<li><a href="${esc(e.url)}" rel="noopener" target="_blank">${esc(e.texto)}</a><span>${esc(e.nota || "")}</span></li>`).join("")}</ul>
    </section>
    ${ctaReforma(a.cta)}
    <section class="bloque">
      <h2>Fuentes</h2>
      <ul class="fuentes">${a.fuentes.map((f) => `<li>${esc(f.texto)}: <a href="${esc(f.url)}" rel="noopener" target="_blank">${esc(f.url)}</a> (consultada el ${fechaTxt(f.fecha || a.comprobado || FECHA)})</li>`).join("")}</ul>
    </section>
  </div>
  <aside class="indice no-imprimir" aria-label="En esta página">
    <b>En esta página</b>
    ${secciones.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join("\n    ")}
  </aside>
</div>
${otras.length ? `<section class="bloque no-imprimir"><h2>Otras ayudas que te pueden servir</h2><ul class="otras">${otras.map((x) => `<li><a href="../${x.slug}/">${esc(x.nombre)}</a><span>${esc(x.cifra)} · ${esc(ESTADOS[x.estado])}</span></li>`).join("")}</ul></section>` : ""}
`;
  const script = `<script>
(function(){
var c=document.querySelector('.check');
if(c){var k=c.dataset.clave,s={};try{s=JSON.parse(localStorage.getItem(k)||'{}')}catch(e){}
var cb=c.querySelectorAll('input[type=checkbox]'),bar=c.querySelector('.progreso i'),cu=c.querySelector('[data-cuenta]'),sel=c.querySelector('[data-destino]'),dt=c.querySelector('[data-destino-txt]');
function guarda(){try{localStorage.setItem(k,JSON.stringify(s))}catch(e){}}
function pinta(){var h=0;cb.forEach(function(x){if(x.checked)h++});bar.style.width=(cb.length?h*100/cb.length:0)+'%';cu.textContent=h+' de '+cb.length+' documentos listos'+(s.destino?' para '+s.destino:'');if(dt)dt.textContent=s.destino||'________________'}
cb.forEach(function(x){x.checked=!!s[x.dataset.id];x.addEventListener('change',function(){s[x.dataset.id]=x.checked;guarda();pinta()})});
if(sel){sel.value=s.destino||'';sel.addEventListener('change',function(){s.destino=sel.value;guarda();pinta()})}
c.querySelector('[data-imprimir]').addEventListener('click',function(){window.print()});
c.querySelector('[data-limpiar]').addEventListener('click',function(){cb.forEach(function(x){x.checked=false;s[x.dataset.id]=false});guarda();pinta()});
pinta()}
document.querySelectorAll('[data-buscar]').forEach(function(i){var l=document.getElementById(i.dataset.buscar).children;
var n=function(t){return t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')};
i.addEventListener('input',function(){var q=n(i.value);for(var j=0;j<l.length;j++)l[j].hidden=q&&n(l[j].textContent).indexOf(q)<0})});
})();
</script>`;
  return { ruta, html: pagina({ titulo, descripcion, ruta, cuerpo, jsonld: [migas, ...(faq ? [faq] : [])], raiz, script }) };
}

rmSync(salida, { recursive: true, force: true });
mkdirSync(salida, { recursive: true });
writeFileSync(join(salida, "index.html"), portada());
if (existsSync(join(aqui, "public"))) cpSync(join(aqui, "public"), salida, { recursive: true });
const rutas = [""];
for (const a of AYUDAS) {
  const { ruta, html } = paginaAyuda(a);
  mkdirSync(join(salida, ruta), { recursive: true });
  writeFileSync(join(salida, ruta, "index.html"), html);
  rutas.push(ruta);
}
writeFileSync(join(salida, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas.map((r) => `  <url><loc>${SITE}/${r}</loc><lastmod>${FECHA}</lastmod></url>`).join("\n")}
</urlset>
`);
// Dominio propio en GitHub Pages
if (INDEXAR) writeFileSync(join(salida, "CNAME"), new URL(SITE).hostname + "\n");
writeFileSync(join(salida, "robots.txt"), INDEXAR ? `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n` : `User-agent: *\nDisallow: /\n`);
console.log(`Generadas ${rutas.length} páginas en ${salida}`);
