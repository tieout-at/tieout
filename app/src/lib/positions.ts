/**
 * Rows of the project tab "Positionen" (SPEZIFIKATION.md 2.3): the website table "Leistungen: beauftragt, erbracht,
 * verrechnet" for one project, one row per position of the Leistungsverzeichnis and one per service without a position,
 * with what is open, its Belegstand and find, and the Belegabdeckung of the row (which Beleg proves it, `kern/`
 * `belegabdeckung`). Every cell and amount is the core's; the footer sums are the core's `fusszeile`.
 */

import {
  BELEGSTAND_TEXT,
  NACHWEISART_SPALTE,
  NACHWEISART_TEXT,
  NACHWEISARTEN,
  belegabdeckung,
  euro,
  prozentText,
  type Belegstand,
  type FirmenErgebnis,
  type Nachweisart,
  type Positionszeile,
} from "@tieout/kern";

import { findSlug, projectSlug } from "./example";
import { business, firm, type Amount } from "./kern-data";
import type { Calculation, Row } from "./table";

/** Names of the Leistungsgruppen of an HKLS Leistungsverzeichnis, by their number. */
const LEISTUNGSGRUPPE: Record<string, string> = { "22": "Heizung", "24": "Sanitär", "26": "Lüftung", "28": "Mess-, Steuer- und Regeltechnik" };

const KIND: Record<Positionszeile["art"], string> = {
  position: "Position",
  regie: "Regiebericht",
  meldung: "WhatsApp-Meldung",
  aenderung: "Änderung",
  preisumrechnung: "Preisumrechnung",
  pauschale: "Pauschale",
};

export type CoverageItem = { belegId: string; title: string; date: string; weak: string | null };

export type PositionRow = Row & {
  /** Place in the Leistungsverzeichnis, then the services without a position. */
  order: number;
  /** "22.04.12B", or null for a service without a position. */
  number: string | null;
  /** Short text without the number ("Plattenheizkörper Typ 22 VK, 600/1000") or the service. */
  text: string;
  kind: string;
  /** "22 Heizung", or "Ohne Position". */
  group: string;
  unit: string | null;
  price: Amount | null;
  ordered: string;
  done: string;
  invoiced: string;
  /** Measured quantity as a number for sorting (hundredths), null without one. */
  doneValue: number | null;
  open: Amount | null;
  belegstand: { state: Belegstand; text: string } | null;
  find: { number: string; href: string } | null;
  /** Only exceptions: "über dem Leistungsverzeichnis, +16,3 %", "nicht aufgemessen", "nach der letzten Abschlagsrechnung". */
  note: string | null;
  /** Which Beleg proves the row, per kind of evidence (Belegabdeckung). */
  coverage: Record<Nachweisart, CoverageItem[]>;
};

export type PositionsView = {
  rows: PositionRow[];
  calculations: Record<"open" | "belegstand", Calculation[]>;
  /** How many rows have a Beleg of each kind. */
  perKind: Record<Nachweisart, number>;
};

export const COVERAGE_KINDS = NACHWEISARTEN.map((k) => ({ id: k, title: NACHWEISART_TEXT[k], column: NACHWEISART_SPALTE[k] }));

/** The tab "Positionen" of an open project; null for a closed project (no Abgleich, no table). */
export function positionsView(projektId: string, b: FirmenErgebnis = business()): PositionsView | null {
  const d = firm().projekte.find((x) => x.projekt.id === projektId);
  const e = b.ergebnisse[projektId];
  if (!d || !e?.abgleich.laeuft) return null;
  const abdeckung = new Map(belegabdeckung(d, e).zeilen.map((z) => [z.schluessel, z]));
  const fundJe = new Map(e.abgleich.funde.map((f) => [f.schluessel, f]));
  const mengenHinweis = new Map(e.abgleich.hinweise.filter((h) => h.art === "mengenaenderung_ueber_20" && h.positionNr).map((h) => [h.positionNr!, h.aenderung]));

  const rows = e.positionen.zeilen.map((z, order): PositionRow => {
    const fund = z.fundSchluessel ? fundJe.get(z.fundSchluessel) : undefined;
    // a find set to "Nicht verrechnen" counts in no sum
    const counts = fund && fund.entscheidung !== "nicht_verrechnen";
    const groups = counts && z.offen > 0 && z.belegstand ? [z.belegstand === "belegt" ? "zusaetzlich" : "klaerung"] : [];
    const lg = z.positionNr?.slice(0, 2);
    const ueber = z.beauftragt !== null && z.erbracht !== null && z.erbracht > z.beauftragt;
    const aenderung = z.positionNr ? mengenHinweis.get(z.positionNr) : undefined;
    const note =
      z.art === "position" && ueber
        ? `über dem Leistungsverzeichnis${aenderung ? `, +${prozentText(aenderung, 1)}` : ""}`
        : z.art === "position" && z.erbracht === 0 && z.einheit !== "psch"
          ? "nicht aufgemessen"
          : z.nachGrenze > 0
            ? "nach der letzten Abschlagsrechnung"
            : null;
    const cover = abdeckung.get(z.schluessel);
    return {
      id: `${projektId}/${z.schluessel}`,
      groups,
      order,
      number: z.positionNr,
      text: z.positionNr ? z.text.slice(z.positionNr.length + 1) : z.text,
      kind: KIND[z.art],
      group: lg ? `${lg} ${LEISTUNGSGRUPPE[lg] ?? "Leistungsgruppe"}` : "Ohne Position",
      unit: z.einheit,
      price: z.ep === null ? null : { cent: z.ep, text: euro(z.ep) },
      ordered: z.zellen.beauftragt,
      done: z.zellen.erbracht,
      invoiced: z.zellen.verrechnet,
      doneValue: z.erbracht,
      open: z.offen > 0 ? { cent: z.offen, text: euro(z.offen) } : null,
      belegstand: z.offen > 0 && z.belegstand ? { state: z.belegstand, text: BELEGSTAND_TEXT[z.belegstand] } : null,
      find: fund ? { number: fund.nr, href: `/funde/${findSlug(d.projekt.name, fund.nr)}/` } : null,
      note,
      coverage: Object.fromEntries(
        NACHWEISARTEN.map((k) => [k, (cover?.belege[k] ?? []).map((x) => ({ belegId: x.belegId, title: x.titel, date: x.datum, weak: x.schwach }))]),
      ) as Record<Nachweisart, CoverageItem[]>,
    };
  });

  const ids = (group: string) => rows.filter((r) => r.groups.includes(group)).map((r) => r.id);
  const s = e.abgleich.summen;
  const extra: Calculation = { id: "zusaetzlich", title: "zusätzlich verrechenbar", sums: [{ group: "zusaetzlich", ids: ids("zusaetzlich"), text: euro(s.zusaetzlichVerrechenbar) }] };
  const unclear: Calculation = { id: "klaerung", title: "in Klärung", sums: [{ group: "klaerung", ids: ids("klaerung"), text: euro(s.inKlaerung) }] };
  const counted = Object.fromEntries(NACHWEISARTEN.map((k) => [k, rows.filter((r) => r.coverage[k].length).length])) as Record<Nachweisart, number>;
  return { rows, calculations: { open: [extra, unclear], belegstand: [unclear] }, perKind: counted };
}

/** Slugs of the projects whose tab "Positionen" has a table. */
export const positionProjects = (b: FirmenErgebnis = business()) => b.projekte.filter((p) => b.ergebnisse[p.projektId].abgleich.laeuft).map((p) => projectSlug(p.name));
