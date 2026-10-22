// Befund-Regeln: was ist erbracht, aber nicht im eigenen Schlussrechnungs-Entwurf?
// Jede Regel liefert Betrag, Rechenweg und Belege mit Quelle. Die Lösungsliste wird hier nie gelesen.

import type { Quelle, Zuruf } from "@/domain/typen";
import { betragAusMenge, euro, menge, prozent, prozentText, rundeHalbAuf, stunden, stundenBetrag } from "./geld";
import { aufmassMenge, istAbDatum, verrechneteZeilen, verrechnetMenge, vorGrenze, type Kontext } from "./kontext";
import type { Befund, Beleg, Liste } from "./typen";

const tagMonat = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;
const datumText = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

function beleg(titel: string, text: string, quelle: Quelle, datum?: string): Beleg {
  return datum ? { titel, text, quelle, datum } : { titel, text, quelle };
}

function nachDatum(belege: Beleg[]): Beleg[] {
  return [...belege].sort((a, b) => (a.datum ?? "").localeCompare(b.datum ?? ""));
}

function zurufBeleg(z: Zuruf): Beleg {
  return beleg(`Zuruf ${z.nr}`, `„${z.transkript.wert}“`, z.transkript.quelle, z.zeitpunkt.slice(0, 10));
}

/**
 * Erbracht, aber nicht verrechnet. Mit Entwurf: Aufmaß gegen Entwurf; über der LV-Menge heißt das Mehrmenge.
 * Ohne Entwurf (in Ausführung): Aufmaß vor der letzten AR gegen die Abschlagsrechnungen.
 */
export function mehrmengen(k: Kontext): Befund[] {
  const ergebnis: Befund[] = [];
  for (const p of k.d.lv) {
    const nr = p.nr.wert;
    const aufmass = aufmassMenge(k, nr, true);
    const verrechnet = verrechnetMenge(k, nr);
    if (aufmass <= verrechnet) continue;

    const ep = p.ep.wert;
    const einheit = p.einheit.wert;
    const differenz = aufmass - verrechnet;
    const betrag = betragAusMenge(differenz, ep);

    const plaene = k.d.plaene
      .flatMap((plan) => plan.vermerke.filter((v) => v.positionNr.wert === nr).map((v) => ({ plan, v })))
      .sort((a, b) => a.plan.datum.wert.localeCompare(b.plan.datum.wert));
    const ausPlanaenderung = plaene.some((x) => x.v.typ === "aenderung");
    const ueberLv = aufmass > p.menge.wert;
    const verrechnetLabel = k.d.entwurf ? "Verrechnet" : "In Abschlagsrechnungen";

    const belege: Beleg[] = [
      ...plaene.map(({ plan, v }) =>
        beleg(`Plan ${plan.planNr.wert}, Index ${plan.index.wert}`, v.text.wert, v.text.quelle, plan.datum.wert),
      ),
      ...k.d.mails
        .filter((m) => m.kategorie.wert === "anweisung" && m.bezugPositionen.wert.includes(nr))
        .map((m) => beleg(`Mail ${m.von.wert}`, m.zitat ? `„${m.zitat.wert}“` : m.betreff.wert, m.zitat?.quelle ?? m.betreff.quelle, m.datum.wert)),
      ...k.d.fotos
        .filter((f) => f.bezugPositionen.wert.includes(nr))
        .map((f) => beleg(`Foto ${k.d.dokumente.find((x) => x.id === f.dokumentId)?.dateiname ?? f.dokumentId}`, f.ort.wert, f.exifDatum.quelle, f.exifDatum.wert.slice(0, 10))),
      ...k.d.zurufe.filter((z) => z.bezugPositionen.wert.includes(nr)).map(zurufBeleg),
      ...(k.aufmass.get(nr) ?? [])
        .filter(({ blatt }) => vorGrenze(k, blatt.datum.wert))
        .map(({ blatt, zeile }) =>
          beleg(`Aufmaßblatt ${blatt.nr}`, `${menge(zeile.menge.wert, einheit)} aufgemessen`, zeile.menge.quelle, blatt.datum.wert),
        ),
      ...(k.d.entwurf
        ? []
        : verrechneteZeilen(k, nr).map(({ rechnung, zeile }) =>
            beleg(`${rechnung.nr.wert} Pos. ${nr}`, `${menge(zeile.menge.wert, einheit)} verrechnet`, zeile.menge.quelle, rechnung.datum.wert),
          )),
    ];

    let plausibilitaet: string | undefined;
    if (p.k7) {
      const lohn = stundenBetrag(p.k7.lohnHundertstel.wert, k.d.vertrag.mittellohnpreis.wert);
      const sonst = p.k7.sonstigesJeEinheit.wert;
      const passt = lohn + sonst === ep ? "" : `, weicht vom EP ${euro(ep)} ab`;
      plausibilitaet = `K7: ${stunden(p.k7.lohnHundertstel.wert)} × ${euro(k.d.vertrag.mittellohnpreis.wert)} = ${euro(lohn)} Lohn + ${euro(sonst)} Sonstiges = ${euro(lohn + sonst)}${passt}`;
    }

    ergebnis.push({
      schluessel: `${ueberLv ? "mehrmenge" : "nicht_verrechnet"}:${nr}`,
      art: !ueberLv ? "nicht_verrechnet" : ausPlanaenderung ? "mehrmenge_plan" : "mehrmenge",
      liste: "jetzt",
      titel: `${nr} ${p.kurztext.wert}`,
      positionNr: nr,
      betrag,
      rechenweg: {
        text: `(${menge(aufmass)} − ${menge(verrechnet)}) ${einheit} × ${euro(ep)} = ${euro(betrag)}`,
        schritte: [
          { bezeichnung: "LV-Menge", wert: menge(p.menge.wert, einheit) },
          { bezeichnung: k.grenze ? `Aufmaß bis ${datumText(k.grenze)}` : "Aufmaß", wert: menge(aufmass, einheit) },
          { bezeichnung: verrechnetLabel, wert: menge(verrechnet, einheit) },
          { bezeichnung: "Einheitspreis laut LV", wert: euro(ep), betrag: ep },
          { bezeichnung: `${menge(differenz, einheit)} × ${euro(ep)}`, wert: euro(betrag), betrag },
        ],
        plausibilitaet,
      },
      belege: [beleg(`LV Pos. ${nr}`, `${menge(p.menge.wert, einheit)} zu ${euro(ep)}`, p.ep.quelle), ...nachDatum(belege)],
      pruefstand: "maschinell",
    });
  }
  return ergebnis;
}

