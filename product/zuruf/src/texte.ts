// Alle Sätze, die der Agent schickt. Fester Text statt KI-Formulierung: vorhersehbar, kurz, prüfbar.
// Regeln aus GESTALTUNG.md: du, kurz, keine Abrechnungsbegriffe, nie über Geld, Recht oder GU entscheiden.

import { normalisiere } from "./belege.ts";
import { projektNachId } from "./firma.ts";
import type { Antwort, Eintrag, Feldname, Knopf } from "./typen.ts";

export const KNOPF = {
  einwJa: { id: "einw_ja", titel: "Ja, passt" },
  einwNein: { id: "einw_nein", titel: "Nein danke" },
  wiederJa: { id: "einw_ja", titel: "Ja, aufnehmen" },
  passt: { id: "passt", titel: "Passt" },
  aendern: { id: "aendern", titel: "Ändern" },
  anweiserBauleiterGu: { id: "anweiser:bauleiter_gu", titel: "Bauleiter GU" },
  anweiserBauherr: { id: "anweiser:bauherr", titel: "Bauherr" },
  anweiserWeissNicht: { id: "anweiser:weissnicht", titel: "Weiß nicht" },
  personen1: { id: "personen:1", titel: "Allein" },
  personen2: { id: "personen:2", titel: "Zu zweit" },
  personen3: { id: "personen:3", titel: "Zu dritt" },
  abgeschlossenJa: { id: "abgeschlossen:ja", titel: "Ja, stimmt" },
  abgeschlossenAndere: { id: "abgeschlossen:andere", titel: "Andere Baustelle" },
} satisfies Record<string, Knopf>;

export const projektKnopf = (id: string): Knopf => ({ id: `projekt:${id}`, titel: projektNachId(id)?.kurz ?? id });

export function begruessung(firma: string): Antwort {
  return {
    zweck: "begruessung",
    text:
      `Servus! Ich bin ein Programm von ${firma} und lege deine Meldungen von der Baustelle ab, lesen tut sie nur unser Büro. ` +
      `Mitmachen ist freiwillig, mit „stopp“ hörst du jederzeit auf. Passt das für dich?`,
    knoepfe: [KNOPF.einwJa, KNOPF.einwNein],
  };
}

export const einwilligungNochmal = (meldungWartet: boolean): Antwort => ({
  zweck: "begruessung",
  text: meldungWartet ? "Deine Meldung hab ich. Ich leg sie ab, sobald du ja sagst." : "Magst du mitmachen? Ja oder nein reicht.",
  knoepfe: [KNOPF.einwJa, KNOPF.einwNein],
});

export const abgelehnt = (): Antwort => ({
  zweck: "stopp",
  text: "Alles klar, ich speichere nichts, auch nicht deine Nachricht von vorhin.",
});

export const stopp = (verworfen: boolean): Antwort => ({
  zweck: "stopp",
  text: verworfen
    ? "Passt, das von vorhin hab ich verworfen und ich nehm nichts mehr auf. Wenn du wieder was melden willst, schreib einfach."
    : "Passt, ich nehm nichts mehr auf. Wenn du wieder was melden willst, schreib einfach.",
});

export const gestopptHinweis = (): Antwort => ({
  zweck: "gestoppt_hinweis",
  text: "Du hattest „stopp“ geschrieben. Soll ich wieder aufnehmen?",
  knoepfe: [KNOPF.wiederJa, KNOPF.einwNein],
});

export const wiederDabei = (): Antwort => ({
  zweck: "hinweis_zweck",
  text: "Passt. Schick einfach, was du gemacht hast.",
});

export const hinweisGeldRecht = (wiederholt = false): Antwort => ({
  zweck: "hinweis_geld_recht",
  text: wiederholt
    ? "Versteh ich. Ich geb das so ans Büro weiter, entscheiden kann ich es nicht."
    : "Das schaut sich unser Büro an, das entscheide ich nicht. Ich lege nur ab, was du meldest.",
});

export const sammeln = (anzahl: number): Antwort => ({
  zweck: "sammeln",
  text: `Hab Punkt ${anzahl}, schick weiter.`,
});

