/**
 * Record pages (Attio's record layout: "Angaben" left, highlights, activity), derived from `kern/` at build time like
 * the table rows in `kern-data.ts`. Every amount is a fixed figure of the core formatted with `euro()`; values read from
 * a document carry the place they were read from. Client components import only the types of this file.
 */

import {
  ABZUG_TEXT,
  AUFTRAGGEBER_ART_TEXT,
  KUERZUNGSGRUND_TEXT,
  PRUEFSTAND_TEXT,
  belegTitel,
  datumText,
  euro,
  imProjekt,
  korrekturen,
  prozentText,
  type Belegstand,
  type Datensatz,
  type FirmenErgebnis,
  type Pruefstand,
  type Quelle,
} from "@tieout/kern";

import { projectSlug } from "./example";
import { placeText as stelleText } from "./originals";
import { business, clientSlug, firm, projectRows, type ProjectRow, type StatusColour } from "./kern-data";

/** One row of "Angaben": the value with the place in the original it was read from. */
export type Attribute = {
  label: string;
  value: string;
  /** Quiet text after the value ("Punkt 5.1", "Generalunternehmer"). */
  detail?: string;
  /** "Bauvertrag, Seite 3, Punkt 5.1"; missing for values the system sets. */
  source?: string;
  review?: string;
  href?: string;
  status?: StatusColour;
};

/** A card of the highlights grid (Attio: 3 columns). */
export type Highlight = {
  id: string;
  title: string;
  value: string;
  lines: string[];
  status?: StatusColour | "orange";
  href?: string;
  /** The lead figure only: one statement written from the core's figures, and the share of its part (the Kürzungsrisiko) for one thin bar. */
  says?: string;
  part?: number;
  /** The rule behind the figure, behind an info icon. */
  info?: string;
};

export type ActivityEntry = { id: string; time: string; timeText: string; who: string; text: string; kind: "korrektur" | "meldung" | "entscheidung" | "aufgabe" | "erledigt" };

export type ProjectRecord = {
  id: string;
  slug: string;
  name: string;
  client: { name: string; href: string };
  attributes: Attribute[];
  contract: Attribute[];
  highlights: Highlight[];
  activity: ActivityEntry[];
};


/** A name like "ÖNORM B 2110" never breaks inside. */
const keepTogether = (text: string) => text.replace(/ /g, " ");

const zeitText = (z: string) => `${datumText(z.slice(0, 10))}, ${z.slice(11, 16)}`;

/** 300 → "3 %", 60 → "0,6 %", 1500 → "15 %". */
const satzText = (bp: number) => prozentText(bp, bp % 100 === 0 ? 0 : bp % 10 === 0 ? 1 : 2);

function sourceOf(d: Datensatz, f: { quelle: Quelle; pruefstand: Pruefstand }) {
  const q = f.quelle;
  return { source: `${belegTitel(d, q.belegId)}, Seite ${q.seite}${q.stelle ? `, ${stelleText(q.stelle)}` : ""}`, review: PRUEFSTAND_TEXT[f.pruefstand] };
}

const PHASE = { abschlag: "auf Abschlagsrechnungen", schluss: "auf die Schlussrechnung", beide: "" } as const;

const dataset = (projektId: string) => {
  const d = firm().projekte.find((x) => x.projekt.id === projektId);
  if (!d) throw new Error(`Unknown project ${projektId}`);
  return d;
};

/**
 * Angaben of a project: Auftraggeber, Bauzeit, what is built, and the Vertrag in one row that leads to its tab. The
 * stage, the deadline and its state stand in the head of every tab (step 8a: each fact once).
 */
function projectAttributes(d: Datensatz, row: ProjectRow, client: { name: string; kind: string; href: string }): Attribute[] {
  const v = d.vertrag;
  return [
    { label: "Auftraggeber", value: client.name, detail: client.kind, href: client.href },
    ...(d.projekt.bauzeit ? [{ label: "Bauzeit", value: `${datumText(d.projekt.bauzeit.von)} bis ${datumText(d.projekt.bauzeit.bis)}` }] : []),
    // the trade is the business's own (Heizung, Klima, Lüftung, Sanitär), so the project names only what is built
    { label: "Leistung", value: d.projekt.langname.replace(`${d.projekt.name}, `, "").replace(/,? ?HKLS$/, "") },
    { label: "Auftragssumme", value: euro(v.auftragssumme.wert), ...sourceOf(d, v.auftragssumme) },
    { label: "Vertrag", value: `vom ${datumText(v.datum.wert)}`, detail: `${v.vertragsart.wert}, ${keepTogether(v.norm.wert)}`, href: `/projekte/${row.slug}/vertrag/` },
  ];
}

