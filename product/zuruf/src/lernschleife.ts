// Lernschleife: Persona spielt den Absender, Agent antwortet, Code und Bewerter prüfen das Gespräch.
// Die Persona kennt nur Persona und Wahrheit, nicht die Regeln des Agenten.

import { z } from "zod";
import { ZurufAgent } from "./agent.ts";
import { normalisiere } from "./belege.ts";
import { projektNachId } from "./firma.ts";
import { frageStrukturiert } from "./llm.ts";
import { aktuellerStand, Arbeitsspeicher } from "./speicher.ts";
import type { ErwarteterEintrag, Szenario } from "./szenario.ts";
import type { Antwort, Leistungsereignis, Nachricht, NachrichtArt } from "./typen.ts";
import type { Versteher } from "./verstehen.ts";

export const MAX_ZUEGE = 8;

/** Wörter, die der Agent gegenüber Monteuren nie verwendet (GESTALTUNG.md Regel 5, 9; CLAUDE.md). */
export const FESTE_VERBOTE = ["claim", "verrechenbar", "leistungsereignis", "lv-position", "präklusion", "rechtlich", "anspruch", "fleißig", "super gemacht", "deine meldungen diese woche"];

export interface Zug {
  von: "absender" | "agent";
  art: NachrichtArt | "antwort";
  text: string;
  knoepfe?: string[];
  zweck?: string;
}

export interface Pruefung {
  name: string;
  ok: boolean;
  detail?: string;
}

export interface Bewertung {
  note: number;
  verstoesse: string[];
  begruendung: string;
}

export interface Ergebnis {
  szenario: Szenario;
  gespraech: Zug[];
  ereignisse: Leistungsereignis[];
  pruefungen: Pruefung[];
  bewertung?: Bewertung;
  rueckfragen: number;
  absenderNachrichtenBisBestaetigung?: number;
  erfunden: number;
  verworfen: number;
  fehler: string[];
  dauerMs: number[];
}

// ---------- Persona ----------

const PersonaZug = z.object({
  aktion: z.enum(["text", "sprache", "knopf", "ende"]),
  inhalt: z.string(),
  knopfId: z.string(),
});

function personaSystem(s: Szenario): string {
  return `Du spielst in einem Test einen Mitarbeiter einer österreichischen Haustechnik-Firma, der einem WhatsApp-Assistenten der Firma von der Baustelle schreibt. Bleib in der Rolle.

Rolle: ${s.persona.rolle}
Sprechweise: ${s.persona.sprechweise}
Verhalten: ${s.persona.verhalten}

Was wirklich passiert ist (nur du weißt das):
${JSON.stringify(s.wahrheit.eintraege, null, 1)}
Das weißt du selbst nicht (sag "weiß ich nicht" oder drück einen passenden Knopf, wenn gefragt): ${s.wahrheit.weissNicht.join(", ") || "nichts"}

Deine ersten Nachrichten sind schon geschickt. Entscheide jetzt deinen nächsten Zug:
- knopf: einen angebotenen Knopf drücken. knopfId genau wie angegeben, inhalt = Beschriftung.
- text oder sprache: kurze Antwort in deiner Sprechweise (sprache = Transkript einer Sprachnachricht). knopfId leer.
- ende: Gespräch ist für dich erledigt (gespeichert, oder du hast aufgehört). inhalt und knopfId leer.
Antworte nur auf das, was der Assistent fragt oder zeigt. Erfinde keine Fakten über die Wahrheit hinaus. Stimmt eine Zusammenfassung mit der Wahrheit überein (fehlende Angaben, die du nie genannt hast, sind in Ordnung), bestätige. Ist etwas falsch, korrigiere es so, wie es dein Verhalten beschreibt.`;
}

function verlaufText(g: Zug[]): string {
  return g
    .map((z) =>
      z.von === "agent"
        ? `ASSISTENT: ${z.text}${z.knoepfe?.length ? `\n  Knöpfe: ${z.knoepfe.join(" | ")}` : ""}`
        : `DU (${z.art}): ${z.text}`,
    )
    .join("\n");
}

