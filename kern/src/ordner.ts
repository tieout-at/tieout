// Run step "Ordner lesen" (SPEZIFIKATION.md 5.1): what came in from the folder, duplicates, plan index chains and the
// fields corrected by hand. Ported from `importStand` of the v1 core (ledger.ts), plus the index chains.

import type { BelegArt, Datensatz, Datum } from "./modell";

export interface Planstand {
  index: string;
  datum: Datum;
  belegId: string;
  /** What changed against the previous index; null for the first index in the folder. */
  aenderung: string | null;
}

export interface OrdnerStand {
  /** Every file of the folder, duplicates included. */
  belege: number;
  duplikate: number;
  eindeutig: number;
  /** Ids of the duplicates (the later file with the same checksum). */
  duplikatIds: string[];
  /** Files per kind, duplicates included. */
  nachArt: Partial<Record<BelegArt, number>>;
  /** Per plan number its indices in date order: "Plan H-201: Index C → D". */
  planketten: { planNr: string; indizes: Planstand[] }[];
  /** Fields a human corrected on import. */
  korrigierteFelder: number;
  /** WhatsApp-Meldungen of the project; not part of the folder. */
  meldungen: number;
}

/** Counts the fields in state "korrigiert", wherever they are in the dataset. */
export function zaehleKorrekturen(wert: unknown): number {
  if (Array.isArray(wert)) return wert.reduce((s: number, w) => s + zaehleKorrekturen(w), 0);
  if (wert && typeof wert === "object") {
    const o = wert as Record<string, unknown>;
    const selbst = "quelle" in o && "wert" in o && o.pruefstand === "korrigiert" ? 1 : 0;
    return selbst + Object.entries(o).reduce((s: number, [k, w]) => s + (k === "verlauf" ? 0 : zaehleKorrekturen(w)), 0);
  }
  return 0;
}

export function ordnerLesen(d: Datensatz): OrdnerStand {
  const gesehen = new Set<string>();
  const duplikatIds: string[] = [];
  const nachArt: Partial<Record<BelegArt, number>> = {};
  for (const b of [...d.belege].sort((a, b) => a.datum.localeCompare(b.datum) || a.id.localeCompare(b.id))) {
    nachArt[b.art] = (nachArt[b.art] ?? 0) + 1;
    if (gesehen.has(b.inhaltHash)) duplikatIds.push(b.id);
    else gesehen.add(b.inhaltHash);
  }

  const ketten = new Map<string, Planstand[]>();
  for (const p of d.plaene) {
    const liste = ketten.get(p.planNr.wert) ?? [];
    liste.push({ index: p.index.wert, datum: p.datum.wert, belegId: p.belegId, aenderung: p.aenderung?.wert ?? null });
    ketten.set(p.planNr.wert, liste);
  }
  const planketten = [...ketten.entries()]
    .map(([planNr, indizes]) => ({ planNr, indizes: indizes.sort((a, b) => a.datum.localeCompare(b.datum)) }))
    .sort((a, b) => a.planNr.localeCompare(b.planNr));

  return {
    belege: d.belege.length,
    duplikate: duplikatIds.length,
    eindeutig: d.belege.length - duplikatIds.length,
    duplikatIds,
    nachArt,
    planketten,
    korrigierteFelder: zaehleKorrekturen(d),
    meldungen: d.meldungen.length,
  };
}
