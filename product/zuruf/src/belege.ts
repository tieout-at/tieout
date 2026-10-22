// Prüft, ob jede Angabe wirklich in einer Nachricht des Absenders steht („nicht raten“).
// Reiner Code ohne KI: Was die KI ohne passendes Zitat liefert, wird verworfen.

import type { Angabe, Eintrag, Feldname, Nachricht } from "./typen.ts";

/** Vergleichsform: klein, ohne Satzzeichen, Leerraum zusammengefasst. Umlaute bleiben. */
export function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFC")
    .replace(/[„“"'’‚‘«»()[\]{}.,;:!?…]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface Verworfen {
  feld: Feldname;
  zitat: string;
  grund: string;
}

const FELDER: Feldname[] = ["projektId", "ort", "leistung", "menge", "personen", "dauerStunden", "angewiesenVon", "datum", "material", "grund"];

/** Ein Foto zeigt einen Zustand, nicht was gemacht wurde: Aus Bildbeschreibungen zählen nur Baustelle und Ort. */
const AUS_FOTO_ERLAUBT = new Set<Feldname>(["projektId", "ort"]);

/** Bei diesen Feldern muss der Wert in den Worten des Absenders stehen (keine Deutung wie „Bauleiter“ aus „der vom GU“). */
const WORTTREU = new Set<Feldname>(["ort", "angewiesenVon"]);
const ERLAUBTE_ZUSAETZE = new Set(["laut", "absender", "niemand", "stiege", "haus", "zimmer"]);

/** Häufige Dialektwörter und ihre Schriftform (Wien, Niederösterreich, Steiermark). Klein halten, nur Eindeutiges. */
const DIALEKT: Record<string, string[]> = {
  gmoa: ["gemeinde"],
  gmeinde: ["gemeinde"],
  kuchl: ["küche"],
  baumasta: ["baumeister"],
  schui: ["schule"],
  oarbeita: ["arbeiter"],
};

function woerter(text: string): string[] {
  return normalisiere(text)
    .split(" ")
    .filter((w) => w.length >= 4);
}

function abstand(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length]![b.length]!;
}

/** Ein Wort gilt als gesagt, wenn es (fast) so vorkommt: Dialekt „Bauleita“ deckt „Bauleiter“, nicht aber ein neues Wort. */
function gesagt(wort: string, gesagteWoerter: Set<string>): boolean {
  if (gesagteWoerter.has(wort) || ERLAUBTE_ZUSAETZE.has(wort)) return true;
  for (const g of gesagteWoerter) {
    if (DIALEKT[g]?.includes(wort)) return true;
    if (g.length >= 4 && abstand(g, wort) <= Math.max(1, Math.floor(wort.length * 0.3))) return true;
  }
  return false;
}

/**
 * Behält nur Angaben, deren Zitat in einer der Nachrichten steht. Stimmt die Nachrichten-ID nicht,
 * aber das Zitat steht in einer anderen Nachricht, wird die ID berichtigt.
 * Bei worttreuen Feldern wird ein umgedeuteter Wert durch das Zitat selbst ersetzt.
 */
export function pruefeBelege(
  eintrag: Eintrag,
  nachrichten: Nachricht[],
): { eintrag: Eintrag; verworfen: Verworfen[]; angepasst: Verworfen[] } {
  const texte = new Map(nachrichten.map((n) => [n.id, normalisiere(n.inhalt)]));
  const art = new Map(nachrichten.map((n) => [n.id, n.art]));
  const alles = new Set(nachrichten.flatMap((n) => normalisiere(n.inhalt).split(" ")));
  const ergebnis: Eintrag = {};
  const verworfen: Verworfen[] = [];
  const angepasst: Verworfen[] = [];
  for (const feld of FELDER) {
    const angabe = eintrag[feld] as Angabe<unknown> | undefined;
    if (!angabe) continue;
    const zitat = normalisiere(angabe.zitat);
    if (!zitat) {
      verworfen.push({ feld, zitat: angabe.zitat, grund: "leeres Zitat" });
      continue;
    }
    const passend = (id: string) => texte.get(id)?.includes(zitat) && (AUS_FOTO_ERLAUBT.has(feld) || art.get(id) !== "foto");
    let id: string | undefined = passend(angabe.nachrichtId) ? angabe.nachrichtId : undefined;
    if (!id) id = [...texte.keys()].find(passend);
    if (!id) {
      const nurFoto = [...texte.entries()].some(([i, t]) => t.includes(zitat) && art.get(i) === "foto");
      verworfen.push({ feld, zitat: angabe.zitat, grund: nurFoto ? "nur aus dem Foto geschlossen" : "Zitat steht in keiner Nachricht" });
      continue;
    }
    let wert = angabe.wert;
    if (WORTTREU.has(feld) && typeof wert === "string") {
      const fremd = woerter(wert).filter((w) => !gesagt(w, alles));
      if (fremd.length) {
        angepasst.push({ feld, zitat: angabe.zitat, grund: `Wert „${wert}“ enthielt nicht gesagte Wörter: ${fremd.join(", ")}` });
        wert = angabe.zitat;
      }
    }
    (ergebnis as Record<Feldname, unknown>)[feld] = { ...angabe, wert, nachrichtId: id };
  }
  return { eintrag: ergebnis, verworfen, angepasst };
}
