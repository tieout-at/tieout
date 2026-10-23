// Route des WhatsApp-Agenten für die App. Läuft im Cloudflare Worker der App und lokal in lokal.ts.
// GET  /api/zuruf/status:    ist der echte Agent gerade verfügbar? (Schalter an, eingerichtet, Grenzen nicht erreicht)
// POST /api/zuruf/nachricht: eine Nachricht an den Agenten. Ohne Server-Zustand: Der Browser schickt den
// Gesprächsstand mit und bekommt ihn neu zurück. Beträge gibt es hier nie; die KI läuft nur über `frage`
// (API-Schlüssel bleibt im Worker). Ist eine Grenze erreicht, spielt die App die Szene wieder vor.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { WhatsAppAgent } from "../src/agent.ts";
import type { Firma } from "../src/firma.ts";
import { apiFrage, type KiFrage } from "../src/ki.ts";
import { Arbeitsspeicher, type SpeicherDaten } from "../src/speicher.ts";
import { kiVersteher } from "../src/verstehen.ts";
import type { Antwort, Leistungsereignis } from "../src/typen.ts";

/**
 * Grenzen für alle zusammen, nie pro Person (Vorgabe Maxi S.: höchstens 25 € im Monat, harte Grenze ist das
 * Monatslimit in der Anthropic-Konsole knapp darunter). Die Monatsgrenze rechnet mit den echten Kosten jeder Antwort.
 */
export const GRENZE_PRO_TAG = 40;
export const GRENZE_MONAT_USD = 20;
const MAX_BYTES = 256 * 1024;

export interface Zaehlerstand {
  /** KI-Aufrufe heute. */
  heute: number;
  /** Kosten im laufenden Monat in US-Dollar (Listenpreis). */
  monatUsd: number;
}

/** Zähler der KI-Aufrufe und Kosten. Im Worker in Supabase (worker/supabase.sql), lokal im Speicher. */
export interface Zaehler {
  stand(tag: string): Promise<Zaehlerstand>;
  buche(tag: string, aufrufe: number, usd: number): Promise<void>;
}

export function speicherZaehler(): Zaehler {
  const tage = new Map<string, Zaehlerstand>();
  return {
    stand: async (tag) => ({
      heute: tage.get(tag)?.heute ?? 0,
      monatUsd: [...tage].filter(([t]) => t.slice(0, 7) === tag.slice(0, 7)).reduce((s, [, x]) => s + x.monatUsd, 0),
    }),
    buche: async (tag, aufrufe, usd) => {
      const alt = tage.get(tag) ?? { heute: 0, monatUsd: 0 };
      tage.set(tag, { heute: alt.heute + aufrufe, monatUsd: alt.monatUsd + usd });
    },
  };
}

export interface RoutenOptionen {
  /** Schalter ZURUF_ECHT: aus heißt, es gibt keine Nachrichten-Route (404) und der Status sagt „nicht verfügbar“. */
  echt: boolean;
  firma: Firma;
  /** KI-Weg; `beiKosten` bekommt die Kosten jeder Antwort (für die Monatsgrenze). */
  frage: (beiKosten: (usd: number) => void) => KiFrage;
  zaehler: Zaehler;
  grenzeTag?: number;
  grenzeMonatUsd?: number;
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
  /** Grenze erreicht: keine Antwort, die App spielt die Szene vor. */
  obergrenze?: true;
}

export interface StatusAntwort {
  verfuegbar: boolean;
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

async function unterGrenzen(opts: RoutenOptionen, tag: string): Promise<boolean> {
  const s = await opts.zaehler.stand(tag);
  return s.heute < (opts.grenzeTag ?? GRENZE_PRO_TAG) && s.monatUsd < (opts.grenzeMonatUsd ?? GRENZE_MONAT_USD);
}

export async function zurufRoute(request: Request, opts: RoutenOptionen): Promise<Response> {
  const url = new URL(request.url);
  const jetzt = (opts.jetzt ?? (() => new Date()))();
  const tag = wienZeit(jetzt).slice(0, 10);

  if (url.pathname === "/api/zuruf/status") {
    const antwort: StatusAntwort = { verfuegbar: opts.echt && (await unterGrenzen(opts, tag)) };
    return json(200, antwort);
  }
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

  const vorher = Arbeitsspeicher.aus(stand as unknown as SpeicherDaten);
  if (!(await unterGrenzen(opts, tag))) {
    const antwort: RoutenAntwort = { antworten: [], stand: vorher.alsDaten(), neu: [], obergrenze: true };
    return json(200, antwort);
  }

  // Jeden KI-Aufruf zählen (auch fehlgeschlagene) und die Kosten sammeln; gebucht wird einmal am Ende.
  let aufrufe = 0;
  let usd = 0;
  const ki = opts.frage((k) => (usd += k));
  const gezaehlt: KiFrage = (anfrage) => {
    aufrufe++;
    return ki(anfrage);
  };
  const bekannt = new Set(stand.ereignisse.map((e) => `${e.id}@${e.version}`));
  const agent = new WhatsAppAgent(vorher, kiVersteher({ frage: gezaehlt, firma: opts.firma }), { firma: opts.firma, kanal: "simulator", firmenname: opts.firma.name });
  // Zeit setzt der Server, nicht der Browser.
  const antworten = await agent.verarbeiteBuendel(
    nachrichten.map((n) => ({ ...n, zeit: wienZeit(jetzt) })),
    rolle,
  );
  if (aufrufe) await opts.zaehler.buche(tag, aufrufe, usd);
  const daten = vorher.alsDaten();
  const antwort: RoutenAntwort = { antworten, stand: daten, neu: daten.ereignisse.filter((e) => !bekannt.has(`${e.id}@${e.version}`)) };
  return json(200, antwort);
}

/** Was der Worker der App für den Agenten braucht (Cloudflare-Variable oder Secret, zur Laufzeit gelesen). */
export interface ZurufUmgebung {
  /** „an“ schaltet den echten Agenten ein; fehlt er, spielt die App die Szene vor (Standard, online bis Go Maxi S.). */
  ZURUF_ECHT?: string;
  ANTHROPIC_API_KEY?: string;
}

/**
 * Einstieg für den Worker der App (product/app/worker/index.ts): beantwortet /api/zuruf/…, sonst null.
 * Ohne Schlüssel oder Zähler gilt der Agent als aus (Status „nicht verfügbar“, keine KI).
 */
export async function zurufAnfrage(anfrage: Request, env: ZurufUmgebung, firma: Firma, zaehler: Zaehler | null): Promise<Response | null> {
  if (!new URL(anfrage.url).pathname.startsWith("/api/zuruf/")) return null;
  const echt = env.ZURUF_ECHT === "an" && !!env.ANTHROPIC_API_KEY && !!zaehler;
  // Der Client entsteht erst, wenn wirklich eine Nachricht kommt (nur mit Schalter an und Schlüssel).
  return zurufRoute(anfrage, { echt, firma, frage: (beiKosten) => apiFrage(new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }), beiKosten), zaehler: zaehler ?? speicherZaehler() });
}
