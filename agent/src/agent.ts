// Gesprächsführung: fester Code. Die KI (Versteher) liefert Absicht und Angaben mit Zitat,
// dieser Code entscheidet, ob nachgefragt, zusammengefasst oder gespeichert wird.
// Regeln aus GESTALTUNG.md: höchstens eine Frage pro Antwort, höchstens zwei Rückfragen, nichts raten, nichts verlieren.

import { pruefeBelege, normalisiere, type Verworfen } from "./belege.ts";
import { FIRMA, laufendeProjekte, projektNachId, type Firma } from "./firma.ts";
import { aktuellerStand, type Entwurf, type Frage, type PunktZustand, type Speicher, type Zustand } from "./speicher.ts";
import * as T from "./texte.ts";
import type { Antwort, Feldname, Nachricht, Rolle } from "./typen.ts";
import type { Versteher, Verstaendnis } from "./verstehen.ts";

/** Höchstens so viele Rückfragen an einen Absender im Zeitfenster, egal wie viele Entwürfe entstehen. */
export const MAX_RUECKFRAGEN = 2;
const RUECKFRAGEN_FENSTER_MS = 30 * 60_000;
/** Wie weit zurück eine Korrektur nach dem Speichern greifen kann. */
const KORREKTUR_FENSTER_MS = 3 * 60 * 60_000;

/** Was zuerst nachgefragt wird, wenn mehreres unverständlich war: was per Knopf schnell geht und fürs Büro zählt. */
const UNKLAR_REIHENFOLGE = ["personen", "dauerStunden", "menge", "angewiesenVon", "ort", "datum", "leistung"] as const;

/** Welches Feld eine Rückfrage füllen sollte. Bleibt es leer, steht es als offen da. */
const FRAGE_FELD: Record<string, Feldname> = { projekt: "projektId", leistung: "leistung", anweiser: "angewiesenVon", aufwand: "dauerStunden" };

const BESTAETIGUNG = new Set(["passt", "passt so", "basst", "passt eh", "ja", "jo", "jop", "ja passt", "ok", "okay", "stimmt", "genau", "passt danke"]);
const STOPP = new Set(["stopp", "stop", "stopp bitte", "aufhören"]);
const START = new Set(["start", "starten"]);
const JA_WOERTER = new Set(["ja", "jo", "jaja", "passt", "basst", "ok", "okay", "gern", "gerne", "sicher", "freilich", "klar"]);
const NEIN_WOERTER = new Set(["nein", "na", "naa", "nö", "ned", "nicht", "nit", "kein", "keine", "net", "niemals"]);

/** Ja oder Nein in freiem Text (auch Dialekt). undefined, wenn es nicht eindeutig ist. */
export function jaOderNein(text: string): "ja" | "nein" | undefined {
  const w = normalisiere(text).split(" ");
  const ja = w.some((x) => JA_WOERTER.has(x));
  const nein = w.some((x) => NEIN_WOERTER.has(x));
  if (ja && !nein) return "ja";
  if (nein && !ja) return "nein";
  return undefined;
}

export interface Protokoll {
  verworfen: (Verworfen & { nachrichtId: string })[];
  angepasst: (Verworfen & { nachrichtId: string })[];
  fehler: string[];
}

export class ZurufAgent {
  readonly protokoll: Protokoll = { verworfen: [], angepasst: [], fehler: [] };
  private zaehler = 0;

  constructor(
    private speicher: Speicher,
    private versteher: Versteher,
    private opts: { firma?: Firma; kanal?: "simulator" | "whatsapp"; firmenname?: string } = {},
  ) {}

  private get firma() {
    return this.opts.firma ?? FIRMA;
  }

  async verarbeite(n: Nachricht, rolle: Rolle = "unbekannt"): Promise<Antwort[]> {
    return this.verarbeiteBuendel([n], rolle);
  }