/** The Vertrag item by item, each value with its Vertragspunkt and place in the Bauvertrag. */
function contractAttributes(d: Datensatz): Attribute[] {
  const v = d.vertrag;
  const legenBis = v.schlussrechnungLegenBis;
  return [
    { label: "Vertrag vom", value: datumText(v.datum.wert), detail: `${v.vertragsart.wert}, ${keepTogether(v.norm.wert)}`, ...sourceOf(d, v.datum) },
    { label: "Auftragssumme", value: euro(v.auftragssumme.wert), ...sourceOf(d, v.auftragssumme) },
    ...(legenBis ? [{ label: "Schlussrechnung legen bis", value: datumText(legenBis.wert), ...sourceOf(d, legenBis) }] : []),
    ...v.saetze.map((s) => ({
      label: ABZUG_TEXT[s.art],
      value: satzText(s.satz.wert),
      detail: [`Punkt ${s.punkt}`, PHASE[s.phase], s.durchBankgarantieErsetzbar ? "durch Bankgarantie ersetzbar" : ""].filter(Boolean).join(", "),
      ...sourceOf(d, s.satz),
    })),
    { label: "Regiesatz Monteur", value: `${euro(v.regiesatzMonteur.wert)} je Stunde`, detail: `Punkt ${v.regiePunkt}`, ...sourceOf(d, v.regiesatzMonteur) },
    { label: "Regiesatz Helfer", value: `${euro(v.regiesatzHelfer.wert)} je Stunde`, detail: `Punkt ${v.regiePunkt}`, ...sourceOf(d, v.regiesatzHelfer) },
    { label: "Regiematerial", value: `Einstandspreis plus ${satzText(v.regiematerialZuschlag.wert)}`, detail: `Punkt ${v.regiematerialPunkt}`, ...sourceOf(d, v.regiematerialZuschlag) },
    { label: "Regie unterschreibt", value: v.regieUnterschrift.wert, ...sourceOf(d, v.regieUnterschrift) },
    v.preise.art === "fest"
      ? { label: "Preise", value: v.preise.text.wert, detail: `Punkt ${v.preise.punkt}`, ...sourceOf(d, v.preise.text) }
      : { label: "Preise", value: `veränderlich, ${v.preise.indexName.wert}`, detail: `Punkt ${v.preise.punkt}`, ...sourceOf(d, v.preise.indexName) },
    ...v.pauschalen.map((x) => ({ label: "Pauschale", value: x.text.wert, detail: `Punkt ${x.punkt}`, ...sourceOf(d, x.text) })),
  ];
}

/**
 * Highlights by stage, at most three (step 8a): an open project leads with "zusätzlich verrechenbar" and its part with a
 * Kürzungsrisiko, then "in Klärung" and the Restforderung (or the Auftragssumme before a Schlussrechnung is drafted); a
 * closed one leads with what the Auftraggeber cut. The deadline is in the head, the Vorprüfung and the finds have their tabs.
 * Takes the core's result, so the browser can show them again with the decisions recorded there (`live.ts`).
 */
