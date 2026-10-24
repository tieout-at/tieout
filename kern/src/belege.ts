// The Belege of a project as a list ("Ihre Daten"): per file its readable title, the website's group (Systeme,
// Dokumente, Kommunikation; SPEZIFIKATION.md 1.2), the review state of the fields read from it, the duplicate it
// repeats and the finds it proves. Plus every correction a human made, for the Verlauf of the project. Counts and
// texts only; no amount is calculated here.

import { euro, menge, stunden } from "./geld";
import type { BelegArt, Datensatz, Datum, Einheit, Pruefstand, Quelle } from "./modell";
import type { ProjektErgebnis } from "./projekt";
import { datumText } from "./regeln";

export type Belegsgruppe = "systeme" | "dokumente" | "kommunikation";

export const BELEGGRUPPE_TEXT: Record<Belegsgruppe, string> = {
  systeme: "Systeme",
  dokumente: "Dokumente",
  kommunikation: "Kommunikation",
};

/**
 * Group and item of the website for each kind of Beleg (SPEZIFIKATION.md 1.2). Systems arrive as exports in the folder
 * in stage 0; they are never shown as connected.
 */
export const BELEG_GRUPPE: Record<BelegArt, { gruppe: Belegsgruppe; eintrag: string }> = {
  abschlagsrechnung: { gruppe: "systeme", eintrag: "ERP" },
  zahlungsavis: { gruppe: "systeme", eintrag: "ERP" },
  schlussrechnung: { gruppe: "systeme", eintrag: "ERP" },
  preisbasis: { gruppe: "systeme", eintrag: "AVA" },
  leistungsverzeichnis: { gruppe: "dokumente", eintrag: "Leistungsverzeichnis" },
  plan: { gruppe: "dokumente", eintrag: "Pläne" },
  indexblatt: { gruppe: "dokumente", eintrag: "Pläne" },
  aufmassblatt: { gruppe: "dokumente", eintrag: "Aufmaß" },
  fotodokumentation: { gruppe: "dokumente", eintrag: "Aufmaß" },
  regiebericht: { gruppe: "dokumente", eintrag: "Stundenzettel" },
  stundenzettel: { gruppe: "dokumente", eintrag: "Stundenzettel" },
  vertrag: { gruppe: "dokumente", eintrag: "Vertrag" },
  entwurf: { gruppe: "dokumente", eintrag: "Entwurf" },
  korrekturblatt: { gruppe: "dokumente", eintrag: "Auftraggeber" },
  abzugsschreiben: { gruppe: "dokumente", eintrag: "Auftraggeber" },
  nachtrag: { gruppe: "dokumente", eintrag: "Nachträge" },
  grosshaendlerrechnung: { gruppe: "dokumente", eintrag: "Großhändlerrechnungen" },
  email: { gruppe: "kommunikation", eintrag: "E-Mail" },
  foto: { gruppe: "kommunikation", eintrag: "Fotos" },
};

export interface Feldstand {
  /** Fields read from the Beleg. */
  felder: number;
  bestaetigt: number;
  korrigiert: number;
}

export interface BelegZeile {
  id: string;
  art: BelegArt;
  titel: string;
  dateiname: string;
  datum: Datum;
  seiten: number;
  gruppe: Belegsgruppe;
  /** Id of the earlier file with the same checksum; null if the file is no copy. */
  duplikatVon: string | null;
  felder: Feldstand;
  /** "korrigiert" once a field was corrected, "bestätigt" when every field is confirmed, else "maschinell gelesen". */
  pruefstand: Pruefstand;
  /** Numbers of the finds ("F1", …) whose evidence or calculation points to this Beleg. */
  funde: string[];
}

export interface Korrektur {
  zeit: string;
  wer: string;
  belegId: string;
  beleg: string;
  stelle: string;
  vorher: string;
  wert: string;
}

type Feldartig = { wert: unknown; quelle: Quelle; pruefstand: Pruefstand; verlauf: { zeit: string; wer: string; art: string; vorher: unknown; wert: unknown }[] };

const istFeld = (o: unknown): o is Feldartig => !!o && typeof o === "object" && "wert" in o && "quelle" in o && "pruefstand" in o;

