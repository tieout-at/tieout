/**
 * The project tab "Schlussrechnung" (SPEZIFIKATION.md 3.3, 3.4, 4.3 and 5.1): Änderungsliste, Rechnungsabschluss down to
 * the Restforderung with "Restforderung laut Vertrag" next to it (E14), Vorprüfung and Schlussbesprechungs-Blatt. All of
 * it is the core's result for the project's own Entwurf; the app adds no amount. Built with the page and computed again
 * in the browser after a decision there (`kern-live.ts`), so a "Nicht verrechnen" takes its line out at once.
 */

import {
  ABZUG_TEXT,
  BELEGSTAND_TEXT,
  datumText,
  euro,
  KUERZUNGSGRUND_TEXT,
  menge,
  prozentText,
  type Belegstand,
  type Einheit,
  type Entscheidungsstand,
  type FirmenErgebnis,
  type Fund,
  type LueckenArt,
  type LueckenWirkung,
  type Satzpruefung,
} from "@tieout/kern";

import { findSlug, projectSlug } from "./example";
import { business, clientSlug, nameAndFacts, type Amount, type Dated } from "./kern-data";

export type InvoiceFind = {
  number: string;
  name: string;
  href: string;
  /** The Beweispaket of the find, a page made for printing. */
  packageHref: string;
  /** Business key of the find ("p1/plan:H-201:D") and the keys its work had before. */
  key: string;
  earlierKeys: string[];
  decision: Entscheidungsstand;
  amount: Amount;
};

/** A sheet of a Beleg: the place of a signature, or what goes along with it. */
export type GapSheet = { belegId: string; page: number; place: string; title: string };

/**
 * A gap as the window "Lücke schließen" and the Mappe show it: what is missing, what closing it does, who signs, and the
 * entry that closed it. From `luecken` of the core; no amount of the app.
 */
export type Gap = {
  key: string;
  kind: LueckenArt;
  title: string;
  about: string;
  amount: Amount;
  effect: LueckenWirkung;
  remedy: string;
  inCharge: "Abrechnung" | "Bauleitung";
  sheet: GapSheet | null;
  signer: string | null;
  enclosures: GapSheet[];
  folder: boolean;
  closable: boolean;
  template: { message: string; day: string; place: string; work: string; orderedBy: string | null; fitter: string; helper: string } | null;
  /** Part of a sum that lies on more sheets. */
  partial: boolean;
  closed: { who: string; at: string; when: string; day: string; file: string | null } | null;
  /** Business key of the risk in the Vorprüfung, and of the find with the earlier keys of its work. */
  riskKey: string | null;
  find: { number: string; name: string; href: string; key: string; earlierKeys: string[] } | null;
  /** Page the task opens: the find, or the Vorprüfung of the project. */
  href: string;
  project: { id: string; name: string; slug: string; client: string; folderHref: string; deadline: string | null };
};

export type ChangeEntry = {
  find: InvoiceFind;
  /** One entry per position the find adds, or one for Regie and other finds without a position. */
  items: { position: string; text: string; quantity: string | null; count: number | null; unit: string | null; price: Amount | null; amount: Amount }[];
  amount: Amount;
  /** The Vorprüfung line in this find ("droht"), named next to it. */
  risk: { number: string; reason: string; amount: Amount } | null;
};

export type SettlementLine = {
  label: string;
  kind: "summe" | "fund" | "abzug" | "zahlung" | "ergebnis";
  amount: Amount;
  rate: string | null;
  /** The rate as a share (3 % is 0.03), for the export. */
  share: number | null;
  /** "laut Vertrag", "weicht vom Vertrag ab" or "Abzug ohne Vertragspunkt", with the Vertragspunkt. */
  check: { state: Satzpruefung["pruefung"]; text: string } | null;
  find: InvoiceFind | null;
};

