/**
 * The export of the tab "Schlussrechnung" for the Rechnungsprogramm (step 8e): one Excel file with four sheets, the
 * Änderungsliste to type in, the Rechnungsabschluss down to the Restforderung both ways, and the Vorprüfung and the
 * Schlussbesprechung marked internal. The whole file is the business's own (it holds the Vorprüfung and the Untergrenzen), so
 * every sheet and the file name say "intern"; for the Auftraggeber are the Beweispakete. Every amount is the core's, taken from the same view the page shows (with the
 * decisions of this browser); the export adds none and writes amounts as numbers in euro. Until every find is decided,
 * every sheet and the file name say "Entwurf" (SPEZIFIKATION.md 5.1).
 */

import { DECISION_TEXT } from "./decisions";
import { projectSlug } from "./example";
import type { InvoiceView, SettlementLine } from "./invoice";
import type { Amount } from "./kern-data";
import { xlsx, type Cell, type Sheet } from "./xlsx";

const eur = (a: Amount): Cell => ({ value: a.cent / 100, style: "euro" });
const eurBold = (a: Amount): Cell => ({ value: a.cent / 100, style: "euroBold" });
const head = (...titles: string[]): Cell[] => titles.map((t) => ({ value: t, style: "head" }));
const bold = (text: string): Cell => ({ value: text, style: "bold" });
const muted = (text: string): Cell => ({ value: text, style: "muted" });

/** "3 von 8 Funden entschieden" and whether the file is still an Entwurf. */
export function exportState(v: InvoiceView): { draft: boolean; text: string } {
  const decided = v.status.finds - v.status.open;
  return v.status.final
    ? { draft: false, text: `Alle ${v.status.finds} Funde entschieden` }
    : { draft: true, text: `Entwurf, nicht freigegeben: ${decided} von ${v.status.finds} Funden entschieden` };
}

/** The lines every sheet starts with: what it is, for whom, from when, and whether it is final. */
function top(v: InvoiceView, title: string, internal: boolean): Cell[][] {
  const state = exportState(v);
  // one cell per line, so the text runs on over the empty cells to its right whatever the first column's width
  return [
    [{ value: `${v.project.name}: ${title}`, style: "title" }],
    [`Auftraggeber: ${v.project.client.name}`],
    [`Stand: ${v.project.asOf.text}`],
    [{ value: state.text, style: state.draft ? "draft" : "bold" }],
    [{ value: internal ? `Nur intern, nicht für ${v.project.client.name}: mit Kalkulation und Untergrenzen` : `Intern, für Ihr Rechnungsprogramm. Für ${v.project.client.name} sind die Beweispakete.`, style: "draft" }],
    [muted("Synthetische Beispieldaten, keine echten Kundendaten")],
    [],
  ];
}

function changeSheet(v: InvoiceView, origin: string): Sheet {
  const rows: Cell[][] = [...top(v, "Änderungsliste", false)];
  rows.push(head("Fund", "Worum es geht", "Position", "Kurztext", "Menge", "Einheit", "Einheitspreis", "Betrag", "Entscheidung", "Beweispaket"));
  for (const c of v.changes.entries)
    for (const i of c.items)
      rows.push([
        c.find.number,
        c.find.name,
        i.position,
        i.text,
        i.count === null ? null : { value: i.count, style: "count" },
        i.unit,
        i.price ? eur(i.price) : null,
        eur(i.amount),
        DECISION_TEXT[c.find.decision],
        { link: origin + c.find.packageHref, text: `Beweispaket ${c.find.number}` },
      ]);
  rows.push([bold("zusätzlich verrechenbar"), null, null, null, null, null, null, eurBold(v.changes.total)]);
  rows.push([muted("Neue Positionen für Ihr Rechnungsprogramm. Sie tragen sie selbst ein; tieout schreibt keine zweite Rechnung. Alle Beträge netto.")]);
  if (v.pending.length) {
    rows.push([], [{ value: "In Klärung, nicht übernehmen", style: "draft" }]);
    rows.push(head("Fund", "Worum es geht", "Belegstand", "Was fehlt", "", "", "", "Betrag", "Entscheidung", "Fund in tieout"));
    for (const x of v.pending)
      rows.push([x.find.number, x.find.name, x.stand, x.remedy, null, null, null, eur(x.amount), DECISION_TEXT[x.find.decision], { link: origin + x.find.href, text: `Fund ${x.find.number}` }]);
    rows.push([bold("in Klärung, nicht addiert"), null, null, null, null, null, null, eurBold(v.pendingTotal)]);
    rows.push([muted("Nie zu zusätzlich verrechenbar addiert. Kommt erst mit dem fehlenden Beleg oder Nachtrag in die Änderungsliste.")]);
  }
  return { name: "Änderungsliste", widths: [7, 50, 22, 50, 9, 8, 14, 14, 20, 18], rows };
}

function settlementRows(lines: SettlementLine[]): Cell[][] {
  return lines.map((l) => {
    const strong = l.kind === "summe" || l.kind === "ergebnis";
    const label = l.find ? `${l.find.number} ${l.label}` : l.label;
    return [strong ? bold(label) : label, l.share === null ? null : { value: l.share, style: "percent" }, strong ? eurBold(l.amount) : eur(l.amount), l.check?.text ?? null];
  });
}

