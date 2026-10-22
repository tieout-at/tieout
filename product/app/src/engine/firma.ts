// Firmenebene: alle Projekte der Firma mit Ampel, Datum und den Summen der offenen Projekte.
// Ampel (feste Regel, Demo_Faelle.md): rot = Schlussrechnung legen bis höchstens 21 Tage nach dem Stichtag
// und etwas offen; gelb = etwas offen; grün = nichts offen; grau = Schlussrechnung gelegt oder abgeschlossen.
// „Jetzt verrechenbar“ und „angemeldet und offen“ werden nie zusammengezählt angezeigt.

import type { Datensatz, Firmendaten } from "@/domain/typen";
import { pruefe } from "./pruefe";
import type { Ampel, Ergebnis, FirmenErgebnis, ProjektZeile } from "./typen";

export const AMPEL_TAGE = 21;

/** Tage von a bis b (ISO-Daten), ganzzahlig. */
export function tageZwischen(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export function ampel(d: Datensatz, e: Ergebnis, stichtag: string): Ampel {
  if (!e.abgleich) return "grau";
  const offen = e.summen.jetzt + e.summen.offen;
  if (offen === 0) return "gruen";
  const legenBis = d.projekt.schlussrechnungLegenBis;
  if (legenBis && tageZwischen(stichtag, legenBis) <= AMPEL_TAGE) return "rot";
  return "gelb";
}

function projektDatum(d: Datensatz): ProjektZeile["datum"] {
  const p = d.projekt;
  switch (p.status) {
    case "sr_vorbereiten":
      return p.schlussrechnungLegenBis ? { art: "legen_bis", wert: p.schlussrechnungLegenBis } : null;
    case "in_ausfuehrung": {
      const letzte = d.abschlaege.map((r) => r.datum.wert).sort().at(-1);
      return letzte ? { art: "letzte_ar", wert: letzte } : null;
    }
    case "sr_gelegt":
      return p.schlussrechnungGelegt ? { art: "gelegt", wert: p.schlussrechnungGelegt } : null;
    case "abgeschlossen":
      return p.schlusszahlung ? { art: "schlusszahlung", wert: p.schlusszahlung } : null;
  }
}

export function pruefeFirma(f: Firmendaten): FirmenErgebnis {
  const ergebnisse: Record<string, Ergebnis> = {};
  const projekte: ProjektZeile[] = f.projekte.map((d) => {
    const e = pruefe(d);
    ergebnisse[d.projekt.id] = e;
    const auftraggeber = f.auftraggeber.find((a) => a.id === d.projekt.auftraggeberId);
    if (!auftraggeber) throw new Error(`Auftraggeber ${d.projekt.auftraggeberId} fehlt (${d.projekt.kurz})`);
    return {
      projektId: d.projekt.id,
      kurz: d.projekt.kurz,
      name: d.projekt.name,
      los: d.projekt.los,
      auftraggeber,
      status: d.projekt.status,
      auftragssumme: d.vertrag.auftragssumme.wert,
      datum: projektDatum(d),
      jetzt: e.abgleich ? e.summen.jetzt : null,
      offen: e.abgleich ? e.summen.offen : null,
      befunde: e.befunde.length,
      ampel: ampel(d, e, f.stichtag),
    };
  });
  const offene = projekte.filter((p) => p.jetzt !== null);
  return {
    stichtag: f.stichtag,
    projekte,
    ergebnisse,
    summen: {
      projekte: projekte.length,
      offeneProjekte: offene.length,
      auftragssumme: projekte.reduce((s, p) => s + p.auftragssumme, 0),
      auftragssummeOffen: offene.reduce((s, p) => s + p.auftragssumme, 0),
      jetzt: offene.reduce((s, p) => s + (p.jetzt ?? 0), 0),
      offen: offene.reduce((s, p) => s + (p.offen ?? 0), 0),
    },
  };
}
