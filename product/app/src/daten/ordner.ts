// Ordner eines Projekts: Belegmatrix (LV-Position × Belegart, jede Zelle zeigt auf das Original) und Dokumentliste.
// Liest nur Bezüge aus dem Datensatz; Beträge kommen hier keine vor.

import type { Datensatz } from "@/domain/typen";
import type { Ergebnis } from "@/engine";
import { datum } from "@/ui/format";

export type Belegart = "lv" | "aufmass" | "verrechnet" | "plan" | "mail" | "foto" | "zuruf";

export interface Fundstelle {
  /** Dokument- oder Zuruf-Kennung (Ziel des Links). */
  id: string;
  text: string;
  /** Position, zu der die Seite springt (Anker „#pos-…“), wenn das Dokument eine Zeile dafür hat. */
  anker?: string;
}

export interface MatrixZeile {
  nr: string;
  kurztext: string;
  befundHref: string | null;
  zellen: Record<Belegart, Fundstelle[]>;
}

export interface DokumentZeile {
  id: string;
  art: string;
  datei: string;
  datum: string;
  kanal: string;
  seiten: number;
  /** Gleicher Inhalt wie ein früheres Dokument: wird nur einmal gezählt. */
  duplikat: boolean;
}

export function belegmatrix(d: Datensatz, e: Ergebnis, befundHref: (schluessel: string) => string): MatrixZeile[] {
  const plan = new Map(d.plaene.map((p) => [p.dokumentId, p]));
  return d.lv.map((p) => {
    const nr = p.nr.wert;
    const b = e.befunde.find((x) => x.schluessel.endsWith(`:${nr}`));
    const eindeutig = (liste: Fundstelle[]) => liste.filter((f, i) => liste.findIndex((g) => g.id === f.id) === i);
    return {
      nr,
      kurztext: p.kurztext.wert,
      befundHref: b ? befundHref(b.schluessel) : null,
      zellen: {
        lv: [{ id: p.nr.quelle.dokumentId, text: `S. ${p.nr.quelle.seite}`, anker: nr }],
        aufmass: eindeutig(d.aufmass.filter((a) => a.zeilen.some((z) => z.positionNr.wert === nr)).map((a) => ({ id: a.dokumentId, text: a.nr, anker: nr }))),
        verrechnet: eindeutig([
          ...d.abschlaege.filter((r) => r.zeilen.some((z) => z.typ === "lv" && z.positionNr.wert === nr)).map((r) => ({ id: r.dokumentId, text: r.nr.wert, anker: nr })),
          ...(d.entwurf?.zeilen.some((z) => z.typ === "lv" && z.positionNr.wert === nr) ? [{ id: d.entwurf.dokumentId, text: "Entwurf SR", anker: nr }] : []),
        ]),
        plan: eindeutig(
          d.plaene
            .filter((x) => x.vermerke.some((v) => v.positionNr.wert === nr))
            .sort((a, b) => b.index.wert.localeCompare(a.index.wert))
            .map((x) => ({ id: x.dokumentId, text: `${plan.get(x.dokumentId)?.planNr.wert} Index ${x.index.wert}` })),
        ),
        mail: d.mails.filter((m) => m.bezugPositionen.wert.includes(nr)).map((m) => ({ id: m.dokumentId, text: datum(m.datum.wert).slice(0, 6) })),
        foto: d.fotos.filter((f) => f.bezugPositionen.wert.includes(nr)).map((f) => ({ id: f.dokumentId, text: datum(f.exifDatum.wert.slice(0, 10)).slice(0, 6) })),
        zuruf: d.zurufe.filter((z) => z.bezugPositionen.wert.includes(nr)).map((z) => ({ id: z.id, text: z.nr })),
      },
    };
  });
}

const ART: Record<string, string> = {
  vertrag: "Vertrag",
  lv: "LV",
  k7: "K7",
  aufmass: "Aufmaß",
  regie: "Regie",
  stundenliste: "Stundenliste",
  abschlag: "Rechnung",
  sr_entwurf: "Rechnung",
  zahlung: "Zahlung",
  indexblatt: "Index",
  mail: "Mail",
  foto: "Foto",
  plan: "Plan",
  gu_abzug: "Auftraggeber",
  gu_korrektur: "Auftraggeber",
};

export function dokumentliste(d: Datensatz): DokumentZeile[] {
  const gesehen = new Set<string>();
  const liste: DokumentZeile[] = d.dokumente.map((x) => {
    const duplikat = gesehen.has(x.inhaltHash);
    gesehen.add(x.inhaltHash);
    return { id: x.id, art: ART[x.art] ?? x.art, datei: x.dateiname, datum: x.datum, kanal: x.kanal === "whatsapp" ? "WhatsApp" : "Ordner", seiten: x.seiten, duplikat };
  });
  for (const z of d.zurufe) {
    liste.push({ id: z.id, art: "Zuruf", datei: `WhatsApp ${z.nr}`, datum: z.zeitpunkt.slice(0, 10), kanal: "WhatsApp", seiten: 1, duplikat: false });
  }
  return liste.sort((a, b) => b.datum.localeCompare(a.datum) || a.datei.localeCompare(b.datei));
}