  /**
   * Mehrere Nachrichten, die fast gleichzeitig ankommen (Foto, Sekunden später Text), als eine Meldung behandeln.
   * Der Kanal sammelt sie in einem kurzen Fenster; der Agent antwortet einmal.
   */
  async verarbeiteBuendel(ns: Nachricht[], rolle: Rolle = "unbekannt"): Promise<Antwort[]> {
    const neu = ns.filter((n) => this.speicher.eingang(n));
    if (!neu.length) return [];
    const z = this.speicher.zustand(neu[0]!.absenderId, rolle);
    for (const n of neu) z.verlauf.push({ von: "absender", text: `${n.art === "knopf" ? "[Knopf] " : n.art === "foto" ? "[Foto] " : ""}${n.inhalt}` });
    let antworten: Antwort[];
    try {
      antworten = await this.schritt(z, neu.at(-1)!, neu.slice(0, -1));
    } catch (e) {
      this.protokoll.fehler.push(`${neu.at(-1)!.id}: ${e instanceof Error ? e.message : String(e)}`);
      antworten = [T.technischesProblem()];
    }
    for (const a of antworten) z.verlauf.push({ von: "agent", text: a.text });
    if (antworten.length) z.letzterZweck = antworten.at(-1)!.zweck;
    if (z.verlauf.length > 30) z.verlauf.splice(0, z.verlauf.length - 30);
    return antworten;
  }

  /** Am Ende des Tages (oder des Tests): Offene Zurufe nicht verlieren, sondern unbestätigt ablegen. */
  tagesabschluss(z: Zustand): void {
    if (z.entwurf && z.einwilligung === "erteilt" && z.entwurf.punkte.length) this.ablegen(z, "unbestaetigt");
    z.entwurf = undefined;
  }

  private async schritt(z: Zustand, n: Nachricht, vorher: Nachricht[] = []): Promise<Antwort[]> {
    const text = normalisiere(n.inhalt);

    if (n.art !== "knopf" && STOPP.has(text)) return this.stoppen(z);

    if (z.einwilligung !== "erteilt") {
      z.wartend.push(...vorher);
      return this.einwilligung(z, n, text);
    }

    if (n.art === "knopf" && n.knopfId && !vorher.length) return this.knopf(z, n);

    if (!vorher.length && z.entwurf?.phase === "warte_bestaetigung" && BESTAETIGUNG.has(text)) return this.bestaetigen(z);

    const warOffen = !!z.entwurf;
    const v = await this.versteher({
      entwurfNachrichten: z.entwurf?.nachrichten ?? [],
      entwurf: z.entwurf?.punkte.map((p) => p.eintrag),
      gespeichert: this.gespeicherteFuerKontext(z, n),
      verlauf: z.verlauf.slice(0, -1 - vorher.length),
      neu: n,
      mitgeschickt: vorher.length ? vorher : undefined,
    });
    if (vorher.length) {
      if (!z.entwurf) z.entwurf = { nachrichten: [], punkte: [], gestellt: [], phase: "sammeln" };
      z.entwurf.nachrichten.push(...vorher);
      // Ein Bündel ohne offenen Zuruf ist eine Meldung, kein Nachtrag zu etwas Leerem (LERNEN.md L17).
      if (!warOffen && v.absicht === "neuer_zuruf") v.absicht = "zuruf";
    }
    return this.nachAbsicht(z, n, v);
  }

  /** Erster Kontakt, Ablehnung oder nach „stopp“: nur mit Zustimmung aufnehmen, höchstens einmal nachfragen. */
  private async einwilligung(z: Zustand, n: Nachricht, text: string): Promise<Antwort[]> {
    const wahl =
      n.knopfId === T.KNOPF.einwJa.id ? "ja" : n.knopfId === T.KNOPF.einwNein.id ? "nein" : z.begruesst && n.art !== "foto" ? jaOderNein(n.inhalt) : undefined;
    if (wahl === "ja" || (z.einwilligung === "gestoppt" && START.has(text))) {
      z.einwilligung = "erteilt";
      z.einwilligungErinnert = false;
      const wartend = z.wartend.filter((w) => w.art !== "knopf" && !jaOderNein(w.inhalt) && !START.has(normalisiere(w.inhalt)));
      z.wartend = [];
      if (!wartend.length) return [T.wiederDabei()];
      return this.schritt(z, wartend.at(-1)!, wartend.slice(0, -1));
    }
    if (wahl === "nein") {
      z.einwilligung = z.einwilligung === "gestoppt" ? "gestoppt" : "abgelehnt";
      z.wartend = [];
      z.begruesst = false;
      return [T.abgelehnt()];
    }
    z.wartend.push(n);
    if (!z.begruesst) {
      z.begruesst = true;
      return [z.einwilligung === "gestoppt" ? T.gestopptHinweis() : T.begruessung(this.opts.firmenname ?? "Haustechnik Beispiel")];
    }
    if (!z.einwilligungErinnert) {
      z.einwilligungErinnert = true;
      return [T.einwilligungNochmal(n.art !== "knopf" && normalisiere(n.inhalt).split(" ").length > 3)];
    }
    // Nicht drängen: Ohne klare Antwort wird nichts gespeichert und nicht weiter nachgefragt.
    return [];
  }

