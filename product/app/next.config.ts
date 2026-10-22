import type { NextConfig } from "next";

// Statischer Export: alle Seiten werden beim Build vorberechnet und liegen danach als Dateien in `out/`.
// So läuft die Demo ohne Server bei jedem Hoster für statische Seiten.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