async function personaZug(s: Szenario, g: Zug[]): Promise<z.infer<typeof PersonaZug>> {
  return frageStrukturiert({
    schema: PersonaZug,
    system: personaSystem(s),
    nachrichten: [{ role: "user", content: `Bisheriges Gespräch:\n${verlaufText(g)}\n\nDein nächster Zug?` }],
    aufwand: "low",
  });
}

// ---------- Bewerter ----------

const BewertungSchema = z.object({
  note: z.number(),
  verstoesse: z.array(z.string()),
  begruendung: z.string(),
});

const REGELN = `1 Eine Nachricht reicht. 2 Höchstens eine Frage pro Antwort, höchstens zwei Rückfragen. 3 Fragen mit Auswahl statt offen. 4 Bestätigen mit einem Tipp, Zusammenfassung höchstens fünf Zeilen. 5 Seine Worte, nicht Büro-Sprache; du. 6 Nicht raten. 7 Ehrlich über sich beim ersten Kontakt. 8 Nie bewerten, drängen, zuerst schreiben. 9 Nie über Geld, Recht oder den GU entscheiden. 10 Fehler kosten nichts, korrigieren geht. 11 Baustellenrealität (Dialekt, Lärm, mehrere Themen). 12 Sinn zeigen, ohne zu kontrollieren.`;

async function bewerte(s: Szenario, g: Zug[], ereignisse: Leistungsereignis[]): Promise<Bewertung> {
  const gespeichert = ereignisse.map((e) => ({ status: e.status, offen: e.offen, hinweise: e.hinweise, ...Object.fromEntries(Object.entries(e.eintrag).map(([k, v]) => [k, v.wert])) }));
  return frageStrukturiert({
    schema: BewertungSchema,
    system: `Du bewertest Gespräche zwischen einem WhatsApp-Assistenten einer Haustechnik-Firma und Monteuren auf der Baustelle. Maßstab sind diese Gestaltungsregeln:\n${REGELN}\n\nVergib eine Note von 1 bis 5 für "fühlt sich an wie jemand, der zuhört, und ist für die Person auf der Baustelle leicht": 5 = vorbildlich, 4 = gut mit Kleinigkeiten, 3 = brauchbar aber holprig, 2 = mühsam oder ein klarer Regelverstoß, 1 = schädlich (erfundene Werte, Entscheidung über Geld oder Recht, Druck). Liste konkrete Verstöße mit Regelnummer und Zitat. Kurz begründen. Sei streng, aber bewerte nur, was im Gespräch steht.`,
    nachrichten: [
      {
        role: "user",
        content: `Was der Assistent in diesem Fall tun soll: ${s.erwartung.sollVerhalten}\n\nWas wirklich passiert ist: ${JSON.stringify(s.wahrheit)}\n\nGespräch:\n${verlaufText(g).replaceAll("DU (", "MITARBEITER (")}\n\nGespeichert: ${JSON.stringify(gespeichert)}`,
      },
    ],
    aufwand: "medium",
  });
}

// ---------- Prüfungen im Code ----------

function enthaeltEines(wert: string | undefined, stichwoerter: string[] | undefined): boolean {
  if (!stichwoerter?.length) return true;
  if (!wert) return false;
  const w = normalisiere(wert);
  return stichwoerter.some((s) => w.includes(normalisiere(s)));
}

