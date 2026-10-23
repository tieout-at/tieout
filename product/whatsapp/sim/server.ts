// Simulator: lokale Chat-Seite im WhatsApp-Stil plus Büro-Ansicht. Nur synthetische Daten.
// Start: npm run sim, dann http://localhost:4321 öffnen.

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WhatsAppAgent } from "../src/agent.ts";
import { FIRMA } from "../src/firma.ts";
import { frageStrukturiert, kiWeg, kostenUsd } from "../src/llm.ts";
import { aktuellerStand } from "../src/speicher.ts";
import { Dateispeicher } from "../src/speicher-datei.ts";
import type { Nachricht, NachrichtArt, Rolle } from "../src/typen.ts";
import { kiVersteher } from "../src/verstehen.ts";

const hier = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 4321);

let speicher = new Dateispeicher(path.join(hier, "..", "laeufe", "sim"));
let agent = new WhatsAppAgent(speicher, kiVersteher({ frage: frageStrukturiert }), { kanal: "simulator" });
let nr = 0;

function json(res: import("node:http").ServerResponse, status: number, daten: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(daten));
}

async function koerper(req: import("node:http").IncomingMessage): Promise<Record<string, string>> {
  let text = "";
  for await (const teil of req) text += teil;
  return text ? JSON.parse(text) : {};
}

createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(readFileSync(path.join(hier, "index.html"), "utf8"));
      return;
    }
    if (req.method === "GET" && req.url === "/firma") return json(res, 200, FIRMA);
    if (req.method === "GET" && req.url === "/ereignisse") {
      const liste = speicher.ereignisse();
      const stand = aktuellerStand(liste).map((e) => ({
        ...e,
        quellen: e.nachrichtIds.map((id) => speicher.nachricht(id)).filter(Boolean),
        versionen: liste.filter((x) => x.id === e.id).length,
      }));
      return json(res, 200, { stand, kostenUsd: kostenUsd(), kiWeg: kiWeg() });
    }
    if (req.method === "POST" && req.url === "/nachricht") {
      const b = await koerper(req);
      const n: Nachricht = {
        id: `sim-${Date.now().toString(36)}-${++nr}`,
        absenderId: b.absenderId || "sim-monteur",
        zeit: new Date().toISOString(),
        art: (b.art as NachrichtArt) || "text",
        inhalt: String(b.inhalt ?? "").slice(0, 2000),
        knopfId: b.knopfId || undefined,
      };
      const antworten = await agent.verarbeite(n, (b.rolle as Rolle) || "monteur");
      return json(res, 200, { antworten });
    }
    if (req.method === "POST" && req.url === "/zuruecksetzen") {
      speicher = new Dateispeicher(path.join(hier, "..", "laeufe", "sim"));
      agent = new WhatsAppAgent(speicher, kiVersteher({ frage: frageStrukturiert }), { kanal: "simulator" });
      return json(res, 200, { ok: true });
    }
    json(res, 404, { fehler: "nicht gefunden" });
  } catch (e) {
    json(res, 500, { fehler: e instanceof Error ? e.message : String(e) });
  }
}).listen(PORT, () => console.log(`Simulator läuft: http://localhost:${PORT}`));