export type InvoiceView = {
  project: { id: string; slug: string; name: string; href: string; packagesHref: string; folderHref: string; client: { name: string; href: string }; deadline: string | null; asOf: Dated };
  /** "Entwurf, nicht freigegeben" until every find is decided (SPEZIFIKATION.md 5.1). */
  status: { finds: number; open: number; released: number; inInvoice: number; final: boolean; all: InvoiceFind[] };
  changes: { entries: ChangeEntry[]; total: Amount; risk: Amount };
  /** Finds in Klärung: not in the Änderungsliste until the gap is closed. */
  pending: { find: InvoiceFind; stand: string; amount: Amount; remedy: string | null }[];
  pendingTotal: Amount;
  settlement: {
    lines: SettlementLine[];
    restforderung: Amount;
    contract: { restforderung: Amount; difference: SettlementLine[]; lines: SettlementLine[] };
    payments: { invoice: string; date: string; amount: Amount; cut: Amount; paid: Amount; paidOn: string; ok: boolean }[];
    /** Rates without a contract item the Auftraggeber already withheld on the Abschlagsrechnungen (history of the core). */
    withheld: { kind: string; invoices: string; amount: Amount }[];
  };
  check: {
    total: Amount;
    threatened: Amount;
    alreadyCut: Amount;
    risks: { key: string; number: string; reason: string; about: string; what: string; detail: string; remedy: string; amount: Amount; alreadyCut: boolean; find: InvoiceFind | null }[];
  };
  /** What can be closed, closed ones included. */
  gaps: Gap[];
  meeting: {
    groups: { stand: Belegstand; label: string; items: { find: InvoiceFind; claim: Amount; floor: Amount; how: string }[]; claim: Amount; floor: Amount; room: Amount }[];
    claim: Amount;
    floor: Amount;
    room: Amount;
  };
  notes: { title: string; text: string }[];
};

const amount = (cent: number): Amount => ({ cent, text: euro(cent) });

const CHECK_TEXT: Record<Satzpruefung["pruefung"], string> = {
  laut_vertrag: "Vertragspunkt",
  abweichung: "weicht ab, Vertragspunkt",
  abzug_ohne_vertragspunkt: "Abzug ohne Vertragspunkt",
};

/** The projects whose own Entwurf the core has, in the order of the business; only these have the tab filled. */
export function invoiceProjects(b: FirmenErgebnis = business()): string[] {
  return b.projekte.filter((p) => b.ergebnisse[p.projektId].rechnungsabschluss !== null).map((p) => p.projektId);
}

