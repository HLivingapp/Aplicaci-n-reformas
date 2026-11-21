import type { Metadata, Viewport } from "next";
import { publico } from "@/lib/base";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: "Human Living Reformas · Tu reforma con precio claro",
  description: "Únete gratis con tu email y ve al momento, en la app, el presupuesto de tu reforma partida a partida. Después pide presupuesto a reformistas homologados de tu zona.",
  appleWebApp: { capable: true, title: "Reformas", statusBarStyle: "default" },
  icons: { icon: publico("/icon.svg"), apple: publico("/icon-192.png") },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
