// Abrechnung eines Projekts mit gelegter und bezahlter Schlussrechnung: von der Rechnungssumme über die Kürzungen
// des Auftraggebers, Nachlass, Umlagen und Haftrücklass bis zur Schlusszahlung, jede Zeile mit ihrem Beleg
// (Schlussrechnung, Korrekturblatt, Vertragspunkt, Zahlungsavis). Beträge laut Avis, Zwischensummen hier gerechnet,
// der Zahlbetrag nachgerechnet. Jeder Satz wird mit dem Vertrag abgeglichen wie in der Kaskade.

import type { AbzugArt, Datensatz, ZahlungsAbzug } from "@/domain/typen";
import { tageZwischen } from "./firma";
import { euro, prozentText } from "./geld";
import type { Abrechnung, AbrechnungsZeile, Beleg, HistorieKuerzung } from "./typen";

const NAME: Record<AbzugArt, string> = {
  nachlass: "Nachlass",
  baustrom_bauwasser: "Baustrom und Bauwasser",
  bauschadensumlage: "Bauschadensumlage",
  deckungsruecklass: "Deckungsrücklass",
  haftruecklass: "Haftrücklass",
};

const STUFEN: { arten: AbzugArt[]; summe: string }[] = [
  { arten: ["nachlass"], summe: "Summe nach Nachlass" },
  { arten: ["baustrom_bauwasser", "bauschadensumlage"], summe: "Betrag vor Einbehalten" },
  { arten: ["deckungsruecklass", "haftruecklass"], summe: "Schlussrechnungsbetrag vor Abzug der Abschläge" },
];

const ABZUG_ARTEN = new Set<string>(STUFEN.flatMap((s) => s.arten));

function zeile(teil: Pick<AbrechnungsZeile, "bezeichnung" | "art" | "betrag"> & Partial<AbrechnungsZeile>): AbrechnungsZeile {
  return { abzugArt: null, satz: null, pruefung: null, vertragspunkt: null, belege: [], ...teil };
}

/** Nur für Projekte mit gelegter Schlussrechnung und Schlusszahlung darauf; sonst null. */
export function abrechnung(d: Datensatz): Abrechnung | null {
  const sr = d.schlussrechnung;
  if (!sr) return null;
  const z = d.zahlungen.find((x) => x.rechnungNr.wert === sr.nr.wert);
  if (!z) return null;
  const avis = (a: ZahlungsAbzug): Beleg => ({ titel: "Zahlungsavis", text: a.betrag.quelle.stelle ?? "", datum: z.datum.wert, quelle: a.betrag.quelle });

  const zeilen: AbrechnungsZeile[] = [
    zeile({
      bezeichnung: "Schlussrechnung",
      art: "rechnung",
      betrag: sr.summe.wert,
      belege: [{ titel: "Schlussrechnung", text: `Summe Leistung ${euro(sr.summe.wert)}`, datum: sr.datum.wert, quelle: sr.summe.quelle }],
    }),
  ];
  let basis = sr.summe.wert;

  const kb = d.korrekturblaetter.filter((k) => k.rechnungNr.wert === sr.nr.wert);
  const kuerzung = z.abzuege.find((a) => a.art === "kuerzung");
  const gekuerzt = kuerzung?.betrag.wert ?? 0;
  if (kuerzung) {
    zeilen.push(
      zeile({
        bezeichnung: "Kürzungen laut Korrekturblatt",
        art: "kuerzung",
        betrag: -gekuerzt,
        belege: [...kb.map((k): Beleg => ({ titel: "Korrekturblatt", text: `${k.zeilen.length} Positionen`, datum: k.datum.wert, quelle: k.rechnungNr.quelle })), avis(kuerzung)],
      }),
    );
    basis -= gekuerzt;
    zeilen.push(zeile({ bezeichnung: "Summe nach Kürzungen", art: "summe", betrag: basis }));
  }

  let einbehalten = 0;
  for (const stufe of STUFEN) {
    const treffer = z.abzuege.filter((a): a is ZahlungsAbzug & { art: AbzugArt } => ABZUG_ARTEN.has(a.art) && stufe.arten.includes(a.art as AbzugArt));
    if (!treffer.length) continue;
    for (const a of treffer) {
      const vs = d.vertrag.saetze.find((s) => s.art === a.art && s.phase !== "abschlag");
      const satz = a.satz?.wert ?? null;
      zeilen.push(
        zeile({
          bezeichnung: NAME[a.art],
          art: "abzug",
          abzugArt: a.art,
          satz,
          pruefung: !vs ? "abzug_ohne_vertragspunkt" : satz === null || vs.satz.wert === satz ? "laut_vertrag" : "abweichung",
          vertragspunkt: vs?.punkt ?? null,
          betrag: -a.betrag.wert,
          belege: [
            ...(vs ? [{ titel: `Vertrag Pkt. ${vs.punkt}`, text: `${NAME[a.art]} ${prozentText(vs.satz.wert, 2)}`, datum: d.vertrag.datum.wert, quelle: vs.satz.quelle }] : []),
            avis(a),
          ],
        }),
      );
      basis -= a.betrag.wert;
      if (a.art === "haftruecklass") einbehalten += a.betrag.wert;
    }
    zeilen.push(zeile({ bezeichnung: stufe.summe, art: "summe", betrag: basis }));
  }

  const abschlaege = z.abzuege.find((a) => a.art === "abschlagszahlungen");
  if (abschlaege) {
    zeilen.push(zeile({ bezeichnung: "Bezahlte Abschläge", art: "zahlung", betrag: -abschlaege.betrag.wert, belege: [avis(abschlaege)] }));
    basis -= abschlaege.betrag.wert;
  }
  zeilen.push(
    zeile({
      bezeichnung: "Schlusszahlung",
      art: "ergebnis",
      betrag: basis,
      belege: [{ titel: "Zahlungsavis", text: `Zahlbetrag ${euro(z.betrag.wert)}`, datum: z.datum.wert, quelle: z.betrag.quelle }],
    }),
  );

  const kuerzungen: HistorieKuerzung[] = kb.flatMap((k) =>
    k.zeilen.map((x) => ({
      projektId: d.projekt.id,
      kurz: d.projekt.kurz,
      rechnung: { nr: sr.nr.wert, art: "schluss" as const, datum: sr.datum.wert },
      bezug: x.positionNr.wert,
      grund: x.grund.wert,
      text: x.text.wert,
      betrag: x.kuerzung.wert,
      beleg: { titel: "Korrekturblatt", text: `${x.positionNr.wert} ${x.text.wert}`, datum: k.datum.wert, quelle: x.kuerzung.quelle },
    })),
  );

  return {
    rechnung: { nr: sr.nr.wert, datum: sr.datum.wert, summe: sr.summe.wert },
    zeilen,
    gekuerzt,
    einbehalten,
    schlusszahlung: { betrag: z.betrag.wert, datum: z.datum.wert, tage: tageZwischen(sr.datum.wert, z.datum.wert), nachgerechnet: basis, stimmt: basis === z.betrag.wert },
    kuerzungen,
    nachtraege: d.nachtraege.map((n) => ({
      nr: n.positionNr.wert,
      titel: n.titel.wert,
      betrag: n.betrag.wert,
      beauftragt: n.beauftragt.wert,
      beleg: { titel: `Nachtragsangebot ${n.positionNr.wert}`, text: n.titel.wert, quelle: n.betrag.quelle },
    })),
  };
}