export function regie(k: Kontext): Befund[] {
  const v = k.d.vertrag;
  return k.d.regie
    .filter((rb) => !k.regieVerrechnet.has(rb.nr.wert) && vorGrenze(k, rb.datum.wert))
    .map((rb) => {
      const m = stundenBetrag(rb.stundenMonteur.wert, v.regiesatzMonteur.wert);
      const h = stundenBetrag(rb.stundenHelfer.wert, v.regiesatzHelfer.wert);
      const betrag = m + h + rb.material.wert;
      const unterschrieben = rb.unterschriftAG.wert;
      const teile = [`${menge(rb.stundenMonteur.wert)} h Monteur × ${euro(v.regiesatzMonteur.wert)} = ${euro(m)}`];
      if (rb.stundenHelfer.wert > 0) teile.push(`${menge(rb.stundenHelfer.wert)} h Helfer × ${euro(v.regiesatzHelfer.wert)} = ${euro(h)}`);
      teile.push(`Material ${euro(rb.material.wert)}`);
      return {
        schluessel: `regie:${rb.nr.wert}`,
        art: "regie" as const,
        liste: (unterschrieben ? "jetzt" : "offen") as Liste,
        titel: `${rb.nr.wert} ${rb.taetigkeit.wert}`,
        positionNr: null,
        betrag,
        rechenweg: {
          text: `${teile.join(" + ")} = ${euro(betrag)}`,
          schritte: [
            { bezeichnung: "Monteur", wert: `${menge(rb.stundenMonteur.wert)} h × ${euro(v.regiesatzMonteur.wert)}`, betrag: m },
            ...(rb.stundenHelfer.wert > 0
              ? [{ bezeichnung: "Helfer", wert: `${menge(rb.stundenHelfer.wert)} h × ${euro(v.regiesatzHelfer.wert)}`, betrag: h }]
              : []),
            { bezeichnung: "Material", wert: euro(rb.material.wert), betrag: rb.material.wert },
          ],
        },
        belege: nachDatum([
          beleg(
            `Regiebericht ${rb.nr.wert}`,
            !unterschrieben
              ? "nicht unterschrieben, nicht verrechnet"
              : k.d.entwurf
                ? "vom GU unterschrieben, in keiner Abschlagsrechnung und nicht im Entwurf"
                : "vom GU unterschrieben, in keiner Abschlagsrechnung",
            rb.unterschriftAG.quelle,
            rb.datum.wert,
          ),
          ...k.d.zurufe.filter((z) => z.bezugRegie?.wert === rb.nr.wert).map(zurufBeleg),
        ]),
        pruefstand: "maschinell" as const,
      };
    });
}

/**
 * Regie, die nur als Zuruf belegt ist: kein Regiebericht, keine Unterschrift → angemeldet und offen.
 * Bepreist mit den Regiesätzen des Vertrags; Material nur, wenn der Zuruf es nennt (hier nie).
 */
