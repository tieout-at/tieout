/**
 * View model of the project tab "Zeitstrahl" (SPEZIFIKATION.md 4.3, draft A "Zwei Bahnen" chosen by Maxi S. on
 * 26.10.2026): the core's `zeitstrahl` of one project with the finds each event proves, the rows of the picture and the
 * deadline. The amounts are the core's: printed on the invoices, or the amount of a find. Nothing is added up here.
 */

import { BELEGSTAND_TEXT, KUERZUNGSGRUND_TEXT, datumText, euro, zeitstrahl, type Belegstand, type Ereignisstand, type FirmenErgebnis } from "@tieout/kern";

import { findSlug, projectSlug } from "./example";
import { business, firm, nameAndFacts } from "./kern-data";

/** The rows of the picture: six of the site, five of the invoices; a row without any event is left out. */
export const TIMELINE_ROWS = [
  { id: "whatsapp", lane: "baustelle", title: "WhatsApp-Meldungen", arts: ["whatsapp"] },
  { id: "regie", lane: "baustelle", title: "Regieberichte", arts: ["regiebericht"] },
  { id: "email", lane: "baustelle", title: "E-Mails", arts: ["email"] },
  { id: "plan", lane: "baustelle", title: "Pläne", arts: ["plan"] },
  { id: "foto", lane: "baustelle", title: "Fotos", arts: ["foto", "fotodokumentation"] },
  { id: "aufmass", lane: "baustelle", title: "Aufmaßblätter", arts: ["aufmassblatt"] },
  { id: "rechnung", lane: "rechnung", title: "Rechnungen", arts: ["abschlagsrechnung", "schlussrechnung"] },
  { id: "nachtrag", lane: "rechnung", title: "Nachträge", arts: ["nachtrag"] },
  { id: "entwurf", lane: "rechnung", title: "Entwurf", arts: ["entwurf"] },
  { id: "zahlung", lane: "rechnung", title: "Zahlungen", arts: ["zahlungsavis"] },
  { id: "kuerzung", lane: "rechnung", title: "Kürzungen", arts: ["korrekturblatt", "abzugsschreiben"] },
] as const;

export type TimelineRowId = (typeof TIMELINE_ROWS)[number]["id"];

export type TimelineFind = { number: string; name: string; href: string; amount: string; belegstand: { state: Belegstand; text: string } | null; remedy: string | null };

export type TimelineEvent = {
  id: string;
  row: TimelineRowId;
  lane: "baustelle" | "rechnung";
  art: string;
  date: { iso: string; text: string };
  time: string | null;
  title: string;
  text: string;
  who: string | null;
  weak: string | null;
  /** A Kürzungsrisiko of the Vorprüfung that points to this Beleg ("Stunden weichen ab"); only while it threatens. */
  risk: string | null;
  positions: string[];
  stand: Ereignisstand | null;
  finds: string[];
  rechtsfrage: boolean;
  /** Lane "Rechnung": the amount printed on the document, with what it is ("bezahlt 153.473,61 €"). */
  amount: string | null;
  /** The same amount without the word, for the picture, where the row already says what it is. */
  short: string | null;
};

export type TimelineView = {
  /** Slug of the project, for its originals (`/originale/<projekt>.json`). */
  project: string;
  events: TimelineEvent[];
  finds: Record<string, TimelineFind>;
  counts: { site: number; missing: number; invoiced: number; next: number; withFind: number; findCount: number };
  /** First day of the first month and of the month after the last day shown. */
  range: { from: string; to: string };
  deadline: { iso: string; text: string } | null;
  /** false once the Schlussrechnung is submitted: no Abgleich, no states. */
  running: boolean;
  /** The day the twin was compared ("Stand"); the calendar's "today". */
  asOf: { iso: string; text: string };
  /** Where missing work belongs: the Schlussrechnung once its Entwurf is in the folder, else the next Abschlagsrechnung. */
  target: InvoiceTarget;
};

export type InvoiceTarget = "schlussrechnung" | "abschlagsrechnung";

