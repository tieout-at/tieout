// Verstehen: Die KI liest die Nachrichten und liefert Absicht und Angaben mit Zitat.
// Sie entscheidet nichts: ob nachgefragt oder gespeichert wird, regelt gespraech.ts.

import { z } from "zod";
import { FIRMA, firmaAlsText, projektNachId, type Firma } from "./firma.ts";
import { frageStrukturiert, type Aufwand } from "./llm.ts";
import type { Eintrag, Nachricht } from "./typen.ts";

export const ABSICHTEN = [
  "zuruf",
  "neuer_zuruf",
  "bestaetigung",
  "aendern",
  "korrektur_gespeichert",
  "zurueckziehen",
  "frage_geld_recht",
  "frage_zum_agenten",
  "kein_zuruf",
  "stopp",
] as const;
export type Absicht = (typeof ABSICHTEN)[number];

export const ARTEN = ["auftrag", "zusatz_aenderung", "behinderung_wartezeit"] as const;
export type Art = (typeof ARTEN)[number];
export const UNKLAR_FELDER = ["ort", "leistung", "menge", "personen", "dauerStunden", "angewiesenVon", "datum"] as const;
export type UnklarFeld = (typeof UNKLAR_FELDER)[number];

const angabe = <T extends z.ZodType>(wert: T) =>
  z.object({ wert, zitat: z.string(), nachrichtId: z.string() }).nullable();

const KiEintrag = z.object({
  projektId: angabe(z.string()),
  projektKandidaten: z.array(z.string()),
  ort: angabe(z.string()),
  leistung: angabe(z.string()),
  menge: angabe(z.object({ wert: z.number(), einheit: z.string() })),
  personen: angabe(z.number()),
  dauerStunden: angabe(z.number()),
  angewiesenVon: angabe(z.string()),
  datum: angabe(z.string()),
  material: angabe(z.string()),
  art: z.enum(ARTEN),
  unklar: z.array(z.enum(UNKLAR_FELDER)),
});

const KiAntwort = z.object({
  absicht: z.enum(ABSICHTEN),
  enthaeltFrageGeldRecht: z.boolean(),
  eintraege: z.array(KiEintrag),
});

export interface EintragMitHinweis {
  eintrag: Eintrag;
  projektKandidaten: string[];
  art: Art;
  /** Angaben, die der Absender gemacht hat, die aber nicht zu verstehen waren (z. B. „[unverständlich] Mann“). */
  unklar: UnklarFeld[];
}

export interface Verstaendnis {
  absicht: Absicht;
  enthaeltFrageGeldRecht: boolean;
  eintraege: EintragMitHinweis[];
}

export interface VerstehenEingabe {
  /** Nachrichten des Absenders zum offenen Zuruf (ohne die neue). */
  entwurfNachrichten: Nachricht[];
  /** Stand des offenen Zurufs, falls einer offen ist. */
  entwurf?: Eintrag[];
  /** Zuletzt gespeicherte Einträge und ihre Nachrichten, für Korrekturen danach. */
  gespeichert?: { eintraege: Eintrag[]; nachrichten: Nachricht[] };
  /** Gesprächsverlauf in Kurzform (Agent und Absender), älteste zuerst. */
  verlauf: { von: "absender" | "agent"; text: string }[];
  neu: Nachricht;
}

export type Versteher = (eingabe: VerstehenEingabe) => Promise<Verstaendnis>;

