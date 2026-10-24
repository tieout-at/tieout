/**
 * The original viewer's pages (SPEZIFIKATION.md 4.2: Attio's chat panel becomes the original). The sample data have no
 * scans, so each page is drawn from the values the twin read from it, in the layout of its kind (a list for an
 * Aufmaßblatt or the Leistungsverzeichnis, a letter for an E-Mail, a message, a plan head, a photo's data), and says so.
 * Nothing is added that the twin did not read: every text on a page is a field of `kern/` with its place.
 */

import { BELEG_ART_TEXT, belegTitel, datumText, euro, gelesen, menge, PRUEFSTAND_TEXT, stunden, type BelegArt, type Datensatz, type GelesenerWert } from "@tieout/kern";

/** A marked place: the viewer marks every part of the page whose place matches the place of the source. */
export type Place = string;

export type PageField = { label: string; value: string; place: Place };

export type OriginalPage = {
  /** `belegId:seite`. */
  key: string;
  belegId: string;
  page: number;
  pages: number;
  title: string;
  art: BelegArt | "whatsapp";
  kind: string;
  file: string | null;
  date: string | null;
  layout: "liste" | "brief" | "nachricht" | "plan" | "foto" | "werte";
  head: PageField[];
  /** A list; `note` is a quiet second line under the first cell (the place of an Aufmaß line). */
  table: { columns: string[]; numeric: number[]; rows: { place: Place; cells: string[]; note?: string }[] } | null;
  /** Running text: the paragraph of an E-Mail, the transcript of a WhatsApp-Meldung, the clouds of a plan. */
  body: { place: Place; label?: string; text: string }[];
  /** Further values read from the page that its layout does not show, so that every marked place is visible. */
  extra: PageField[];
  /** A signature field and whether it is given. */
  sign: { label: string; value: string; place: Place; given: boolean } | null;
  /** Everything the twin read from this page, for the line under the page ("maschinell gelesen", "korrigiert, vorher …"). */
  read: { place: Place; label: string | null; text: string; review: string; before: string | null }[];
};

/** The place in the app's words: a line of a list is named by its position ("Position 22.04.12B"). */
export const placeText = (stelle: string) => stelle.replace(/^Zeile /, "Position ");

/**
 * The place on the page to mark for a source: the part with exactly that place, else the part the place lies in
 * ("Pos. 22.04.12B" for "Pos. 22.04.12B, Einheitspreis"); null if the page has no such part.
 */
export function markOf(page: OriginalPage, source: Place | null): Place | null {
  if (!source) return null;
  const parts = [...page.head.map((h) => h.place), ...(page.table?.rows.map((r) => r.place) ?? []), ...page.body.map((b) => b.place), ...(page.sign ? [page.sign.place] : []), ...page.read.map((r) => r.place)];
  if (parts.includes(source)) return source;
  return parts.filter((p) => source.startsWith(`${p},`)).sort((a, b) => b.length - a.length)[0] ?? null;
}

/** Names of the fields a page of the general layout shows next to their place, where the place alone is ambiguous. */
const LABEL: Record<string, string> = {
  regiesatzMonteur: "Regiesatz Monteur",
  regiesatzHelfer: "Regiesatz Helfer",
  regiematerialZuschlag: "Zuschlag Regiematerial",
  regieUnterschrift: "Regie unterschreibt",
  auftragssumme: "Auftragssumme",
  satz: "Satz",
  stundenMonteur: "Stunden Monteur",
  stundenHelfer: "Stunden Helfer",
  material: "Material",
  summe: "Summe",
  betrag: "Betrag",
  menge: "Menge",
  ep: "Einheitspreis",
  mittellohnkosten: "Mittellohnkosten",
  mittellohnpreis: "Mittellohnpreis",
};

const zeit = (z: string) => `${datumText(z.slice(0, 10))}, ${z.slice(11, 16)}`;

function readOn(werte: GelesenerWert[], page: number): OriginalPage["read"] {
  const seen = new Set<string>();
  return werte
    .filter((w) => w.seite === page)
    .filter((w) => !seen.has(`${w.stelle}|${w.text}`) && !!seen.add(`${w.stelle}|${w.text}`))
    .map((w) => ({ place: w.stelle, label: LABEL[w.schluessel] ?? null, text: w.text, review: PRUEFSTAND_TEXT[w.pruefstand], before: w.vorher }));
}

