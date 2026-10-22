// Gesprächsführung: fester Code. Die KI (Versteher) liefert Absicht und Angaben mit Zitat,
// dieser Code entscheidet, ob nachgefragt, zusammengefasst oder gespeichert wird.
// Regeln aus GESTALTUNG.md: höchstens eine Frage pro Antwort, höchstens zwei Rückfragen pro Zuruf, nichts raten, nichts verlieren.

import { pruefeBelege, normalisiere, type Verworfen } from "./belege.ts";
import { FIRMA, laufendeProjekte, projektNachId, type Firma } from "./firma.ts";
import type { Entwurf, Frage, PunktZustand, Speicher, Zustand } from "./speicher.ts";
import * as T from "./texte.ts";
import type { Antwort, Feldname, Leistungsereignis, Nachricht, Rolle } from "./typen.ts";
import type { Versteher, Verstaendnis } from "./verstehen.ts";

export const MAX_RUECKFRAGEN = 2;

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
    if (!this.speicher.eingang(n)) return [];
    const z = this.speicher.zustand(n.absenderId, rolle);
    z.verlauf.push({ von: "absender", text: `${n.art === "knopf" ? "[Knopf] " : n.art === "foto" ? "[Foto] " : ""}${n.inhalt}` });
    let antworten: Antwort[];
    try {
      antworten = await this.schritt(z, n);
    } catch (e) {
      this.protokoll.fehler.push(`${n.id}: ${e instanceof Error ? e.message : String(e)}`);
      antworten = [T.technischesProblem()];
    }
    for (const a of antworten) z.verlauf.push({ von: "agent", text: a.text });
    if (antworten.length) z.letzterZweck = antworten.at(-1)!.zweck;
    if (z.verlauf.length > 30) z.verlauf.splice(0, z.verlauf.length - 30);
    return antworten;
  }

  /** Am Ende des Tages (oder des Tests): Offene Zurufe nicht verlieren, sondern unbestätigt ablegen. */
  tagesabschluss(z: Zustand): void {
    if (z.entwurf && z.einwilligung === "erteilt") this.ablegen(z, "unbestaetigt");
    z.entwurf = undefined;
  }

  private async schritt(z: Zustand, n: Nachricht): Promise<Antwort[]> {
    const text = normalisiere(n.inhalt);

    if (n.art !== "knopf" && STOPP.has(text)) return this.stoppen(z);

    if (z.einwilligung !== "erteilt") return this.einwilligung(z, n, text);

    if (n.art === "knopf" && n.knopfId) return this.knopf(z, n);

    if (z.entwurf?.phase === "warte_bestaetigung" && BESTAETIGUNG.has(text)) return this.bestaetigen(z);

    const v = await this.versteher({
      entwurfNachrichten: z.entwurf?.nachrichten ?? [],
      entwurf: z.entwurf?.punkte.map((p) => p.eintrag),
      gespeichert: this.gespeicherteFuerKontext(z),
      verlauf: z.verlauf.slice(0, -1),
      neu: n,
    });
    return this.nachAbsicht(z, n, v);
  }

  /** Erster Kontakt, Ablehnung oder nach „stopp“: nur mit Zustimmung aufnehmen, höchstens einmal nachfragen. */
  private async einwilligung(z: Zustand, n: Nachricht, text: string): Promise<Antwort[]> {
    const wahl =
      n.knopfId === T.KNOPF.einwJa.id ? "ja" : n.knopfId === T.KNOPF.einwNein.id ? "nein" : z.begruesst && n.art !== "foto" ? jaOderNein(n.inhalt) : undefined;
    const startWort = START.has(text);
    if (wahl === "ja" || (z.einwilligung === "gestoppt" && startWort)) {
      z.einwilligung = "erteilt";
      z.einwilligungErinnert = false;
      const wartend = z.wartend.filter((w) => w.art !== "knopf" && !jaOderNein(w.inhalt) && !START.has(normalisiere(w.inhalt)));
      z.wartend = [];
      let antworten: Antwort[] = [];
      for (const w of wartend) antworten = await this.schritt(z, w);
      return antworten.length ? antworten : [T.wiederDabei()];
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
      return [T.einwilligungNochmal()];
    }
    // Nicht drängen: Ohne klare Antwort wird nichts gespeichert und nicht weiter nachgefragt.
    return [];
  }

  private gespeicherteFuerKontext(z: Zustand) {
    if (z.entwurf || !z.letzteGespeicherte.length) return undefined;
    const ereignisse = z.letzteGespeicherte.map((id) => this.speicher.ereignis(id)).filter((e): e is Leistungsereignis => !!e);
    const ids = new Set(ereignisse.flatMap((e) => e.nachrichtIds));
    const nachrichten = [...ids].map((id) => this.speicher.nachricht(id)).filter((m): m is Nachricht => !!m);
    return { eintraege: ereignisse.map((e) => e.eintrag), nachrichten };
  }

  private async nachAbsicht(z: Zustand, n: Nachricht, v: Verstaendnis): Promise<Antwort[]> {
    const vorne: Antwort[] = v.enthaeltFrageGeldRecht && v.absicht !== "frage_geld_recht" ? [T.hinweisGeldRecht()] : [];
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
        return T.zusammenlegen([T.hinweisGeldRecht()], this.erinnern(z));
      case "frage_zum_agenten":
        return T.zusammenlegen([T.hinweisZweck()], this.erinnern(z));
      case "kein_zuruf":
        return T.zusammenlegen([T.keinZuruf(z.letzterZweck === "verstanden_nichts")], this.erinnern(z));
      case "korrektur_gespeichert": {
        if (z.entwurf || !z.letzteGespeicherte.length) return T.zusammenlegen(vorne, this.uebernehmen(z, n, v, false));
        const kontext = this.gespeicherteFuerKontext(z)!;
        z.entwurf = {
          nachrichten: [...kontext.nachrichten],
          punkte: [],
          gestellt: [],
          phase: "sammeln",
          ersetzt: [...z.letzteGespeicherte],
          anweiserBeantwortet: true,
          abgeschlossenBestaetigt: true,
        };
        return T.zusammenlegen(vorne, this.uebernehmen(z, n, v, false));
      }
      case "neuer_zuruf":
        if (z.entwurf && z.entwurf.punkte.some((p) => p.eintrag.leistung)) this.ablegen(z, "unbestaetigt");
        z.entwurf = undefined;
        return T.zusammenlegen(vorne, this.uebernehmen(z, n, v, true));
      case "zuruf":
        return T.zusammenlegen(vorne, this.uebernehmen(z, n, v, false));
    }
  }

  /** Übernimmt den von der KI gelieferten Stand, nachdem jede Angabe gegen die Nachrichten geprüft wurde. */
  private uebernehmen(z: Zustand, n: Nachricht, v: Verstaendnis, neu: boolean): Antwort[] {
    if (!z.entwurf || neu) z.entwurf = { nachrichten: [], punkte: [], gestellt: [], phase: "sammeln" };
    const e = z.entwurf;
    e.nachrichten.push(n);
    const punkte: PunktZustand[] = v.eintraege.map((k) => {
      const { eintrag, verworfen, angepasst } = pruefeBelege(k.eintrag, e.nachrichten);
      for (const w of verworfen) this.protokoll.verworfen.push({ ...w, nachrichtId: n.id });
      for (const w of angepasst) this.protokoll.angepasst.push({ ...w, nachrichtId: n.id });
      return { eintrag, projektKandidaten: k.projektKandidaten, art: k.art, unklar: k.unklar.filter((f) => !eintrag[f]) };
    });
    // Per Knopf Gewähltes bleibt erhalten, auch wenn die KI es beim nächsten Lesen weglässt.
    punkte.forEach((p, i) => {
      const alt = e.punkte[i];
      if (!alt) return;
      for (const f of ["projektId", "angewiesenVon", "personen"] as const) {
        if (!p.eintrag[f] && alt.eintrag[f] && e.nachrichten.find((m) => m.id === alt.eintrag[f]!.nachrichtId)?.art === "knopf") {
          (p.eintrag as Record<string, unknown>)[f] = alt.eintrag[f];
        }
      }
    });
    if (punkte.length) e.punkte = punkte;
    if (!e.punkte.length) {
      if (e.nachrichten.length === 1 && !e.gestellt.includes("leistung")) {
        e.gestellt.push("leistung");
        e.phase = "warte_antwort";
        return [T.frageLeistung()];
      }
      z.entwurf = undefined;
      return [T.keinZuruf(false)];
    }
    return this.weiter(z);
  }

  /** Nächster Schritt für den offenen Zuruf: eine Rückfrage oder die Zusammenfassung. */
  private weiter(z: Zustand): Antwort[] {
    const e = z.entwurf!;
    const frage = this.naechsteFrage(e);
    if (frage) {
      e.gestellt.push(frage.frage);
      e.phase = "warte_antwort";
      return [frage.antwort];
    }
    e.phase = "warte_bestaetigung";
    return [this.zusammenfassung(e)];
  }

  private zusammenfassung(e: Entwurf): Antwort {
    return T.zusammenfassung(
      e.punkte.map((p) => p.eintrag),
      this.heute(e),
      !!e.ersetzt,
      e.punkte.map((p) => this.offen(p)),
    );
  }

  private naechsteFrage(e: Entwurf): { frage: Frage; antwort: Antwort } | undefined {
    if (e.gestellt.length >= MAX_RUECKFRAGEN) return undefined;
    const darf = (f: Frage) => !e.gestellt.includes(f);
    const laufend = laufendeProjekte(this.firma).map((p) => p.id);

    const ohneProjekt = e.punkte.filter((p) => !p.eintrag.projektId);
    if (ohneProjekt.length && darf("projekt")) {
      const kandidaten = [...new Set(ohneProjekt.flatMap((p) => p.projektKandidaten))].filter((id) => laufend.includes(id));
      return { frage: "projekt", antwort: T.frageProjekt(kandidaten, laufend) };
    }
    const abgeschlossen = e.punkte.find((p) => p.eintrag.projektId && projektNachId(p.eintrag.projektId.wert, this.firma)?.status === "abgeschlossen");
    if (abgeschlossen && !e.abgeschlossenBestaetigt && darf("abgeschlossen")) {
      return { frage: "abgeschlossen", antwort: T.frageAbgeschlossen(projektNachId(abgeschlossen.eintrag.projektId!.wert, this.firma)!.kurz) };
    }
    if (e.punkte.some((p) => !p.eintrag.leistung) && darf("leistung")) return { frage: "leistung", antwort: T.frageLeistung() };
    const unklar = e.punkte.flatMap((p) => p.unklar)[0];
    if (unklar && darf("unklar")) return { frage: "unklar", antwort: T.frageUnklar(unklar) };
    const zusatz = e.punkte.map((p, i) => ({ p, i })).filter(({ p }) => p.art === "zusatz_aenderung");
    const ohneAnweiser = zusatz.find(({ p }) => !p.eintrag.angewiesenVon);
    if (ohneAnweiser && !e.anweiserBeantwortet && darf("anweiser")) {
      return { frage: "anweiser", antwort: T.frageAnweiser(e.punkte.length > 1 ? ohneAnweiser.i + 1 : undefined) };
    }
    if (zusatz.some(({ p }) => !p.eintrag.personen && !p.eintrag.dauerStunden) && darf("aufwand")) {
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
      // Der Absender hat selbst korrigiert: Die Projektfrage kommt noch einmal, auch über die Grenze.
      const laufend = laufendeProjekte(this.firma).map((p) => p.id);
      e.gestellt = e.gestellt.filter((f) => f !== "projekt");
      e.gestellt.push("projekt");
      e.phase = "warte_antwort";
      return [T.frageProjekt([], laufend)];
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

  /** Wiederholt die offene Zusammenfassung nach einer Zwischenfrage, damit nichts hängen bleibt. */
  private erinnern(z: Zustand): Antwort[] {
    const e = z.entwurf;
    if (!e || e.phase !== "warte_bestaetigung") return [];
    const zf = this.zusammenfassung(e);
    const koerper = zf.text.split("\n").slice(1).join("\n");
    return [{ ...zf, text: `${T.offenHinweis().text}\n${koerper}` }];
  }

  private heute(e: Entwurf): string {
    return (e.nachrichten.at(-1)?.zeit ?? new Date().toISOString()).slice(0, 10);
  }

  private offen(p: PunktZustand): Feldname[] {
    const offen = new Set<Feldname>();
    if (!p.eintrag.projektId) offen.add("projektId");
    if (!p.eintrag.leistung) offen.add("leistung");
    if (!p.eintrag.ort) offen.add("ort");
    if (p.art === "zusatz_aenderung" && !p.eintrag.angewiesenVon) offen.add("angewiesenVon");
    for (const f of p.unklar) if (!p.eintrag[f]) offen.add(f);
    return [...offen];
  }

  private hinweise(p: PunktZustand): string[] {
    const h: string[] = [];
    const projekt = p.eintrag.projektId && projektNachId(p.eintrag.projektId.wert, this.firma);
    if (projekt && projekt.status === "abgeschlossen") h.push("Baustelle ist als abgeschlossen geführt, Absender hat sie bestätigt");
    if (p.art === "behinderung_wartezeit") h.push("Behinderung oder Wartezeit");
    return h;
  }

  private ablegen(z: Zustand, status: "bestaetigt" | "unbestaetigt"): number {
    const e = z.entwurf;
    if (!e) return 0;
    const ids: string[] = [];
    const nachrichtIds = e.nachrichten.map((m) => m.id);
    e.punkte.forEach((p, i) => {
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
        offen: this.offen(p),
        status,
        hinweise: this.hinweise(p),
        nachrichtIds,
      });
      ids.push(id);
    });
    // Punkte, die bei einer Korrektur weggefallen sind, gelten als zurückgezogen.
    for (const altId of e.ersetzt?.slice(e.punkte.length) ?? []) {
      const alt = this.speicher.ereignis(altId);
      if (alt) this.speicher.ablegen({ ...alt, version: alt.version + 1, ersetzt: `${alt.id}@v${alt.version}`, status: "zurueckgezogen" });
    }
    z.letzteGespeicherte = ids;
    return ids.length;
  }
}