export function projectHighlights(projektId: string, b: FirmenErgebnis = business()): Highlight[] {
  const d = dataset(projektId);
  const row = projectRows(b).find((r) => r.id === projektId)!;
  const e = b.ergebnisse[projektId];
  const v = d.vertrag;
  const findsHref = `/projekte/${row.slug}/funde/`;
  const invoiceHref = `/projekte/${row.slug}/schlussrechnung/`;
  const contract: Highlight = { id: "auftragssumme", title: "Auftragssumme", value: euro(v.auftragssumme.wert), lines: [`Vertrag vom ${datumText(v.datum.wert)}`] };

  if (!e.abgleich.laeuft) {
    const ab = b.abrechnungen[projektId];
    if (!ab) return [contract];
    const invoice = ab.zeilen.find((z) => z.art === "rechnung")!.betrag;
    const h = b.historie.find((x) => x.kuerzungen.some((k) => k.projektId === projektId) || x.abzuege.some((a) => a.projektId === projektId));
    const reasons = [
      ...(h?.kuerzungen.filter((k) => k.projektId === projektId).map((k) => `${KUERZUNGSGRUND_TEXT[k.grund]} ${euro(k.betrag)}`) ?? []),
      ...(h?.abzuege.filter((a) => a.projektId === projektId).map((a) => `dazu abgezogen: ${ABZUG_TEXT[a.art]} ${euro(a.betrag)}`) ?? []),
    ];
    return [
      {
        id: "gekuerzt",
        title: "Gekürzt",
        value: euro(ab.gekuerzt),
        lines: [`von der Schlussrechnung ${euro(invoice)}`, ...reasons],
        part: invoice ? ab.gekuerzt / invoice : undefined,
      },
      { id: "schlusszahlung", title: "Schlusszahlung", value: euro(ab.schlusszahlung.betrag), lines: [`nach ${ab.schlusszahlung.tage} Tagen`] },
      { id: "einbehalten", title: "Haftrücklass einbehalten", value: euro(ab.einbehalten), lines: ["laut Zahlungsavis"] },
    ];
  }

  const s = e.abgleich.summen;
  // a find set to "Nicht verrechnen" counts in no money word and is named apart
  const count = (stand: Belegstand) => e.abgleich.funde.filter((f) => f.belegstand === stand && f.entscheidung !== "nicht_verrechnen").length;
  const excluded = e.abgleich.funde.filter((f) => f.entscheidung === "nicht_verrechnen").length;
  const risk = e.vorpruefung?.davonMitKuerzungsrisiko ?? 0;
  const proven = count("belegt");
  const pending = count("beleg_fehlt") + count("nachtrag_nicht_gelegt");
  return [
    {
      id: "zusaetzlich",
      title: "Zusätzlich verrechenbar",
      value: euro(s.zusaetzlichVerrechenbar),
      lines: [[`aus ${proven} ${proven === 1 ? "belegtem Fund" : "belegten Funden"}`, excluded ? `${excluded} nicht verrechnet` : ""].filter(Boolean).join(", ")],
      part: risk && s.zusaetzlichVerrechenbar ? risk / s.zusaetzlichVerrechenbar : undefined,
      says: risk ? `davon mit Kürzungsrisiko ${euro(risk)}` : undefined,
      href: findsHref,
    },
    {
      id: "klaerung",
      title: "In Klärung",
      value: s.inKlaerung ? euro(s.inKlaerung) : "nichts",
      lines: s.inKlaerung ? [`Beleg fehlt ${euro(s.belegFehlt)}`, `Nachtrag nicht gelegt ${euro(s.nachtragNichtGelegt)}`] : [],
      href: pending ? findsHref : undefined,
    },
    ...(e.rechnungsabschluss
      ? [
          {
            id: "restforderung",
            title: "Restforderung",
            value: euro(e.rechnungsabschluss.restforderung),
            lines: [`laut Vertrag ${euro(e.rechnungsabschluss.lautVertrag.restforderung)}`],
            info: "Was nach dem Entwurf der Schlussrechnung, den Zahlungen und den Abzügen des Auftraggebers offen bleibt. „Laut Vertrag“ rechnet ohne die Abzüge, für die der Vertrag keinen Punkt nennt.",
            href: invoiceHref,
          },
        ]
      : []),
  ];
}

