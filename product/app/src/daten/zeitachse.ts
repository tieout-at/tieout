// Zeitachse eines Projekts: jedes Dokument und jeder Zuruf als Ereignis mit Zeitpunkt, neueste zuerst.
// Duplikate (gleicher Inhalt) erscheinen nur einmal. Texte kommen aus den Feldern des Datensatzes, Beträge
// nur so, wie sie im Beleg stehen; gerechnet wird hier nichts.

import type { Datensatz, Dokument, MailKategorie } from "@/domain/typen";
import type { Ergebnis } from "@/engine";
import { menge } from "@/engine/geld";
import { betrag } from "@/ui/format";

export type EreignisArt = "zuruf" | "mail" | "regie" | "aufmass" | "plan" | "foto" | "rechnung" | "vertrag";

export interface Ereignis {
  id: string;
  /** „JJJJ-MM-TT“ oder „JJJJ-MM-TTThh:mm“. */
  zeit: string;
  art: EreignisArt;
  titel: string;
  text: string;
  /** Kurzes Merkmal neben dem Titel, z. B. „Anmeldung“ oder „Ohne Unterschrift“. */
  marke: { text: string; ton: "warn" | "neutral" } | null;
  /** Wie viele Befunde diesen Beleg zitieren. */
  befunde: number;
}

const MAIL_MARKE: Partial<Record<MailKategorie, string>> = {
  anmeldung: "Anmeldung",
  anweisung: "Anweisung",
  terminaenderung: "Terminänderung",
  behinderung: "Behinderung",
};

function ausDokument(d: Datensatz, dok: Dokument): Omit<Ereignis, "befunde"> {
  const basis = { id: dok.id, zeit: dok.datum, marke: null };
  switch (dok.art) {
    case "mail": {
      const m = d.mails.find((x) => x.dokumentId === dok.id);
      const k = m ? MAIL_MARKE[m.kategorie.wert] : undefined;
      return { ...basis, art: "mail", titel: m?.betreff.wert ?? dok.dateiname, text: m ? `Mail von ${m.von.wert}` : "Mail", marke: k ? { text: k, ton: "neutral" } : null };
    }
    case "regie": {
      const r = d.regie.find((x) => x.dokumentId === dok.id);
      if (!r) break;
      const stunden = r.stundenMonteur.wert + r.stundenHelfer.wert;
      return {
        ...basis,
        art: "regie",
        titel: r.taetigkeit.wert,
        text: `Regiebericht ${r.nr.wert}, ${menge(stunden)} h`,
        marke: r.unterschriftAG.wert ? null : { text: "Ohne Unterschrift GU", ton: "warn" },
      };
    }
    case "aufmass": {
      const a = d.aufmass.find((x) => x.dokumentId === dok.id);
      if (!a) break;
      return {
        ...basis,
        art: "aufmass",
        titel: `Aufmaßblatt ${a.nr}`,
        text: `${a.zeilen.length} Zeilen`,
        marke: a.unterschriftAG.wert ? null : { text: "Nicht gegengezeichnet", ton: "warn" },
      };
    }
    case "plan": {
      const p = d.plaene.find((x) => x.dokumentId === dok.id);
      if (!p) break;
      return { ...basis, art: "plan", titel: `Plan ${p.planNr.wert}, Index ${p.index.wert}`, text: p.titel.wert };
    }
    case "foto": {
      const f = d.fotos.find((x) => x.dokumentId === dok.id);
      return { ...basis, zeit: f?.exifDatum.wert ?? dok.datum, art: "foto", titel: f?.motiv.wert ?? "Foto", text: f ? `Foto ${f.ort.wert}, ${dok.dateiname}` : dok.dateiname };
    }
    case "abschlag": {
      const r = d.abschlaege.find((x) => x.dokumentId === dok.id);
      if (!r) break;
      return { ...basis, art: "rechnung", titel: `Abschlagsrechnung ${r.nr.wert}`, text: betrag(r.summe.wert) };
    }
    case "sr_entwurf":
      return { ...basis, art: "rechnung", titel: "Schlussrechnung, Entwurf", text: d.entwurf ? betrag(d.entwurf.summe.wert) : dok.dateiname };
    case "zahlung": {
      const z = d.zahlungen.find((x) => x.dokumentId === dok.id);
      if (!z) break;
      return { ...basis, art: "rechnung", titel: `Zahlung zu ${z.rechnungNr.wert}`, text: betrag(z.betrag.wert) };
    }
    case "gu_korrektur": {
      const k = d.korrekturblaetter.find((x) => x.dokumentId === dok.id);
      return { ...basis, art: "rechnung", titel: `Korrekturblatt ${k?.rechnungNr.wert ?? ""}`.trim(), text: "Kürzungen des Auftraggebers" };
    }
    case "gu_abzug":
      return { ...basis, art: "rechnung", titel: "Abzugsschreiben des Auftraggebers", text: dok.dateiname };
    case "stundenliste":
      return { ...basis, art: "regie", titel: "Stundenliste", text: dok.dateiname };
    case "vertrag":
      return { ...basis, art: "vertrag", titel: "Bauvertrag", text: dok.dateiname };
    case "lv":
      return { ...basis, art: "vertrag", titel: "Leistungsverzeichnis", text: `${d.lv.length} Positionen` };
    case "k7":
      return { ...basis, art: "vertrag", titel: "K7-Blätter", text: dok.dateiname };
    case "indexblatt":
      return { ...basis, art: "vertrag", titel: "Indexblatt", text: d.indexblatt?.name.wert ?? dok.dateiname };
  }
  return { ...basis, art: "vertrag", titel: dok.dateiname, text: "" };
}

/** Zahl der Befunde je zitiertem Beleg (Dokument oder Zuruf). */
export function zitate(e: Ergebnis): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const b of e.befunde) {
    for (const id of new Set(b.belege.map((x) => x.quelle.dokumentId))) m.set(id, [...(m.get(id) ?? []), b.schluessel]);
  }
  return m;
}

export function zeitachse(d: Datensatz, e: Ergebnis): Ereignis[] {
  const z = zitate(e);
  const gesehen = new Set<string>();
  const liste: Ereignis[] = [];
  for (const dok of d.dokumente) {
    if (gesehen.has(dok.inhaltHash)) continue;
    gesehen.add(dok.inhaltHash);
    liste.push({ ...ausDokument(d, dok), befunde: z.get(dok.id)?.length ?? 0 });
  }
  for (const x of d.zurufe) {
    liste.push({
      id: x.id,
      zeit: x.zeitpunkt,
      art: "zuruf",
      titel: x.taetigkeit.wert,
      text: `WhatsApp-Meldung ${x.nr}, ${x.absender}`,
      marke: null,
      befunde: z.get(x.id)?.length ?? 0,
    });
  }
  return liste.sort((a, b) => b.zeit.localeCompare(a.zeit) || a.id.localeCompare(b.id));
}
