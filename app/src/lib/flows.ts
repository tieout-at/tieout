/**
 * "Abläufe" (step 9, SPEZIFIKATION.md 5.2): the three ready Abläufe as blocks on Attio's canvas and every run the data
 * allows. The counts come from `ablaeufe()` of `kern/` over the core's result, so the same code runs while the pages are
 * built and in the browser once decisions exist (`kern-live.ts`). A block never shows an amount: it says what it read,
 * found and checked, and leads to the page where that is.
 */

import { ablaeufe, datumText, euro, FUND_ART_TEXT, PRUEFUNGEN, type AbschlagsLauf, type AbschlussLauf, type AblaufId, type FirmenErgebnis, type Fundzahlen, type MeldungsLauf, type PruefungId } from "@tieout/kern";

import { findSlug, projectSlug } from "./example";
import { checkLinks } from "./flow-state";
import { business, findRows, firm, type Amount, type FindRow } from "./kern-data";
import { targetOf, type TaskTarget } from "./tasks";

export type FlowKind = "ausloeser" | "schritt" | "bedingung" | "aufgabe";
export type FlowIcon = "folder" | "file" | "compare" | "shield" | "receipt" | "release" | "package" | "task" | "invoice" | "message" | "filter";
export type Tone = "green" | "yellow" | "orange" | "red" | "grey";

/** A block and where it sits: `row` down the main column, `side` left of it (tasks) or in it. */
export type FlowNode = {
  id: string;
  kind: FlowKind;
  icon: FlowIcon;
  title: string;
  /** What the block does, in a few words (the subtitle before a run). */
  does: string;
  /** The panel: what it is, what it reads, who confirms. */
  text: string;
  reads: string[];
  confirms: string;
  row: number;
  side: "main" | "left";
};

export type FlowEdge = { from: string; to: string };

export type Line = { label: string; value: string; tone?: Tone };

/** What a block produced in one run; `ran` false when the run did not reach it (a filter stopped, no Entwurf yet). */
export type NodeResult = {
  ran: boolean;
  /** A task block: the tasks are proposed, nobody created them yet; `tasks` are the finds they are for. */
  proposed?: boolean;
  tasks?: FlowTask[];
  text: string;
  lines: Line[];
  /** One sentence below the lines (what this run leaves for the next one). */
  note?: string | null;
  link: { href: string; label: string } | null;
};

/** A find a task block is for: its keys (with earlier ones of the same work); `excluded` once set to "Nicht verrechnen". */
export type FlowTask = TaskTarget & { keys: string[]; excluded: boolean };

/** One hit of a check: where it leads, the quantity change in basis points (only the quantity check), whether it threatens. */
export type CheckItem = { href: string; label: string; change: number | null; threat: boolean };
export type CheckResult = {
  id: PruefungId;
  title: string;
  hits: number;
  threat: number;
  items: CheckItem[];
  links: { href: string; label: string }[];
  /** Hits a higher threshold of this browser leaves out, so the panel can name them. */
  below?: CheckItem[];
};

/** What the project's Abgleich found, from the core: the two money words apart, the part with a Kürzungsrisiko as "davon". */
export type RunMoney = { extra: Amount; risk: Amount | null; unclear: Amount | null };

export type FlowRun = {
  id: string;
  project: { name: string; slug: string };
  /** Plain date of the run ("19.10.2026"). */
  date: string;
  iso: string;
  /** The project; `on` what the run ran on ("Entwurf", "Abschlagsrechnung 2", "Meldung W4"). */
  title: string;
  on: string;
  summary: string;
  results: Record<string, NodeResult>;
  checks: CheckResult[] | null;
  money: RunMoney | null;
};

export type FlowView = {
  id: AblaufId;
  slug: string;
  title: string;
  /** One sentence on the list and in the panel when no block is chosen. */
  summary: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** The block the check catalogue hangs on (the Vorprüfung of the Abschluss-Lauf). */
  checksAt: string | null;
  runs: FlowRun[];
};