export const offenOben = (): Antwort => ({
  zweck: "zusammenfassung",
  text: "Deine Meldung oben ist noch offen.",
  knoepfe: [KNOPF.passt, KNOPF.aendern],
});

export const hinweisZweck = (): Antwort => ({
  zweck: "hinweis_zweck",
  text:
    "Ich bin ein Programm der Firma. Ich lege deine Meldungen mit Sprachnachricht und Foto ab, lesen tut sie nur unser Büro. " +
    "Mitmachen ist freiwillig, „stopp“ beendet es.",
});

export const keinZuruf = (wiederholt: boolean): Antwort => ({
  zweck: "verstanden_nichts",
  text: wiederholt ? "Kein Problem." : "Das ist nichts für mich, ich nehm nur Meldungen von der Baustelle auf.",
});

export const verstehe = (): Antwort => ({ zweck: "hinweis_zweck", text: "Verstehe." });

export const nichtsOffen = (): Antwort => ({
  zweck: "verstanden_nichts",
  text: "Da ist gerade nichts offen. Schick einfach, was du gemacht hast.",
});

export const technischesProblem = (): Antwort => ({
  zweck: "verstanden_nichts",
  text: "Ich hab gerade ein technisches Problem. Deine Nachricht ist gesichert, das Büro schaut sie sich an.",
});

export const aendernFrage = (): Antwort => ({
  zweck: "aendern_frage",
  text: "Was soll ich ändern? Schreib oder sprich es einfach.",
});

export function frageProjekt(kandidaten: string[], alle: string[]): Antwort {
  if (kandidaten.length >= 2 && kandidaten.length <= 3) {
    return { zweck: "rueckfrage", text: "Welche Baustelle?", knoepfe: kandidaten.map(projektKnopf) };
  }
  return {
    zweck: "rueckfrage",
    text: "Welche Baustelle?",
    liste: { titel: "Baustelle wählen", eintraege: alle.map(projektKnopf) },
  };
}

export const frageAbgeschlossen = (kurz: string): Antwort => ({
  zweck: "rueckfrage",
  text: `${kurz} ist bei uns schon abgeschlossen. War es wirklich ${kurz}?`,
  knoepfe: [KNOPF.abgeschlossenJa, KNOPF.abgeschlossenAndere],
});

export const frageLeistung = (): Antwort => ({
  zweck: "rueckfrage",
  text: "Was hast du gemacht? Ein Satz reicht.",
});

export const frageAnweiser = (punkt?: number): Antwort => ({
  zweck: "rueckfrage",
  text: punkt ? `Wer hat Punkt ${punkt} angeschafft?` : "Wer hat das angeschafft?",
  knoepfe: [KNOPF.anweiserBauleiterGu, KNOPF.anweiserBauherr, KNOPF.anweiserWeissNicht],
});

const UNKLAR_TEXT: Partial<Record<Feldname, string>> = {
  ort: "Wo genau war das? Das hab ich nicht verstanden.",
  leistung: "Was hast du gemacht? Das hab ich nicht verstanden.",
  menge: "Wie viel war das? Das hab ich nicht verstanden.",
  personen: "Wie viele wart ihr? Das hab ich nicht verstanden.",
  dauerStunden: "Wie lang hat es gedauert? Das hab ich nicht verstanden.",
  angewiesenVon: "Wer hat das angeschafft? Das hab ich nicht verstanden.",
  datum: "An welchem Tag war das? Das hab ich nicht verstanden.",
};

export const frageUnklar = (feld: Feldname): Antwort => ({
  zweck: "rueckfrage",
  text: UNKLAR_TEXT[feld] ?? "Da hab ich was nicht verstanden. Kannst du es nochmal sagen?",
  knoepfe: feld === "personen" ? [KNOPF.personen1, KNOPF.personen2, KNOPF.personen3] : undefined,
});

export const frageAufwand = (): Antwort => ({
  zweck: "rueckfrage",
  text: "Wie lang hat es gedauert?",
});

const OFFEN_NAME: Partial<Record<Feldname, string>> = {
  projektId: "welche Baustelle",
  ort: "wo genau",
  leistung: "was gemacht",
  menge: "wie viel",
  personen: "wie viele Leute",
  dauerStunden: "wie lang",
  angewiesenVon: "wer angeschafft hat",
  datum: "welcher Tag",
};

