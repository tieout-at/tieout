// Antwort des Agenten auf einen Zuruf der Demo, gleich in Szene und Belegseite (Wortlaut wie die Szene in
// product/docs/Demo_Faelle.md): „Danke. So habe ich es verstanden: … Stimmt das?“. Nur Felder des Zurufs, keine Beträge.

import type { Zuruf } from "@/domain/typen";
import { menge } from "@/engine/geld";

export function meldungStunden(z: Zuruf): string[] {
  return [
    z.stundenMonteur.wert ? `${menge(z.stundenMonteur.wert)} h Monteur` : "",
    z.stundenHelfer.wert ? `${menge(z.stundenHelfer.wert)} h Helfer` : "",
  ].filter(Boolean);
}

/** Was der Agent verstanden hat, ohne Anrede und Frage. */
export function meldungVerstanden(z: Zuruf, projektName: string): string {
  return (
    [
      `${projektName}, ${z.ort.wert}`,
      `${z.taetigkeit.wert.replace(`${z.ort.wert} `, "")}, ${z.bezugPositionen.wert.length ? `LV-Position ${z.bezugPositionen.wert.join(", ")}` : "keine LV-Position"}`,
      meldungStunden(z).join(", "),
      z.angewiesenVon ? `Angewiesen vom ${z.angewiesenVon.wert}` : "",
      `Regiebericht: ${z.bezugRegie?.wert ?? "keiner"}`,
    ]
      .filter(Boolean)
      .join(". ") + "."
  );
}

export function meldungAntwort(z: Zuruf, projektName: string): string {
  return `Danke. So habe ich es verstanden: ${meldungVerstanden(z, projektName)} Stimmt das?`;
}
