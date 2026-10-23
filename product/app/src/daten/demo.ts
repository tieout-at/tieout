// Datenzugriff der App. Heute: der synthetische Firmenzwilling aus dem Generator, einmal gerechnet und beim Build
// vorberechnet. Später (Stufe 0) kommt hier die Datenbank pro Firma hin; die Bildschirme lesen nur diese Funktionen.

import "server-only";
import { notFound } from "next/navigation";
import { erzeugeFirma } from "@/demo/firma/erzeuge";
import { LG_NAME } from "@/demo/w21/katalog";
import type { Datensatz, Firmendaten, Kuerzungsgrund } from "@/domain/typen";
import { ART_TEXT } from "@/ui/posten-texte";
import { BELEGQUELLE_TEXT, KUERZUNGSGRUND_TEXT, abrechnung, gleicherGrund, guHistorie, pruefeFirma, schlussbesprechung, type Abrechnung, type Schlussbesprechung, type Ampel, type Befund, type Ergebnis, type FirmenErgebnis, type GuHistorie, type Liste } from "@/engine";

let cache: { f: Firmendaten; e: FirmenErgebnis; h: GuHistorie } | null = null;

function laden() {
  if (!cache) {
    const f = erzeugeFirma();
    cache = { f, e: pruefeFirma(f), h: guHistorie(f) };
  }
  return cache;
}

/** GU-Historie der Firma: je Auftraggeber Kürzungen, Abzüge ohne Vertragspunkt, Nachträge, Tage bis zur Schlusszahlung. */
export function historie(): GuHistorie {
  return laden().h;
}

/** Ein anderes Projekt desselben Auftraggebers mit demselben Grund, mit Adresse des Originals dort. */
export interface SchonBeiAuftraggeber {
  kurz: string;
  href: string;
}

/**
 * Hat dieser Auftraggeber in einem anderen Projekt schon aus demselben Grund gekürzt oder abgezogen? Abgleich über
 * den festen Schlüssel des Grunds, nur Treffer vor der eigenen Schlussrechnung (sonst vor dem Stichtag), damit
 * „schon“ zeitlich stimmt. Die Adresse führt zum Korrekturblatt oder Zahlungsavis dort.
 */
export function schonBeiAuftraggeber(projektId: string, grund: Kuerzungsgrund): SchonBeiAuftraggeber[] {
  const { f, h } = laden();
  const d = f.projekte.find((p) => p.projekt.id === projektId);
  if (!d) return [];
  const vor = d.schlussrechnung?.datum.wert ?? f.stichtag;
  return gleicherGrund(h, d.projekt.auftraggeberId, grund, projektId, vor).map((x) => ({ kurz: x.kurz, href: `/projekte/${x.projektId}/belege/${x.beleg.quelle.dokumentId}/#pos-${x.anker}` }));
}

export function firma(): { daten: Firmendaten; ergebnis: FirmenErgebnis } {
  const { f, e } = laden();
  return { daten: f, ergebnis: e };
}

export function projekt(id: string): { d: Datensatz; e: Ergebnis } {
  const { f, e } = laden();
  const d = f.projekte.find((p) => p.projekt.id === id);
  if (!d) notFound();
  return { d, e: e.ergebnisse[id] };
}

/**
 * Projekte mit eigener Schlussrechnungs-Seite: nur die, deren Kaskade und Vorprüfung in der Lösungsliste stehen
 * (Demo_Faelle.md hat sie nur für W21). P3 hat auch einen Entwurf, seine Werte sind aber nicht freigegeben.
 */
const SCHLUSSRECHNUNG_SEITE = new Set(["w21-b-hkls"]);

export function hatSchlussrechnung(id: string): boolean {
  return SCHLUSSRECHNUNG_SEITE.has(id) && laden().e.ergebnisse[id]?.kaskade !== null;
}

export function schlussrechnungIds(): { projekt: string }[] {
  return laden().f.projekte.filter((p) => hatSchlussrechnung(p.projekt.id)).map((p) => ({ projekt: p.projekt.id }));
}

export function projektIds(): { projekt: string }[] {
  return laden().f.projekte.map((p) => ({ projekt: p.projekt.id }));
}

/**
 * Schlüssel eines Postens wie „mehrmenge:22.04.12B“ als lesbarer URL-Teil „mehrmenge-22-04-12B“. Der Rechenkern
 * sagt weiter „zuruf:Z6“ (Freigaben im Browser hängen am Schlüssel), die Adresse heißt „whatsapp-Z6“.
 */
export function postenSlug(schluessel: string): string {
  return schluessel.replace(/^zuruf:/, "whatsapp:").replace(/[:.]/g, "-");
}

