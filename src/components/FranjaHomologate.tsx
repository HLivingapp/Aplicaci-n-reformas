import Link from "next/link";

/** Acceso directo, fuera del menú, para que proveedores y arquitectos se homologuen. */
export function FranjaHomologate({ oscura = false }: { oscura?: boolean }) {
  return (
    <div className={`text-sm ${oscura ? "bg-teal-800 text-white" : "bg-teal-700 text-white"}`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-1.5 text-center">
        <span className="font-medium">¿Eres profesional? Homológate gratis:</span>
        <span className="flex gap-2">
          <Link href="/reformistas" className="rounded-full bg-white px-3 py-0.5 font-semibold text-teal-800 hover:bg-teal-50">Como proveedor</Link>
          <Link href="/arquitectos" className="rounded-full bg-white px-3 py-0.5 font-semibold text-teal-800 hover:bg-teal-50">Como arquitecto</Link>
        </span>
      </div>
    </div>
  );
}
