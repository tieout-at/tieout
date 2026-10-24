/**
 * View model of the page "Übersicht" (Digitaler Zwilling): the Belege of the folder, the twin (Ebene 1 "Ihr Betrieb" and
 * the Abgleich of Ebene 2: beauftragt, erbracht, verrechnet per position) and the money, with every link from a finding
 * back to the Belege that prove it. Computed from `kern/` while the page is built; the client draws it and never adds
 * an amount (SPEZIFIKATION.md 4.4, decided with Maxi S. on 24.10.2026).
 */

import {
  AUFTRAGGEBER_ART_TEXT,
  BELEG_ART_TEXT,
  BELEGGRUPPE_TEXT,
  BELEGSTAND_TEXT,
  FUND_ART_TEXT,
  KUERZUNGSGRUND_TEXT,
  belegListe,
  datumText,
  euro,
  type BelegArt,
  type Belegstand,
  type Belegsgruppe,
  type Fund,
  type Positionszeile,
} from "@tieout/kern";

import { findSlug, projectSlug } from "./example";
import { business, clientSlug, firm, projectRows, type StatusColour } from "./kern-data";

/**
 * Where a Beleg's evidence enters the twin. "auftraggeber", "vertrag", "preisbasis" are the nodes of Ebene 1;
 * "fund" means the cells of the findings it proves (a position, or the row without position); "verrechnet" marks
 * what was invoiced (Abschlagsrechnung, Entwurf, Zahlungsavis): shown in a trace, never counted as proof.
 */
export type TwinNode = "auftraggeber" | "vertrag" | "preisbasis" | "fund" | "verrechnet";

const NODE: Record<BelegArt, TwinNode> = {
  vertrag: "vertrag",
  preisbasis: "preisbasis",
  korrekturblatt: "auftraggeber",
  abzugsschreiben: "auftraggeber",
  abschlagsrechnung: "verrechnet",
  zahlungsavis: "verrechnet",
  schlussrechnung: "verrechnet",
  entwurf: "verrechnet",
  leistungsverzeichnis: "fund",
  plan: "fund",
  indexblatt: "fund",
  aufmassblatt: "fund",
  fotodokumentation: "fund",
  email: "fund",
  foto: "fund",
  regiebericht: "fund",
  stundenzettel: "fund",
  grosshaendlerrechnung: "fund",
  nachtrag: "fund",
};

export type TwinGroup = Belegsgruppe | "whatsapp";

export type TwinBeleg = {
  id: string;
  /** Raw kind for icons and rules; `kind` is the word shown. */
  art: BelegArt | "whatsapp";
  title: string;
  /** Second line: for a WhatsApp-Meldung what was done and where. */
  detail: string | null;
  kind: string;
  group: string;
  groupKey: TwinGroup;
  date: { iso: string; text: string };
  copy: boolean;
  node: TwinNode;
  /** Findings this Beleg proves; empty for a Beleg of node "verrechnet" (see `shows`). */
  finds: string[];
  /** Findings whose invoiced quantity this Beleg shows (Entwurf, Abschlagsrechnung); never proof. */
  shows: string[];
};

/** One cell of the Abgleich: a position of the Leistungsverzeichnis or a service without one. */
export type TwinCell = {
  id: string;
  /** Index in the Leistungsverzeichnis; null in the row without position. */
  index: number | null;
  label: string;
  state: "verrechnet" | "menge_abweichend" | "pauschale" | "fund";
  find: string | null;
  cells: { beauftragt: string; erbracht: string; verrechnet: string };
};

export type TwinFind = {
  number: string;
  /** The find page. */
  href: string;
  /** Short name for the row ("Plan H-201 Index C → D", "Regiebericht 9", "Mehrschichtverbundrohr"). */
  label: string;
  kind: string;
  title: string;
  /** "4 Positionen über dem Leistungsverzeichnis", "nicht unterschrieben". */
  detail: string;
  /** Which money word the finding belongs to; never added across both. */
  bucket: "zusaetzlich" | "klaerung" | "pauschale";
  belegstand: { state: Belegstand; text: string } | null;
  amount: { cent: number; text: string };
  /** Cells of the finding: position numbers, or the id of its row without position. */
  cells: string[];
  /** "Gleicher Grund bei diesem Auftraggeber schon im …" from the Auftraggeber history, if any. */
  sameReason: string | null;
  /** The Vorprüfung line that lies in this finding ("Kürzungsrisiko: Aufmaß nicht gegengezeichnet"). */
  risk: { reason: string; amount: string; alreadyCut: boolean } | null;
  /** What closes the gap of a finding that is not "belegt" ("Regiebericht vom Polier unterschreiben lassen"). */
  remedy: string | null;
};

