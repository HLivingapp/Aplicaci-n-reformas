import type { MetadataRoute } from "next";
import { publico } from "@/lib/base";
import { APP } from "@/lib/marca";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP.nombre,
    short_name: APP.nombre,
    description: "Presupuestos, planificación de obra y portal del cliente.",
    start_url: publico("/"),
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#0f766e",
    lang: "es",
    icons: [
      { src: publico("/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: publico("/icon-512.png"), sizes: "512x512", type: "image/png" },
      { src: publico("/icon.svg"), sizes: "any", type: "image/svg+xml" },
    ],
  };
}
