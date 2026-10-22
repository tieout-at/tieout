// Prüfkaskade der Schlussrechnung (Muster reebuild R-A, hier auf der eigenen Rechnung):
// Leistungssumme (Entwurf + Liste 1) → Nachlass → Abzüge → Einbehalte → Zahlungen → Restforderung.
// Jeder Satz wird mit dem Vertrag abgeglichen: laut Vertrag / Abweichung / kein Vertragspunkt.
// Rundung: jede Zeile einzeln kaufmännisch auf Cent; Abzüge auf die Summe nach Nachlass,
// Einbehalte auf den Betrag vor Einbehalten.

import type { AbzugArt } from "@/domain/typen";
import { prozent } from "./geld";
import type { Kontext } from "./kontext";
import type { Befund, KaskadenZeile } from "./typen";

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
  { arten: ["haftruecklass"], summe: "Schlussrechnungsbetrag vor Abzug der Zahlungen" },
];

/** Nur mit eigenem Entwurf; ohne Entwurf null. */
export function kaskade(k: Kontext, befunde: Befund[]) {
  if (!k.d.entwurf) return null;
  const v = k.d.vertrag;
  const entwurf = k.d.entwurf.summe.wert;
  const liste1 = befunde.filter((b) => b.liste === "jetzt").reduce((s, b) => s + (b.betrag ?? 0), 0);
  const leistungssumme = entwurf + liste1;
  const zeilen: KaskadenZeile[] = [
    {
      bezeichnung: "Leistungssumme laut Entwurf inkl. Liste 1",
      art: "summe",
      abzugArt: null,
      satz: null,
      quelle: "entwurf",
      pruefung: null,
      vertragspunkt: null,
      betrag: leistungssumme,
    },
  ];

  let basis = leistungssumme;
  for (const stufe of STUFEN) {
    let abzuege = 0;
    for (const art of stufe.arten) {
      const vs = v.saetze.find((s) => s.art === art && s.phase !== "abschlag");
      const gu = k.d.guAbzug?.abzuege.find((a) => a.art === art);
      if (!vs && !gu) continue;
      const satz = gu ? gu.satz.wert : vs!.satz.wert;
      const pruefung = !vs ? "abzug_ohne_vertragspunkt" : vs.satz.wert === satz ? "laut_vertrag" : "abweichung";
      const betrag = prozent(basis, satz);
      abzuege += betrag;
      zeilen.push({
        bezeichnung: NAME[art],
        art: "abzug",
        abzugArt: art,
        satz,
        quelle: gu ? "gu_abzug" : "vertrag",
        pruefung,
        vertragspunkt: vs?.punkt ?? null,
        betrag: -betrag,
      });
    }
    basis -= abzuege;
    zeilen.push({ bezeichnung: stufe.summe, art: "summe", abzugArt: null, satz: null, quelle: null, pruefung: null, vertragspunkt: null, betrag: basis });
  }

  const schlussrechnungsbetrag = basis;
  const zahlungen = k.d.zahlungen.reduce((s, z) => s + z.betrag.wert, 0);
  zeilen.push({
    bezeichnung: `Zahlungen auf ${k.d.zahlungen.map((z) => z.rechnungNr.wert).join(", ")}`,
    art: "zahlung",
    abzugArt: null,
    satz: null,
    quelle: "zahlungen",
    pruefung: null,
    vertragspunkt: null,
    betrag: -zahlungen,
  });
  const restforderung = schlussrechnungsbetrag - zahlungen;
  zeilen.push({ bezeichnung: "Restforderung", art: "summe", abzugArt: null, satz: null, quelle: null, pruefung: null, vertragspunkt: null, betrag: restforderung });

  return { zeilen, leistungssumme, schlussrechnungsbetrag, zahlungen, restforderung };
}
