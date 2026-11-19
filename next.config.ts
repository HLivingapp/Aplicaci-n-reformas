import type { NextConfig } from "next";

/**
 * EXPORTAR=1 genera una versión estática de demostración (sin servidor ni base de datos)
 * para publicarla en GitHub Pages. Ver scripts/exportar-demo.sh.
 */
const exportar = process.env.EXPORTAR === "1";

const nextConfig: NextConfig = exportar
  ? {
      output: "export",
      basePath: process.env.NEXT_PUBLIC_BASE_PATH,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {
      async headers() {
        return [
          {
            source: "/:path*",
            headers: [
              // Los enlaces privados de los clientes no se envían a otras webs
              { key: "Referrer-Policy", value: "same-origin" },
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "X-Frame-Options", value: "DENY" },
              { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
            ],
          },
          {
            // Ni los portales de cliente ni la zona de empresa deben aparecer en buscadores
            source: "/(p|empresa|entrar)/:path*",
            headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
          },
        ];
      },
    };

export default nextConfig;
