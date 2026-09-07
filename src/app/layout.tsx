import type { Metadata, Viewport } from "next";
import { Syne, Manrope } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = "https://dresde.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dresde — Peluquería & Barbería",
    template: "%s — Dresde",
  },
  description:
    "Dresde. Más que un corte, una experiencia. Peluquería y barbería en Bahía Blanca — elegí tu local y reservá por WhatsApp.",
  openGraph: {
    title: "Dresde — Peluquería & Barbería",
    description: "Más que un corte, una experiencia.",
    url: siteUrl,
    siteName: "Dresde",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dresde — Peluquería & Barbería",
    description: "Más que un corte, una experiencia.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${syne.variable} ${manrope.variable} overflow-x-hidden`}
    >
      <body className="bg-dresde-black text-dresde-paper antialiased overflow-x-hidden">
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