export function zurufRegie(k: Kontext): Befund[] {
  const v = k.d.vertrag;
  return k.d.zurufe
    .filter((z) => !z.bezugRegie && z.stundenMonteur.wert + z.stundenHelfer.wert > 0 && vorGrenze(k, z.zeitpunkt.slice(0, 10)))
    .map((z) => {
      const m = stundenBetrag(z.stundenMonteur.wert, v.regiesatzMonteur.wert);
      const h = stundenBetrag(z.stundenHelfer.wert, v.regiesatzHelfer.wert);
      const betrag = m + h;
      const teile: string[] = [];
      if (z.stundenMonteur.wert > 0) teile.push(`${menge(z.stundenMonteur.wert)} h Monteur × ${euro(v.regiesatzMonteur.wert)} = ${euro(m)}`);
      if (z.stundenHelfer.wert > 0) teile.push(`${menge(z.stundenHelfer.wert)} h Helfer × ${euro(v.regiesatzHelfer.wert)} = ${euro(h)}`);
      return {
        schluessel: `zuruf:${z.nr}`,
        art: "regie_zuruf" as const,
        liste: "offen" as Liste,
        titel: `${z.nr} ${z.taetigkeit.wert}`,
        positionNr: null,
        betrag,
        rechenweg: {
          text: `${teile.join(" + ")}${teile.length > 1 ? ` = ${euro(betrag)}` : ""}`,
          schritte: [
            ...(z.stundenMonteur.wert > 0
              ? [{ bezeichnung: "Monteur", wert: `${menge(z.stundenMonteur.wert)} h × ${euro(v.regiesatzMonteur.wert)}`, betrag: m }]
              : []),
            ...(z.stundenHelfer.wert > 0
              ? [{ bezeichnung: "Helfer", wert: `${menge(z.stundenHelfer.wert)} h × ${euro(v.regiesatzHelfer.wert)}`, betrag: h }]
              : []),
          ],
        },
        belege: [zurufBeleg(z)],
        pruefstand: "maschinell" as const,
      };
    });
}

/** Summe der aufgemessenen Leistung ab dem Stichtag (nach Leistungszeitraum des Aufmaßblatts). */
export function leistungAbStichtag(k: Kontext, stichtag: string): number {
  let s = 0;
  for (const blatt of k.d.aufmass) {
    if (!istAbDatum(blatt.leistungVon.wert, stichtag)) continue;
    for (const z of blatt.zeilen) {
      const p = k.lv.get(z.positionNr.wert);
      if (p) s += betragAusMenge(z.menge.wert, p.ep.wert);
    }
  }
  return s;
}

export function preisumrechnung(k: Kontext): Befund[] {
  const pg = k.d.vertrag.preisgleitung;
  const ix = k.d.indexblatt;
  if (!pg || !ix || !k.d.entwurf) return [];
  if (k.d.entwurf.zeilen.some((z) => z.typ === "preisgleitung")) return [];
  const aenderung = rundeHalbAuf((ix.aktuell.wert - ix.basis.wert) * 10000, ix.basis.wert);
  if (aenderung <= 0) return [];

  const stichtag = pg.stichtag.wert;
  const leistung = leistungAbStichtag(k, stichtag);
  const lohn = prozent(leistung, pg.lohnanteil.wert);
  const betrag = prozent(lohn, aenderung);
  if (betrag <= 0) return [];
  const blaetter = k.d.aufmass.filter((b) => istAbDatum(b.leistungVon.wert, stichtag)).map((b) => b.nr);

  return [
    {
      schluessel: "preisumrechnung",
      art: "preisumrechnung",
      liste: "jetzt",
      titel: `Preisumrechnung Lohn ab ${datumText(stichtag)} (ÖNORM B 2111)`,
      positionNr: null,
      betrag,
      rechenweg: {
        text: `${euro(lohn)} × ${prozentText(aenderung)} = ${euro(betrag)}`,
        schritte: [
          { bezeichnung: `Leistung ab ${datumText(stichtag)} (${blaetter.length} Aufmaßblätter)`, wert: euro(leistung), betrag: leistung },
          { bezeichnung: `Lohnanteil ${prozentText(pg.lohnanteil.wert, 0)} laut Vertrag Pkt. ${pg.punkt}`, wert: euro(lohn), betrag: lohn },
          {
            bezeichnung: `${ix.name.wert}: ${menge(ix.basis.wert)} → ${menge(ix.aktuell.wert)}`,
            wert: prozentText(aenderung),
          },
          { bezeichnung: "Preisumrechnung", wert: euro(betrag), betrag },
        ],
      },
      belege: [
        beleg(`Vertrag Pkt. ${pg.punkt}`, `veränderliche Preise, Lohnanteil ${prozentText(pg.lohnanteil.wert, 0)}, ab ${datumText(stichtag)}`, pg.stichtag.quelle, k.d.vertrag.datum.wert),
        beleg(`Indexblatt ${ix.name.wert}`, `${menge(ix.basis.wert)} → ${menge(ix.aktuell.wert)}`, ix.aktuell.quelle, ix.stand.wert),
      ],
      pruefstand: "maschinell",
    },
  ];
}

