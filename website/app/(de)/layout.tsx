import "../globals.css";
import { interTight, plexMono } from "@/lib/fonts";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata("de");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${interTight.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