/** Verlauf: what humans changed in the twin (corrections, confirmed WhatsApp-Meldungen), newest first, append only. */
function projectActivity(d: Datensatz): ActivityEntry[] {
  return [
    ...korrekturen(d).map((k, i) => ({
      id: `korrektur-${i}`,
      time: k.zeit,
      timeText: zeitText(k.zeit),
      who: k.wer,
      text: `korrigierte ${k.beleg}, ${stelleText(k.stelle)}: ${k.vorher} auf ${k.wert}`,
      kind: "korrektur" as const,
    })),
    ...d.meldungen.map((m) => ({
      id: `meldung-${m.id}`,
      time: m.bestaetigt.zeitpunkt,
      timeText: zeitText(m.bestaetigt.zeitpunkt),
      who: m.bestaetigt.rolle,
      text: `bestätigte WhatsApp-Meldung ${m.nr}: ${m.taetigkeit.wert}, ${m.ort.wert}`,
      kind: "meldung" as const,
    })),
  ].sort((x, y) => y.time.localeCompare(x.time) || x.id.localeCompare(y.id));
}

/** The project page (SPEZIFIKATION.md 4.1 and 7.2). */
export function projectRecord(projektId: string): ProjectRecord {
  const d = dataset(projektId);
  const row = projectRows().find((r) => r.id === projektId)!;
  const ag = business().projekte.find((p) => p.projektId === projektId)!.auftraggeber;
  const client = { name: ag.name, kind: AUFTRAGGEBER_ART_TEXT[ag.art], href: `/auftraggeber/${clientSlug(ag.kurzname)}/` };
  return {
    id: projektId,
    slug: row.slug,
    name: d.projekt.name,
    client: { name: client.name, href: client.href },
    attributes: projectAttributes(d, row, client),
    contract: contractAttributes(d),
    highlights: projectHighlights(projektId),
    activity: projectActivity(d),
  };
}

export type HistoryLine = { id: string; project: { name: string; href: string }; what: string; reason: string; invoice: string; amount: string };

export type ClientRecord = {
  id: string;
  slug: string;
  name: string;
  attributes: Attribute[];
  highlights: Highlight[];
  /** "Gleicher Grund bei diesem Auftraggeber schon im …", per open project and reason; `earlier` says what it cost there. */
  sameReason: { id: string; project: { name: string; href: string }; reason: string; text: string; earlier: string; deducted: boolean }[];
  cuts: HistoryLine[];
  deductions: HistoryLine[];
  changeOrders: { id: string; project: string; number: string; title: string; amount: string; accepted: boolean }[];
  projects: ProjectRow[];
};

