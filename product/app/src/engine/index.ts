// Einstieg in den Rechenkern: pruefe(datensatz) liefert alles, was die Oberfläche zeigt.

import type { Datensatz } from "@/domain/typen";
import { alleBefunde } from "./befunde";
import { kaskade } from "./kaskade";
import { baueKontext } from "./kontext";
import { baueLedger, importStand } from "./ledger";
import type { Ergebnis } from "./typen";
import { hinweise, vorpruefung } from "./vorpruefung";

export function pruefe(d: Datensatz): Ergebnis {
  const k = baueKontext(d);
  const befunde = alleBefunde(k);
  const ledger = baueLedger(k).map((z) => ({
    ...z,
    befundSchluessel: befunde.find((b) => b.positionNr === z.positionNr)?.schluessel ?? null,
  }));
  const summe = (liste: string) => befunde.filter((b) => b.liste === liste).reduce((s, b) => s + (b.betrag ?? 0), 0);
  const unterschriebenNichtVerrechnet = d.regie.filter((r) => r.unterschriftAG.wert && !k.regieVerrechnet.has(r.nr.wert)).length;
  const nichtUnterschrieben = d.regie.filter((r) => !r.unterschriftAG.wert && !k.regieVerrechnet.has(r.nr.wert)).length;

  return {
    import: importStand(d),
    ledger,
    befunde,
    summen: { jetzt: summe("jetzt"), offen: summe("offen"), verloren: summe("verloren") },
    vorpruefung: vorpruefung(k, befunde),
    hinweise: hinweise(k, befunde),
    kaskade: kaskade(k, befunde),
    regie: {
      gesamt: d.regie.length,
      verrechnet: d.regie.filter((r) => k.regieVerrechnet.has(r.nr.wert)).length,
      unterschriebenNichtVerrechnet,
      nichtUnterschrieben,
    },
  };
}

export type * from "./typen";
export { KUERZUNGSGRUND_TEXT } from "./typen";