function tag(datum: string): string {
  const [, m, d] = datum.split("-");
  return `${Number(d)}.${Number(m)}.`;
}

function zahl(n: number): string {
  return String(n).replace(".", ",");
}

/** Wenige kurze Zeilen pro Punkt. Fehlendes erscheint als „Offen“, nicht geraten. */
export function punktZeilen(e: Eintrag, heute: string, offen: Feldname[] = []): string[] {
  const zeilen: string[] = [];
  const projekt = e.projektId ? (projektNachId(e.projektId.wert)?.kurz ?? e.projektId.wert) : "Baustelle offen";
  const wo = [projekt, e.ort?.wert].filter(Boolean).join(", ");
  const wann = e.datum && e.datum.wert !== heute ? ` (am ${tag(e.datum.wert)})` : "";
  zeilen.push(wo + wann);
  const material = e.material && !normalisiere(e.leistung?.wert ?? "").includes(normalisiere(e.material.wert)) ? e.material.wert : undefined;
  const was = [e.leistung?.wert ?? "Arbeit offen", e.menge ? `${zahl(e.menge.wert.wert)} ${e.menge.wert.einheit}` : undefined, material]
    .filter(Boolean)
    .join(", ");
  zeilen.push(e.grund ? `${was} (${e.grund.wert})` : was);
  const leute = e.personen ? `${e.personen.wert} ${e.personen.wert === 1 ? "Person" : "Leute"}` : undefined;
  const stunden = e.dauerStunden ? `${zahl(e.dauerStunden.wert)} ${e.dauerStunden.wert === 1 ? "Stunde" : "Stunden"}` : undefined;
  if (leute || stunden) zeilen.push([leute, stunden].filter(Boolean).join(", "));
  if (e.angewiesenVon) zeilen.push(`Angeschafft: ${e.angewiesenVon.wert}`);
  const offenText = offen.filter((f) => f !== "projektId" && f !== "leistung").map((f) => OFFEN_NAME[f] ?? f);
  if (offenText.length) zeilen.push(`Offen: ${offenText.join(", ")}`);
  return zeilen;
}

export function zusammenfassung(eintraege: Eintrag[], heute: string, korrektur: boolean, offen: Feldname[][] = []): Antwort {
  const kopf = korrektur ? "Geändert, hab ich jetzt so:" : "Danke, hab ich so:";
  const koerper =
    eintraege.length === 1
      ? punktZeilen(eintraege[0]!, heute, offen[0]).join("\n")
      : eintraege.map((e, i) => `${i + 1}) ${punktZeilen(e, heute, offen[i]).join(", ")}`).join("\n");
  return { zweck: "zusammenfassung", text: `${kopf}\n${koerper}`, knoepfe: [KNOPF.passt, KNOPF.aendern] };
}

export function gespeichert(anzahl: number, korrektur: boolean): Antwort {
  if (korrektur) return { zweck: "gespeichert", text: "Geändert. Die alte Fassung bleibt im Verlauf, gilt aber nicht mehr." };
  return {
    zweck: "gespeichert",
    text: anzahl === 1 ? "Abgelegt. Das Büro schaut es sich an." : `Alle ${anzahl} abgelegt. Das Büro schaut sie sich an.`,
  };
}

export const zurueckgezogen = (): Antwort => ({
  zweck: "zurueckgezogen",
  text: "Zurückgenommen. Die Meldung gilt nicht mehr, sie bleibt nur im Verlauf.",
});

export const offenHinweis = (): Antwort => ({
  zweck: "zusammenfassung",
  text: "Deine Meldung von vorhin ist noch offen:",
});

/** Hängt einen Hinweis vor die nächste Antwort, damit es eine Nachricht bleibt (GESTALTUNG.md Regel 1). */
export function zusammenlegen(vorne: Antwort[], antworten: Antwort[]): Antwort[] {
  if (!vorne.length || !antworten.length) return [...vorne, ...antworten];
  const [erste, ...rest] = antworten;
  return [{ ...erste!, text: `${vorne.map((v) => v.text).join(" ")}\n\n${erste!.text}` }, ...rest];
}