/** A project whose own Entwurf of the Schlussrechnung is in the folder settles there; a running one in its next Abschlagsrechnung. */
export const invoiceTarget = (d: { entwurf: unknown }): InvoiceTarget => (d.entwurf ? "schlussrechnung" : "abschlagsrechnung");

/** The words for work that is done and missing, by where it belongs (never "Schlussrechnung" in a running project). */
export const MISSING_TEXT: Record<InvoiceTarget, string> = {
  schlussrechnung: "fehlt in der Schlussrechnung",
  abschlagsrechnung: "fehlt, gehört in die nächste Abschlagsrechnung",
};

// the word an amount carries in every list, so it never reads as the amount of the document title next to it
const AMOUNT_WORD: Partial<Record<string, string>> = { abschlagsrechnung: "verrechnet", schlussrechnung: "verrechnet", zahlungsavis: "bezahlt", korrekturblatt: "gekürzt", entwurf: "nicht gelegt" };

const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;
const nextMonth = (iso: string) => {
  const [y, m] = [Number(iso.slice(0, 4)), Number(iso.slice(5, 7))];
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
};

export function timelineView(projektId: string, b: FirmenErgebnis = business()): TimelineView | null {
  const d = firm().projekte.find((x) => x.projekt.id === projektId);
  const e = b.ergebnisse[projektId];
  if (!d || !e) return null;
  const z = zeitstrahl(d, e);
  const risk = new Map<string, string>();
  for (const r of e.vorpruefung?.risiken ?? []) if (r.zustand === "droht") for (const n of r.nachweise) if (!risk.has(n.quelle.belegId)) risk.set(n.quelle.belegId, KUERZUNGSGRUND_TEXT[r.grund]);
  const rowOf = (art: string) => TIMELINE_ROWS.find((r) => (r.arts as readonly string[]).includes(art))?.id;

  const events = z.ereignisse.flatMap((x): TimelineEvent[] => {
    const row = rowOf(x.art);
    if (!row) return [];
    const word = AMOUNT_WORD[x.art];
    return [
      {
        id: x.id,
        row,
        lane: x.bahn,
        art: x.art,
        date: { iso: x.datum, text: datumText(x.datum) },
        time: x.uhrzeit,
        title: x.titel,
        text: x.text,
        who: x.wer,
        weak: x.schwach,
        risk: x.bahn === "baustelle" ? (risk.get(x.id) ?? null) : null,
        positions: x.positionen,
        stand: x.stand,
        finds: x.funde,
        rechtsfrage: x.rechtsfrage,
        amount: x.betrag === null ? null : `${word ? `${word} ` : ""}${euro(x.betrag)}`,
        short: x.betrag === null ? null : euro(x.betrag),
      },
    ];
  });

  const finds = Object.fromEntries(
    e.abgleich.funde.map((f) => [
      f.nr,
      {
        number: f.nr,
        name: nameAndFacts(f).name,
        href: `/funde/${findSlug(d.projekt.name, f.nr)}/`,
        amount: euro(f.betrag),
        belegstand: f.belegstand ? { state: f.belegstand, text: BELEGSTAND_TEXT[f.belegstand] } : null,
        remedy: f.abhilfe,
      },
    ]),
  );

  const deadline = d.projekt.schlussrechnungLegenBis;
  const days = [...events.map((x) => x.date.iso), ...(deadline ? [deadline] : [])].sort();
  return {
    project: projectSlug(d.projekt.name),
    events,
    finds,
    counts: { site: z.zaehler.baustelle, missing: z.zaehler.fehlt, invoiced: z.zaehler.verrechnet, next: z.zaehler.naechste, withFind: z.zaehler.mitFund, findCount: e.abgleich.funde.length },
    range: { from: monthStart(days[0]), to: nextMonth(days.at(-1)!) },
    deadline: deadline ? { iso: deadline, text: datumText(deadline) } : null,
    running: e.abgleich.laeuft,
    asOf: { iso: b.stichtag, text: datumText(b.stichtag) },
    target: invoiceTarget(d),
  };
}