/** Ein Posten zum Entscheiden mit Adresse, in der Reihenfolge, in der man prüft. */
export interface ZuEntscheiden {
  schluessel: string;
  liste: Liste;
  href: string;
}

/**
 * Posten, über die zu entscheiden ist (ohne „Braucht Anwalt“), in Prüfreihenfolge: zuerst die Posten, die der GU
 * kürzen würde (größtes Kürzungsrisiko zuerst), dann die übrigen in der Reihenfolge des Rechenkerns. So beginnt
 * „Weiter prüfen“ beim Posten, der am meisten Verteidigung braucht (W21: J1, Mehrmenge aus Planänderung).
 */
export function zuEntscheiden(projektId: string, e: Ergebnis): ZuEntscheiden[] {
  const risiko = new Map<string, number>();
  for (const r of e.vorpruefung?.risiken ?? []) if (r.befundSchluessel) risiko.set(r.befundSchluessel, Math.max(risiko.get(r.befundSchluessel) ?? 0, r.betrag));
  return e.befunde
    .filter((b) => b.liste !== "anwalt")
    .map((b, i) => ({ b, i, r: risiko.get(b.schluessel) ?? -1 }))
    .sort((x, y) => y.r - x.r || x.i - y.i)
    .map(({ b }) => ({ schluessel: b.schluessel, liste: b.liste, href: `/projekte/${projektId}/posten/${postenSlug(b.schluessel)}/` }));
}

export function einPosten(projektId: string, slug: string): { d: Datensatz; e: Ergebnis; b: Befund } {
  const { d, e } = projekt(projektId);
  const b = e.befunde.find((x) => postenSlug(x.schluessel) === slug);
  if (!b) notFound();
  return { d, e, b };
}

/** Gebäudeart für die Bauglyphe in der Seitenleiste. */
export type Gebaeude = "wohnhaus" | "buero" | "schule" | "pflege" | "reihenhaus" | "hotel";

/** Heute aus dem Projektnamen; später ein Feld im Projekt. */
function gebaeudeAus(name: string): Gebaeude {
  if (/^Bürogebäude/.test(name)) return "buero";
  if (/schule/i.test(name)) return "schule";
  if (/^Pflege/.test(name)) return "pflege";
  if (/^Reihenhaus/.test(name)) return "reihenhaus";
  if (/^Hotel/.test(name)) return "hotel";
  return "wohnhaus";
}

/** Stammdaten für die Seitenleiste und die Suche (klein, geht an den Browser). */
export interface NavProjekt {
  id: string;
  kurz: string;
  name: string;
  abgleich: boolean;
  /** Eigene Schlussrechnungs-Seite (nur mit Werten in der Lösungsliste). */
  schlussrechnung: boolean;
  /** Ampel aus dem Rechenkern (Firmenübersicht); „rot“ zeigt die Frist in der Seitenleiste. */
  ampel: Ampel;
  /** Frist „Schlussrechnung legen bis“ (ISO), nur wenn sie drängt. */
  frist: string | null;
  gebaeude: Gebaeude;
  /** Geschoße für die Glyphe eines Wohnhauses (fest aus der Kennung, 3 bis 6). */
  geschosse: number;
  /** Posten, über die zu entscheiden ist (ohne „Braucht Anwalt“), wie auf der Projektübersicht. */
  entscheiden: { schluessel: string; liste: Liste }[];
  /** Für die Suche: Titel und Adresse jedes Postens. */
  posten: { titel: string; href: string }[];
}