export function anmeldungen(k: Kontext): Befund[] {
  const v = k.d.vertrag;
  return k.d.mails
    .filter((m) => m.kategorie.wert === "anmeldung" && m.anmeldung && !m.anmeldung.bepreist.wert)
    .map((m) => {
      const a = m.anmeldung!;
      const lohn = stundenBetrag(a.stunden.wert, v.mittellohnpreis.wert);
      const betrag = lohn + a.material.wert;
      const pauschale = v.pauschalen.find((p) => p.kategorie.wert === a.kategorie.wert);
      const mailBeleg = beleg(`Mail ${tagMonat(m.datum.wert)} (Anmeldung)`, m.zitat ? `„${m.zitat.wert}“` : a.gegenstand.wert, m.zitat?.quelle ?? a.gegenstand.quelle, m.datum.wert);
      const rechenweg = {
        text: `${menge(a.stunden.wert)} h × ${euro(v.mittellohnpreis.wert)} (Mittellohnpreis) + Material ${euro(a.material.wert)} = ${euro(betrag)}`,
        schritte: [
          { bezeichnung: "Lohn", wert: `${menge(a.stunden.wert)} h × ${euro(v.mittellohnpreis.wert)}`, betrag: lohn },
          { bezeichnung: "Material", wert: euro(a.material.wert), betrag: a.material.wert },
        ],
      };
      if (pauschale) {
        return {
          schluessel: `anmeldung:${m.dokumentId}`,
          art: "pauschale" as const,
          liste: "verloren" as Liste,
          titel: a.gegenstand.wert,
          positionNr: null,
          betrag,
          rechenweg: { ...rechenweg, text: `${rechenweg.text}; laut Vertrag Pkt. ${pauschale.punkt} pauschal enthalten` },
          belege: [mailBeleg, beleg(`Vertrag Pkt. ${pauschale.punkt}`, pauschale.text.wert, pauschale.text.quelle, v.datum.wert)],
          pruefstand: "maschinell" as const,
        };
      }
      return {
        schluessel: `anmeldung:${m.dokumentId}`,
        art: "aenderung" as const,
        liste: "offen" as Liste,
        titel: `${a.gegenstand.wert}, angemeldet ${tagMonat(m.datum.wert)}, nie bepreist`,
        positionNr: null,
        betrag,
        rechenweg: { ...rechenweg, text: `Untergrenze aus eigener Kalkulation: ${rechenweg.text}` },
        belege: [mailBeleg],
        pruefstand: "maschinell" as const,
      };
    });
}

/** Termin- und Behinderungs-Mails des GU: nur Hinweis, kein Betrag, keine rechtliche Einordnung. */
export function anwaltsHinweise(k: Kontext): Befund[] {
  return k.d.mails
    .filter((m) => m.kategorie.wert === "terminaenderung" || m.kategorie.wert === "behinderung")
    .map((m) => ({
      schluessel: `hinweis:${m.dokumentId}`,
      art: m.kategorie.wert === "terminaenderung" ? ("terminaenderung" as const) : ("behinderung" as const),
      liste: "anwalt" as Liste,
      titel: `${m.kategorie.wert === "terminaenderung" ? "Terminänderung" : "Behinderung"} (Mail GU ${tagMonat(m.datum.wert)})`,
      positionNr: null,
      betrag: null,
      rechenweg: null,
      belege: [beleg(`Mail ${m.von.wert}`, m.zitat ? `„${m.zitat.wert}“` : m.betreff.wert, m.zitat?.quelle ?? m.betreff.quelle, m.datum.wert)],
      pruefstand: "maschinell" as const,
    }));
}

const LISTEN_REIHENFOLGE: Liste[] = ["jetzt", "offen", "verloren", "anwalt"];

export function alleBefunde(k: Kontext): Befund[] {
  return [...mehrmengen(k), ...regie(k), ...zurufRegie(k), ...preisumrechnung(k), ...anmeldungen(k), ...anwaltsHinweise(k)].sort(
    (a, b) =>
      LISTEN_REIHENFOLGE.indexOf(a.liste) - LISTEN_REIHENFOLGE.indexOf(b.liste) ||
      (b.betrag ?? 0) - (a.betrag ?? 0) ||
      a.schluessel.localeCompare(b.schluessel),
  );
}
