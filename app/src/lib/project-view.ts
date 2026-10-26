/**
 * A project's "Überblick" (step 8d): the facts in one line, the figures for the rings, the finds with their place in
 * the building, the dates of the Bauzeit and the Verlauf. Every amount is a fixed figure of the core; the parts of a
 * ring are the core's own parts (the cut by reason), so no sum is made here.
 */

import { ABZUG_TEXT, datumText, euro, KUERZUNGSGRUND_TEXT, type FirmenErgebnis } from "@tieout/kern";

import { buildingModel, placeOf, type BuildingModel, type FindPlace } from "./building";
import { business, findRows, firm, type Amount, type FindRow } from "./kern-data";
import { projectRecord, type ActivityEntry, type Attribute } from "./records";

export type Mark = { iso: string; text: string; label: string };

export type OverviewFind = FindRow & { place: FindPlace | null };

export type ProjectOverview = {
  id: string;
  slug: string;
  name: string;
  /** Auftragssumme, Leistung and Vertrag for the one quiet line; every Angabe for the window. */
  facts: { label: string; value: string }[];
  attributes: Attribute[];
  /** The core compares this project (in Ausführung or Schlussrechnung vorbereiten). */
  open: boolean;
  /** A closed project: what was cut (by reason), the Schlusszahlung and the Haftrücklass kept. */
  closing: {
    cut: Amount;
    invoice: Amount;
    reasons: { id: string; label: string; amount: Amount }[];
    deductions: { id: string; label: string; amount: Amount }[];
    final: Amount;
    days: number;
    kept: Amount;
  } | null;
  /** The Restforderung of the own Entwurf and the same "laut Vertrag" (E14), explained step by step on the tab Schlussrechnung; null without an Entwurf. */
  rest: { announced: Amount; contract: Amount } | null;
  finds: OverviewFind[];
  building: BuildingModel | null;
  time: { start: Mark | null; end: Mark | null; invoices: Mark[]; draft: Mark | null; deadline: Mark | null; submitted: Mark | null; paid: Mark | null; asOf: Mark };
  activity: ActivityEntry[];
};

const amount = (cent: number): Amount => ({ cent, text: euro(cent) });
const mark = (iso: string, label: string): Mark => ({ iso, text: datumText(iso), label });

export function projectOverview(projektId: string, b: FirmenErgebnis = business()): ProjectOverview {
  const d = firm().projekte.find((x) => x.projekt.id === projektId);
  if (!d) throw new Error(`Unknown project ${projektId}`);
  const record = projectRecord(projektId);
  const e = b.ergebnisse[projektId];
  const rows = findRows(b).filter((r) => r.id.startsWith(`${projektId}/`));
  const finds: OverviewFind[] = rows.map((r) => {
    const f = e.abgleich.funde.find((x) => `${projektId}/${x.schluessel}` === r.id)!;
    return { ...r, place: placeOf(d, f) };
  });
  const ab = b.abrechnungen[projektId];
  const h = b.historie.find((x) => x.kuerzungen.some((k) => k.projektId === projektId) || x.abzuege.some((a) => a.projektId === projektId));
  const pick = (label: string) => record.attributes.find((a) => a.label === label);
  const vertrag = pick("Vertrag");
  const p = d.projekt;
  return {
    id: projektId,
    slug: record.slug,
    name: record.name,
    facts: [
      ...(pick("Auftragssumme") ? [{ label: "Auftragssumme", value: pick("Auftragssumme")!.value }] : []),
      ...(pick("Leistung") ? [{ label: "Leistung", value: pick("Leistung")!.value }] : []),
      ...(vertrag ? [{ label: "Vertrag", value: `${vertrag.value}${vertrag.detail ? `, ${vertrag.detail}` : ""}` }] : []),
    ],
    attributes: record.attributes,
    open: e.abgleich.laeuft,
    closing:
      !e.abgleich.laeuft && ab
        ? {
            cut: amount(ab.gekuerzt),
            invoice: amount(ab.zeilen.find((z) => z.art === "rechnung")!.betrag),
            reasons: (h?.kuerzungen ?? []).filter((k) => k.projektId === projektId).map((k, i) => ({ id: `k${i}`, label: KUERZUNGSGRUND_TEXT[k.grund], amount: amount(k.betrag) })),
            deductions: (h?.abzuege ?? []).filter((a) => a.projektId === projektId).map((a, i) => ({ id: `a${i}`, label: ABZUG_TEXT[a.art], amount: amount(a.betrag) })),
            final: amount(ab.schlusszahlung.betrag),
            days: ab.schlusszahlung.tage,
            kept: amount(ab.einbehalten),
          }
        : null,
    rest: e.rechnungsabschluss ? { announced: amount(e.rechnungsabschluss.restforderung), contract: amount(e.rechnungsabschluss.lautVertrag.restforderung) } : null,
    finds,
    building: buildingModel(
      d,
      finds.map((f) => f.place).filter((x): x is FindPlace => x !== null),
    ),
    time: {
      start: p.bauzeit ? mark(p.bauzeit.von, "Baubeginn") : mark(d.vertrag.datum.wert, "Bauvertrag"),
      end: p.bauzeit ? mark(p.bauzeit.bis, "Bauende") : null,
      invoices: d.abschlaege.map((a) => mark(a.datum.wert, a.nr.wert)),
      draft: d.entwurf ? mark(d.entwurf.datum.wert, "Entwurf der Schlussrechnung") : null,
      deadline: p.schlussrechnungLegenBis ? mark(p.schlussrechnungLegenBis, "Schlussrechnung legen bis") : null,
      submitted: d.schlussrechnung ? mark(d.schlussrechnung.datum.wert, "Schlussrechnung gelegt") : null,
      paid: p.schlusszahlung ? mark(p.schlusszahlung, "Schlusszahlung") : null,
      asOf: mark(b.stichtag, "Stand"),
    },
    activity: record.activity,
  };
}
