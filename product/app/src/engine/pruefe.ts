// Projektebene: pruefe(datensatz) liefert alles, was die Oberfläche zu einem Projekt zeigt.

import type { Datensatz } from "@/domain/typen";
import { alleBefunde } from "./befunde";
import { belegquellen, nurAusserhalbErp } from "./belegquelle";
import { kaskade } from "./kaskade";
import { baueKontext, vorGrenze } from "./kontext";
import { baueLedger, importStand } from "./ledger";
import type { Ergebnis } from "./typen";
import { hinweise, vorpruefung } from "./vorpruefung";

/** Abgeglichen werden nur Projekte in Ausführung und vor der Schlussrechnung. */
export function wirdAbgeglichen(d: Datensatz): boolean {
  return d.projekt.status === "in_ausfuehrung" || d.projekt.status === "sr_vorbereiten";
}

export function pruefe(d: Datensatz): Ergebnis {
  const k = baueKontext(d);
  const abgleich = wirdAbgeglichen(d);
  const befunde = abgleich ? alleBefunde(k) : [];
  const ledger = (abgleich ? baueLedger(k) : []).map((z) => ({
    ...z,
    befundSchluessel: befunde.find((b) => b.positionNr === z.positionNr)?.schluessel ?? null,
  }));
  const summe = (liste: string) => befunde.filter((b) => b.liste === liste).reduce((s, b) => s + (b.betrag ?? 0), 0);
  const offeneRegie = d.regie.filter((r) => !k.regieVerrechnet.has(r.nr.wert));
  const bisGrenze = offeneRegie.filter((r) => vorGrenze(k, r.datum.wert));
  const unterschriebenNichtVerrechnet = bisGrenze.filter((r) => r.unterschriftAG.wert).length;
  const nichtUnterschrieben = bisGrenze.filter((r) => !r.unterschriftAG.wert).length;

  const quellen = Object.fromEntries(befunde.map((b) => [b.schluessel, belegquellen(d, b)]));
  const mitBetrag = befunde.filter((b) => (b.liste === "jetzt" || b.liste === "offen") && b.betrag !== null);
  const ausserhalb = mitBetrag.filter((b) => nurAusserhalbErp(quellen[b.schluessel]));

  return {
    projektId: d.projekt.id,
    abgleich,
    grenze: k.grenze,
    import: importStand(d),
    ledger,
    befunde,
    belegquellen: quellen,
    ausserhalbErp: {
      betrag: ausserhalb.reduce((s, b) => s + (b.betrag ?? 0), 0),
      anzahl: ausserhalb.length,
      vonBetrag: mitBetrag.reduce((s, b) => s + (b.betrag ?? 0), 0),
      vonAnzahl: mitBetrag.length,
    },
    summen: { jetzt: summe("jetzt"), offen: summe("offen"), verloren: summe("verloren") },
    vorpruefung: abgleich ? vorpruefung(k, befunde) : null,
    hinweise: abgleich ? hinweise(k, befunde) : [],
    kaskade: abgleich ? kaskade(k, befunde) : null,
    regie: {
      gesamt: d.regie.length,
      verrechnet: d.regie.filter((r) => k.regieVerrechnet.has(r.nr.wert)).length,
      unterschriebenNichtVerrechnet,
      nichtUnterschrieben,
      nachGrenze: offeneRegie.length - bisGrenze.length,
    },
  };
}
