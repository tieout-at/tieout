// Einlesen-Stand (Duplikate, Planindizes, Korrekturen) und Ledger pro LV-Position.

import type { Datensatz } from "@/domain/typen";
import { betragAusMenge } from "./geld";
import { aufmassMenge, verrechneteZeilen, verrechnetMenge, type Kontext } from "./kontext";
import type { ImportStand, LedgerZeile } from "./typen";

/** Zählt Felder mit korrigiert = true, egal wo im Datensatz. */
function zaehleKorrekturen(wert: unknown): number {
  if (Array.isArray(wert)) return wert.reduce((s: number, w) => s + zaehleKorrekturen(w), 0);
  if (wert && typeof wert === "object") {
    const o = wert as Record<string, unknown>;
    const selbst = "quelle" in o && "wert" in o && o.korrigiert === true ? 1 : 0;
    return selbst + Object.values(o).reduce((s: number, w) => s + zaehleKorrekturen(w), 0);
  }
  return 0;
}

export function importStand(d: Datensatz): ImportStand {
  const gesehen = new Set<string>();
  let duplikate = 0;
  const nachArt: Record<string, number> = {};
  for (const dok of d.dokumente) {
    nachArt[dok.art] = (nachArt[dok.art] ?? 0) + 1;
    if (gesehen.has(dok.inhaltHash)) duplikate++;
    else gesehen.add(dok.inhaltHash);
  }
  const planIndizes = [...new Set(d.plaene.map((p) => p.index.wert))].sort();
  return {
    dokumente: d.dokumente.length,
    duplikate,
    eindeutig: d.dokumente.length - duplikate,
    planIndizes,
    korrigierteFelder: zaehleKorrekturen(d),
    nachArt,
  };
}

export function baueLedger(k: Kontext): LedgerZeile[] {
  return k.d.lv.map((p) => {
    const nr = p.nr.wert;
    const ep = p.ep.wert;
    const aufmass = aufmassMenge(k, nr);
    const verrechnet = verrechnetMenge(k, nr);
    const verrechnetBetrag = verrechneteZeilen(k, nr).reduce((s, f) => s + f.zeile.betrag.wert, 0);
    const arZeilen = k.abschlaege.get(nr) ?? [];
    const inAbschlaegen = arZeilen.reduce((s, f) => s + f.zeile.menge.wert, 0);
    const bezahlt =
      arZeilen.filter((f) => k.bezahlteRechnungen.has(f.rechnung.nr.wert)).reduce((s, f) => s + f.zeile.betrag.wert, 0) -
      (k.kuerzungen.get(nr) ?? 0);
    const differenz = aufmass - verrechnet;
    return {
      positionNr: nr,
      kurztext: p.kurztext.wert,
      einheit: p.einheit.wert,
      ep,
      lvMenge: p.menge.wert,
      aufmassMenge: aufmass,
      verrechnetMenge: verrechnet,
      verrechnetBetrag,
      inAbschlaegenMenge: inAbschlaegen,
      bezahltBetrag: bezahlt,
      differenzMenge: differenz,
      differenzBetrag: differenz > 0 ? betragAusMenge(differenz, ep) : 0,
      befundSchluessel: null,
    };
  });
}
