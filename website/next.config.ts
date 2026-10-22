import type { NextConfig } from "next";

// Statischer Export: die Seite läuft ohne Server und lässt sich überall hosten.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;
