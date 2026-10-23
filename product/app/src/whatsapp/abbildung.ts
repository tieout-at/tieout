// Abbildung Leistungsereignis (Agent) → Zuruf (App): ein Typ in der App, keine Parallelwelt.
// Jede Angabe behält ihr Zitat als Quelle (Stelle = Zitat). Stunden bleiben 0: Der Agent trennt nicht Monteur und
// Helfer und weiß nicht, ob „zwei Mann, sechs Stunden“ 6 oder 12 Stunden sind. Darum rechnet der Rechenkern hier
// nichts; das Büro klärt Stunden und Regiebericht (Go Maxi S. 22.10.2026: neue Zurufe ohne Betrag).

import type { Feld, Zuruf } from "@/domain/typen";
import type { Angabe, Feldname, Leistungsereignis, Nachricht, Rolle } from "../../../whatsapp/src/typen";

export const ROLLE: Record<Rolle, string> = { monteur: "Monteur", polier: "Polier", obermonteur: "Obermonteur", unbekannt: "Absender" };

/** Was auf der Liste „offen“ fehlt, in Worten. Stunden und Regiebericht fehlen immer (kein Betrag ohne Bericht). */
const OFFEN: Partial<Record<Feldname, string>> = {
  projektId: "Baustelle",
  ort: "Ort",
  leistung: "Leistung",
  menge: "Menge",
  personen: "Leute",
  dauerStunden: "Stunden",
  angewiesenVon: "Anweiser",
  datum: "Datum",
};

/** Ein gespeicherter neuer Zuruf im Browser: aktuelle Fassung des Ereignisses, seine Nachrichten, die vergebene Nummer. */
export interface NeueMeldung {
  nr: string;
  ereignis: Leistungsereignis;
  nachrichten: Nachricht[];
}

export const neueZurufId = (ereignisId: string) => `zuruf-neu-${ereignisId}`;

function feld<T>(id: string, a: Angabe<T> | undefined, leer: T): Feld<T> {
  return { wert: a ? a.wert : leer, quelle: { dokumentId: id, seite: 1, stelle: a ? `„${a.zitat}“` : undefined } };
}

export function alsZuruf(n: NeueMeldung): Zuruf {
  const { ereignis: e } = n;
  const id = neueZurufId(e.id);
  const absender = ROLLE[e.rolle];
  const eigene = n.nachrichten.filter((m) => e.nachrichtIds.includes(m.id) && m.art !== "knopf");
  const zeit = e.erfasst.slice(0, 16);
  return {
    id,
    nr: n.nr,
    kanal: "whatsapp",
    zeitpunkt: zeit,
    absender,
    transkript: { wert: eigene.map((m) => m.inhalt).join(" "), quelle: { dokumentId: id, seite: 1 } },
    foto: null,
    ort: feld(id, e.eintrag.ort, ""),
    taetigkeit: feld(id, e.eintrag.leistung, "Leistung offen"),
    stundenMonteur: feld<number>(id, undefined, 0),
    stundenHelfer: feld<number>(id, undefined, 0),
    angewiesenVon: e.eintrag.angewiesenVon ? feld(id, e.eintrag.angewiesenVon, "") : null,
    bezugPositionen: feld<string[]>(id, undefined, []),
    bezugRegie: null,
    bestaetigt: { von: absender, zeitpunkt: zeit },
  };
}

/** „Stunden, Regiebericht“ und was der Agent sonst als offen abgelegt hat. */
export function offenText(e: Leistungsereignis): string {
  const fehlt = e.offen.map((f) => OFFEN[f]).filter((x): x is string => !!x && x !== "Stunden");
  return ["Stunden", "Regiebericht", ...fehlt].join(", ");
}
