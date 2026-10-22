// Route des Zuruf-Agenten für die App: POST /api/zuruf/nachricht. Läuft im Cloudflare Worker der App (nach der
// Anmeldeprüfung) und lokal in lokal.ts. Ohne Server-Zustand: Der Browser schickt den Gesprächsstand mit und bekommt
// ihn neu zurück. Beträge gibt es hier nie; die KI läuft nur über `frage` (API-Schlüssel bleibt im Worker).

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ZurufAgent } from "../src/agent.ts";
import type { Firma } from "../src/firma.ts";
import { apiFrage, type KiFrage } from "../src/ki.ts";
import { Arbeitsspeicher, type SpeicherDaten } from "../src/speicher.ts";
import { kiVersteher } from "../src/verstehen.ts";
import type { Antwort, Leistungsereignis } from "../src/typen.ts";

/** Höchstens so viele KI-Aufrufe pro Tag für alle zusammen (Go Maxi S. 22.10.2026). Nie pro Person gezählt. */
export const GRENZE_PRO_TAG = 100;
const MAX_BYTES = 256 * 1024;

/** Zähler der KI-Aufrufe pro Tag. Im Worker in Supabase (worker/supabase.sql), lokal im Speicher. */
export interface Tageszaehler {
  stand(tag: string): Promise<number>;
  erhoehe(tag: string): Promise<void>;
}

export function speicherZaehler(): Tageszaehler {
  const m = new Map<string, number>();
  return {
    stand: async (tag) => m.get(tag) ?? 0,
    erhoehe: async (tag) => void m.set(tag, (m.get(tag) ?? 0) + 1),
  };
}

export interface RoutenOptionen {
  /** Schalter ZURUF_ECHT: aus heißt, die Route gibt es nicht (404). */
  echt: boolean;
  firma: Firma;
  frage: KiFrage;
  zaehler: Tageszaehler;
  grenze?: number;
  jetzt?: () => Date;
}

const Angabe = z.object({ wert: z.unknown(), zitat: z.string(), nachrichtId: z.string() });
const Nachricht = z.object({
  id: z.string().min(1).max(100),
  absenderId: z.string().min(1).max(100),
  zeit: z.string(),
  art: z.enum(["text", "sprache", "foto", "knopf"]),
  inhalt: z.string().max(4000),
  knopfId: z.string().max(100).optional(),
});
const Anfrage = z.object({
  nachrichten: z.array(Nachricht).min(1).max(5),
  rolle: z.enum(["monteur", "polier", "obermonteur", "unbekannt"]).default("monteur"),
  stand: z
    .object({
      nachrichten: z.array(Nachricht),
      // Gesprächszustand und Ereignisse kommen so zurück, wie die Route sie geschickt hat; nur grob geprüft.
      zustaende: z.array(z.object({ absenderId: z.string() }).passthrough()),
      ereignisse: z.array(z.object({ id: z.string(), version: z.number(), eintrag: z.record(z.string(), Angabe) }).passthrough()),
    })
    .default({ nachrichten: [], zustaende: [], ereignisse: [] }),
});

export interface RoutenAntwort {
  antworten: Antwort[];
  stand: SpeicherDaten;
  /** In diesem Schritt abgelegte Ereignisse (neu oder neue Version). */
  neu: Leistungsereignis[];
  obergrenze?: true;
}

/** Ortszeit Wien als ISO-Text mit Versatz, z. B. „2026-10-22T14:32:00+02:00“ (wie die Nachrichten des Agenten). */
export function wienZeit(d: Date): string {
  const teile = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Vienna", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  const lokal = `${teile.year}-${teile.month}-${teile.day}T${teile.hour}:${teile.minute}:${teile.second}`;
  const versatz = Math.round((Date.parse(`${lokal}Z`) - Math.floor(d.getTime() / 1000) * 1000) / 60_000);
  const h = String(Math.floor(Math.abs(versatz) / 60)).padStart(2, "0");
  const m = String(Math.abs(versatz) % 60).padStart(2, "0");
  return `${lokal}${versatz < 0 ? "-" : "+"}${h}:${m}`;
}

