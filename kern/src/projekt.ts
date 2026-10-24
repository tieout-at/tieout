// One project through the Abschluss-Lauf (SPEZIFIKATION.md 5.1): "Ordner lesen", "Abgleich", "Vorprüfung", "Entwurf"
// (Rechnungsabschluss) and what "Ausgaben" needs (Schlussbesprechungs-Blatt). Pure function over the twin and the decisions.

import { ausserhalbErp, belegquellen, type AusserhalbErp, type Belegquelle } from "./belegquelle";
import type { Datensatz, Entscheidung } from "./modell";
import { ordnerLesen, type OrdnerStand } from "./ordner";
import { positionstabelle, type Positionstabelle } from "./positionen";
import { rechnungsabschluss, type Rechnungsabschluss } from "./rechnungsabschluss";
import { abgleich, type Abgleich } from "./regeln";
import { schlussbesprechung, type Schlussbesprechung } from "./schlussbesprechung";
import { vorpruefung, type Vorpruefung } from "./vorpruefung";

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
}

export function pruefeProjekt(d: Datensatz, optionen: { auftraggeber?: string; entscheidungen?: readonly Entscheidung[] } = {}): ProjektErgebnis {
  const a = abgleich(d, optionen);
  const zaehlt = a.funde.filter((f) => f.entscheidung !== "nicht_verrechnen");
  return {
    projektId: d.projekt.id,
    ordner: ordnerLesen(d),
    abgleich: a,
    positionen: positionstabelle(d, a),
    vorpruefung: vorpruefung(d, a),
    rechnungsabschluss: rechnungsabschluss(d, a),
    schlussbesprechung: a.laeuft ? schlussbesprechung(d, a) : null,
    belegquellen: Object.fromEntries(a.funde.map((f) => [f.schluessel, belegquellen(f)])),
    ausserhalbErp: {
      zusaetzlichVerrechenbar: ausserhalbErp(zaehlt.filter((f) => f.belegstand === "belegt")),
      inKlaerung: ausserhalbErp(zaehlt.filter((f) => f.belegstand === "beleg_fehlt" || f.belegstand === "nachtrag_nicht_gelegt")),
    },
  };
}
