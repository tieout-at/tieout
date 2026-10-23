// Nur zum lokalen Testen: dieselbe Route wie im Worker, als kleiner Node-Server auf Port 3103.
// KI nach ZURUF_KI in product/whatsapp/.env (abo = Claude-Abo, api = Schlüssel). Firma aus dem Generator der App
// (product/app/data/generated/agent-firma.json, entsteht mit `npm run generate` in product/app).
// Start: npm run app-server. Die App ruft ihn auf, wenn sie mit NEXT_PUBLIC_ZURUF_API=http://localhost:3103/api/zuruf läuft.

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Firma } from "../src/firma.ts";
import { frageStrukturiert, kiWeg } from "../src/llm.ts";
import { speicherZaehler, zurufRoute } from "./route.ts";

const PORT = Number(process.env.ZURUF_PORT ?? 3103);
const hier = path.dirname(fileURLToPath(import.meta.url));
const firma = JSON.parse(readFileSync(path.join(hier, "..", "..", "app", "data", "generated", "agent-firma.json"), "utf8")) as Firma;
const zaehler = speicherZaehler();

createServer(async (req, res) => {
  const herkunft = req.headers.origin ?? "";
  const lokal = /^http:\/\/localhost:\d+$/.test(herkunft);
  if (lokal) {
    res.setHeader("access-control-allow-origin", herkunft);
    res.setHeader("access-control-allow-headers", "content-type");
    res.setHeader("access-control-allow-methods", "GET, POST");
  }
  if (req.method === "OPTIONS") return void res.writeHead(204).end();
  let body = "";
  for await (const teil of req) body += teil;
  const antwort = await zurufRoute(
    new Request(`http://localhost:${PORT}${req.url}`, { method: req.method, body: req.method === "POST" ? body : undefined }),
    { echt: true, firma, frage: () => frageStrukturiert, zaehler },
  );
  res.writeHead(antwort.status, { "content-type": antwort.headers.get("content-type") ?? "application/json" });
  res.end(await antwort.text());
}).listen(PORT, () => console.log(`Zuruf-Route lokal auf http://localhost:${PORT}/api/zuruf/nachricht, KI über ${kiWeg()}, ${firma.projekte.length} Projekte`));