export type TwinView = {
  project: { slug: string; name: string; client: string; date: { label: string; text: string } | null; status: { colour: StatusColour; text: string } };
  belege: TwinBeleg[];
  counts: { belege: number; copies: number; whatsapp: number; perGroup: Record<TwinGroup, number> };
  groups: { key: TwinGroup; title: string; note: string }[];
  business: {
    counts: { clients: number; contracts: number; projects: number };
    client: { name: string; kind: string; projects: number; href: string };
    contract: { date: string; kind: string; norm: string; sum: string };
    priceBasis: { label: string; hourly: string | null };
  };
  /** Per plan number its indices in date order ("H-201", ["C", "D"]). */
  planChains: { plan: string; indices: string[] }[];
  abgleich: { positions: TwinCell[]; withoutPosition: TwinCell[]; counts: Record<TwinCell["state"], number> };
  finds: TwinFind[];
  money: { extra: string; atRisk: string | null; unclear: string; missing: string; changeOrder: string };
};

function cellState(z: Positionszeile): TwinCell["state"] {
  if (z.fundSchluessel) return "fund";
  if (z.art !== "position") return "verrechnet";
  if (z.erbracht === null) return "pauschale";
  return z.erbracht === z.beauftragt ? "verrechnet" : "menge_abweichend";
}

/** Short name of a finding for its row, from the core's own title and positions. */
function findLabel(f: Fund): string {
  const before = (sep: string) => f.titel.split(sep)[0].trim();
  switch (f.art) {
    case "mehrmenge":
    case "nicht_verrechnet":
      return f.positionen.length === 1 ? f.positionen[0].kurztext.split(" ")[0] : before(":");
    case "regie":
      return before(",");
    case "stunden_ohne_regiebericht":
      return f.titel.includes(", ") ? f.titel.slice(f.titel.indexOf(", ") + 2) : f.titel;
    default:
      return before(":");
  }
}

const BUCKET: Record<Belegstand, TwinFind["bucket"]> = { belegt: "zusaetzlich", beleg_fehlt: "klaerung", nachtrag_nicht_gelegt: "klaerung" };

/** Projects that have an overview: the open ones the core compares. */
export function twinProjects(): string[] {
  const b = business();
  return b.projekte.filter((p) => b.ergebnisse[p.projektId].abgleich.laeuft).map((p) => p.projektId);
}