function settlementSheet(v: InvoiceView): Sheet {
  const s = v.settlement;
  const rows: Cell[][] = [...top(v, "Rechnungsabschluss", false)];
  rows.push([bold("Wie angekündigt")], head("Bezeichnung", "Satz", "Betrag", "Prüfung"), ...settlementRows(s.lines));
  rows.push([], [bold("Laut Vertrag")], head("Bezeichnung", "Satz", "Betrag", "Prüfung"), ...settlementRows(s.contract.lines));
  if (s.contract.difference.length) rows.push([muted(`Laut Vertrag entfällt: ${s.contract.difference.map((l) => l.label).join(", ")} (Abzug ohne Vertragspunkt). Ob Sie widersprechen, entscheiden Sie.`)]);
  rows.push([], [bold("Abschlagsrechnungen")], head("Rechnung", "vom", "Betrag", "Kürzung", "Bezahlt", "bezahlt am", "nachgerechnet"));
  for (const p of s.payments) rows.push([p.invoice, p.date, eur(p.amount), eur(p.cut), eur(p.paid), p.paidOn, p.ok ? "stimmt" : "weicht vom Zahlungsavis ab"]);
  if (s.withheld.length) {
    rows.push([], [bold("Davon schon einbehalten, ohne Vertragspunkt")], head("Art", "", "Betrag", "Rechnungen"));
    for (const w of s.withheld) rows.push([w.kind, null, eur(w.amount), w.invoices]);
  }
  rows.push([], [muted(`So rechnet ${v.project.client.name} voraussichtlich ab. Nachlass und Abzüge auf die Gesamtleistung. Alle Beträge netto.`)]);
  return { name: "Rechnungsabschluss", widths: [60, 12, 16, 26, 16, 12, 14], rows };
}

function checkSheet(v: InvoiceView, origin: string): Sheet {
  const c = v.check;
  const rows: Cell[][] = [...top(v, "Vorprüfung", true)];
  rows.push(head("Nr.", "Kürzungsgrund", "Bezug", "Was", "Abhilfe", "Betrag", "Zustand", "Fund in tieout"));
  for (const r of c.risks)
    rows.push([r.number, { value: r.reason, style: "wrap" }, r.about, { value: r.what, style: "wrap" }, { value: r.remedy, style: "wrap" }, eur(r.amount), r.alreadyCut ? "schon gekürzt" : "Kürzung droht", r.find ? { link: origin + r.find.href, text: `Fund ${r.find.number}` } : null]);
  rows.push([bold("Vorprüfung"), null, null, null, null, eurBold(c.total)]);
  rows.push(["davon Kürzung droht", null, null, null, null, eur(c.threatened)]);
  rows.push(["davon schon gekürzt", null, null, null, null, eur(c.alreadyCut)]);
  rows.push([], [muted("Prüft den Entwurf so, wie es die Software eines Generalunternehmers tun wird. Überschneidet sich mit zusätzlich verrechenbar und wird nie dazugezählt.")]);
  return { name: "Vorprüfung (intern)", widths: [6, 34, 24, 44, 50, 14, 15, 16], rows };
}

function meetingSheet(v: InvoiceView): Sheet {
  const m = v.meeting;
  const rows: Cell[][] = [...top(v, "Schlussbesprechung", true)];
  rows.push(head("Fund", "Worum es geht", "Forderung", "Untergrenze", "Spielraum", "Rechenweg"));
  for (const g of m.groups) {
    rows.push([bold(g.label)]);
    for (const i of g.items) rows.push([i.find.number, i.find.name, eur(i.claim), eur(i.floor), null, { value: i.how, style: "wrap" }]);
    rows.push([muted(`Summe ${g.label}`), null, eurBold(g.claim), eurBold(g.floor), eurBold(g.room)]);
  }
  rows.push([], [bold("Zusammen mit in Klärung"), null, eurBold(m.claim), eurBold(m.floor), eurBold(m.room)]);
  rows.push([muted("Nur für das Gespräch, nicht für die Rechnung: Was in Klärung ist, kommt erst mit dem fehlenden Beleg oder Nachtrag dazu.")]);
  rows.push([muted("Untergrenze: Stunden zu Mittellohnkosten und Material zum Einstandspreis, Mehrmengen zum Einheitspreis des Vertrags (Annahme der Beispieldaten).")]);
  for (const n of v.notes) rows.push([{ value: `Rechtsfrage für die Geschäftsführung: ${n.text}`, style: "muted" }]);
  return { name: "Schlussbesprechung (intern)", widths: [7, 60, 15, 15, 15, 50], rows };
}

/** The four sheets of the export; `origin` makes the links to the Beweispakete and finds absolute. */
export function invoiceSheets(v: InvoiceView, origin: string): Sheet[] {
  return [changeSheet(v, origin), settlementSheet(v), checkSheet(v, origin), meetingSheet(v)];
}

/** "Schlussrechnung_wohnpark-mooshaim_2026-10-22_Entwurf_intern.xlsx"; without "Entwurf" once every find is decided. */
export function exportFileName(v: InvoiceView): string {
  return `Schlussrechnung_${projectSlug(v.project.name)}_${v.project.asOf.iso}${exportState(v).draft ? "_Entwurf" : ""}_intern.xlsx`;
}

/** Builds the file and hands it to the browser as a download. */
export function downloadInvoice(v: InvoiceView): void {
  const bytes = xlsx(invoiceSheets(v, window.location.origin), `${v.project.name}, Schlussrechnung`);
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFileName(v);
  document.body.append(a);
  a.click();
  a.remove();
  // long enough for the save question of Safari on iPhones
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