/** Every field of the dataset with the key it sits under and its parent object. */
function felder(wert: unknown, schluessel = "", eltern: Record<string, unknown> | null = null, aus: { f: Feldartig; schluessel: string; eltern: Record<string, unknown> | null }[] = []) {
  if (istFeld(wert)) {
    aus.push({ f: wert, schluessel, eltern });
    felder(wert.wert, schluessel, eltern, aus);
  } else if (Array.isArray(wert)) wert.forEach((w) => felder(w, schluessel, eltern, aus));
  else if (wert && typeof wert === "object") for (const [k, w] of Object.entries(wert)) if (k !== "verlauf") felder(w, k, wert as Record<string, unknown>, aus);
  return aus;
}

/** Readable title of a Beleg: "Regiebericht 9", "Plan H-201 Index D", "Zahlungsavis zu Abschlagsrechnung 3". */
export function belegTitel(d: Datensatz, belegId: string): string {
  const b = d.belege.find((x) => x.id === belegId);
  const meldung = d.meldungen.find((m) => m.id === belegId);
  if (meldung) return `WhatsApp-Meldung ${meldung.nr}`;
  if (!b) return belegId;
  const nur = <T extends { belegId: string }>(xs: readonly T[]) => xs.find((x) => x.belegId === belegId);
  switch (b.art) {
    case "vertrag":
      return "Bauvertrag";
    case "leistungsverzeichnis":
      return "Leistungsverzeichnis";
    case "preisbasis":
      return "Preisbasis K3 und K7";
    case "aufmassblatt":
      return `Aufmaßblatt ${nur(d.aufmass)?.nr ?? ""}`.trim();
    case "regiebericht":
      return `Regiebericht ${nur(d.regie)?.nr ?? ""}`.trim();
    case "stundenzettel": {
      const s = nur(d.stundenzettel);
      return s ? `Stundenzettel ${s.trupp.wert}, ${datumText(s.von.wert)} bis ${datumText(s.bis.wert)}` : "Stundenzettel";
    }
    case "abschlagsrechnung":
      return nur(d.abschlaege)?.nr.wert ?? "Abschlagsrechnung";
    case "entwurf":
      return "Entwurf der Schlussrechnung";
    case "schlussrechnung":
      return "Schlussrechnung";
    case "zahlungsavis": {
      const z = nur(d.zahlungen);
      return z ? `Zahlungsavis zu ${z.rechnungNr.wert}` : "Zahlungsavis";
    }
    case "korrekturblatt": {
      const k = nur(d.korrekturblaetter);
      return k ? `Korrekturblatt zu ${k.rechnungNr.wert}` : "Korrekturblatt";
    }
    case "abzugsschreiben":
      return "Abzugsschreiben";
    case "nachtrag": {
      const n = nur(d.nachtraege);
      return n ? `Nachtrag ${n.nr.wert}, ${n.titel.wert}` : "Nachtrag";
    }
    case "grosshaendlerrechnung": {
      const g = nur(d.grosshaendlerrechnungen);
      return g ? `Großhändlerrechnung zu Regiebericht ${g.regieberichtNr.wert}` : "Großhändlerrechnung";
    }
    case "email": {
      const m = nur(d.emails);
      return m ? `E-Mail: ${m.betreff.wert}` : "E-Mail";
    }
    case "foto": {
      const f = nur(d.fotos);
      return f ? `Foto: ${f.motiv.wert}` : "Foto";
    }
    case "fotodokumentation":
      return nur(d.fotodokumentationen)?.titel.wert ?? "Fotodokumentation";
    case "plan": {
      const p = nur(d.plaene);
      return p ? `Plan ${p.planNr.wert} Index ${p.index.wert}` : "Plan";
    }
    case "indexblatt":
      return d.indexblatt?.name.wert ?? "Indexblatt";
  }
}

const HUNDERTSTEL = new Set(["menge", "stundenMonteur", "stundenHelfer", "stunden", "lohnHundertstel", "aufmassMenge"]);
const CENT = new Set(["betrag", "ep", "material", "summe", "kuerzung", "auftragssumme", "regiesatzMonteur", "regiesatzHelfer", "mittellohnkosten", "mittellohnpreis", "sonstigesJeEinheit"]);

