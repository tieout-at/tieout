// Quelle des Belegs (Dossier v3, 15.5): woher der Nachweis der Leistung kommt.
// „Datei“ = LV, Aufmaß, Rechnung, Vertrag, Plan (Annahme: liegt im ERP der Firma); Papier = Regiebericht (Scan);
// Mail, Foto, WhatsApp (Zuruf). Abgeleitet aus der Dokumentart, nie eingetippt.

import type { Datensatz, DokumentArt } from "@/domain/typen";
import type { Befund } from "./typen";

export type Belegquelle = "datei" | "papier" | "mail" | "foto" | "whatsapp";

export const BELEGQUELLE_TEXT: Record<Belegquelle, string> = {
  datei: "Datei",
  papier: "Papier",
  mail: "Mail",
  foto: "Foto",
  whatsapp: "WhatsApp",
};

const REIHENFOLGE: Belegquelle[] = ["datei", "papier", "mail", "foto", "whatsapp"];

const NACH_ART: Partial<Record<DokumentArt, Belegquelle>> = { regie: "papier", mail: "mail", foto: "foto" };

export function belegquellen(d: Datensatz, befund: Pick<Befund, "belege">): Belegquelle[] {
  const arten = new Map(d.dokumente.map((x) => [x.id, x.art] as const));
  const zurufe = new Set(d.zurufe.map((z) => z.id));
  const gefunden = new Set<Belegquelle>();
  for (const b of befund.belege) {
    const id = b.quelle.dokumentId;
    if (zurufe.has(id)) gefunden.add("whatsapp");
    else {
      const art = arten.get(id);
      if (art) gefunden.add(NACH_ART[art] ?? "datei");
    }
  }
  return REIHENFOLGE.filter((q) => gefunden.has(q));
}

/** Nur außerhalb des ERP belegt: kein Leistungsnachweis aus einer Datei. */
export function nurAusserhalbErp(quellen: Belegquelle[]): boolean {
  return quellen.length > 0 && !quellen.includes("datei");
}
