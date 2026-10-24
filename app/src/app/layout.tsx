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

export const metadata: Metadata = {
  title: { default: "tieout", template: "%s · tieout" },
  description: "tieout prüft die Schlussrechnung: was erbracht ist, kommt in die Rechnung, jede Position mit Beleg.",
  icons: { icon: "/favicon.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body>
        <AppShell finds={findSearchEntries()}>{children}</AppShell>
      </body>
    </html>
  );
}
