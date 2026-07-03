import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Archivo, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "BRUMA · Accesos",
  description: "Control de accesos — BRUMA",
};

// Locks brightness low and prevents zoom jitter during fast door taps.
export const viewport: Viewport = {
  themeColor: "#0A0C0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bebas.variable} ${archivo.variable} ${mono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