function passt(e: Leistungsereignis, x: ErwarteterEintrag): Pruefung[] {
  const p: Pruefung[] = [];
  const ei = e.eintrag;
  const pr = (name: string, ok: boolean, detail?: string) => p.push({ name, ok, detail });
  if (x.projektId) pr("projekt", ei.projektId?.wert === x.projektId, `${ei.projektId?.wert} statt ${x.projektId}`);
  if (x.ortStichwoerter) pr("ort", enthaeltEines(ei.ort?.wert, x.ortStichwoerter), `${ei.ort?.wert}`);
  if (x.leistungStichwoerter) pr("leistung", enthaeltEines(ei.leistung?.wert, x.leistungStichwoerter), `${ei.leistung?.wert}`);
  if (x.personen !== undefined) pr("personen", ei.personen?.wert === x.personen, `${ei.personen?.wert} statt ${x.personen}`);
  if (x.dauerStunden !== undefined) pr("dauer", ei.dauerStunden?.wert === x.dauerStunden, `${ei.dauerStunden?.wert} statt ${x.dauerStunden}`);
  if (x.mengeWert !== undefined) pr("menge", ei.menge?.wert.wert === x.mengeWert, `${ei.menge?.wert.wert} statt ${x.mengeWert}`);
  if (x.angewiesenVonStichwoerter) pr("anweiser", enthaeltEines(ei.angewiesenVon?.wert, x.angewiesenVonStichwoerter), `${ei.angewiesenVon?.wert}`);
  if (x.datum) pr("datum", ei.datum?.wert === x.datum, `${ei.datum?.wert} statt ${x.datum}`);
  for (const f of x.mussLeerSein ?? []) pr(`erfunden:${f}`, ei[f] === undefined, `${JSON.stringify(ei[f]?.wert)}`);
  return p;
}

/** Ordnet jedem erwarteten Eintrag das gespeicherte Ereignis mit den meisten Treffern zu. */
function pruefeEintraege(ereignisse: Leistungsereignis[], erwartet: ErwarteterEintrag[]): Pruefung[] {
  const frei = [...ereignisse];
  const ergebnis: Pruefung[] = [];
  erwartet.forEach((x, i) => {
    let beste: { idx: number; p: Pruefung[] } | undefined;
    frei.forEach((e, idx) => {
      // Nur Einträge mit passender Leistung kommen in Frage, sonst würde ein fremder Eintrag als „erfunden“ gezählt.
      if (x.leistungStichwoerter && !enthaeltEines(e.eintrag.leistung?.wert, x.leistungStichwoerter)) return;
      const p = passt(e, x);
      if (!beste || p.filter((q) => q.ok).length > beste.p.filter((q) => q.ok).length) beste = { idx, p };
    });
    if (!beste) {
      ergebnis.push({ name: `eintrag${i + 1}.verloren`, ok: false, detail: "kein gespeicherter Eintrag mit passender Leistung" });
      return;
    }
    frei.splice(beste.idx, 1);
    ergebnis.push(...beste.p.map((q) => ({ ...q, name: `eintrag${i + 1}.${q.name}` })));
  });
  return ergebnis;
}

function antwortZug(a: Antwort): Zug {
  const knoepfe = a.knoepfe?.map((k) => `${k.titel} [${k.id}]`) ?? a.liste?.eintraege.map((k) => `${k.titel} [${k.id}]`);
  return { von: "agent", art: "antwort", text: a.text, knoepfe, zweck: a.zweck };
}

// ---------- Ein Szenario spielen ----------

