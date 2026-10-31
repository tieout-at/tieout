// One sheet of a Beleg as HTML. Every value comes from `gelesen()` of the core and carries its place in `data-place`;
// the run measures those places on the finished sheet. Whatever a form has no field for lands under "Vermerke", so no
// value the twin read can go missing from the paper. Nothing here computes or invents an amount.

import { ABZUG_TEXT, BELEG_ART_TEXT, datumText, type AbzugArt, type Datensatz, type Firmendaten, type GelesenerWert } from "@tieout/kern";
import { planBlatt } from "./plaene.ts";
import type { Profil } from "./profil.ts";

export type Beleg = Datensatz["belege"][number];

export interface Blatt {
  html: string;
  quer: boolean;
  scan: boolean;
  /** A plan's sheet with everything but its change faded; the comparison in the app shows it. */
  aenderung?: string;
}

export interface Zufall {
  /** 0 to 1, the same on every run for the same sheet. */
  (): number;
}

export function zufall(text: string, saat: number): Zufall {
  let h = 2166136261 ^ saat;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export const e = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A part of the sheet that holds one place or several. */
export const ort = (stellen: string | string[], inhalt: string, tag = "span", klasse = "") =>
  `<${tag} data-place="${e([stellen].flat().join("|"))}"${klasse ? ` class="${klasse}"` : ""}>${inhalt}</${tag}>`;

/** Handwriting: each letter sits a little differently, as no pen writes the same line twice. */
function hand(text: string, c: Kontext, faktor = 1): string {
  const h = c.hand;
  const buchstaben = [...text]
    .map((z) => {
      if (z === " ") return `<i style="width:.32em"> </i>`;
      const dreh = (c.r() - 0.5) * 7;
      const hoch = (c.r() - 0.5) * 0.09;
      return `<i style="transform:rotate(${dreh.toFixed(1)}deg) translateY(${hoch.toFixed(3)}em)">${e(z)}</i>`;
    })
    .join("");
  return `<span class="hand" style="font-family:'${h.schrift}';font-size:${(h.groesse * faktor).toFixed(2)}em;line-height:.9;transform:rotate(${((c.r() - 0.5) * 3).toFixed(1)}deg)">${buchstaben}</span>`;
}

/**
 * A figure a person really could misread: where a human corrected what the machine read, the sheet shows the true
 * value in a hand that explains the mistake (a 2 whose foot is barely there reads as a 7). Only that one pair is drawn;
 * any other correction stays plain handwriting.
 */
function mehrdeutig(neu: string, vorher: string | null, c: Kontext): string {
  const stelle = vorher ? [...neu].findIndex((z, i) => z !== vorher[i]) : -1;
  if (stelle < 0 || neu[stelle] !== "2" || vorher?.[stelle] !== "7") return hand(neu.replace(/,00$/, ""), c);
  const zwei = `<svg viewBox="0 0 26 40" style="height:1.5em;vertical-align:-.28em"><path d="M4 9c4-6 15-8 18-3 2 5-7 19-12 29" fill="none" stroke="${c.profil.tinte}" stroke-width="2.5" stroke-linecap="round"/><path d="M10 35c3 0 7-.4 10-1.200" fill="none" stroke="${c.profil.tinte}" stroke-width="1" stroke-linecap="round" opacity=".55"/></svg>`;
  return `${hand(neu.slice(0, stelle), c)}${zwei}`;
}

function unterschrift(c: Kontext): string {
  const w = () => Math.round((c.r() - 0.5) * 18);
  const d = `M6 44c14-${30 + w()} 24-34 28-22 4 12-11 ${26 + w()}-4 24 11-5 16-${26 + w()} 24-20 6 4-4 18 4 16 10-5 14-16 22-12 7 4 3 12 11 9 16-6 ${44 + w()}-14 ${90 + w()}-8`;
  return `<svg viewBox="0 0 300 70"><path d="${d}" fill="none" stroke="${c.profil.tinte}" stroke-width="2.4" stroke-linecap="round"/></svg>`;
}

interface Kontext {
  firma: Firmendaten;
  d: Datensatz;
  b: Beleg;
  seite: number;
  profil: Profil;
  r: Zufall;
  hand: Profil["haende"][number];
  werte: GelesenerWert[];
  gezeigt: Set<string>;
  auftraggeber: string;
}

const wert = (c: Kontext, stelle: string, schluessel?: string): string | null => {
  const w = c.werte.find((x) => x.stelle === stelle && (!schluessel || x.schluessel === schluessel));
  if (!w) return null;
  c.gezeigt.add(stelle);
  return w.text;
};

/** The values no field of the form took: printed, so that every place of the Beleg exists on its page. */
function vermerke(c: Kontext): string {
  const offen = [...new Map(c.werte.filter((w) => !c.gezeigt.has(w.stelle)).map((w) => [`${w.stelle}|${w.text}`, w])).values()];
  if (!offen.length) return "";
  return `<div class="block"><b>Vermerke</b>${offen.map((w) => ort(w.stelle, `<div class="zeile"><span>${e(benennen(w.stelle))}</span><span class="wert"><span>${e(w.text)}</span></span></div>`, "div")).join("")}</div>`;
}

const ABZUG = Object.entries(ABZUG_TEXT) as [AbzugArt, string][];

/** A place as a label on paper. */
function benennen(stelle: string): string {
  let s = stelle.replace(/^Kopf, /, "").replace(/^Pos\. /, "").replace(/^Zeile /, "").replace(/^Kopf$/, "Bezeichnung");
  for (const [art, text] of ABZUG) s = s.replace(art, text);
  return s;
}

const KOPF_BETRIEB = (c: Kontext, art: string) =>
  `<div class="kopf"><div><h1>${e(c.firma.betrieb.name)}</h1>${e(c.firma.betrieb.gewerk)} · ${e(c.firma.betrieb.sitz)}</div><div class="art"><b>${e(art.toUpperCase())}</b></div></div>`;

const KOPF_FREMD = (name: string, art: string) => `<div class="kopf"><div><h1>${e(name)}</h1></div><div class="art"><b>${e(art)}</b></div></div>`;

const fuss = (c: Kontext) => `<div class="fuss"><span>Beispieldaten, synthetisch</span><span>Seite ${c.seite} von ${c.b.seiten}</span></div>`;

/** The head under the sender: a letter of the Auftraggeber names who it goes to, a paper of the business its Auftraggeber. */
const anschrift = (c: Kontext, fremd: boolean) =>
  `<div class="felder"><span>Bauvorhaben:</span><span>${e(c.d.projekt.langname)}</span><span>${fremd ? "An" : "Auftraggeber"}:</span><span>${e(fremd ? c.firma.betrieb.name : c.auftraggeber)}</span></div>`;

function aufmassblatt(c: Kontext): string {
  const a = c.d.aufmass.find((x) => x.belegId === c.b.id)!;
  const lv = new Map(c.d.positionen.map((p) => [p.nr.wert, p.kurztext.wert]));
  const stellen = [...new Set(c.werte.filter((w) => w.stelle.startsWith("Zeile ")).map((w) => w.stelle))];
  const orte = new Set(a.zeilen.map((z) => z.ort.wert));
  const zeilen = stellen.map((s) => {
    const nr = wert(c, s, "positionNr") ?? s.replace("Zeile ", "");
    const m = wert(c, s, "menge") ?? "";
    const o = wert(c, s, "ort") ?? "";
    // an amount without a unit has no space: the whole text is the number
    const luecke = m.lastIndexOf(" ");
    const [zahl, einheit] = luecke < 0 ? [m, ""] : [m.slice(0, luecke), m.slice(luecke + 1)];
    return ort(s,`<td>${e(nr)}</td><td>${e(lv.get(nr) ?? o)}${orte.size > 1 ? `<br>${hand(o, c, 0.62)}` : ""}</td><td class="zahl">${hand(zahl, c)}</td><td>${e(einheit)}</td>`, "tr");
  });
  const datum = wert(c, "Kopf, Datum");
  const von = c.werte.find((w) => w.schluessel === "leistungVon");
  const bis = c.werte.find((w) => w.schluessel === "leistungBis");
  if (von) c.gezeigt.add(von.stelle);
  const unterschrieben = c.werte.find((w) => w.stelle === "Unterschrift Auftraggeber");
  const am = wert(c, "Unterschrift Auftraggeber, Datum");
  if (unterschrieben) c.gezeigt.add(unterschrieben.stelle);
  const ja = unterschrieben?.text === "ja";
  return `${KOPF_BETRIEB(c, "Aufmaßblatt")}
  <div class="felder">
    <span>Blatt Nr.:</span><span>${hand(a.nr, c)}</span>
    <span>Bauvorhaben:</span><span>${e(c.d.projekt.langname)}</span>
    <span>Auftraggeber:</span><span>${e(c.auftraggeber)}</span>
    ${datum ? `<span>Datum:</span>${ort("Kopf, Datum", hand(datum, c))}` : ""}
    ${von && bis ? `<span>Leistungszeit:</span>${ort(von.stelle, hand(`${von.text} bis ${bis.text}`, c))}` : ""}
    ${orte.size === 1 ? `<span>Betreff:</span><span>${e([...orte][0])}</span>` : ""}
  </div>
  ${zeilen.length ? `<table><thead><tr><th style="width:17%">Position</th><th>Bezeichnung</th><th class="zahl" style="width:14%">Menge</th><th style="width:8%">EH</th></tr></thead><tbody>${zeilen.join("")}</tbody></table>` : ""}
  ${vermerke(c)}
  <div class="unten">
    ${unterschrieben ? `<div class="sig"><div>${unterschrift(c)}Für den Auftragnehmer</div>${ort("Unterschrift Auftraggeber", `${ja ? unterschrift(c) : ""}${am ? `<span class="am">${hand(am, c, 0.8)}</span>` : ""}Gegengezeichnet Auftraggeber`, "div")}</div>` : ""}
    ${fuss(c)}
  </div>`;
}

function regiebericht(c: Kontext): string {
  const f = (label: string, stelle: string, faktor = 1) => {
    const t = wert(c, stelle);
    return t === null ? "" : `<span>${e(label)}:</span>${ort(stelle, hand(t, c, faktor))}`;
  };
  const stunden = (label: string, stelle: string) => {
    const t = wert(c, stelle);
    const vorher = c.werte.find((w) => w.stelle === stelle)?.vorher ?? null;
    return t === null ? "" : `<tr><td>${e(label)}</td>${ort(stelle, mehrdeutig(t.replace(/ h$/, ""), vorher?.replace(/ h$/, "") ?? null, c), "td", "zahl")}<td>Std.</td></tr>`;
  };
  const unterschrieben = wert(c, "Unterschrift Auftraggeber");
  const am = wert(c, "Unterschrift Auftraggeber, Datum");
  const material = wert(c, "Material zum Einstandspreis");
  return `${KOPF_BETRIEB(c, "Regiebericht")}
  <div class="felder">
    <span>Bericht Nr.:</span><span>${hand(c.b.id.replace(/^\D+/, ""), c)}</span>
    <span>Bauvorhaben:</span><span>${e(c.d.projekt.langname)}</span>
    <span>Auftraggeber:</span><span>${e(c.auftraggeber)}</span>
    ${f("Datum", "Kopf, Datum")}${f("Arbeitstage", "Arbeitstage", 0.85)}${f("Angeordnet von", "Angeordnet von", 0.85)}
  </div>
  <div class="block"><b>Tätigkeit</b>${ort("Tätigkeit", hand(wert(c, "Tätigkeit") ?? "", c, 0.82), "div")}</div>
  <table><thead><tr><th>Stunden</th><th class="zahl" style="width:22%">Anzahl</th><th style="width:12%">EH</th></tr></thead><tbody>
  ${stunden("Monteur", "Stunden Monteur")}${stunden("Helfer", "Stunden Helfer")}</tbody></table>
  ${material ? `<div class="block"><b>Material zum Einstandspreis</b>${ort("Material zum Einstandspreis", hand(material, c), "div")}</div>` : ""}
  ${vermerke(c)}
  <div class="unten">
    <div class="sig"><div>${unterschrift(c)}Für den Auftragnehmer</div>${ort("Unterschrift Auftraggeber", `${unterschrieben === "ja" ? unterschrift(c) : ""}${am ? `<span class="am">${hand(am, c, 0.8)}</span>` : ""}Unterschrift Auftraggeber`, "div")}</div>
    ${fuss(c)}
  </div>`;
}

/** A Stundenzettel: the week once, one row per Regiebericht with the hours of Monteur and Helfer (customer test of step 10). */
function stundenzettel(c: Kontext): string {
  const von = c.werte.find((w) => w.schluessel === "von");
  const bis = c.werte.find((w) => w.schluessel === "bis");
  if (von) c.gezeigt.add(von.stelle);
  const trupp = wert(c, "Kopf, Trupp");
  const stellen = [...new Set(c.werte.filter((w) => /^Zeile Regiebericht \S+$/.test(w.stelle)).map((w) => w.stelle))];
  const zeilen = stellen.map((s) => {
    const nr = wert(c, s) ?? "";
    const stunden = (spalte: string) => ort(`${s}, ${spalte}`, hand(wert(c, `${s}, ${spalte}`) ?? "", c), "td", "zahl");
    return ort(s, `<td>Regiebericht ${hand(nr, c)}</td>${stunden("Monteur")}${stunden("Helfer")}`, "tr");
  });
  return `${KOPF_BETRIEB(c, "Stundenzettel")}
  <div class="felder">
    <span>Bauvorhaben:</span><span>${e(c.d.projekt.langname)}</span>
    <span>Auftraggeber:</span><span>${e(c.auftraggeber)}</span>
    ${von && bis ? `<span>Woche:</span>${ort(von.stelle, hand(`${von.text} bis ${bis.text}`, c))}` : ""}
    ${trupp ? `<span>Trupp:</span>${ort("Kopf, Trupp", hand(trupp, c))}` : ""}
  </div>
  ${zeilen.length ? `<table><thead><tr><th>Regiebericht</th><th class="zahl" style="width:22%">Monteur</th><th class="zahl" style="width:22%">Helfer</th></tr></thead><tbody>${zeilen.join("")}</tbody></table>` : ""}
  ${vermerke(c)}
  <div class="unten">${fuss(c)}</div>`;
}

function email(c: Kontext): string {
  const m = c.d.emails.find((x) => x.belegId === c.b.id)!;
  const absaetze = c.werte.filter((w) => w.stelle.startsWith("Absatz") && !/Aufwand|Material/.test(w.stelle));
  absaetze.forEach((w) => c.gezeigt.add(w.stelle));
  const zusatz = c.werte.filter((w) => /Absatz \d+, /.test(w.stelle));
  zusatz.forEach((w) => c.gezeigt.add(w.stelle));
  const gegenstand = c.werte.find((w) => w.stelle === "Betreff");
  if (gegenstand) c.gezeigt.add("Betreff");
  c.gezeigt.add("Inhalt");
  const inhalt = absaetze.filter((w) => w.schluessel === "zitat").map((w) => ort(w.stelle, e(w.text), "p", "absatz"));
  const leer = "Zur Information, Näheres siehe Betreff.";
  return `<div class="mail"><div class="von">
    <span>Von:</span>${ort("Kopf, Absender", e(m.absender.wert))}
    <span>Gesendet:</span>${ort("Kopf, Datum", e(datumText(m.datum.wert)))}
    <span>An:</span><span>${e(m.von === "betrieb" ? c.auftraggeber : c.firma.betrieb.name)}</span>
    <span>Betreff:</span>${ort("Kopf, Betreff", e(m.betreff.wert))}
  </div>
  ${ort("Inhalt", `${inhalt.join("") || `<p class="absatz">${leer}</p>`}${gegenstand ? ort("Betreff", `Gegenstand: ${e(gegenstand.text)}`, "p", "absatz") : ""}${zusatz.map((w) => ort(w.stelle, `${e(benennen(w.stelle).replace(/^Absatz \d+, /, ""))}: ${e(w.text)}`, "p", "absatz")).join("")}<p class="absatz">Mit freundlichen Grüßen<br>${e(m.absender.wert)}</p>`, "div")}
  </div><div class="unten">${fuss(c)}</div>`;
}

function leistungsverzeichnis(c: Kontext): string {
  const stellen = [...new Set(c.werte.map((w) => w.stelle.replace(/, [^,]+$/, "")))];
  const zeilen = stellen.map((s) => {
    const zelle = (feld: string, schluessel: string, klasse = "") => ort(`${s}, ${feld}`, e(wert(c, `${s}, ${feld}`, schluessel) ?? ""), "td", klasse);
    return ort(s, `${zelle("Positionsnummer", "nr")}${zelle("Kurztext", "kurztext")}${zelle("Menge", "menge", "zahl")}${zelle("Einheit", "einheit")}${zelle("Einheitspreis", "ep", "zahl")}`, "tr");
  });
  return `${KOPF_FREMD(c.auftraggeber, "Leistungsverzeichnis")}${anschrift(c, true)}
  <table><thead><tr><th style="width:15%">Position</th><th>Kurztext</th><th class="zahl">Menge</th><th>EH</th><th class="zahl">Einheitspreis</th></tr></thead><tbody>${zeilen.join("")}</tbody></table>
  ${vermerke(c)}<div class="unten">${fuss(c)}</div>`;
}

/** A payment advice as it is laid out: what is paid for, each deduction with its rate, and the payment last. */
function zahlungsavis(c: Kontext, kopf: string): string {
  const abzuege = ABZUG.filter(([art]) => c.werte.some((w) => w.stelle === `Abzug ${art}`)).map(([art, name]) => {
    const satz = wert(c, `Satz ${art}`);
    const stellen = [`Abzug ${art}`, ...(satz ? [`Satz ${art}`] : [])];
    return ort(stellen, `<span>${e(name)}${satz ? ` ${e(satz)}` : ""}</span><span class="wert"><span>${e(wert(c, `Abzug ${art}`) ?? "")}</span></span>`, "div", "zeile");
  });
  const kopfzeile = (stelle: string) => {
    const t = wert(c, stelle);
    return t === null ? "" : ort(stelle, `<span>${e(stelle)}</span><span class="wert"><span>${e(t)}</span></span>`, "div", "zeile");
  };
  const zahlbetrag = wert(c, "Zahlbetrag");
  const oben = `${kopfzeile("Bezug")}${kopfzeile("Valuta")}`;
  return `${kopf}${anschrift(c, true)}${oben}<div style="height:22px"></div>${abzuege.join("")}${vermerke(c)}${zahlbetrag ? ort("Zahlbetrag", `<span>Zahlbetrag</span><span class="wert"><span>${e(zahlbetrag)}</span></span>`, "div", "zeile summe") : ""}<div class="unten">${fuss(c)}</div>`;
}

const TEXTFORM = /^(Absatz|Punkt|Deckblatt|Zusammenfassung)/;

/** The kinds that are lists of values: invoices, letters, contract points. Each place is one line or one paragraph. */
function liste(c: Kontext, kopf: string, fremd: boolean): string {
  const gruppen = new Map<string, GelesenerWert[]>();
  for (const w of c.werte) gruppen.set(w.stelle, [...(gruppen.get(w.stelle) ?? []), w]);
  const lv = new Map(c.d.positionen.map((p) => [p.nr.wert, p.kurztext.wert]));
  // an invoice's positions are one tight table, however many there are
  const positionen = [...gruppen].filter(([stelle]) => stelle.startsWith("Pos. "));
  const tabelle = positionen.length > 12;
  // a long invoice runs in two columns, without the short texts, so it stays one readable sheet
  const zweiSpalten = positionen.length > 62;
  const zeilen = tabelle
    ? positionen.map(([stelle, werte]) => {
        c.gezeigt.add(stelle);
        const nr = stelle.replace(/^Pos\. /, "");
        const feld = (s: string) => e(werte.find((w) => w.schluessel === s)?.text ?? "");
        // a position outside the Leistungsverzeichnis (Z-01) brings its own text
        const kurz = lv.get(nr) ?? werte.find((w) => w.schluessel === "text")?.text ?? "";
        return ort(stelle, `<td>${e(nr)}${zweiSpalten && !lv.has(nr) && kurz ? ` ${e(kurz)}` : ""}</td>${zweiSpalten ? "" : `<td class="kurz">${e(kurz)}</td>`}<td class="zahl">${feld("menge")}</td><td class="zahl">${feld("ep")}</td><td class="zahl">${feld("betrag")}</td>`, "tr");
      })
    : [];
  const teile = [...gruppen].filter(([stelle]) => !tabelle || !stelle.startsWith("Pos. ")).map(([stelle, werte]) => {
    c.gezeigt.add(stelle);
    // `grund` is the core's key for the reason; its readable text stands next to it
    const texte = [...new Set(werte.filter((w) => w.schluessel !== "grund").map((w) => w.text))].filter((t) => t !== stelle.replace(/^(Pos\.|Zeile) /, ""));
    const name = benennen(stelle);
    if (TEXTFORM.test(stelle) || texte.some((t) => t.length > 58)) return ort(stelle, `<b>${e(name)}</b>${texte.map((t) => `<div>${e(t)}</div>`).join("")}`, "div", "block");
    const kurz = lv.get(stelle.replace(/^Pos\. /, ""));
    const summe = /Summe|Zahlbetrag/.test(stelle);
    return ort(stelle, `<span>${e(name)}${kurz ? ` ${e(kurz)}` : ""}</span><span class="wert">${texte.map((t) => `<span>${e(t)}</span>`).join("")}</span>`, "div", `zeile${summe ? " summe" : ""}`);
  });
  const spalte = (z: string[]) =>
    `<table class="eng${zweiSpalten ? " schmal" : ""}"><thead><tr><th${zweiSpalten ? "" : ` style="width:12%"`}>Position</th>${zweiSpalten ? "" : "<th>Kurztext</th>"}<th class="zahl">Menge</th><th class="zahl">EP</th><th class="zahl">Betrag</th></tr></thead><tbody>${z.join("")}</tbody></table>`;
  const mitte = Math.ceil(zeilen.length / 2);
  const eng = !zeilen.length ? "" : zweiSpalten ? `<div class="spalten">${spalte(zeilen.slice(0, mitte))}${spalte(zeilen.slice(mitte))}</div>` : spalte(zeilen);
  return `${kopf}${anschrift(c, fremd)}${eng}${teile.join("")}<div class="unten">${fuss(c)}</div>`;
}

const VOM_AUFTRAGGEBER = new Set<Beleg["art"]>(["vertrag", "zahlungsavis", "korrekturblatt", "abzugsschreiben"]);
const GESCANNT = new Set<Beleg["art"]>(["aufmassblatt", "regiebericht", "stundenzettel", "korrekturblatt", "abzugsschreiben", "vertrag"]);

/** The sheet of one page, or null if the twin read nothing from it (a contract's other 70 pages stay out of the folder). */
export function blatt(firma: Firmendaten, d: Datensatz, b: Beleg, seite: number, alleWerte: GelesenerWert[], profil: Profil): Blatt | null {
  const werte = alleWerte.filter((w) => w.seite === seite);
  if (!werte.length || b.art === "foto") return null;
  const r = zufall(`${b.id}:${seite}`, profil.saat);
  const auftraggeber = firma.auftraggeber.find((a) => a.id === d.projekt.auftraggeberId)?.name ?? "";
  const c: Kontext = { firma, d, b, seite, profil, r, hand: profil.haende[r() < 0.6 ? 0 : 1], werte, gezeigt: new Set(), auftraggeber };
  if (b.art === "plan") return planBlatt(d, b, c.gezeigt);
  const art = BELEG_ART_TEXT[b.art];
  const inhalt = (() => {
    switch (b.art) {
      case "aufmassblatt":
        return aufmassblatt(c);
      case "regiebericht":
        return regiebericht(c);
      case "stundenzettel":
        return stundenzettel(c);
      case "email":
        return email(c);
      case "leistungsverzeichnis":
        return leistungsverzeichnis(c);
      case "zahlungsavis":
        return zahlungsavis(c, KOPF_FREMD(auftraggeber, art));
      case "grosshaendlerrechnung":
        return liste(c, KOPF_FREMD("Haustechnik Großhandel", art), true);
      default:
        return VOM_AUFTRAGGEBER.has(b.art) ? liste(c, KOPF_FREMD(auftraggeber, art), true) : liste(c, KOPF_BETRIEB(c, art), false);
    }
  })();
  const scan = GESCANNT.has(b.art);
  const fremd = VOM_AUFTRAGGEBER.has(b.art) || b.art === "grosshaendlerrechnung" || b.art === "leistungsverzeichnis";
  const loecher = scan && r() < 0.7 ? `<i class="loch" style="top:30%"></i><i class="loch" style="top:66%"></i>` : "";
  return {
    html: `<div class="papier${fremd ? " fremd" : ""}">${loecher}<div class="inhalt">${inhalt}</div></div>`,
    quer: false,
    scan,
  };
}
