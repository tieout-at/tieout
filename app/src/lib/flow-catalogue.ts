/**
 * The texts of the check catalogue and the palette "Bausteine" for the page "Abläufe" (step 9). A file of its own
 * without the core, so the canvas does not load `kern/` and its sample data; `flows.test.ts` checks the titles against
 * `PRUEFUNGEN` of the core.
 */

import type { PruefungId } from "@tieout/kern";

import type { FlowKind } from "./flows";

/** What each rule of the check catalogue looks for; every rule a construction professional adds becomes one block. */
export const CHECK_TEXT: Record<PruefungId, string> = {
  aufmass_nicht_gegengezeichnet: "Findet Mengen, deren Aufmaßblatt der Auftraggeber nicht gegengezeichnet hat.",
  regie_nicht_unterschrieben: "Findet Regieberichte im Entwurf, die der Auftraggeber nicht unterschrieben hat.",
  stunden_weichen_ab: "Vergleicht die Stunden der Regieberichte mit den Stundenzetteln.",
  rechenfehler: "Rechnet jede Position des Entwurfs nach, Menge mal Einheitspreis.",
  ausserhalb_lv_kein_nachtrag: "Findet Leistungen außerhalb des Leistungsverzeichnisses, zu denen kein Nachtrag gelegt ist.",
  menge_ohne_aufmass: "Findet Mengen im Entwurf, zu denen kein Aufmaß vorliegt.",
  abzug_ohne_vertragspunkt: "Prüft jeden Abzug des Auftraggebers gegen die Punkte des Vertrags.",
  mengenaenderung_ueber_20: "Meldet Positionen, deren Menge um mehr als den Schwellwert vom Leistungsverzeichnis abweicht. Dort kann der Auftraggeber einen neuen Einheitspreis prüfen.",
};

/** The titles of `PRUEFUNGEN` in the core, in its order. */
export const CHECK_TITLES = [
  "Aufmaß nicht gegengezeichnet",
  "Regie nicht unterschrieben",
  "Stunden weichen ab",
  "Rechenfehler",
  "Außerhalb des Leistungsverzeichnisses",
  "Menge ohne Aufmaß-Nachweis",
  "Abzug ohne Vertragspunkt",
  "Mengenänderung über 20 %",
];

/** The building blocks of the palette, by kind: what a business can see and, with the sign-in, switch on. */
export const PALETTE: { kind: FlowKind; title: string; items: string[] }[] = [
  { kind: "ausloeser", title: "Auslöser", items: ["Ordner importiert", "Neue Abschlagsrechnung", "Neue WhatsApp-Meldung", "Schlussrechnung legen bis in 21 Tagen"] },
  { kind: "schritt", title: "Laufschritte", items: ["Ordner lesen", "Abgleich", "Vorprüfung", "Entwurf", "Ausgaben"] },
  { kind: "bedingung", title: "Prüfungen", items: CHECK_TITLES },
  { kind: "aufgabe", title: "Aufgaben", items: ["Aufgabe an Bauleitung", "Aufgabe an Abrechnung", "Freigabe anfordern"] },
];
