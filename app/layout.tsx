import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./candidates.css";
import "./filters.css";
import "./national.css";
import "./map.css";
import "./selection-highlight.css";
import "./continuous-pdf.css";
import "./official-images.css";
import "./participation.css";
import "./phase-one.css";
import "./candidate-state-tooltip.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monitor Electoral Territorial ERM 2026",
  description: "Plataforma de monitoreo político-electoral y territorial del Perú.",
  keywords: ["Elecciones 2026", "ERM 2026", "JNE", "Perú", "Monitor Electoral", "Candidatos", "Planes de Gobierno", "Voto Informado"],
  authors: [{ name: "Nextnet" }],
  creator: "Nextnet",
  publisher: "Nextnet",
  openGraph: {
    title: "Monitor Electoral Territorial ERM 2026",
    description: "Plataforma de monitoreo político-electoral y territorial del Perú.",
    type: "website",
    locale: "es_PE",
    siteName: "Monitor Electoral Territorial ERM 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monitor Electoral Territorial ERM 2026",
    description: "Plataforma de monitoreo político-electoral y territorial del Perú.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
