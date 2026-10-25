import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AppShell } from "@/components/shell/app-shell";
import { findSearchEntries } from "@/lib/finds";
import "./globals.css";

// Inter, served from our own files (no request to Google).
const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

// IBM Plex Mono, the brand's face for labels (brand/README.md): numbers of positions and Belege, also self-hosted.
const plexMono = localFont({
  src: [
    { path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "tieout", template: "%s · tieout" },
  description: "tieout prüft die Schlussrechnung: was erbracht ist, kommt in die Rechnung, jede Position mit Beleg.",
  icons: { icon: "/favicon.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${plexMono.variable}`}>
      <body>
        <AppShell finds={findSearchEntries()}>{children}</AppShell>
      </body>
    </html>
  );
}