/** The overview of one open project; null for a project that is not compared (Schlussrechnung submitted, closed). */
export function twinView(projektId: string): TwinView | null {
  const b = business();
  const d = firm().projekte.find((x) => x.projekt.id === projektId);
  const e = b.ergebnisse[projektId];
  const row = projectRows().find((r) => r.id === projektId);
  if (!d || !row || !e.abgleich.laeuft) return null;
  const p = b.projekte.find((x) => x.projektId === projektId)!;
  const h = b.historie.find((x) => x.auftraggeber.id === p.auftraggeber.id)!;
  const nrOf = new Map(e.abgleich.funde.map((f) => [f.schluessel, f.nr]));

  const belege: TwinBeleg[] = belegListe(d, e).map((x) => {
    const node = NODE[x.art];
    return {
      id: x.id,
      art: x.art,
      title: x.titel,
      detail: null,
      kind: BELEG_ART_TEXT[x.art],
      group: BELEGGRUPPE_TEXT[x.gruppe],
      groupKey: x.gruppe,
      date: { iso: x.datum, text: datumText(x.datum) },
      copy: x.duplikatVon !== null,
      node,
      finds: node === "verrechnet" ? [] : x.funde,
      shows: node === "verrechnet" ? x.funde : [],
    };
  });
  const messages: TwinBeleg[] = d.meldungen.map((m) => ({
    id: m.id,
    art: "whatsapp",
    title: `WhatsApp-Meldung ${m.nr}`,
    detail: `${m.taetigkeit.wert}, ${m.ort.wert}`,
    kind: "WhatsApp-Meldung",
    group: "WhatsApp-Meldungen",
    groupKey: "whatsapp",
    date: { iso: m.zeitpunkt.slice(0, 10), text: datumText(m.zeitpunkt.slice(0, 10)) },
    copy: false,
    node: "fund",
    finds: e.abgleich.funde.filter((f) => f.nachweise.some((n) => n.quelle.belegId === m.id)).map((f) => f.nr),
    shows: [],
  }));

  const lvIndex = new Map(d.positionen.map((x, i) => [x.nr.wert, i]));
  const cell = (z: Positionszeile, i: number): TwinCell => ({
    id: z.positionNr ?? `ohne-${i}`,
    index: z.positionNr ? (lvIndex.get(z.positionNr) ?? null) : null,
    label: z.text,
    state: cellState(z),
    find: z.fundSchluessel ? (nrOf.get(z.fundSchluessel) ?? null) : null,
    cells: z.zellen,
  });
  const positions = e.positionen.zeilen.filter((z) => z.art === "position").map(cell);
  const withoutPosition = e.positionen.zeilen.filter((z) => z.art !== "position").map(cell);
  const counts = { verrechnet: 0, menge_abweichend: 0, pauschale: 0, fund: 0 };
  for (const c of [...positions, ...withoutPosition]) counts[c.state] += 1;

  const sameReason = new Map<string, string>();
  for (const r of e.vorpruefung?.risiken ?? []) {
    const note = b.gleicherGrund[`${projektId}/${r.schluessel}`]?.[0];
    const nr = r.fundSchluessel ? nrOf.get(r.fundSchluessel) : undefined;
    if (note && nr) sameReason.set(nr, note.text);
  }
  const riskOf = (schluessel: string): TwinFind["risk"] => {
    const r = e.vorpruefung?.risiken.find((x) => x.fundSchluessel === schluessel);
    return r ? { reason: KUERZUNGSGRUND_TEXT[r.grund], amount: euro(r.betrag), alreadyCut: r.zustand === "schon_gekuerzt" } : null;
  };
  const cellsOf = (nr: string) => [...positions, ...withoutPosition].filter((c) => c.find === nr).map((c) => c.id);

  const all = [...belege, ...messages];
  const perGroup: Record<TwinGroup, number> = { systeme: 0, dokumente: 0, kommunikation: 0, whatsapp: 0 };
  for (const x of all) perGroup[x.groupKey] += 1;
  const s = e.abgleich.summen;
  return {
    project: {
      slug: projectSlug(d.projekt.name),
      name: d.projekt.name,
      client: p.auftraggeber.kurzname,
      date: row.date ? { label: row.date.label, text: row.date.text } : null,
      status: { colour: row.status.colour, text: row.status.text },
    },
    belege: all,
    counts: { belege: belege.length, copies: e.ordner.duplikate, whatsapp: messages.length, perGroup },
    groups: [
      { key: "systeme", title: BELEGGRUPPE_TEXT.systeme, note: "aus Ordner importiert" },
      { key: "dokumente", title: BELEGGRUPPE_TEXT.dokumente, note: "" },
      { key: "kommunikation", title: BELEGGRUPPE_TEXT.kommunikation, note: "" },
      { key: "whatsapp", title: "WhatsApp-Meldungen", note: "nicht im Ordner" },
    ],
    business: {
      counts: { clients: b.historie.length, contracts: b.summen.projekte, projects: b.summen.projekte },
      client: { name: p.auftraggeber.name, kind: AUFTRAGGEBER_ART_TEXT[p.auftraggeber.art], projects: h.projekte, href: `/auftraggeber/${clientSlug(p.auftraggeber.kurzname)}/` },
      contract: { date: datumText(d.vertrag.datum.wert), kind: d.vertrag.vertragsart.wert, norm: d.vertrag.norm.wert, sum: euro(d.vertrag.auftragssumme.wert) },
      priceBasis: { label: d.preisbasis ? "Preisbasis K3 und K7" : "keine Preisbasis", hourly: d.preisbasis ? `Mittellohnpreis ${euro(d.preisbasis.mittellohnpreis.wert)} je Stunde` : null },
    },
    planChains: e.ordner.planketten.map((k) => ({ plan: k.planNr, indices: k.indizes.map((i) => i.index) })),
    abgleich: { positions, withoutPosition, counts },
    finds: e.abgleich.funde.map((f) => ({
      number: f.nr,
      href: `/funde/${findSlug(p.name, f.nr)}/`,
      label: findLabel(f),
      kind: FUND_ART_TEXT[f.art],
      title: f.titel,
      detail: f.untertitel,
      bucket: f.belegstand ? BUCKET[f.belegstand] : "pauschale",
      belegstand: f.belegstand ? { state: f.belegstand, text: BELEGSTAND_TEXT[f.belegstand] } : null,
      amount: { cent: f.betrag, text: euro(f.betrag) },
      cells: cellsOf(f.nr),
      sameReason: sameReason.get(f.nr) ?? null,
      risk: riskOf(f.schluessel),
      remedy: f.abhilfe,
    })),
    money: {
      extra: euro(s.zusaetzlichVerrechenbar),
      atRisk: e.vorpruefung ? euro(e.vorpruefung.davonMitKuerzungsrisiko) : null,
      unclear: euro(s.inKlaerung),
      missing: euro(s.belegFehlt),
      changeOrder: euro(s.nachtragNichtGelegt),
    },
  };
}