/** The Auftraggeber page (SPEZIFIKATION.md 2.2 and 7.2): history from the documents of every project, facts only. */
export function clientRecord(auftraggeberId: string): ClientRecord {
  const b = business();
  const h = b.historie.find((x) => x.auftraggeber.id === auftraggeberId);
  if (!h) throw new Error(`Unknown Auftraggeber ${auftraggeberId}`);
  const ag = h.auftraggeber;
  const href = (projektId: string) => `/projekte/${projectSlug(dataset(projektId).projekt.name)}/`;
  const projects = projectRows().filter((r) => b.projekte.find((p) => p.projektId === r.id)!.auftraggeber.id === ag.id);
  const n = h.nachtraege;

  const attributes: Attribute[] = [
    { label: "Art", value: AUFTRAGGEBER_ART_TEXT[ag.art] },
    { label: "Projekte", value: String(h.projekte), detail: h.abgeschlossen ? `${h.abgeschlossen} abgeschlossen` : undefined },
    ...h.schlusszahlung.map((s) => ({ label: "Tage bis Schlusszahlung", value: String(s.tage), detail: s.projekt })),
  ];

  const highlights: Highlight[] = [
    {
      id: "kuerzungen",
      title: "Kürzungen",
      value: euro(h.kuerzungenSumme),
      lines: h.kuerzungen.length ? [`${h.kuerzungen.length} ${h.kuerzungen.length === 1 ? "Kürzung" : "Kürzungen"} in ${h.kuerzungenProjekte} ${h.kuerzungenProjekte === 1 ? "Projekt" : "Projekten"}`] : ["keine Kürzung"],
    },
    {
      id: "abzuege",
      title: "Abzug ohne Vertragspunkt",
      value: euro(h.abzuegeSumme),
      lines: h.abzuege.length ? [`in ${h.abzuegeProjekte} ${h.abzuegeProjekte === 1 ? "Projekt" : "Projekten"}`] : ["kein Abzug ohne Vertragspunkt"],
    },
    {
      id: "nachtraege",
      title: "Nachträge beauftragt",
      value: n.angeboten ? `${n.beauftragt} von ${n.angeboten}` : "keine",
      lines: n.angeboten ? [`${euro(n.betragBeauftragt)} von ${euro(n.betrag)}${n.quote === null ? "" : `, ${prozentText(n.quote, 1)} des Betrags`}`] : ["kein Nachtrag angeboten"],
    },
  ];

  const sameReason = Object.entries(b.gleicherGrund)
    .filter(([key]) => b.projekte.find((p) => key.startsWith(`${p.projektId}/`))?.auftraggeber.id === ag.id)
    .flatMap(([key, notes]) => {
      const [projektId, rest] = [key.slice(0, key.indexOf("/")), key.slice(key.indexOf("/") + 1)];
      const e = b.ergebnisse[projektId];
      const risk = e.vorpruefung?.risiken.find((r) => r.schluessel === rest);
      const reason = risk ? KUERZUNGSGRUND_TEXT[risk.grund] : `${ABZUG_TEXT[rest.replace("abzug:", "") as keyof typeof ABZUG_TEXT]}: ${KUERZUNGSGRUND_TEXT.abzug_ohne_vertragspunkt}`;
      return notes.map((x, i) => {
        const earlier = risk
          ? h.kuerzungen.filter((k) => k.projektId === x.projektId && k.grund === risk.grund).map((k) => euro(k.betrag))
          : h.abzuege.filter((a) => a.projektId === x.projektId && `abzug:${a.art}` === rest).map((a) => euro(a.betrag));
        return {
          id: `${key}-${i}`,
          project: { name: dataset(projektId).projekt.name, href: href(projektId) },
          reason,
          text: x.text,
          deducted: !risk,
          earlier: `${imProjekt(dataset(x.projektId).projekt.name)} ${risk ? "gekürzt" : "abgezogen"}: ${earlier.join(", ")}`,
        };
      });
    });

  return {
    id: ag.id,
    slug: clientSlug(ag.kurzname),
    name: ag.name,
    attributes,
    highlights,
    sameReason,
    cuts: h.kuerzungen.map((k, i) => ({
      id: `kuerzung-${i}`,
      project: { name: k.projekt, href: href(k.projektId) },
      what: k.bezug,
      reason: KUERZUNGSGRUND_TEXT[k.grund],
      invoice: `${k.rechnung.nr === "Schlussrechnung" ? "Schlussrechnung" : k.rechnung.nr} vom ${datumText(k.rechnung.datum)}`,
      amount: euro(k.betrag),
    })),
    deductions: h.abzuege.map((a, i) => ({
      id: `abzug-${i}`,
      project: { name: a.projekt, href: href(a.projektId) },
      what: ABZUG_TEXT[a.art],
      reason: KUERZUNGSGRUND_TEXT[a.grund],
      invoice: a.rechnungen.join(", "),
      amount: euro(a.betrag),
    })),
    changeOrders: firm()
      .projekte.filter((d) => d.projekt.auftraggeberId === ag.id)
      .flatMap((d) => d.nachtraege.map((x) => ({ id: `${d.projekt.id}-${x.nr.wert}`, project: d.projekt.name, number: x.nr.wert, title: x.titel.wert, amount: euro(x.betrag.wert), accepted: x.beauftragt.wert }))),
    projects,
  };
}

export type ContractRow = { id: string; project: { name: string; href: string }; client: string; date: string; kind: string; sum: string };

/** "Verträge" of the business (Ebene 1, SPEZIFIKATION.md 2.2): one row per project, each leading to its tab "Vertrag". */
export function contractRows(): ContractRow[] {
  const b = business();
  return firm().projekte.map((d) => {
    const v = d.vertrag;
    return {
      id: d.projekt.id,
      project: { name: d.projekt.name, href: `/projekte/${projectSlug(d.projekt.name)}/vertrag/` },
      client: b.projekte.find((p) => p.projektId === d.projekt.id)!.auftraggeber.name,
      date: datumText(v.datum.wert),
      kind: `${v.vertragsart.wert}, ${v.norm.wert}`,
      sum: euro(v.auftragssumme.wert),
    };
  });
}
