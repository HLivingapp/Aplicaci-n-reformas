import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { DatosProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reformas · Gestión de obras",
  description: "Presupuestos, planificación de obra y portal del cliente.",
  appleWebApp: { capable: true, title: "Reformas", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <DatosProvider>{children}</DatosProvider>
      </body>
    </html>
  );
}