const json = (status: number, daten: unknown) =>
  new Response(JSON.stringify(daten), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function zurufRoute(request: Request, opts: RoutenOptionen): Promise<Response> {
  const url = new URL(request.url);
  if (!opts.echt || url.pathname !== "/api/zuruf/nachricht") return json(404, { fehler: "nicht gefunden" });
  if (request.method !== "POST") return json(405, { fehler: "nur POST" });
  const roh = await request.text();
  if (roh.length > MAX_BYTES) return json(413, { fehler: "zu groß" });
  let geparst;
  try {
    geparst = Anfrage.safeParse(JSON.parse(roh));
  } catch {
    return json(400, { fehler: "kein JSON" });
  }
  if (!geparst.success) return json(400, { fehler: "ungültig" });
  const { nachrichten, rolle, stand } = geparst.data;

  const jetzt = (opts.jetzt ?? (() => new Date()))();
  const tag = wienZeit(jetzt).slice(0, 10);
  const vorher = Arbeitsspeicher.aus(stand as unknown as SpeicherDaten);
  if ((await opts.zaehler.stand(tag)) >= (opts.grenze ?? GRENZE_PRO_TAG)) {
    const antwort: RoutenAntwort = {
      antworten: [{ zweck: "hinweis_zweck", text: "Für heute ist die Grenze der Demo erreicht. Morgen geht es wieder." }],
      stand: vorher.alsDaten(),
      neu: [],
      obergrenze: true,
    };
    return json(200, antwort);
  }

  const gezaehlt: KiFrage = async (anfrage) => {
    await opts.zaehler.erhoehe(tag);
    return opts.frage(anfrage);
  };
  const bekannt = new Set(stand.ereignisse.map((e) => `${e.id}@${e.version}`));
  const agent = new ZurufAgent(vorher, kiVersteher({ frage: gezaehlt, firma: opts.firma }), { firma: opts.firma, kanal: "simulator", firmenname: opts.firma.name });
  // Zeit setzt der Server, nicht der Browser.
  const antworten = await agent.verarbeiteBuendel(
    nachrichten.map((n) => ({ ...n, zeit: wienZeit(jetzt) })),
    rolle,
  );
  const daten = vorher.alsDaten();
  const antwort: RoutenAntwort = { antworten, stand: daten, neu: daten.ereignisse.filter((e) => !bekannt.has(`${e.id}@${e.version}`)) };
  return json(200, antwort);
}

/** Was der Worker der App für den Agenten braucht (Cloudflare-Variablen und Secret). */
export interface ZurufUmgebung {
  /** „an“ schaltet die Route ein; fehlt er, gibt es sie nicht (Standard, online bis Go Maxi S.). */
  ZURUF_ECHT?: string;
  ANTHROPIC_API_KEY?: string;
}

/**
 * Einstieg für den Worker der App (product/app/worker/index.ts), nach der Anmeldeprüfung: beantwortet /api/zuruf/…,
 * sonst null. Ohne Schlüssel oder Zähler antwortet er „nicht eingerichtet“ und ruft keine KI.
 */
export async function zurufAnfrage(anfrage: Request, env: ZurufUmgebung, firma: Firma, zaehler: Tageszaehler | null): Promise<Response | null> {
  if (!new URL(anfrage.url).pathname.startsWith("/api/zuruf/")) return null;
  const echt = env.ZURUF_ECHT === "an";
  if (echt && (!env.ANTHROPIC_API_KEY || !zaehler)) return json(503, { fehler: "Zuruf-Agent ist nicht eingerichtet" });
  return zurufRoute(anfrage, { echt, firma, frage: apiFrage(new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })), zaehler: zaehler ?? speicherZaehler() });
}
