// Belegabdeckung (SPEZIFIKATION.md 4.4, candidate B): which Beleg proves which row of the position table. One row per row
// of `positionstabelle`, one column per kind of evidence along the website table "beauftragt, erbracht, verrechnet".
// A cell lists the Belege of its kind that name the position (or the Regiebericht, or the find without a position); a
// Beleg that is there but weak ("nicht gegengezeichnet", "nicht unterschrieben") says so. Duplicates are left out.
// Assignment only; no amount is calculated here.

import { belegTitel } from "./belege";
import type { Datensatz, Datum } from "./modell";
import type { ProjektErgebnis } from "./projekt";
import { datumText } from "./regeln";
import type { Belegstand, Fund, Nachweis } from "./typen";

/** Kinds of evidence, in the order of the website table: beauftragt, erbracht, verrechnet. */
export type Nachweisart = "leistungsverzeichnis" | "plan" | "email" | "whatsapp" | "foto" | "aufmass" | "regie" | "rechnung";

export const NACHWEISARTEN: readonly Nachweisart[] = ["leistungsverzeichnis", "plan", "email", "whatsapp", "foto", "aufmass", "regie", "rechnung"];

export const NACHWEISART_TEXT: Record<Nachweisart, string> = {
  leistungsverzeichnis: "Leistungsverzeichnis",
  plan: "Plan",
  email: "E-Mail",
  whatsapp: "WhatsApp",
  foto: "Foto",
  aufmass: "Aufmaß",
  regie: "Regie und Stunden",
  rechnung: "Rechnung",
};

/** The column of the website table each kind belongs to. */
export const NACHWEISART_SPALTE: Record<Nachweisart, "beauftragt" | "erbracht" | "verrechnet"> = {
  leistungsverzeichnis: "beauftragt",
  plan: "erbracht",
  email: "erbracht",
  whatsapp: "erbracht",
  foto: "erbracht",
  aufmass: "erbracht",
  regie: "erbracht",
  rechnung: "verrechnet",
};

export interface AbdeckungsBeleg {
  /** Id of the Beleg or of the WhatsApp-Meldung. */
  belegId: string;
  titel: string;
  datum: Datum;
  /** The Beleg is there but does not prove enough yet: "nicht gegengezeichnet", "nicht unterschrieben". */
  schwach: string | null;
}

export interface AbdeckungsZeile {
  /** Key of the row of the position table. */
  schluessel: string;
  art: ProjektErgebnis["positionen"]["zeilen"][number]["art"];
  positionNr: string | null;
  text: string;
  belege: Record<Nachweisart, AbdeckungsBeleg[]>;
  /** The find of the row, with its Belegstand and what closes the gap. */
  fund: { nr: string; schluessel: string; belegstand: Belegstand | null; abhilfe: string | null } | null;
}

export interface Belegabdeckung {
  zeilen: AbdeckungsZeile[];
  /** Per kind: how many rows have at least one Beleg of it. */
  jeArt: Record<Nachweisart, number>;
}

const NACHWEIS_ART: Partial<Record<Nachweis["art"], Nachweisart>> = {
  plan: "plan",
  email: "email",
  whatsapp: "whatsapp",
  foto: "foto",
  aufmassblatt: "aufmass",
  fotodokumentation: "aufmass",
  regiebericht: "regie",
  stundenzettel: "regie",
};

const leer = (): Record<Nachweisart, AbdeckungsBeleg[]> => Object.fromEntries(NACHWEISARTEN.map((a) => [a, []])) as unknown as Record<Nachweisart, AbdeckungsBeleg[]>;

