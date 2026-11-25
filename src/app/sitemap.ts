import type { MetadataRoute } from "next";
import { DISTRITOS_MADRID, DOMINIO, SERVICIOS_SEO } from "@/lib/seo";

export const dynamic = "force-static";

/** Mapa del sitio para el dominio de lanzamiento (la demo sigue con noindex). */
export default function sitemap(): MetadataRoute.Sitemap {
  const fijas = ["", "/precios", "/red", "/reformistas", "/arquitectos", "/materiales", "/comunidad", "/tramites", "/subvenciones", "/hipoteca", "/suscripcion", "/comunidades"];
  return [
    ...fijas.map((p) => ({ url: `${DOMINIO}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...SERVICIOS_SEO.map((s) => ({ url: `${DOMINIO}/precios/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...DISTRITOS_MADRID.map((d) => ({ url: `${DOMINIO}/reformas-madrid/${d.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
