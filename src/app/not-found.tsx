import Link from "next/link";

/**
 * En la versión estática (GitHub Pages) las páginas con parámetros solo existen con «_».
 * Este script lleva /p/<token> a /p/_/#/p/<token> antes de que cargue la app.
 */
const PLANTILLAS = ["p/_", "p/_/presupuesto/_", "reformista/_", "empresa/obras/_", "empresa/presupuestos/_", "empresa/proveedores/_", "empresa/solicitudes/_"];
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const script = `(function(){var b=${JSON.stringify(base)};var P=${JSON.stringify(PLANTILLAS)};
var r=location.pathname.slice(b.length).split("/").filter(Boolean);
for(var i=0;i<P.length;i++){var t=P[i].split("/");if(t.length!==r.length)continue;var ok=true;
for(var j=0;j<t.length;j++){if(t[j]!=="_"&&t[j]!==r[j]){ok=false;break;}}
if(ok){location.replace(b+"/"+P[i]+"/"+location.search+"#/"+r.join("/"));return;}}})();`;

export default function NoEncontrado() {
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      {base && <script dangerouslySetInnerHTML={{ __html: script }} />}
      <h1 className="mb-2 text-xl font-semibold">Esta página no existe</h1>
      <Link href="/" className="text-teal-700 underline">Volver al inicio</Link>
    </main>
  );
}