export function belegabdeckung(d: Datensatz, e: ProjektErgebnis): Belegabdeckung {
  const doppelt = new Set(e.ordner.duplikatIds);
  // the date written on the document where the twin read one (as the Zeitstrahl shows it), else the file's date
  const datumJe = new Map<string, Datum>([
    ...d.belege.map((b) => [b.id, b.datum] as const),
    ...d.aufmass.map((b) => [b.belegId, b.datum.wert] as const),
    ...d.regie.map((rb) => [rb.belegId, rb.datum.wert] as const),
    ...d.emails.map((m) => [m.belegId, m.datum.wert] as const),
    ...d.plaene.map((p) => [p.belegId, p.datum.wert] as const),
    ...d.fotos.map((f) => [f.belegId, f.zeitpunkt.wert.slice(0, 10)] as const),
    ...d.fotodokumentationen.map((f) => [f.belegId, f.datum.wert] as const),
    ...d.grosshaendlerrechnungen.map((g) => [g.belegId, g.datum.wert] as const),
    ...[...d.abschlaege, ...(d.entwurf ? [d.entwurf] : [])].map((r) => [r.belegId, r.datum.wert] as const),
    ...d.meldungen.map((m) => [m.id, m.zeitpunkt.slice(0, 10)] as const),
  ]);
  const zeilen = new Map<string, AbdeckungsZeile>();
  for (const z of e.positionen.zeilen) zeilen.set(z.schluessel, { schluessel: z.schluessel, art: z.art, positionNr: z.positionNr, text: z.text, belege: leer(), fund: null });

  const dazu = (schluessel: string, art: Nachweisart, belegId: string, schwach: string | null = null) => {
    const zeile = zeilen.get(schluessel);
    if (!zeile || doppelt.has(belegId)) return;
    const liste = zeile.belege[art];
    const da = liste.find((b) => b.belegId === belegId);
    if (da) da.schwach ??= schwach;
    else liste.push({ belegId, titel: belegTitel(d, belegId), datum: datumJe.get(belegId) ?? "", schwach });
  };

  for (const p of d.positionen) dazu(p.nr.wert, "leistungsverzeichnis", p.nr.quelle.belegId);
  for (const p of d.plaene) for (const v of p.vermerke) dazu(v.positionNr.wert, "plan", p.belegId);
  for (const m of d.emails) for (const nr of m.bezugPositionen.wert) dazu(nr, "email", m.belegId);
  for (const f of d.fotos) for (const nr of f.bezugPositionen.wert) dazu(nr, "foto", f.belegId);
  for (const m of d.meldungen) {
    for (const nr of m.bezugPositionen.wert) dazu(nr, "whatsapp", m.id);
    if (m.bezugRegiebericht) dazu(`regie:${m.bezugRegiebericht.wert}`, "whatsapp", m.id);
  }
  for (const b of d.aufmass) for (const z of b.zeilen) dazu(z.positionNr.wert, "aufmass", b.belegId, b.gegengezeichnet.wert ? null : "nicht gegengezeichnet");
  for (const f of d.fotodokumentationen) dazu(f.positionNr.wert, "aufmass", f.belegId);
  for (const rb of d.regie) {
    dazu(`regie:${rb.nr}`, "regie", rb.belegId, rb.unterschrieben.wert ? null : "nicht unterschrieben");
    if (rb.ausMeldung) dazu(`regie:${rb.nr}`, "whatsapp", rb.ausMeldung.wert);
  }
  for (const s of d.stundenzettel) for (const x of s.eintraege) dazu(`regie:${x.regieberichtNr.wert}`, "regie", s.belegId);
  for (const g of d.grosshaendlerrechnungen) dazu(`regie:${g.regieberichtNr.wert}`, "regie", g.belegId);
  for (const r of [...d.abschlaege, ...(d.entwurf ? [d.entwurf] : [])])
    for (const z of r.zeilen) {
      if (z.typ === "position" || z.typ === "zusatz") dazu(z.positionNr.wert, "rechnung", r.belegId);
      if (z.typ === "regie") dazu(`regie:${z.regieberichtNr.wert}`, "rechnung", r.belegId);
    }

  // the find of a row brings the Belege that prove its work (a plan change names its e-mail, message and photo)
  const fundZu = (f: Fund) => (f.positionen.length ? f.positionen.map((p) => p.positionNr) : [f.schluessel]);
  for (const f of e.abgleich.funde)
    for (const s of fundZu(f)) {
      const zeile = zeilen.get(s);
      if (!zeile) continue;
      zeile.fund ??= { nr: f.nr, schluessel: f.schluessel, belegstand: f.belegstand, abhilfe: f.abhilfe };
      for (const n of f.nachweise) {
        const art = n.rolle === "leistung" ? NACHWEIS_ART[n.art] : undefined;
        if (art) dazu(s, art, n.quelle.belegId);
      }
    }

  const alle = [...zeilen.values()];
  for (const z of alle) for (const a of NACHWEISARTEN) z.belege[a].sort((x, y) => x.datum.localeCompare(y.datum) || x.titel.localeCompare(y.titel, "de", { numeric: true }));
  const jeArt = Object.fromEntries(NACHWEISARTEN.map((a) => [a, alle.filter((z) => z.belege[a].length > 0).length])) as Record<Nachweisart, number>;
  return { zeilen: alle, jeArt };
}

/** Per Beleg the rows it proves, for the Belege list ("Belegt 4 Positionen"). */
export function zeilenJeBeleg(a: Belegabdeckung): Map<string, string[]> {
  const je = new Map<string, string[]>();
  for (const z of a.zeilen) for (const art of NACHWEISARTEN) for (const b of z.belege[art]) je.set(b.belegId, [...(je.get(b.belegId) ?? []), z.schluessel]);
  return je;
}

/** "Aufmaßblatt 12 vom 18.09.2026, nicht gegengezeichnet" for a cell's read-out. */
export const abdeckungText = (b: AbdeckungsBeleg) => [`${b.titel} vom ${datumText(b.datum)}`, b.schwach].filter(Boolean).join(", ");
