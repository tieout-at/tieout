// Datenzugriff der App. Heute: der synthetische Firmenzwilling aus dem Generator, einmal gerechnet und beim Build
// vorberechnet. Später (Stufe 0) kommt hier die Datenbank pro Firma hin; die Bildschirme lesen nur diese Funktionen.

import "server-only";
import { notFound } from "next/navigation";
import { erzeugeFirma } from "@/demo/firma/erzeuge";
import { LG_NAME } from "@/demo/w21/katalog";
import type { Datensatz, Firmendaten, Kuerzungsgrund } from "@/domain/typen";
import { gleicherGrund, guHistorie, pruefeFirma, type Ampel, type Befund, type Ergebnis, type FirmenErgebnis, type GuHistorie, type Liste } from "@/engine";

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
 * den festen Schlüssel des Grunds. Die Adresse führt zum Korrekturblatt oder Zahlungsavis dort.
 */
export function schonBeiAuftraggeber(projektId: string, grund: Kuerzungsgrund): SchonBeiAuftraggeber[] {
  const { f, h } = laden();
  const d = f.projekte.find((p) => p.projekt.id === projektId);
  if (!d) return [];
  return gleicherGrund(h, d.projekt.auftraggeberId, grund, projektId).map((x) => ({ kurz: x.kurz, href: `/projekte/${x.projektId}/belege/${x.beleg.quelle.dokumentId}/#pos-${x.anker}` }));
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
