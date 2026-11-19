import Vista from "./Vista";

/** En la versión estática se genera una sola página con «_»; el valor real se lee en el navegador. */
export function generateStaticParams() {
  return [{ token: "_", id: "_" }];
}

export default function Pagina() {
  return <Vista />;
}
