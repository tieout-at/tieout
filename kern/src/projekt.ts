// One project through the Abschluss-Lauf (SPEZIFIKATION.md 5.1): "Ordner lesen", "Abgleich", "Vorprüfung", "Entwurf"
// (Rechnungsabschluss) and what "Ausgaben" needs (Schlussbesprechungs-Blatt). Pure function over the twin and the decisions.

import { ausserhalbErp, belegquellen, type AusserhalbErp, type Belegquelle } from "./belegquelle";
import type { Cent, Datensatz, Entscheidung, Entscheidungsstand } from "./modell";
import { aktiveEingaenge, luecken, mitEingaengen, type Eingang, type Luecke } from "./luecken";
import { ordnerLesen, type OrdnerStand } from "./ordner";
import { positionstabelle, type Positionstabelle } from "./positionen";
import { rechnungsabschluss, type Rechnungsabschluss } from "./rechnungsabschluss";
import { abgleich, type Abgleich } from "./regeln";
import { schlussbesprechung, type Schlussbesprechung } from "./schlussbesprechung";
import { vorpruefung, type Vorpruefung } from "./vorpruefung";

/** The decisions a find counts under; "Nicht verrechnen" counts in no sum. */
export type ZaehlendeEntscheidung = Exclude<Entscheidungsstand, "nicht_verrechnen">;
export const ZAEHLENDE_ENTSCHEIDUNGEN: readonly ZaehlendeEntscheidung[] = ["gefunden", "geprueft", "freigegeben", "in_schlussrechnung"];

/** The money of the finds that stand on one decision (the sums under a column of the board). Parts of the totals, never new ones. */
export interface Entscheidungssumme {
  anzahl: number;
  zusaetzlichVerrechenbar: Cent;
  inKlaerung: Cent;
  belegFehlt: Cent;
  nachtragNichtGelegt: Cent;
  /** The "droht" amounts of the Vorprüfung inside "zusätzlich verrechenbar" of these finds (E13). */
  davonMitKuerzungsrisiko: Cent;
}

export const LEERE_ENTSCHEIDUNGSSUMME: Entscheidungssumme = { anzahl: 0, zusaetzlichVerrechenbar: 0, inKlaerung: 0, belegFehlt: 0, nachtragNichtGelegt: 0, davonMitKuerzungsrisiko: 0 };

export interface ProjektErgebnis {
  projektId: string;
  ordner: OrdnerStand;
  abgleich: Abgleich;
  positionen: Positionstabelle;
  vorpruefung: Vorpruefung | null;
  rechnungsabschluss: Rechnungsabschluss | null;
  schlussbesprechung: Schlussbesprechung | null;
  /** "Belegquelle" per find. */
  belegquellen: Record<string, Belegquelle[]>;
  /** "Nur außerhalb ERP" per money word, never on their sum. */
  ausserhalbErp: { zusaetzlichVerrechenbar: AusserhalbErp; inKlaerung: AusserhalbErp };
  /** The money words split by the decision on each find; per money word the parts add up to its total. */
  jeEntscheidung: Record<ZaehlendeEntscheidung, Entscheidungssumme>;
  /** What can still be closed, as the twin was read; the closed ones carry their Eingang. */
  luecken: Luecke[];
}

function jeEntscheidung(a: Abgleich, vp: Vorpruefung | null): Record<ZaehlendeEntscheidung, Entscheidungssumme> {
  const droht = (vp?.risiken ?? []).filter((r) => r.zustand === "droht" && r.fundSchluessel !== null);
  return Object.fromEntries(
    ZAEHLENDE_ENTSCHEIDUNGEN.map((stand) => {
      const xs = a.funde.filter((f) => f.entscheidung === stand);
      const summe = (...staende: string[]) => xs.filter((f) => f.belegstand !== null && staende.includes(f.belegstand)).reduce((s, f) => s + f.betrag, 0);
      const belegt = new Set(xs.filter((f) => f.belegstand === "belegt").map((f) => f.schluessel));
      return [
        stand,
        {
          anzahl: xs.length,
          zusaetzlichVerrechenbar: summe("belegt"),
          inKlaerung: summe("beleg_fehlt", "nachtrag_nicht_gelegt"),
          belegFehlt: summe("beleg_fehlt"),
          nachtragNichtGelegt: summe("nachtrag_nicht_gelegt"),
          davonMitKuerzungsrisiko: droht.filter((r) => belegt.has(r.fundSchluessel!)).reduce((s, r) => s + r.betrag, 0),
        },
      ];
    }),
  ) as Record<ZaehlendeEntscheidung, Entscheidungssumme>;
}

export function pruefeProjekt(gelesen: Datensatz, optionen: { auftraggeber?: string; entscheidungen?: readonly Entscheidung[]; eingaenge?: readonly Eingang[] } = {}): ProjektErgebnis {
  const eingaenge = aktiveEingaenge(optionen.eingaenge ?? []);
  const wieGelesen = abgleich(gelesen, optionen);
  const d = mitEingaengen(gelesen, eingaenge);
  const a = d === gelesen ? wieGelesen : abgleich(d, { ...optionen, nummern: new Map(wieGelesen.funde.map((f) => [f.schluessel, f.nr])) });
  const zaehlt = a.funde.filter((f) => f.entscheidung !== "nicht_verrechnen");
  const vp = vorpruefung(d, a);
  return {
    projektId: d.projekt.id,
    ordner: ordnerLesen(d),
    abgleich: a,
    positionen: positionstabelle(d, a),
    vorpruefung: vp,
    rechnungsabschluss: rechnungsabschluss(d, a),
    schlussbesprechung: a.laeuft ? schlussbesprechung(d, a) : null,
    belegquellen: Object.fromEntries(a.funde.map((f) => [f.schluessel, belegquellen(f)])),
    ausserhalbErp: {
      zusaetzlichVerrechenbar: ausserhalbErp(zaehlt.filter((f) => f.belegstand === "belegt")),
      inKlaerung: ausserhalbErp(zaehlt.filter((f) => f.belegstand === "beleg_fehlt" || f.belegstand === "nachtrag_nicht_gelegt")),
    },
    jeEntscheidung: jeEntscheidung(a, vp),
    luecken: luecken(gelesen, wieGelesen, d === gelesen ? vp : vorpruefung(gelesen, wieGelesen), eingaenge),
  };
}
