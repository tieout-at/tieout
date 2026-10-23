import type { NextConfig } from "next";

// Static export: every page is rendered at build time into `out/` and served as files by the Cloudflare worker `app-neu`.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;
