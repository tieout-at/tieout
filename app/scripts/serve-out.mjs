// Serves the static export in out/ for screenshots and customer tests. `serve` ran out of file handles on Windows
// under the prefetch load of the screens script (EMFILE); this reads each file whole and closes it at once.
// Usage: node scripts/serve-out.mjs [port]   (default 3101; a rebuild of out/ needs no restart)

import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "out");
const port = Number(process.argv[2] ?? process.env.PORT ?? 3101);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function file(path) {
  try {
    const s = await stat(path);
    return s.isDirectory() ? file(join(path, "index.html")) : path;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const path = normalize(join(root, url));
  if (!path.startsWith(root)) return res.writeHead(403).end();
  const found = (await file(path)) ?? (await file(`${path}.html`));
  const target = found ?? join(root, "404.html");
  try {
    const body = await readFile(target);
    res.writeHead(found ? 200 : 404, { "content-type": TYPES[extname(target)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, () => console.log(`out/ at http://localhost:${port}`));