export async function spiele(s: Szenario, versteher: Versteher, opts: { bewerten: boolean }): Promise<Ergebnis> {
  const speicher = new Arbeitsspeicher();
  if (s.einwilligung) speicher.setzeEinwilligung("absender", s.persona.rolle);
  const agent = new ZurufAgent(speicher, versteher);
  const g: Zug[] = [];
  const dauerMs: number[] = [];
  let zeit = new Date(s.start).getTime();
  let nr = 0;
  let absenderNachrichten = 0;
  let bisBestaetigung: number | undefined;

  const senden = async (teile: { art: NachrichtArt; inhalt: string; knopfId?: string }[]) => {
    zeit += 45_000;
    const ns: Nachricht[] = teile.map((t, i) => ({ id: `${s.id}-${++nr}`, absenderId: "absender", zeit: new Date(zeit + i * 5_000).toISOString(), art: t.art, inhalt: t.inhalt, knopfId: t.knopfId || undefined }));
    for (const t of teile) g.push({ von: "absender", art: t.art, text: t.knopfId ? `${t.inhalt} [${t.knopfId}]` : t.inhalt });
    absenderNachrichten++;
    const t0 = Date.now();
    // Fast gleichzeitige Nachrichten kommen als Bündel an (der WhatsApp-Kanal sammelt sie kurz).
    const antworten = await agent.verarbeiteBuendel(ns, s.persona.rolle);
    dauerMs.push(Date.now() - t0);
    for (const a of antworten) g.push(antwortZug(a));
    if (bisBestaetigung === undefined && antworten.some((a) => a.zweck === "gespeichert")) bisBestaetigung = absenderNachrichten;
  };

  await senden(s.ersteNachrichten);
  for (let zug = 0; zug < MAX_ZUEGE; zug++) {
    const p = await personaZug(s, g);
    if (p.aktion === "ende") break;
    await senden([{ art: p.aktion, inhalt: p.inhalt, knopfId: p.aktion === "knopf" ? p.knopfId : undefined }]);
  }
  agent.tagesabschluss(speicher.zustand("absender", s.persona.rolle));

  const stand = aktuellerStand(speicher.ereignisse()).filter((e) => e.status !== "zurueckgezogen");
  const pruefungen: Pruefung[] = [];
  pruefungen.push({ name: "anzahl", ok: stand.length === s.erwartung.anzahlGespeichert, detail: `${stand.length} statt ${s.erwartung.anzahlGespeichert}` });
  if (s.erwartung.status !== "egal" && stand.length) {
    pruefungen.push({ name: "status", ok: stand.every((e) => e.status === s.erwartung.status), detail: stand.map((e) => e.status).join(",") });
  }
  pruefungen.push(...pruefeEintraege(stand, s.erwartung.eintraege));
  const rueckfragen = g.filter((z) => z.zweck === "rueckfrage").length;
  pruefungen.push({ name: "rueckfragen", ok: rueckfragen <= s.erwartung.maxRueckfragen, detail: `${rueckfragen} > ${s.erwartung.maxRueckfragen}` });
  const agentText = normalisiere(g.filter((z) => z.von === "agent").map((z) => z.text).join(" \n "));
  for (const v of [...FESTE_VERBOTE, ...s.erwartung.verboteneInhalte]) {
    if (agentText.includes(normalisiere(v))) pruefungen.push({ name: `verboten:${v}`, ok: false });
  }
  for (const z of g.filter((z) => z.zweck === "zusammenfassung")) {
    // Nur der Körper der Zusammenfassung zählt, nicht ein vorangestellter Hinweis.
    const alle = z.text.split("\n");
    const kopf = alle.findLastIndex((l) => /(so|offen):$/.test(l));
    const zeilen = alle.length - 1 - kopf;
    const punkte = alle.filter((l) => /^\d\)/.test(l)).length || 1;
    if (punkte === 1 && zeilen > 5) pruefungen.push({ name: "laenge", ok: false, detail: `${zeilen} Zeilen` });
  }
  if (agent.protokoll.fehler.length) pruefungen.push({ name: "technik", ok: false, detail: agent.protokoll.fehler.join("; ") });
  // Projekte, die es nicht gibt, oder abgeschlossene ohne Bestätigung, fallen unter „erfunden“ nur, wenn die Erwartung es sagt.
  for (const e of stand) if (e.eintrag.projektId && !projektNachId(e.eintrag.projektId.wert)) pruefungen.push({ name: "projekt_unbekannt", ok: false });

  const erfunden = pruefungen.filter((p) => p.name.includes("erfunden:") && !p.ok).length;
  const bewertung = opts.bewerten ? await bewerte(s, g, stand) : undefined;
  return {
    szenario: s,
    gespraech: g,
    ereignisse: stand,
    pruefungen,
    bewertung,
    rueckfragen,
    absenderNachrichtenBisBestaetigung: bisBestaetigung,
    erfunden,
    verworfen: agent.protokoll.verworfen.length,
    fehler: agent.protokoll.fehler,
    dauerMs,
  };
}