export const FLOW_SLUGS: Record<AblaufId, string> = {
  abschluss_lauf: "abschluss-lauf",
  lauf_je_abschlagsrechnung: "lauf-je-abschlagsrechnung",
  meldung_zu_regiebericht: "meldung-zu-regiebericht",
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const funde = (n: number) => plural(n, "Fund", "Funde");
const tab = (name: string, t = "") => `/projekte/${projectSlug(name)}/${t ? `${t}/` : ""}`;

function stand(z: Fundzahlen): Line[] {
  return [
    { label: "belegt", value: String(z.belegt), tone: "green" as const },
    { label: "Beleg fehlt", value: String(z.belegFehlt), tone: "yellow" as const },
    { label: "Nachtrag nicht gelegt", value: String(z.nachtragNichtGelegt), tone: "orange" as const },
    ...(z.nichtVerrechnen ? [{ label: "Nicht verrechnen", value: String(z.nichtVerrechnen), tone: "grey" as const }] : []),
  ].filter((l) => l.value !== "0" || l.tone === "green");
}

const done = (text: string, lines: Line[] = [], link: NodeResult["link"] = null): NodeResult => ({ ran: true, text, lines, link });
const skipped = (text: string): NodeResult => ({ ran: false, text, lines: [], link: null });
/** A task block over the finds it is for; finds set to "Nicht verrechnen" stay listed (a task made earlier) but are not counted. */
const proposed = (all: FindRow[], none: string): NodeResult => {
  const tasks: FlowTask[] = all.map((r) => ({ ...targetOf(r), keys: [r.id, ...r.earlierIds], excluded: !counts(r) }));
  const n = tasks.filter((t) => !t.excluded).length;
  return n
    ? { ran: true, proposed: true, text: `${plural(n, "Aufgabe", "Aufgaben")} vorgeschlagen`, lines: [], link: { href: "/aufgaben/", label: "Aufgaben öffnen" }, tasks }
    : { ...skipped(none), tasks: tasks.length ? tasks : undefined };
};

/** The context of a run: the project's name, its finds as rows (for tasks) and its money from the core. */
type Ctx = { name: string; rows: FindRow[]; money: RunMoney | null };
const counts = (r: FindRow) => r.decisionState !== "nicht_verrechnen";
const amount = (cent: number): Amount => ({ cent, text: euro(cent) });

function vorpruefungText(droht: number, gekuerzt: number): string {
  const risiko = droht ? plural(droht, "Kürzungsrisiko", "Kürzungsrisiken") : "kein Kürzungsrisiko";
  return gekuerzt ? `${risiko}, ${gekuerzt} gekürzt` : risiko;
}

// ---------- Abschluss-Lauf ----------

const ABSCHLUSS_NODES: FlowNode[] = [
  { id: "ausloeser", kind: "ausloeser", icon: "folder", title: "Ordner importiert", does: "Wenn ein Projektordner kommt", text: "Startet, sobald der Ordner eines Projekts mit Entwurf der Schlussrechnung hereinkommt.", reads: ["Projektordner"], confirms: "Niemand, der Lauf startet von selbst.", row: 0, side: "main" },
  { id: "ordner", kind: "schritt", icon: "file", title: "Ordner lesen", does: "Belege und Felder lesen", text: "Liest jede Datei des Ordners, erkennt doppelte Dateien und Planstände und ordnet die WhatsApp-Meldungen dem Projekt zu.", reads: ["Projektordner", "WhatsApp-Meldungen"], confirms: "Die Abrechnung bestätigt oder korrigiert unsichere Felder.", row: 1, side: "main" },
  { id: "abgleich", kind: "schritt", icon: "compare", title: "Abgleich", does: "Funde suchen", text: "Legt Leistungsverzeichnis, Aufmaß, Regie, Meldungen und Abschlagsrechnungen neben Ihren Entwurf und sucht, was erbracht, aber nicht verrechnet ist.", reads: ["Leistungsverzeichnis", "Aufmaßblätter", "Regieberichte", "WhatsApp-Meldungen", "Abschlagsrechnungen", "Entwurf", "Vertrag"], confirms: "Rechnen muss niemand bestätigen. Jeder Fund geht zur Prüfung an die Abrechnung.", row: 2, side: "main" },
  { id: "vorpruefung", kind: "schritt", icon: "shield", title: "Vorprüfung", does: "Prüfen wie der Auftraggeber", text: "Prüft den Entwurf so, wie der Auftraggeber prüfen wird: jede Position mit Kürzungsrisiko, mit Grund und Abhilfe, und jeden Satz gegen den Vertrag.", reads: ["Entwurf mit den Funden", "Vertrag", "Verlauf des Auftraggebers"], confirms: "Die Abrechnung entscheidet über die Abhilfe.", row: 3, side: "main" },
  { id: "entwurf", kind: "schritt", icon: "receipt", title: "Entwurf", does: "Änderungsliste und Rechnungsabschluss", text: "Stellt die Änderungsliste und den Rechnungsabschluss bis zur Restforderung zusammen. Die Beträge rechnet der Rechenkern.", reads: ["Entwurf", "Funde", "Vertrag", "Zahlungen"], confirms: "Die Abrechnung prüft jeden Fund.", row: 4, side: "main" },
  { id: "freigabe", kind: "aufgabe", icon: "release", title: "Freigabe anfordern", does: "An die Geschäftsführung", text: "Bittet die Geschäftsführung, die geprüften Funde freizugeben. Erst dann sind die Ausgaben endgültig.", reads: ["geprüfte Funde"], confirms: "Die Geschäftsführung gibt frei.", row: 5, side: "main" },
  { id: "ausgaben", kind: "schritt", icon: "package", title: "Ausgaben", does: "Excel, Beweispakete, Blatt", text: "Erstellt Änderungsliste als Excel, Beweispakete und das Schlussbesprechungs-Blatt. Ihr Betrieb trägt die Rechnung selbst ein und schickt sie selbst.", reads: ["freigegebene Funde"], confirms: "Niemand: tieout schickt nichts an den Auftraggeber.", row: 6, side: "main" },
  { id: "aufgabe-bauleitung", kind: "aufgabe", icon: "task", title: "Aufgabe an Bauleitung", does: "Je Lücke im Beleg", text: "Legt für jeden Fund mit fehlendem Beleg eine Aufgabe an die Bauleitung, solange der Polier noch auf der Baustelle ist.", reads: ["Funde in Klärung"], confirms: "Die Bauleitung bestätigt auf dem Handy.", row: 2, side: "left" },
  { id: "aufgabe-abrechnung", kind: "aufgabe", icon: "task", title: "Aufgabe an Abrechnung", does: "Je Kürzungsrisiko", text: "Legt für jedes drohende Kürzungsrisiko eine Aufgabe mit der Abhilfe an die Abrechnung.", reads: ["Kürzungsrisiken"], confirms: "Die Abrechnung hakt die Aufgabe ab.", row: 3, side: "left" },
];

const chain = (ids: string[]): FlowEdge[] => ids.slice(1).map((to, i) => ({ from: ids[i], to }));

function abschlussRun(x: AbschlussLauf, { name, rows, money }: Ctx): FlowRun {
  const z = x.abgleich;
  const vp = x.vorpruefung;
  const offen = x.entwurf.funde - x.entwurf.entschieden;
  return {
    id: `abschluss-${x.projektId}`,
    project: { name, slug: projectSlug(name) },
    date: datumText(x.datum),
    iso: x.datum,
    title: name,
    on: "Entwurf",
    summary: `${plural(x.ordner.belege, "Beleg", "Belege")}, ${funde(z.funde)}, ${vorpruefungText(vp.droht, vp.schonGekuerzt)}`,
    results: {
      ausloeser: done(name, [{ label: "Entwurf vom", value: datumText(x.datum) }], { href: tab(name), label: "Projekt öffnen" }),
      ordner: done(
        `${plural(x.ordner.belege, "Beleg", "Belege")} gelesen`,
        [
          { label: "Belege gelesen", value: String(x.ordner.belege) },
          { label: "davon doppelt", value: String(x.ordner.duplikate) },
          { label: "Felder von Hand korrigiert", value: String(x.ordner.korrigierteFelder) },
          { label: "WhatsApp-Meldungen", value: String(x.ordner.meldungen) },
        ],
        { href: tab(name, "belege"), label: "Belege öffnen" },
      ),
      abgleich: done(funde(z.funde), stand(z), { href: tab(name, "funde"), label: `${funde(z.funde)} öffnen` }),
      vorpruefung: done(
        vorpruefungText(vp.droht, vp.schonGekuerzt),
        [
          { label: "Kürzungsrisiko droht", value: String(vp.droht), tone: "red" },
          { label: "schon gekürzt", value: String(vp.schonGekuerzt) },
        ],
        { href: tab(name, "schlussrechnung"), label: "Vorprüfung öffnen" },
      ),
      entwurf: done(`${x.entwurf.entschieden} von ${x.entwurf.funde} ${x.entwurf.funde === 1 ? "Fund" : "Funden"} entschieden`, [], { href: tab(name, "schlussrechnung"), label: "Schlussrechnung öffnen" }),
      freigabe: done(offen ? `${funde(offen)} offen` : x.entwurf.freigegeben ? "alle Funde entschieden" : "nichts freigegeben", [], { href: tab(name, "funde"), label: "Funde öffnen" }),
      ausgaben: done(x.ausgabenFertig ? "freigegeben" : "Entwurf, nicht freigegeben", [], { href: tab(name, "schlussrechnung"), label: "Ausgaben öffnen" }),
      "aufgabe-bauleitung": proposed(rows.filter((r) => r.remedy), "keine Lücke"),
      "aufgabe-abrechnung": proposed(rows.filter((r) => r.risk && !r.risk.alreadyCut), "kein Kürzungsrisiko"),
    },
    checks: vp.pruefungen.map((p) => {
      const items: CheckItem[] = p.einzeln.map((h) =>
        h.fund
          ? { href: `/funde/${findSlug(name, h.fund)}/`, label: `${h.fund} öffnen`, change: h.aenderung, threat: h.droht }
          : { href: tab(name, "schlussrechnung"), label: p.id === "abzug_ohne_vertragspunkt" ? "Rechnungsabschluss öffnen" : "Vorprüfung öffnen", change: h.aenderung, threat: h.droht },
      );
      return { id: p.id, title: PRUEFUNGEN.find((c) => c.id === p.id)!.text, hits: p.treffer, threat: p.droht, items, links: checkLinks(items) };
    }),
    money,
  };
}

// ---------- Lauf je Abschlagsrechnung ----------

const ABSCHLAG_NODES: FlowNode[] = [
  { id: "ausloeser", kind: "ausloeser", icon: "invoice", title: "Neue Abschlagsrechnung", does: "Bei jeder Abschlagsrechnung", text: "Startet für ein Projekt in Ausführung, sobald eine Abschlagsrechnung im Ordner liegt. Nur Arbeit bis zu ihrem Datum zählt.", reads: ["Abschlagsrechnung"], confirms: "Niemand, der Lauf startet von selbst.", row: 0, side: "main" },
  { id: "abgleich", kind: "schritt", icon: "compare", title: "Abgleich", does: "Funde bis zur Abschlagsrechnung", text: "Sucht Arbeit bis zum Datum der Abschlagsrechnung, die erbracht, aber in keiner Abschlagsrechnung verrechnet ist.", reads: ["Leistungsverzeichnis", "Aufmaßblätter", "Regieberichte", "WhatsApp-Meldungen", "Abschlagsrechnungen"], confirms: "Jeder Fund geht zur Prüfung an die Abrechnung.", row: 1, side: "main" },
  { id: "vorpruefung", kind: "schritt", icon: "shield", title: "Vorprüfung", does: "Prüfen wie der Auftraggeber", text: "Prüft wie der Auftraggeber. Sie braucht einen eigenen Entwurf der Schlussrechnung und läuft deshalb erst vor der Schlussrechnung.", reads: ["Entwurf", "Vertrag"], confirms: "Die Abrechnung entscheidet über die Abhilfe.", row: 2, side: "main" },
  { id: "aufgabe-bauleitung", kind: "aufgabe", icon: "task", title: "Aufgabe an Bauleitung", does: "Je Lücke im Beleg", text: "Legt für jede Lücke eine Aufgabe an die Bauleitung, solange der Polier noch auf der Baustelle ist.", reads: ["Funde in Klärung"], confirms: "Die Bauleitung bestätigt auf dem Handy.", row: 3, side: "main" },
];

function abschlagRun(x: AbschlagsLauf, { name, rows, money }: Ctx): FlowRun {
  const z = x.abgleich;
  return {
    id: `abschlag-${x.projektId}`,
    project: { name, slug: projectSlug(name) },
    date: datumText(x.abschlagsrechnung.datum),
    iso: x.abschlagsrechnung.datum,
    title: name,
    on: x.abschlagsrechnung.nr,
    summary: `${funde(z.funde)}, ${x.aufgaben.bauleitung ? `${plural(x.aufgaben.bauleitung, "Aufgabe", "Aufgaben")} vorgeschlagen` : "keine Lücke"}`,
    results: {
      ausloeser: done(x.abschlagsrechnung.nr, [{ label: "vom", value: datumText(x.abschlagsrechnung.datum) }], { href: tab(name, "zeitstrahl"), label: "Zeitstrahl öffnen" }),
      abgleich: {
        ...done(funde(z.funde), [...stand(z), ...Object.entries(z.jeArt).map(([art, n]) => ({ label: FUND_ART_TEXT[art as keyof typeof FUND_ART_TEXT], value: String(n) }))], { href: tab(name, "funde"), label: `${funde(z.funde)} öffnen` }),
        note: x.regie.nachGrenze ? `${plural(x.regie.nachGrenze, "Regiebericht", "Regieberichte")} nach dem ${datumText(x.abschlagsrechnung.datum)} zählt erst beim nächsten Lauf.` : null,
      },
      vorpruefung: x.vorpruefung
        ? done(`${plural(x.vorpruefung.positionen, "Position", "Positionen")} in der Vorprüfung`, [{ label: "Kürzungsrisiko droht", value: String(x.vorpruefung.droht), tone: "red" }], { href: tab(name, "schlussrechnung"), label: "Vorprüfung öffnen" })
        : skipped("läuft erst mit einem Entwurf"),
      "aufgabe-bauleitung": proposed(rows.filter((r) => r.remedy), "keine Lücke"),
    },
    checks: null,
    money,
  };
}

// ---------- Meldung zu Regiebericht ----------

const MELDUNG_NODES: FlowNode[] = [
  { id: "ausloeser", kind: "ausloeser", icon: "message", title: "Neue WhatsApp-Meldung", does: "Wenn ein Monteur meldet", text: "Startet bei jeder WhatsApp-Meldung, die der Absender bestätigt hat.", reads: ["WhatsApp-Meldung"], confirms: "Der Absender bestätigt die Meldung im Chat.", row: 0, side: "main" },
  { id: "bedingung", kind: "bedingung", icon: "filter", title: "Ohne Regiebericht", does: "Nur weiter, wenn keiner da ist", text: "Geht nur weiter, wenn die Meldung Stunden nennt, keine Position betrifft und kein Regiebericht sie aufnimmt.", reads: ["Regieberichte", "Leistungsverzeichnis"], confirms: "Niemand, die Bedingung prüft nur.", row: 1, side: "main" },
  { id: "aufgabe-bauleitung", kind: "aufgabe", icon: "task", title: "Aufgabe an Bauleitung", does: "Regiebericht schreiben lassen", text: "Bittet die Bauleitung, einen Regiebericht zu schreiben und ihn vom Polier unterschreiben zu lassen.", reads: ["WhatsApp-Meldung"], confirms: "Die Bauleitung bestätigt auf dem Handy.", row: 2, side: "main" },
];

function meldungRun(x: MeldungsLauf, { name, rows }: Ctx): FlowRun {
  const day = x.zeitpunkt.slice(0, 10);
  const e = x.ergebnis;
  const filter =
    e.art === "regiebericht"
      ? skipped(`Regiebericht ${e.nr} vorhanden${e.unterschrieben ? ", unterschrieben" : ", nicht unterschrieben"}`)
      : e.art === "positionen"
        ? skipped("betrifft Positionen, kein Regiebericht nötig")
        : e.art === "verrechnet"
          ? skipped("schon verrechnet")
          : e.art === "ohne_stunden"
            ? skipped("keine Stunden genannt")
            : done("kein Regiebericht");
  return {
    id: `meldung-${x.meldungId}`,
    project: { name, slug: projectSlug(name) },
    date: datumText(day),
    iso: x.zeitpunkt,
    title: name,
    on: `Meldung ${x.nr}`,
    summary: e.art === "aufgabe" ? `${x.taetigkeit}: Aufgabe an die Bauleitung vorgeschlagen` : `${x.taetigkeit}: ${filter.text}`,
    results: {
      ausloeser: done(`${x.nr}, ${x.taetigkeit}`, [{ label: "eingegangen", value: `${datumText(day)}, ${x.zeitpunkt.slice(11, 16)}` }], { href: `/whatsapp-meldungen/#${x.meldungId}`, label: "Meldung öffnen" }),
      bedingung: { ...filter, ran: true },
      "aufgabe-bauleitung": e.art === "aufgabe" ? proposed(rows.filter((r) => [r.id, ...r.earlierIds].some((k) => k.endsWith(`meldung:${x.nr}`))), "kein Fund zur Meldung") : skipped("nicht nötig"),
    },
    checks: null,
    money: null,
  };
}

// ---------- the views ----------

/** The three Abläufe with their runs, from the core's result (built: no decisions; live: this browser's). */
export function flowViews(b: FirmenErgebnis = business()): FlowView[] {
  const f = firm();
  const a = ablaeufe(f, b);
  const all = findRows(b);
  const ctx = (id: string): Ctx => {
    const name = f.projekte.find((d) => d.projekt.id === id)!.projekt.name;
    const e = b.ergebnisse[id];
    const s = e.abgleich.summen;
    const risk = e.vorpruefung?.davonMitKuerzungsrisiko ?? 0;
    return { name, rows: all.filter((r) => r.project.name === name), money: { extra: amount(s.zusaetzlichVerrechenbar), risk: risk ? amount(risk) : null, unclear: s.inKlaerung ? amount(s.inKlaerung) : null } };
  };
  return [
    {
      id: "abschluss_lauf",
      slug: FLOW_SLUGS.abschluss_lauf,
      title: "Abschluss-Lauf",
      summary: "Ordner importiert, fünf Laufschritte, Freigabe anfordern",
      description: "Prüft vor der Schlussrechnung den ganzen Ordner eines Projekts: lesen, abgleichen, wie der Auftraggeber prüfen, den Entwurf zusammenstellen und die Freigabe anfordern.",
      nodes: ABSCHLUSS_NODES,
      edges: [...chain(["ausloeser", "ordner", "abgleich", "vorpruefung", "entwurf", "freigabe", "ausgaben"]), { from: "abgleich", to: "aufgabe-bauleitung" }, { from: "vorpruefung", to: "aufgabe-abrechnung" }],
      checksAt: "vorpruefung",
      runs: a.abschluss.map((x) => abschlussRun(x, ctx(x.projektId))),
    },
    {
      id: "lauf_je_abschlagsrechnung",
      slug: FLOW_SLUGS.lauf_je_abschlagsrechnung,
      title: "Lauf je Abschlagsrechnung",
      summary: "Abgleich bei jeder Abschlagsrechnung, Aufgabe an die Bauleitung",
      description: "Prüft Projekte in Ausführung bei jeder Abschlagsrechnung, damit eine Lücke eine Aufgabe wird, solange der Polier noch auf der Baustelle ist.",
      nodes: ABSCHLAG_NODES,
      edges: chain(["ausloeser", "abgleich", "vorpruefung", "aufgabe-bauleitung"]),
      checksAt: null,
      runs: a.abschlag.map((x) => abschlagRun(x, ctx(x.projektId))),
    },
    {
      id: "meldung_zu_regiebericht",
      slug: FLOW_SLUGS.meldung_zu_regiebericht,
      title: "Meldung zu Regiebericht",
      summary: "WhatsApp-Meldung ohne Regiebericht wird eine Aufgabe",
      description: "Macht aus einer WhatsApp-Meldung mit Stunden, die kein Regiebericht aufnimmt, eine Aufgabe an die Bauleitung.",
      nodes: MELDUNG_NODES,
      edges: chain(["ausloeser", "bedingung", "aufgabe-bauleitung"]),
      checksAt: null,
      runs: a.meldung.map((x) => meldungRun(x, ctx(x.projektId))),
    },
  ];
}

export function flowView(slug: string, b: FirmenErgebnis = business()): FlowView | null {
  return flowViews(b).find((v) => v.slug === slug) ?? null;
}