export function invoiceView(projektId: string, b: FirmenErgebnis = business()): InvoiceView | null {
  const p = b.projekte.find((x) => x.projektId === projektId);
  const e = b.ergebnisse[projektId];
  if (!p || !e.rechnungsabschluss || !e.vorpruefung || !e.schlussbesprechung) return null;
  const ra = e.rechnungsabschluss;
  const vp = e.vorpruefung;
  const sb = e.schlussbesprechung;
  const funde = e.abgleich.funde;
  const bySchluessel = new Map(funde.map((f) => [f.schluessel, f]));

  const link = (f: Fund): InvoiceFind => ({
    number: f.nr,
    name: nameAndFacts(f).name,
    href: `/funde/${findSlug(p.name, f.nr)}/`,
    packageHref: `/funde/${findSlug(p.name, f.nr)}/beweispaket/`,
    key: `${projektId}/${f.schluessel}`,
    earlierKeys: f.fruehereSchluessel.map((k) => `${projektId}/${k}`),
    decision: f.entscheidung,
    amount: amount(f.betrag),
  });
  const linkOf = (schluessel: string | null | undefined) => {
    const f = schluessel ? bySchluessel.get(schluessel) : undefined;
    return f ? link(f) : null;
  };
  const counts = (f: Fund) => f.entscheidung !== "nicht_verrechnen";

  const entries: ChangeEntry[] = funde
    .filter((f) => f.belegstand === "belegt" && counts(f))
    .map((f) => {
      const risk = vp.risiken.find((r) => r.fundSchluessel === f.schluessel && r.zustand === "droht");
      return {
        find: link(f),
        items: f.positionen.length
          ? f.positionen.map((x) => ({
              position: x.positionNr,
              text: x.kurztext,
              quantity: menge(x.differenz, x.einheit as Einheit),
              count: x.differenz / 100,
              unit: x.einheit,
              price: amount(x.ep),
              amount: amount(x.betrag),
            }))
          : [{ position: f.titel.split(",")[0], text: f.rechenweg.text, quantity: null, count: null, unit: null, price: null, amount: amount(f.betrag) }],
        amount: amount(f.betrag),
        risk: risk ? { number: risk.nr, reason: KUERZUNGSGRUND_TEXT[risk.grund], amount: amount(risk.betrag) } : null,
      };
    });

  const line = (z: (typeof ra.zeilen)[number]): SettlementLine => ({
    label: z.art === "fund" ? (linkOf(z.fundSchluessel)?.name ?? z.bezeichnung) : z.bezeichnung,
    kind: z.art,
    amount: amount(z.betrag),
    rate: z.satz === null ? null : prozentText(z.satz, 1),
    share: z.satz === null ? null : z.satz / 10_000,
    check: z.pruefung ? { state: z.pruefung, text: z.vertragspunkt ? `${CHECK_TEXT[z.pruefung]} ${z.vertragspunkt}` : CHECK_TEXT[z.pruefung] } : null,
    find: linkOf(z.fundSchluessel),
  });
  const lines = ra.zeilen.map(line);
  const contractLines = ra.lautVertrag.zeilen.map(line);

  const decided = funde.filter((f) => f.entscheidung !== "gefunden" && f.entscheidung !== "geprueft").length;

  return {
    project: {
      id: projektId,
      slug: projectSlug(p.name),
      name: p.name,
      href: `/projekte/${projectSlug(p.name)}/`,
      packagesHref: `/schlussrechnungen/${projectSlug(p.name)}/beweispakete/`,
      folderHref: `/schlussrechnungen/${projectSlug(p.name)}/mappe/`,
      client: { name: p.auftraggeber.name, href: `/auftraggeber/${clientSlug(p.auftraggeber.kurzname)}/` },
      deadline: p.datum?.art === "legen_bis" ? `Schlussrechnung legen bis ${datumText(p.datum.wert)}` : null,
      asOf: { iso: b.stichtag, text: datumText(b.stichtag) },
    },
    status: {
      finds: funde.length,
      open: funde.length - decided,
      released: funde.filter((f) => f.entscheidung === "freigegeben").length,
      inInvoice: funde.filter((f) => f.entscheidung === "in_schlussrechnung").length,
      final: decided === funde.length,
      all: funde.map(link),
    },
    changes: { entries, total: amount(e.abgleich.summen.zusaetzlichVerrechenbar), risk: amount(vp.davonMitKuerzungsrisiko) },
    pending: funde
      .filter((f) => f.belegstand !== null && f.belegstand !== "belegt" && counts(f))
      .map((f) => ({ find: link(f), stand: BELEGSTAND_TEXT[f.belegstand!], amount: amount(f.betrag), remedy: f.abhilfe })),
    pendingTotal: amount(e.abgleich.summen.inKlaerung),
    settlement: {
      lines,
      restforderung: amount(ra.restforderung),
      contract: {
        restforderung: amount(ra.lautVertrag.restforderung),
        lines: contractLines,
        // what "laut Vertrag" leaves out: the deductions without a contract item
        difference: lines.filter((l) => l.check?.state === "abzug_ohne_vertragspunkt" && !contractLines.some((c) => c.label === l.label && c.kind === l.kind)),
      },
      withheld: b.historie.flatMap((h) => h.abzuege.filter((a) => a.projektId === projektId).map((a) => ({ kind: ABZUG_TEXT[a.art], invoices: a.rechnungen.join(", "), amount: amount(a.betrag) }))),
      payments: ra.abschlaege.map((a) => ({
        invoice: a.rechnungNr,
        date: datumText(a.datum),
        amount: amount(a.betrag),
        cut: amount(a.kuerzung),
        paid: amount(a.bezahlt),
        paidOn: datumText(a.bezahltAm),
        ok: a.stimmt,
      })),
    },
    check: {
      total: amount(vp.summe),
      threatened: amount(vp.droht),
      alreadyCut: amount(vp.schonGekuerzt),
      risks: vp.risiken.map((r) => ({
        key: r.schluessel,
        number: r.nr,
        reason: KUERZUNGSGRUND_TEXT[r.grund],
        about: r.bezug,
        what: r.was,
        detail: r.detail,
        remedy: r.abhilfe,
        amount: amount(r.betrag),
        alreadyCut: r.zustand === "schon_gekuerzt",
        find: linkOf(r.fundSchluessel),
      })),
    },
    meeting: {
      groups: sb.gruppen.map((g) => ({
        stand: g.belegstand,
        label: BELEGSTAND_TEXT[g.belegstand],
        items: g.posten.flatMap((x) => {
          const f = linkOf(x.fundSchluessel);
          return f ? [{ find: f, claim: amount(x.forderung), floor: amount(x.untergrenze), how: x.rechenweg }] : [];
        }),
        claim: amount(g.forderung),
        floor: amount(g.untergrenze),
        room: amount(g.spielraum),
      })),
      claim: amount(sb.forderung),
      floor: amount(sb.untergrenze),
      room: amount(sb.spielraum),
    },
    gaps: gapsView(projektId, b),
    notes: e.abgleich.hinweise.filter((h) => h.art === "rechtsfrage").map((h) => ({ title: h.titel, text: h.text })),
  };
}