  /** Alle eigenen, gültigen Einträge der letzten Stunden, auch unbestätigte, mit ihren Nachrichten als Belegbasis. */
  private gespeicherteFuerKontext(z: Zustand, n: Nachricht) {
    if (z.entwurf) return undefined;
    const grenze = new Date(n.zeit).getTime() - KORREKTUR_FENSTER_MS;
    const ereignisse = aktuellerStand(this.speicher.ereignisse()).filter(
      (e) => e.absenderId === z.absenderId && e.status !== "zurueckgezogen" && new Date(e.erfasst).getTime() >= grenze,
    );
    if (!ereignisse.length) return undefined;
    const ids = new Set(ereignisse.flatMap((e) => e.nachrichtIds));
    const nachrichten = [...ids].map((id) => this.speicher.nachricht(id)).filter((m): m is Nachricht => !!m);
    return { eintraege: ereignisse.map((e) => ({ id: e.id, eintrag: e.eintrag })), nachrichten };
  }

  private async nachAbsicht(z: Zustand, n: Nachricht, v: Verstaendnis): Promise<Antwort[]> {
    const wiederholtGeld =
      z.letzterZweck === "hinweis_geld_recht" || z.verlauf.slice(-6).some((x) => x.von === "agent" && x.text.includes(T.hinweisGeldRecht().text));
    const vorne: Antwort[] = v.enthaeltFrageGeldRecht && v.absicht !== "frage_geld_recht" ? [T.hinweisGeldRecht(wiederholtGeld)] : [];
    if (v.ungeduldig && z.entwurf) z.entwurf.keineFragenMehr = true;
    switch (v.absicht) {
      case "stopp":
        return this.stoppen(z);
      case "bestaetigung":
        if (z.entwurf?.phase === "warte_bestaetigung") return this.bestaetigen(z);
        return z.entwurf ? this.weiter(z) : [T.nichtsOffen()];
      case "aendern":
        if (!z.entwurf) return [T.nichtsOffen()];
        z.entwurf.phase = "warte_aenderung";
        return [T.aendernFrage()];
      case "zurueckziehen":
        return this.zurueckziehen(z);
      case "frage_geld_recht":
        return T.zusammenlegen([T.hinweisGeldRecht(wiederholtGeld)], this.erinnern(z));
      case "frage_zum_agenten":
        return T.zusammenlegen([T.hinweisZweck()], this.erinnern(z));
      case "kein_zuruf":
        // Bei offenem Zuruf ist es meist ein Seufzer oder Kommentar („na hoffentlich“): zuhören, nicht abweisen.
        if (z.entwurf?.phase === "warte_bestaetigung") return T.zusammenlegen([T.verstehe()], this.erinnern(z));
        return T.zusammenlegen([T.keinZuruf(z.letzterZweck === "verstanden_nichts")], this.erinnern(z));
      case "korrektur_gespeichert":
        return T.zusammenlegen(vorne, this.korrigieren(z, n, v));
      case "neuer_zuruf":
        // Ein Nachtrag wird angehängt, nie still als unbestätigt abgelegt.
        return T.zusammenlegen(vorne, this.uebernehmen(z, n, v, "anhaengen"));
      case "zuruf":
        return T.zusammenlegen(vorne, this.uebernehmen(z, n, v, "ersetzen"));
    }
  }

