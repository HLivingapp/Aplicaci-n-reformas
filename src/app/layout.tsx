import type { Metadata, Viewport } from "next";
import { publico } from "@/lib/base";
import { APP } from "@/lib/marca";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { DEMO_PRIVADA, PuertaClave, SCRIPT_PUERTA } from "@/components/PuertaClave";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: `${APP.nombre} · ${APP.lema}`,
  description: "Únete gratis con tu email y ve al momento, en la app, el presupuesto de tu reforma partida a partida. Después compara el precio de cada reformista homologado de tu zona.",
  appleWebApp: { capable: true, title: APP.nombre, statusBarStyle: "default" },
  // Privada hasta el lanzamiento: que los buscadores no la indexen
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  icons: { icon: [{ url: publico("/icon.svg"), type: "image/svg+xml" }, { url: publico("/favicon.ico"), sizes: "48x48" }], apple: publico("/apple-icon.png") },
};

export const viewport: Viewport = {
  themeColor: "#0E5A52",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      {DEMO_PRIVADA && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: SCRIPT_PUERTA }} />
        </head>
      )}
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}>
        {children}
        {DEMO_PRIVADA && <PuertaClave />}
      </body>
    </html>
  );
}
