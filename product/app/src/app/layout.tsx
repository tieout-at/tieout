import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { navDaten } from "@/daten/demo";
import { Seitenleiste } from "@/ui/Seitenleiste";
import { THEMA_SKRIPT } from "@/ui/thema-skript";
import { ToastBereich } from "@/ui/Toast";
import "./globals.css";

// Schriften werden beim Build geladen und von der eigenen Domain ausgeliefert (kein Aufruf bei Google im Betrieb).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", weight: ["400", "500"] });
// Inter Tight nur für die Wortmarke Tieout, wie auf der Website.
const display = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", weight: ["600"] });

export const metadata: Metadata = {
  title: { default: "Tieout", template: "%s | Tieout" },
  description: "Tieout: Schlussrechnung mit Beleg für jeden Euro. Demo mit synthetischen Daten.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nav = navDaten();
  return (
    <html lang="de-AT" className={`${inter.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEMA_SKRIPT }} />
      </head>
      <body>
        <div className="scr">
          <Seitenleiste firma={nav.firma} untertitel={nav.untertitel} auftraggeber={nav.auftraggeber} projekte={nav.projekte} />
          <div className="scr-main">{children}</div>
        </div>
        <ToastBereich />
      </body>
    </html>
  );
}