  private pruefe(k: Verstaendnis["eintraege"][number], nachrichten: Nachricht[], n: Nachricht): PunktZustand {
    const { eintrag, verworfen, angepasst } = pruefeBelege(k.eintrag, nachrichten);
    for (const w of verworfen) this.protokoll.verworfen.push({ ...w, nachrichtId: n.id });
    for (const w of angepasst) this.protokoll.angepasst.push({ ...w, nachrichtId: n.id });
    return { eintrag, projektKandidaten: k.projektKandidaten, art: k.art, unklar: k.unklar.filter((f) => !eintrag[f]) };
  }

  /** Übernimmt den von der KI gelieferten Stand, nachdem jede Angabe gegen die Nachrichten geprüft wurde. */
  private uebernehmen(z: Zustand, n: Nachricht, v: Verstaendnis, modus: "ersetzen" | "anhaengen"): Antwort[] {
    if (!z.entwurf) z.entwurf = { nachrichten: [], punkte: [], gestellt: [], phase: "sammeln" };
    const e = z.entwurf;
    e.nachrichten.push(n);
    if (v.angekuendigtePunkte) e.angekuendigt = v.angekuendigtePunkte;
    const punkte = v.eintraege.map((k) => this.pruefe(k, e.nachrichten, n));
    if (modus === "anhaengen") {
      // Nachtrag ohne eigene Baustelle: Wenn im offenen Zuruf genau eine Baustelle steht, gilt sie.
      const baustellen = [...new Set(e.punkte.map((p) => p.eintrag.projektId?.wert).filter(Boolean))];
      const bisher = e.punkte.find((p) => p.eintrag.projektId);
      for (const p of punkte) if (!p.eintrag.projektId && baustellen.length === 1 && bisher) p.eintrag.projektId = bisher.eintrag.projektId;
      e.punkte = [...e.punkte, ...punkte];
    } else {
      // Per Knopf Gewähltes und die Art bleiben erhalten, auch wenn die KI es beim nächsten Lesen anders liefert.
      punkte.forEach((p, i) => {
        const alt = e.punkte[i];
        if (!alt) return;
        for (const f of ["projektId", "angewiesenVon", "personen"] as const) {
          if (!p.eintrag[f] && alt.eintrag[f] && e.nachrichten.find((m) => m.id === alt.eintrag[f]!.nachrichtId)?.art === "knopf") {
            (p.eintrag as Record<string, unknown>)[f] = alt.eintrag[f];
          }
        }
        if (p.art === "auftrag" && alt.art !== "auftrag") p.art = alt.art;
      });
      if (punkte.length) e.punkte = punkte;
    }
    if (!e.punkte.length) {
      if (e.nachrichten.every((m) => m.art === "foto") || (e.nachrichten.length === 1 && !e.gestellt.includes("leistung"))) {
        return this.frage(z, "leistung", T.frageLeistung()) ?? [T.keinZuruf(false)];
      }
      z.entwurf = undefined;
      return [T.keinZuruf(false)];
    }
    // Angekündigte Aufzählung: erst sammeln, dann fragen.
    if (e.angekuendigt && e.punkte.length < e.angekuendigt) {
      e.phase = "sammeln";
      return [T.sammeln(e.punkte.length)];
    }
    return this.weiter(z);
  }

  /** Korrektur nach dem Speichern: Nur die genannten Einträge, über ihre Id, ohne Rückfragen zu Bekanntem. */
  private korrigieren(z: Zustand, n: Nachricht, v: Verstaendnis): Antwort[] {
    const kontext = this.gespeicherteFuerKontext(z, n);
    const bekannt = new Set(kontext?.eintraege.map((g) => g.id));
    const betroffen = v.eintraege.filter((k) => k.bezugId && bekannt.has(k.bezugId));
    if (!kontext || !betroffen.length) return this.uebernehmen(z, n, v, "ersetzen");
    const nachrichten = [...kontext.nachrichten, n];
    z.entwurf = {
      nachrichten,
      punkte: betroffen.map((k) => {
        const p = this.pruefe(k, nachrichten, n);
        const alt = this.speicher.ereignis(k.bezugId!);
        // Was bei der Korrektur nicht mehr belegt ist, bleibt wie gespeichert: Eine Korrektur verliert nichts.
        if (alt) for (const [f, a] of Object.entries(alt.eintrag)) if (!p.eintrag[f as Feldname]) (p.eintrag as Record<string, unknown>)[f] = a;
        return p;
      }),
      gestellt: [],
      phase: "sammeln",
      ersetzt: betroffen.map((k) => k.bezugId),
      keineFragenMehr: true,
      anweiserBeantwortet: true,
      abgeschlossenBestaetigt: true,
    };
    return this.weiter(z);
  }

