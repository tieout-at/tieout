// Entry of the calculation core. Pure functions over the twin; nothing is typed in, everything is derived.

export * from "./grundtypen";
export * from "./modell";
export * from "./geld";
export { abrechnen, type Satz, type Stufenrechnung, type StufenZeile } from "./stufen";
export { ordnerLesen, type OrdnerStand, type Planstand } from "./ordner";
export * from "./typen";
export { abgleich, wirdAbgeglichen, datumText, type Abgleich, type AbgleichOptionen } from "./regeln";
export { zumStichtag } from "./stand";
export { positionstabelle, type Positionstabelle, type Positionszeile } from "./positionen";
export { vorpruefung, saetzePruefen, kalenderwoche, type Vorpruefung, type Satzpruefung } from "./vorpruefung";
export { rechnungsabschluss, type Rechnungsabschluss, type AbschlussZeile, type Abschlagszahlung } from "./rechnungsabschluss";
export { schlussbesprechung, type Schlussbesprechung, type BesprechungsGruppe, type BesprechungsPosten } from "./schlussbesprechung";
export { belegquellen, nurAusserhalbErp, ausserhalbErp, BELEGQUELLE_TEXT, type Belegquelle, type AusserhalbErp } from "./belegquelle";
export { pruefeProjekt, type ProjektErgebnis } from "./projekt";
export { belegListe, belegTitel, korrekturen, BELEG_GRUPPE, BELEGGRUPPE_TEXT, type BelegZeile, type Belegsgruppe, type Feldstand, type Korrektur } from "./belege";
export { auftraggeberHistorie, gleicherGrund, abrechnung, tageZwischen, imProjekt, type AuftraggeberHistorie, type HistorieKuerzung, type HistorieAbzug, type Abrechnung, type AbrechnungsZeile } from "./historie";
export { pruefeFirma, statusfarbe, STATUS_TAGE, type FirmenErgebnis, type ProjektZeile, type Statusfarbe } from "./firma";
