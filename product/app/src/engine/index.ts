// Einstieg in den Rechenkern: pruefe(datensatz) liefert alles, was die Oberfläche zu einem Projekt zeigt,
// pruefeFirma(firmendaten) die Firmenübersicht. Reine Funktionen, liest nur den Datensatz.

export { pruefe, wirdAbgeglichen } from "./pruefe";
export { pruefeFirma, ampel, tageZwischen, AMPEL_TAGE, geldStand, geldAufteilung, ausserhalbErpFirma } from "./firma";
export type * from "./typen";
export type { Belegquelle } from "./belegquelle";
export { BELEGQUELLE_TEXT, belegquellen, nurAusserhalbErp } from "./belegquelle";
export { KUERZUNGSGRUND_TEXT } from "./typen";