function systemPrompt(firma: Firma): string {
  return `Du liest Nachrichten, die Mitarbeiter einer österreichischen Haustechnik-Firma per WhatsApp von der Baustelle schicken. Du lieferst nur Fakten mit wörtlichem Beleg. Was dann passiert (nachfragen, zusammenfassen, speichern), entscheidet ein anderes Programm.

${firmaAlsText(firma)}

Aufgabe: Bestimme die Absicht der NEUEN Nachricht und den vollständigen, aktuellen Stand der gemeldeten Punkte.

Absichten:
- zuruf: meldet eine Arbeit oder ergänzt, beantwortet oder korrigiert den offenen Zuruf. Gilt auch für die erste Meldung, wenn nichts offen ist.
- neuer_zuruf: Ein Zuruf ist offen, aber die neue Nachricht meldet eindeutig etwas anderes, Eigenständiges. eintraege enthält dann NUR die neuen Punkte.
- bestaetigung: stimmt der Zusammenfassung zu (passt, ja, stimmt, basst).
- aendern: will etwas ändern, sagt aber noch nicht was.
- korrektur_gespeichert: Nichts ist offen, aber die Nachricht korrigiert die zuletzt gespeicherten Punkte. eintraege enthält dann den vollständigen korrigierten Stand dieser Punkte.
- zurueckziehen: will die Meldung löschen oder zurücknehmen.
- frage_geld_recht: fragt nur, ob etwas bezahlt wird, ob es verrechenbar ist, was rechtlich gilt oder was man dem GU sagen soll.
- frage_zum_agenten: fragt, wer oder was du bist, wer das liest, was gespeichert wird.
- kein_zuruf: Privates, Smalltalk, Unsinn, nichts zur Arbeit.
- stopp: will nicht mehr mitmachen oder keine Nachrichten mehr.
enthaeltFrageGeldRecht: true, wenn irgendwo in der neuen Nachricht so eine Frage steckt, auch neben einem Zuruf.

Punkte (eintraege): Ein Punkt ist eine Arbeit an einem Ort. Zwei verschiedene Arbeiten oder Orte sind zwei Punkte. Gib bei zuruf und korrektur_gespeichert immer ALLE Punkte des Zurufs mit allen Angaben zurück, nicht nur die Änderung. Spätere Aussagen gehen früheren vor. Bei bestaetigung, aendern, zurueckziehen, frage_*, kein_zuruf, stopp: eintraege leer.

Angaben: Jede Angabe hat wert, zitat und nachrichtId.
- zitat ist eine wörtliche, zusammenhängende Stelle aus einer Nachricht des Absenders (nicht des Agenten), genau so geschrieben wie dort, kurz (1 bis 8 Wörter). Ohne solche Stelle: null. Nichts ergänzen, nichts schließen, nichts aus dem Kontext raten.
- projektId: nur eine id aus der Projektliste, wenn der Absender das Projekt, einen Rufnamen oder einen Bereich nennt, der nur zu EINEM Projekt passt. Sonst null und projektKandidaten mit den passenden ids (z. B. "Wien" passt zu w21 und w10). Ohne jeden Hinweis: projektKandidaten leer. Abgeschlossene Projekte trotzdem eintragen, wenn genannt.
- Worttreue: wert für ort und angewiesenVon in den Worten des Absenders, nur Rechtschreibung glätten. Nichts ergänzen, nichts deuten, keine Klammerzusätze ("der vom GU" bleibt "der vom GU", nicht "Bauleiter vom GU").
- ort: Stiege, Top, Haus, Geschoss, Raum, so wie gesagt.
- leistung: kurze Beschreibung in normalem Deutsch (z. B. "Heizkörper versetzt"), zitat aus der Nachricht.
- menge: nur mit Zahl und Einheit (m, Stk, m², psch). Personen und Stunden sind keine Menge.
- personen: Anzahl Leute, die gearbeitet haben ("zu zweit" = 2, "i allan" = 1). Nur wenn gesagt.
- dauerStunden: Dauer in Stunden, so wie gesagt ("an halben Tag" ist keine Zahl, dann null). Nicht umrechnen, nicht mit Personen multiplizieren.
- angewiesenVon: wer die Arbeit direkt angeschafft oder angeordnet hat, so wie gesagt. Wessen Wunsch es war ("weil die Schule das will"), ist nicht angewiesenVon, wenn jemand anderer es angeschafft hat. Antwortet der Absender auf die Frage danach mit "niemand" oder "keiner", ist der wert "niemand (laut Absender)" mit diesem Zitat.
- datum: JJJJ-MM-TT, nur wenn ein Tag genannt ist ("gestern", "am Montag"); relativ zum Zeitpunkt der Nachricht auflösen.
- material: nur verbautes oder verbrauchtes Material, das ausdrücklich als solches genannt ist und nicht schon in leistung steht. Sonst null.
- art: zusatz_aenderung, wenn es nach zusätzlicher, geänderter oder angeordneter Arbeit klingt (Änderung, Versetzen, Zusatz, Regie, auf Wunsch von jemandem, Mehraufwand). behinderung_wartezeit, wenn nicht gearbeitet werden konnte (Warten, fehlender Kran, Vorgewerk nicht fertig). auftrag bei normaler Arbeit laut Auftrag.
- unklar: Felder, zu denen der Absender etwas gesagt hat, das aber nicht zu verstehen ist (z. B. "[unverständlich] Mann" = personen, "Top [unverständlich]" = ort). Solche Felder bleiben null.
- Fotos: Ein Foto zeigt einen Zustand, nicht was gemacht wurde. Aus einer Bildbeschreibung nur projektId (z. B. Beschriftung an der Wand) und ort übernehmen. leistung, menge, personen, dauerStunden, angewiesenVon, datum, material nie aus einem Foto, nur aus Text oder Sprache.

Antwortknöpfe: Eine Nachricht der Art "knopf" ist der Text des gedrückten Knopfs.
Fotos stehen als Bildbeschreibung da. Sprachnachrichten als Transkript, oft Dialekt mit Fehlern. "[unverständlich]" heißt: Stelle nicht verstanden, nicht raten.`;
}

