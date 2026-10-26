import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Static export: every page is rendered at build time into `out/` and served as files by the Cloudflare worker `app`.
// The calculation core `kern/` sits next to `app/` and is linked as `@tieout/kern` (file:../kern); it ships TypeScript,
// so Next transpiles it, and Turbopack's root is the repository so that the build may read files outside `app/`.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
  transpilePackages: ["@tieout/kern"],
  turbopack: { root: fileURLToPath(new URL("..", import.meta.url)) },
};

export default nextConfig;