/** A value as the Verlauf shows it, by the key the field sits under. */
function wertText(wert: unknown, schluessel: string, einheit?: Einheit): string {
  if (typeof wert === "boolean") return wert ? "ja" : "nein";
  if (typeof wert === "number") {
    if (schluessel.startsWith("stunden")) return stunden(wert);
    if (HUNDERTSTEL.has(schluessel)) return menge(wert, einheit);
    if (CENT.has(schluessel)) return euro(wert);
    return String(wert);
  }
  if (typeof wert === "string") {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(wert)) return `${datumText(wert.slice(0, 10))}, ${wert.slice(11, 16)}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(wert)) return datumText(wert);
    return wert;
  }
  if (Array.isArray(wert)) return wert.map((w) => wertText(w, schluessel, einheit)).join(", ");
  return String(wert);
}

/** Every correction a human made to a field of the project, oldest first. */
export function korrekturen(d: Datensatz): Korrektur[] {
  const einheitJe = new Map(d.positionen.map((p) => [p.nr.wert, p.einheit.wert]));
  return felder(d)
    .flatMap(({ f, schluessel, eltern }) => {
      const nr = eltern && istFeld(eltern.positionNr) ? String(eltern.positionNr.wert) : undefined;
      const einheit = nr ? einheitJe.get(nr) : undefined;
      return f.verlauf
        .filter((v) => v.art === "korrigiert")
        .map((v) => ({
          zeit: v.zeit,
          wer: v.wer,
          belegId: f.quelle.belegId,
          beleg: belegTitel(d, f.quelle.belegId),
          stelle: f.quelle.stelle ?? `Seite ${f.quelle.seite}`,
          vorher: wertText(v.vorher, schluessel, einheit),
          wert: wertText(v.wert, schluessel, einheit),
        }));
    })
    .sort((a, b) => a.zeit.localeCompare(b.zeit) || a.beleg.localeCompare(b.beleg, "de", { numeric: true }));
}

/** The Belege of the folder in date order, with their group, review state, duplicate and finds. */
export function belegListe(d: Datensatz, e: ProjektErgebnis): BelegZeile[] {
  const stand = new Map<string, Feldstand>();
  for (const { f } of felder(d)) {
    const s = stand.get(f.quelle.belegId) ?? { felder: 0, bestaetigt: 0, korrigiert: 0 };
    s.felder += 1;
    if (f.pruefstand === "bestaetigt") s.bestaetigt += 1;
    if (f.pruefstand === "korrigiert" || f.verlauf.some((v) => v.art === "korrigiert")) s.korrigiert += 1;
    stand.set(f.quelle.belegId, s);
  }

  const fundeJe = new Map<string, Set<string>>();
  for (const fund of e.abgleich.funde) {
    const ids = [...fund.nachweise.map((n) => n.quelle.belegId), ...fund.rechenweg.schritte.flatMap((s) => (s.quellen ?? []).map((q) => q.belegId))];
    for (const id of ids) fundeJe.set(id, (fundeJe.get(id) ?? new Set()).add(fund.nr));
  }

  const erstesJe = new Map<string, string>();
  const doppelt = new Set(e.ordner.duplikatIds);
  const sortiert = [...d.belege].sort((a, b) => a.datum.localeCompare(b.datum) || a.id.localeCompare(b.id));
  for (const b of sortiert) if (!doppelt.has(b.id) && !erstesJe.has(b.inhaltHash)) erstesJe.set(b.inhaltHash, b.id);

  return sortiert.map((b) => {
    const s = stand.get(b.id) ?? { felder: 0, bestaetigt: 0, korrigiert: 0 };
    const original = doppelt.has(b.id) ? (erstesJe.get(b.inhaltHash) ?? null) : null;
    return {
      id: b.id,
      art: b.art,
      // a copy carries no fields of its own; it is named after the file it repeats
      titel: belegTitel(d, original ?? b.id),
      dateiname: b.dateiname,
      datum: b.datum,
      seiten: b.seiten,
      gruppe: BELEG_GRUPPE[b.art].gruppe,
      duplikatVon: original,
      felder: s,
      pruefstand: s.korrigiert > 0 ? "korrigiert" : s.felder > 0 && s.bestaetigt === s.felder ? "bestaetigt" : "maschinell",
      funde: [...(fundeJe.get(b.id) ?? [])].sort((x, y) => x.localeCompare(y, "de", { numeric: true })),
    };
  });
}
