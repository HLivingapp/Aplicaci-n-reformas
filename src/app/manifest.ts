import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reformas · Gestión de obras",
    short_name: "Reformas",
    description: "Presupuestos, planificación de obra y portal del cliente.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#0f766e",
    lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