  /** Nächster Schritt für den offenen Zuruf: eine Rückfrage oder die Zusammenfassung. */
  private weiter(z: Zustand): Antwort[] {
    const e = z.entwurf!;
    const naechste = this.naechsteFrage(z, e);
    const gefragt = naechste && this.frage(z, naechste.frage, naechste.antwort);
    if (gefragt) return gefragt;
    e.phase = "warte_bestaetigung";
    return [this.zusammenfassung(e)];
  }

  private rueckfragenOffen(z: Zustand): number {
    const jetzt = new Date(z.entwurf?.nachrichten.at(-1)?.zeit ?? Date.now()).getTime();
    z.rueckfragen = z.rueckfragen.filter((t) => jetzt - new Date(t).getTime() < RUECKFRAGEN_FENSTER_MS);
    return MAX_RUECKFRAGEN - z.rueckfragen.length;
  }

  private frage(z: Zustand, frage: Frage, antwort: Antwort): Antwort[] | undefined {
    const e = z.entwurf!;
    if (this.rueckfragenOffen(z) <= 0 || e.keineFragenMehr || e.gestellt.includes(frage)) return undefined;
    e.gestellt.push(frage);
    e.phase = "warte_antwort";
    z.rueckfragen.push(e.nachrichten.at(-1)?.zeit ?? new Date().toISOString());
    return [antwort];
  }

  private zusammenfassung(e: Entwurf): Antwort {
    return T.zusammenfassung(
      e.punkte.map((p) => p.eintrag),
      this.heute(e),
      !!e.ersetzt,
      e.punkte.map((p) => this.offen(p, e)),
      this.firma,
    );
  }

  private naechsteFrage(z: Zustand, e: Entwurf): { frage: Frage; antwort: Antwort } | undefined {
    if (e.keineFragenMehr || this.rueckfragenOffen(z) <= 0) return undefined;
    const darf = (f: Frage) => !e.gestellt.includes(f);
    const laufend = laufendeProjekte(this.firma).map((p) => p.id);

    const ohneProjekt = e.punkte.filter((p) => !p.eintrag.projektId);
    if (ohneProjekt.length && darf("projekt")) {
      const kandidaten = [...new Set(ohneProjekt.flatMap((p) => p.projektKandidaten))].filter((id) => laufend.includes(id));
      return { frage: "projekt", antwort: T.frageProjekt(kandidaten, laufend, this.firma) };
    }
    const abgeschlossen = e.punkte.find((p) => p.eintrag.projektId && projektNachId(p.eintrag.projektId.wert, this.firma)?.status === "abgeschlossen");
    if (abgeschlossen && !e.abgeschlossenBestaetigt && darf("abgeschlossen")) {
      return { frage: "abgeschlossen", antwort: T.frageAbgeschlossen(projektNachId(abgeschlossen.eintrag.projektId!.wert, this.firma)!.kurz) };
    }
    if (e.punkte.some((p) => !p.eintrag.leistung) && darf("leistung")) return { frage: "leistung", antwort: T.frageLeistung() };
    const unklar = UNKLAR_REIHENFOLGE.find((f) => e.punkte.some((p) => p.unklar.includes(f)) && darf(`unklar:${f}`));
    if (unklar) return { frage: `unklar:${unklar}`, antwort: T.frageUnklar(unklar) };
    const zusatz = e.punkte.map((p, i) => ({ p, i })).filter(({ p }) => p.art === "zusatz_aenderung");
    const ohneAnweiser = zusatz.find(({ p }) => !p.eintrag.angewiesenVon);
    if (ohneAnweiser && !e.anweiserBeantwortet && darf("anweiser")) {
      return { frage: "anweiser", antwort: T.frageAnweiser(e.punkte.length > 1 ? ohneAnweiser.i + 1 : undefined) };
    }
    // Aufwand nur bei Zusatzarbeit ohne Menge, Leute und Stunden. Eine Frage, nicht zwei.
    if (zusatz.some(({ p }) => !p.eintrag.personen && !p.eintrag.dauerStunden && !p.eintrag.menge) && darf("aufwand")) {
      return { frage: "aufwand", antwort: T.frageAufwand() };
    }
    return undefined;
  }