/**
 * One page of a Beleg or WhatsApp-Meldung as the viewer shows it; null if the twin knows no such Beleg. `pointed` holds
 * the places sources point to (`belegId:seite|stelle`): a value the layout does not show is listed under it only then.
 */
export function originalPage(d: Datensatz, belegId: string, page: number, pointed: ReadonlySet<string> = new Set()): OriginalPage | null {
  const o = layoutPage(d, belegId, page);
  if (!o || o.layout === "werte") return o;
  const shown = new Set([...o.head.map((h) => h.place), ...(o.table?.rows.map((r) => r.place) ?? []), ...o.body.map((b) => b.place), ...(o.sign ? [o.sign.place] : [])]);
  // a value inside a shown part ("Pos. 22.04.12B, Einheitspreis" in the line of 22.04.12B) is shown with it
  const inShown = (place: string) => [...shown].some((x) => place === x || place.startsWith(`${x},`));
  const extra = o.read.filter((r) => !inShown(r.place) && pointed.has(`${o.key}|${r.place}`)).map((r) => ({ label: r.label ?? placeText(r.place), value: r.text, place: r.place }));
  return { ...o, extra };
}

function layoutPage(d: Datensatz, belegId: string, page: number): OriginalPage | null {
  const beleg = d.belege.find((b) => b.id === belegId);
  const meldung = d.meldungen.find((m) => m.id === belegId);
  if (!beleg && !meldung) return null;
  const werte = gelesen(d, belegId);
  const base: OriginalPage = {
    key: `${belegId}:${page}`,
    belegId,
    page,
    pages: beleg?.seiten ?? 1,
    title: belegTitel(d, belegId),
    art: beleg ? beleg.art : "whatsapp",
    kind: beleg ? BELEG_ART_TEXT[beleg.art] : "WhatsApp-Meldung",
    file: beleg?.dateiname ?? null,
    date: beleg ? datumText(beleg.datum) : meldung ? zeit(meldung.zeitpunkt) : null,
    layout: "werte",
    head: [],
    table: null,
    body: [],
    sign: null,
    extra: [],
    read: readOn(werte, page),
  };
  const lvText = new Map(d.positionen.map((p) => [p.nr.wert, p.kurztext.wert]));
  const einheit = new Map(d.positionen.map((p) => [p.nr.wert, p.einheit.wert]));

  if (meldung) {
    return {
      ...base,
      layout: "nachricht",
      head: [
        { label: "Von", value: meldung.absender, place: "Absender" },
        { label: "Ort", value: meldung.ort.wert, place: meldung.ort.quelle.stelle ?? "Ort" },
        { label: "Tätigkeit", value: meldung.taetigkeit.wert, place: meldung.taetigkeit.quelle.stelle ?? "Tätigkeit" },
        ...(meldung.angewiesenVon ? [{ label: "Angewiesen von", value: meldung.angewiesenVon.wert, place: meldung.angewiesenVon.quelle.stelle ?? "Angewiesen" }] : []),
        ...(meldung.stundenMonteur.wert || meldung.stundenHelfer.wert
          ? [
              {
                label: "Stunden",
                value: [meldung.stundenMonteur.wert ? `Monteur ${stunden(meldung.stundenMonteur.wert)}` : "", meldung.stundenHelfer.wert ? `Helfer ${stunden(meldung.stundenHelfer.wert)}` : ""].filter(Boolean).join(", "),
                place: meldung.stundenMonteur.quelle.stelle ?? "Stunden",
              },
            ]
          : []),
        ...(meldung.bezugPositionen.wert.length ? [{ label: "Positionen", value: meldung.bezugPositionen.wert.join(", "), place: meldung.bezugPositionen.quelle.stelle ?? "Bezug" }] : []),
      ],
      body: [{ place: meldung.transkript.quelle.stelle ?? "Transkript", text: meldung.transkript.wert }],
    };
  }

  switch (beleg!.art) {
    case "aufmassblatt": {
      const a = d.aufmass.find((x) => x.belegId === belegId)!;
      const rows = a.zeilen.filter((z) => z.menge.quelle.seite === page);
      const onPage = (q: { seite: number }) => q.seite === page;
      // the place every line shares is written once in the head, not under each line
      const places = [...new Set(rows.map((z) => z.ort.wert))];
      const shared = places.length === 1 ? places[0] : null;
      return {
        ...base,
        layout: "liste",
        head: [
          ...(onPage(a.datum.quelle) ? [{ label: "Datum", value: datumText(a.datum.wert), place: a.datum.quelle.stelle ?? "Kopf" }] : []),
          ...(onPage(a.leistungVon.quelle)
            ? [{ label: "Leistungszeitraum", value: `${datumText(a.leistungVon.wert)} bis ${datumText(a.leistungBis.wert)}`, place: a.leistungVon.quelle.stelle ?? "Kopf" }]
            : []),
          ...(shared ? [{ label: "Ort", value: shared, place: "Kopf, Ort" }] : []),
        ],
        table: rows.length
          ? {
              columns: ["Position", "Menge"],
              numeric: [1],
              rows: rows.map((z) => ({
                place: z.menge.quelle.stelle ?? "",
                cells: [`${z.positionNr.wert} ${lvText.get(z.positionNr.wert) ?? ""}`.trim(), menge(z.menge.wert, einheit.get(z.positionNr.wert))],
                note: shared ? undefined : z.ort.wert,
              })),
            }
          : null,
        sign: onPage(a.gegengezeichnet.quelle)
          ? {
              label: "Unterschrift Auftraggeber",
              value: a.gegengezeichnet.wert ? `gegengezeichnet${a.gegengezeichnetAm ? ` am ${datumText(a.gegengezeichnetAm.wert)}` : ""}` : "nicht gegengezeichnet",
              place: a.gegengezeichnet.quelle.stelle ?? "Unterschrift Auftraggeber",
              given: a.gegengezeichnet.wert,
            }
          : null,
      };
    }
    case "leistungsverzeichnis": {
      const rows = d.positionen.filter((p) => p.ep.quelle.seite === page);
      return {
        ...base,
        layout: "liste",
        table: {
          columns: ["Position", "Menge", "Einheitspreis"],
          numeric: [1, 2],
          rows: rows.map((p) => ({ place: `Pos. ${p.nr.wert}`, cells: [`${p.nr.wert} ${p.kurztext.wert}`, menge(p.menge.wert, p.einheit.wert), euro(p.ep.wert)] })),
        },
      };
    }
    case "plan": {
      const p = d.plaene.find((x) => x.belegId === belegId)!;
      return {
        ...base,
        layout: "plan",
        head: [
          { label: "Plan", value: p.planNr.wert, place: p.planNr.quelle.stelle ?? "Plankopf" },
          { label: "Index", value: p.index.wert, place: p.index.quelle.stelle ?? "Plankopf" },
          { label: "Datum", value: datumText(p.datum.wert), place: p.datum.quelle.stelle ?? "Plankopf" },
          { label: "Inhalt", value: p.titel.wert, place: p.titel.quelle.stelle ?? "Plankopf" },
          ...(p.aenderung ? [{ label: "Änderung", value: p.aenderung.wert, place: p.aenderung.quelle.stelle ?? "Indexfeld" }] : []),
        ],
        // one cloud per text: the twin reads the same note once per position it touches
        body: [...new Map(p.vermerke.map((v) => [v.text.wert, v])).values()].map((v) => ({
          place: v.text.quelle.stelle ?? "",
          text: v.text.wert,
        })),
      };
    }
    case "email": {
      const m = d.emails.find((x) => x.belegId === belegId)!;
      return {
        ...base,
        layout: "brief",
        date: datumText(m.datum.wert),
        head: [
          { label: "Von", value: m.absender.wert, place: m.absender.quelle.stelle ?? "Kopf" },
          { label: "Datum", value: datumText(m.datum.wert), place: m.datum.quelle.stelle ?? "Kopf" },
          { label: "Betreff", value: m.betreff.wert, place: m.betreff.quelle.stelle ?? "Kopf" },
        ],
        body: m.zitat ? [{ place: m.zitat.quelle.stelle ?? "Absatz 1", text: m.zitat.wert }] : [],
      };
    }
    case "foto": {
      const f = d.fotos.find((x) => x.belegId === belegId)!;
      return {
        ...base,
        layout: "foto",
        head: [
          { label: "Aufgenommen", value: zeit(f.zeitpunkt.wert), place: f.zeitpunkt.quelle.stelle ?? "EXIF" },
          { label: "Ort", value: f.ort.wert, place: f.ort.quelle.stelle || "Ort" },
          { label: "Motiv", value: f.motiv.wert, place: f.motiv.quelle.stelle || "Motiv" },
        ],
      };
    }
    default:
      return base;
  }
}