function nachrichtZeile(n: Nachricht): string {
  return `[${n.id} | ${n.art} | ${n.zeit}] ${n.inhalt}`;
}

function eingabeText(e: VerstehenEingabe): string {
  const teile: string[] = [];
  if (e.gespeichert && e.gespeichert.eintraege.length) {
    teile.push(
      `ZULETZT GESPEICHERT (nur relevant für korrektur_gespeichert):\n${JSON.stringify(e.gespeichert.eintraege)}\nNachrichten dazu:\n${e.gespeichert.nachrichten.map(nachrichtZeile).join("\n")}`,
    );
  }
  if (e.verlauf.length) {
    teile.push(`VERLAUF (älteste zuerst):\n${e.verlauf.map((v) => `${v.von === "agent" ? "Agent" : "Absender"}: ${v.text}`).join("\n")}`);
  }
  if (e.entwurf) {
    teile.push(
      `OFFENER ZURUF, bisheriger Stand:\n${JSON.stringify(e.entwurf)}\nNachrichten des Absenders dazu:\n${e.entwurfNachrichten.map(nachrichtZeile).join("\n") || "(keine)"}`,
    );
  } else {
    teile.push("OFFENER ZURUF: keiner");
  }
  teile.push(`NEUE NACHRICHT:\n${nachrichtZeile(e.neu)}`);
  return teile.join("\n\n");
}

function alsEintrag(k: z.infer<typeof KiEintrag>): Eintrag {
  const e: Eintrag = {};
  if (k.projektId && projektNachId(k.projektId.wert)) e.projektId = k.projektId;
  if (k.ort) e.ort = k.ort;
  if (k.leistung) e.leistung = k.leistung;
  if (k.menge) e.menge = k.menge;
  if (k.personen) e.personen = k.personen;
  if (k.dauerStunden) e.dauerStunden = k.dauerStunden;
  if (k.angewiesenVon) e.angewiesenVon = k.angewiesenVon;
  if (k.datum && /^\d{4}-\d{2}-\d{2}$/.test(k.datum.wert)) e.datum = k.datum;
  if (k.material) e.material = k.material;
  return e;
}

export function kiVersteher(opts: { firma?: Firma; aufwand?: Aufwand } = {}): Versteher {
  const system = systemPrompt(opts.firma ?? FIRMA);
  return async (eingabe) => {
    const antwort = await frageStrukturiert({
      schema: KiAntwort,
      system,
      nachrichten: [{ role: "user", content: eingabeText(eingabe) }],
      aufwand: opts.aufwand ?? "low",
    });
    return {
      absicht: antwort.absicht,
      enthaeltFrageGeldRecht: antwort.enthaeltFrageGeldRecht,
      eintraege: antwort.eintraege.map((k) => ({
        eintrag: alsEintrag(k),
        projektKandidaten: k.projektKandidaten.filter((id) => projektNachId(id)),
        art: k.art,
        unklar: k.unklar.filter((f) => !alsEintrag(k)[f]),
      })),
    };
  };
}