export function navDaten(): { firma: string; untertitel: string; projekte: NavProjekt[] } {
  const { f, e } = laden();
  return {
    firma: f.firma.name,
    untertitel: `${f.projekte.length} Projekte`,
    projekte: f.projekte.map((d) => {
      const x = e.ergebnisse[d.projekt.id];
      const zeile = e.projekte.find((z) => z.projektId === d.projekt.id);
      const ampel = zeile?.ampel ?? "grau";
      const id = d.projekt.id;
      return {
        id,
        kurz: d.projekt.kurz,
        name: d.projekt.name,
        abgleich: x.abgleich,
        schlussrechnung: hatSchlussrechnung(id),
        ampel,
        frist: ampel === "rot" && zeile?.datum?.art === "legen_bis" ? zeile.datum.wert : null,
        gebaeude: gebaeudeAus(d.projekt.name),
        geschosse: 3 + ([...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 4),
        entscheiden: x.befunde.filter((b) => b.liste !== "anwalt").map((b) => ({ schluessel: b.schluessel, liste: b.liste })),
        posten: x.befunde.map((b) => ({ titel: b.titel, href: `/projekte/${id}/posten/${postenSlug(b.schluessel)}/` })),
      };
    }),
  };
}

/** Namen der Leistungsgruppen (heute aus dem synthetischen Katalog, später aus dem LV). */
export function leistungsgruppen(): Record<string, string> {
  return LG_NAME;
}

/** Schlussbesprechungs-Blatt: Forderung und Untergrenze je Posten (nur Projekte mit Schlussrechnungs-Seite). */
export function projektBesprechung(id: string): Schlussbesprechung | null {
  if (!hatSchlussrechnung(id)) return null;
  const { d, e } = projekt(id);
  return schlussbesprechung(d, e.befunde);
}

/** Abrechnung einer gelegten und bezahlten Schlussrechnung (Projekte ohne Abgleich); sonst null. */
export function projektAbrechnung(id: string): Abrechnung | null {
  const { d, e } = projekt(id);
  return e.abgleich ? null : abrechnung(d);
}

/** Was die Excel-Datei einer Schlussrechnung braucht, fertig aus dem Rechenkern (der Browser ergänzt nur den Freigabestand). */
export interface ExcelDaten {
  projekt: { id: string; kurz: string; name: string; los: string; auftraggeber: string; legenBis: string | null };
  kaskade: { bezeichnung: string; satz: number | null; pruefung: string | null; betrag: number; belege: string }[];
  posten: { schluessel: string; liste: Liste; titel: string; art: string; betrag: number | null; rechenweg: string; quellen: string; href: string }[];
  besprechung: { gruppe: string; schluessel: string; titel: string; forderung: number; untergrenze: number; rechenweg: string }[];
  vorpruefung: { bezug: string; grund: string; was: string; abhilfe: string; betrag: number; bereitsGekuerzt: boolean }[];
  belege: { id: string; dateiname: string; art: string; datum: string; href: string }[];
  /** Summen aus dem Rechenkern, nie in der Datei gerechnet. */
  summen: { liste1: number; besprechung: { forderung: number; untergrenze: number; spielraum: number }; vorpruefung: number; synthetisch: boolean };
}

const GRUPPE_TEXT: Record<string, string> = { belegt: "Belegt", beleg_fehlt: "Beleg fehlt", angemeldet: "Angemeldet" };

export function excelDaten(id: string): ExcelDaten | null {
  if (!hatSchlussrechnung(id)) return null;
  const { d, e } = projekt(id);
  const s = schlussbesprechung(d, e.befunde);
  const ag = laden().f.auftraggeber.find((a) => a.id === d.projekt.auftraggeberId);
  const basis = `/projekte/${id}`;
  return {
    projekt: { id, kurz: d.projekt.kurz, name: d.projekt.name, los: d.projekt.los, auftraggeber: ag?.name ?? "", legenBis: d.projekt.schlussrechnungLegenBis },
    kaskade: (e.kaskade?.zeilen ?? []).map((z) => ({ bezeichnung: z.bezeichnung, satz: z.satz, pruefung: z.pruefung, betrag: z.betrag, belege: z.belege.map((b) => b.titel).join(", ") })),
    posten: e.befunde.map((b) => ({
      schluessel: b.schluessel,
      liste: b.liste,
      titel: b.titel,
      art: ART_TEXT[b.art],
      betrag: b.betrag,
      rechenweg: b.rechenweg?.text ?? "",
      quellen: (e.belegquellen[b.schluessel] ?? []).map((q) => BELEGQUELLE_TEXT[q]).join(", "),
      href: `${basis}/posten/${postenSlug(b.schluessel)}/`,
    })),
    besprechung: s.gruppen.flatMap((g) => g.posten.map((p) => ({ gruppe: GRUPPE_TEXT[g.stand], schluessel: p.schluessel, titel: p.titel, forderung: p.forderung, untergrenze: p.untergrenze, rechenweg: p.rechenweg }))),
    vorpruefung: (e.vorpruefung?.risiken ?? []).map((r) => ({ bezug: r.bezug, grund: KUERZUNGSGRUND_TEXT[r.grund], was: r.was, abhilfe: r.abhilfe, betrag: r.betrag, bereitsGekuerzt: r.bereitsGekuerzt })),
    belege: d.dokumente.map((x) => ({ id: x.id, dateiname: x.dateiname, art: x.art, datum: x.datum, href: `${basis}/belege/${x.id}/` })),
    summen: { liste1: e.summen.jetzt, besprechung: { forderung: s.forderung, untergrenze: s.untergrenze, spielraum: s.spielraum }, vorpruefung: e.vorpruefung?.summe ?? 0, synthetisch: laden().f.synthetisch },
  };
}
