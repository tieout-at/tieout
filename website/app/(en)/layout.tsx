import "../globals.css";
import { interTight, plexMono } from "@/lib/fonts";
import { siteMetadata } from "@/lib/metadata";

export const metadata = siteMetadata("en");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