  private knopf(z: Zustand, n: Nachricht): Antwort[] {
    const id = n.knopfId!;
    const e = z.entwurf;
    if (!e) return [T.nichtsOffen()];
    e.nachrichten.push(n);
    const beleg = { zitat: n.inhalt, nachrichtId: n.id };
    if (id === T.KNOPF.passt.id) return e.phase === "warte_bestaetigung" ? this.bestaetigen(z) : this.weiter(z);
    if (id === T.KNOPF.aendern.id) {
      e.phase = "warte_aenderung";
      return [T.aendernFrage()];
    }
    if (id.startsWith("projekt:")) {
      const projektId = id.slice("projekt:".length);
      if (!projektNachId(projektId, this.firma)) return this.weiter(z);
      for (const p of e.punkte) if (!p.eintrag.projektId) p.eintrag.projektId = { wert: projektId, ...beleg };
      return this.weiter(z);
    }
    if (id.startsWith("personen:")) {
      const anzahl = Number(id.slice("personen:".length));
      for (const p of e.punkte) {
        if (!p.eintrag.personen) p.eintrag.personen = { wert: anzahl, ...beleg };
        p.unklar = p.unklar.filter((f) => f !== "personen");
      }
      return this.weiter(z);
    }
    if (id === T.KNOPF.anweiserWeissNicht.id) {
      e.anweiserBeantwortet = true;
      return this.weiter(z);
    }
    if (id === T.KNOPF.anweiserBauleiterGu.id || id === T.KNOPF.anweiserBauherr.id) {
      e.anweiserBeantwortet = true;
      const ziel = e.punkte.find((p) => p.art === "zusatz_aenderung" && !p.eintrag.angewiesenVon);
      if (ziel) ziel.eintrag.angewiesenVon = { wert: n.inhalt, ...beleg };
      return this.weiter(z);
    }
    if (id === T.KNOPF.abgeschlossenJa.id) {
      e.abgeschlossenBestaetigt = true;
      return this.weiter(z);
    }
    if (id === T.KNOPF.abgeschlossenAndere.id) {
      for (const p of e.punkte) {
        if (p.eintrag.projektId && projektNachId(p.eintrag.projektId.wert, this.firma)?.status === "abgeschlossen") {
          delete p.eintrag.projektId;
          p.projektKandidaten = [];
        }
      }
      // Der Absender hat selbst korrigiert: Die Projektfrage darf noch einmal kommen und zählt nicht als neue Rückfrage.
      const laufend = laufendeProjekte(this.firma).map((p) => p.id);
      e.phase = "warte_antwort";
      return [T.frageProjekt([], laufend, this.firma)];
    }
    return this.weiter(z);
  }

  private bestaetigen(z: Zustand): Antwort[] {
    const korrektur = !!z.entwurf?.ersetzt;
    const anzahl = this.ablegen(z, "bestaetigt");
    z.entwurf = undefined;
    return [T.gespeichert(anzahl, korrektur)];
  }

  private stoppen(z: Zustand): Antwort[] {
    const verworfen = !!z.entwurf;
    z.einwilligung = "gestoppt";
    z.begruesst = false;
    z.entwurf = undefined;
    z.wartend = [];
    return [T.stopp(verworfen)];
  }

  private zurueckziehen(z: Zustand): Antwort[] {
    if (z.entwurf) {
      z.entwurf = undefined;
      return [T.zurueckgezogen()];
    }
    if (!z.letzteGespeicherte.length) return [T.nichtsOffen()];
    for (const id of z.letzteGespeicherte) {
      const alt = this.speicher.ereignis(id);
      if (!alt) continue;
      this.speicher.ablegen({ ...alt, version: alt.version + 1, ersetzt: `${alt.id}@v${alt.version}`, status: "zurueckgezogen", erfasst: new Date().toISOString() });
    }
    z.letzteGespeicherte = [];
    return [T.zurueckgezogen()];
  }