/** The gaps of one project, as the core lists them; an empty list for a project without any or an unknown id. */
export function gapsView(projektId: string, b: FirmenErgebnis = business()): Gap[] {
  const p = b.projekte.find((x) => x.projektId === projektId);
  if (!p) return [];
  const e = b.ergebnisse[projektId];
  const slug = projectSlug(p.name);
  // a Regiebericht made from a WhatsApp-Meldung has a new key: the find is still the same work
  const findOf = (schluessel: string | null) => (schluessel ? e.abgleich.funde.find((f) => f.schluessel === schluessel || f.fruehereSchluessel.includes(schluessel)) : undefined);
  return e.luecken.map((l): Gap => {
    const f = findOf(l.fundSchluessel);
    const href = f ? `/funde/${findSlug(p.name, f.nr)}/` : `/projekte/${slug}/schlussrechnung/#vorpruefung`;
    const sheet = (s: (typeof l.beilagen)[number]): GapSheet => ({ belegId: s.belegId, page: s.seite, place: s.stelle, title: s.titel });
    return {
      key: `${projektId}/${l.schluessel}`,
      kind: l.art,
      title: l.titel,
      about: l.bezug,
      amount: amount(l.betrag),
      effect: l.wirkung,
      remedy: l.abhilfe,
      inCharge: l.zustaendig,
      sheet: l.blatt ? sheet(l.blatt) : null,
      signer: l.unterschreibt,
      enclosures: l.beilagen.map(sheet),
      folder: l.mappe,
      closable: l.schliessbar,
      template: l.vorlage && { message: l.vorlage.meldung, day: datumText(l.vorlage.arbeitstag), place: l.vorlage.ort, work: l.vorlage.taetigkeit, orderedBy: l.vorlage.angeordnet, fitter: menge(l.vorlage.monteur), helper: menge(l.vorlage.helfer) },
      partial: l.teil,
      closed: l.eingang && { who: l.eingang.wer, at: l.eingang.zeit, day: datumText(l.eingang.am ?? l.eingang.zeit.slice(0, 10)), when: `${datumText(l.eingang.zeit.slice(0, 10))}, ${l.eingang.zeit.slice(11, 16)}`, file: l.eingang.dateiId ?? null },
      riskKey: l.risikoSchluessel,
      find: f ? { number: f.nr, name: nameAndFacts(f).name, href, key: `${projektId}/${f.schluessel}`, earlierKeys: f.fruehereSchluessel.map((k) => `${projektId}/${k}`) } : null,
      href,
      project: { id: projektId, name: p.name, slug, client: p.auftraggeber.name, folderHref: `/schlussrechnungen/${slug}/mappe/`, deadline: p.datum?.art === "legen_bis" ? `Schlussrechnung legen bis ${datumText(p.datum.wert)}` : null },
    };
  });
}

/** The open projects, each with a page "Mappe", the ones without an open signature too (they say so). */
export function folderProjects(b: FirmenErgebnis = business()): string[] {
  return b.projekte.filter((p) => b.ergebnisse[p.projektId].abgleich.laeuft).map((p) => p.projektId);
}


export type InvoiceListRow = {
  id: string;
  name: string;
  /** The tab "Schlussrechnung" of the project. */
  href: string;
  client: string;
  state: string;
  date: string | null;
  /** Restforderung of the own Entwurf, or the Schlusszahlung of a closed project, with what it is. */
  figure: { label: string; amount: Amount } | null;
  cut: Amount | null;
};

/** "Schlussrechnungen" of the business: per project where its Schlussrechnung stands, with the core's figure for it. */
export function invoiceList(b: FirmenErgebnis = business()): InvoiceListRow[] {
  return b.projekte.map((p) => {
    const e = b.ergebnisse[p.projektId];
    const ab = b.abrechnungen[p.projektId];
    const href = `/projekte/${projectSlug(p.name)}/schlussrechnung/`;
    const base = { id: p.projektId, name: p.name, href, client: p.auftraggeber.kurzname, date: p.datum ? datumText(p.datum.wert) : null };
    if (e.rechnungsabschluss) {
      const open = e.abgleich.funde.filter((f) => f.entscheidung === "gefunden" || f.entscheidung === "geprueft").length;
      return {
        ...base,
        state: open ? `Entwurf, ${open === 1 ? "1 Fund" : `${open} Funde`} offen` : "alle Funde entschieden",
        date: p.datum?.art === "legen_bis" ? `legen bis ${datumText(p.datum.wert)}` : base.date,
        figure: { label: "Restforderung", amount: amount(e.rechnungsabschluss.restforderung) },
        cut: e.vorpruefung?.schonGekuerzt ? amount(e.vorpruefung.schonGekuerzt) : null,
      };
    }
    if (ab) return { ...base, state: "bezahlt", date: `Schlusszahlung ${datumText(ab.schlusszahlung.datum)}`, figure: { label: "Schlusszahlung", amount: amount(ab.schlusszahlung.betrag) }, cut: ab.gekuerzt ? amount(ab.gekuerzt) : null };
    if (p.stufe === "in_ausfuehrung") return { ...base, state: "in Ausführung, noch kein Entwurf", date: p.datum ? `letzte Abschlagsrechnung ${datumText(p.datum.wert)}` : null, figure: null, cut: null };
    return { ...base, state: "gelegt", figure: null, cut: null };
  });
}