  /** Erinnert an die offene Zusammenfassung. War sie gerade die letzte Nachricht, nur ein kurzer Satz mit Knöpfen. */
  private erinnern(z: Zustand): Antwort[] {
    const e = z.entwurf;
    if (!e || e.phase !== "warte_bestaetigung") return [];
    if (z.letzterZweck === "zusammenfassung" || z.letzterZweck === "hinweis_geld_recht") return [T.offenOben()];
    const zf = this.zusammenfassung(e);
    const koerper = zf.text.split("\n").slice(1).join("\n");
    return [{ ...zf, text: `${T.offenHinweis().text}\n${koerper}` }];
  }

  private heute(e: Entwurf): string {
    return (e.nachrichten.at(-1)?.zeit ?? new Date().toISOString()).slice(0, 10);
  }

  private offen(p: PunktZustand, e?: Entwurf): Feldname[] {
    const offen = new Set<Feldname>();
    if (!p.eintrag.projektId) offen.add("projektId");
    if (!p.eintrag.leistung) offen.add("leistung");
    if (!p.eintrag.ort) offen.add("ort");
    if (p.art === "zusatz_aenderung" && !p.eintrag.angewiesenVon) offen.add("angewiesenVon");
    for (const f of p.unklar) if (!p.eintrag[f]) offen.add(f);
    // Gefragt, aber nicht beantwortet: steht als offen da.
    for (const g of e?.gestellt ?? []) {
      const feld = g.startsWith("unklar:") ? (g.slice("unklar:".length) as Feldname) : FRAGE_FELD[g];
      if (!feld || p.eintrag[feld]) continue;
      if (feld === "angewiesenVon" && p.art !== "zusatz_aenderung") continue;
      if (feld === "dauerStunden" && (p.art !== "zusatz_aenderung" || p.eintrag.personen || p.eintrag.menge)) continue;
      offen.add(feld);
    }
    return [...offen];
  }

  private hinweise(p: PunktZustand): string[] {
    const h: string[] = [];
    const projekt = p.eintrag.projektId && projektNachId(p.eintrag.projektId.wert, this.firma);
    if (projekt && projekt.status === "abgeschlossen") h.push("Baustelle ist als abgeschlossen geführt, Absender hat sie bestätigt");
    if (p.art === "behinderung_wartezeit") h.push("Behinderung oder Wartezeit");
    if (p.art === "reparatur_schaden") h.push("Reparatur oder Schaden, Verursacher klärt das Büro");
    return h;
  }

  private ablegen(z: Zustand, status: "bestaetigt" | "unbestaetigt"): number {
    const e = z.entwurf;
    if (!e) return 0;
    const ids: string[] = [];
    const alle = e.nachrichten.map((m) => m.id);
    const fotos = e.nachrichten.filter((m) => m.art === "foto").map((m) => m.id);
    e.punkte.forEach((p, i) => {
      // Quelle pro Eintrag: nur die Nachrichten, aus denen seine Angaben stammen. Fotos gehören dazu, wenn es nur einen Punkt gibt.
      const belegt = new Set(Object.values(p.eintrag).map((a) => a.nachrichtId));
      if (e.punkte.length === 1) for (const f of fotos) belegt.add(f);
      const nachrichtIds = belegt.size ? alle.filter((id) => belegt.has(id)) : alle;
      const altId = e.ersetzt?.[i];
      const alt = altId ? this.speicher.ereignis(altId) : undefined;
      const id = alt?.id ?? `ev-${z.absenderId}-${Date.now().toString(36)}-${++this.zaehler}`;
      this.speicher.ablegen({
        id,
        version: alt ? alt.version + 1 : 1,
        ersetzt: alt ? `${alt.id}@v${alt.version}` : undefined,
        absenderId: z.absenderId,
        rolle: z.rolle,
        kanal: this.opts.kanal ?? "simulator",
        erfasst: e.nachrichten.at(-1)?.zeit ?? new Date().toISOString(),
        eintrag: p.eintrag,
        offen: this.offen(p, e),
        status,
        hinweise: this.hinweise(p),
        nachrichtIds,
      });
      ids.push(id);
    });
    z.letzteGespeicherte = ids;
    return ids.length;
  }
}
