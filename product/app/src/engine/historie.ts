// GU-Historie auf Firmenebene: je Auftraggeber, was er gekürzt hat (Korrekturblätter), welche Sätze er ohne
// Vertragspunkt abzieht (Zahlungsavisos gegen den Vertrag), wie viele Nachträge er beauftragt hat und wie lange er
// bis zur Schlusszahlung braucht. Nur Fakten aus den Dokumenten, keine Bewertung des Auftraggebers.
// Abgleich mit dem laufenden Projekt über den festen Grund (Schlüssel), nie über den Text.

import type { AbzugArt, Datensatz, Firmendaten, Kuerzungsgrund } from "@/domain/typen";
import { rundeHalbAuf } from "./geld";
import { tageZwischen } from "./firma";
import type { AuftraggeberHistorie, Beleg, GuHistorie, HistorieAbzug, HistorieKuerzung } from "./typen";

const ABZUG_ARTEN: AbzugArt[] = ["nachlass", "baustrom_bauwasser", "bauschadensumlage", "deckungsruecklass", "haftruecklass"];

function kuerzungen(d: Datensatz): HistorieKuerzung[] {
  return d.korrekturblaetter.flatMap((kb) => {
    const nr = kb.rechnungNr.wert;
    const rechnung = d.schlussrechnung?.nr.wert === nr ? d.schlussrechnung : d.abschlaege.find((r) => r.nr.wert === nr);
    if (!rechnung) throw new Error(`${d.projekt.kurz}: Rechnung ${nr} zum Korrekturblatt fehlt`);
    const art = rechnung.art === "schluss" ? "schluss" : "abschlag";
    return kb.zeilen.map((z) => ({
      projektId: d.projekt.id,
      kurz: d.projekt.kurz,
      rechnung: { nr, art, datum: rechnung.datum.wert },
      bezug: z.positionNr.wert,
      grund: z.grund.wert,
      text: z.text.wert,
      betrag: z.kuerzung.wert,
      beleg: { titel: `Korrekturblatt ${nr}`, text: `${z.positionNr.wert} ${z.text.wert}`, datum: kb.datum.wert, quelle: z.kuerzung.quelle },
    }));
  });
}

/** Sätze auf den Zahlungsavisos, die der Vertrag des Projekts nicht nennt, je Art summiert. */
function abzuegeOhneVertragspunkt(d: Datensatz): HistorieAbzug[] {
  const imVertrag = new Set(d.vertrag.saetze.map((s) => s.art));
  const ergebnis: HistorieAbzug[] = [];
  for (const art of ABZUG_ARTEN) {
    if (imVertrag.has(art)) continue;
    const treffer = d.zahlungen.flatMap((z) => z.abzuege.filter((a) => a.art === art).map((a) => ({ z, a })));
    if (!treffer.length) continue;
    ergebnis.push({
      projektId: d.projekt.id,
      kurz: d.projekt.kurz,
      art,
      grund: "abzug_ohne_vertragspunkt",
      rechnungen: treffer.map(({ z }) => z.rechnungNr.wert),
      betrag: treffer.reduce((s, { a }) => s + a.betrag.wert, 0),
      belege: treffer.map(({ z, a }) => ({ titel: `Zahlungsavis ${z.rechnungNr.wert}`, text: a.betrag.quelle.stelle ?? "", datum: z.datum.wert, quelle: a.betrag.quelle })),
    });
  }
  return ergebnis;
}

function schlusszahlung(d: Datensatz): AuftraggeberHistorie["schlusszahlung"][number] | null {
  const sr = d.schlussrechnung;
  if (d.projekt.status !== "abgeschlossen" || !sr) return null;
  const z = d.zahlungen.find((x) => x.rechnungNr.wert === sr.nr.wert);
  if (!z) return null;
  return { projektId: d.projekt.id, kurz: d.projekt.kurz, gelegt: sr.datum.wert, bezahlt: z.datum.wert, tage: tageZwischen(sr.datum.wert, z.datum.wert) };
}

export function guHistorie(f: Firmendaten): GuHistorie {
  return {
    auftraggeber: f.auftraggeber.map((ag) => {
      const projekte = f.projekte.filter((d) => d.projekt.auftraggeberId === ag.id);
      const k = projekte.flatMap(kuerzungen);
      const a = projekte.flatMap(abzuegeOhneVertragspunkt);
      const n = projekte.flatMap((d) => d.nachtraege);
      const beauftragt = n.filter((x) => x.beauftragt.wert);
      const betrag = n.reduce((s, x) => s + x.betrag.wert, 0);
      const betragBeauftragt = beauftragt.reduce((s, x) => s + x.betrag.wert, 0);
      return {
        auftraggeber: ag,
        projekte: projekte.length,
        abgeschlossen: projekte.filter((d) => d.projekt.status === "abgeschlossen").length,
        kuerzungen: k,
        kuerzungenSumme: k.reduce((s, x) => s + x.betrag, 0),
        kuerzungenProjekte: new Set(k.map((x) => x.projektId)).size,
        abzuege: a,
        abzuegeSumme: a.reduce((s, x) => s + x.betrag, 0),
        nachtraege: { anzahl: n.length, beauftragt: beauftragt.length, betrag, betragBeauftragt, quote: betrag > 0 ? rundeHalbAuf(betragBeauftragt * 10000, betrag) : null },
        schlusszahlung: projekte.map(schlusszahlung).filter((x) => x !== null),
      };
    }),
  };
}

/**
 * Andere Projekte desselben Auftraggebers, in denen er aus demselben Grund gekürzt oder abgezogen hat, je Projekt
 * einmal mit dem Beleg des ersten Treffers (Korrekturblatt oder Zahlungsavis) und dem Anker der Zeile dort
 * (Position bzw. Art des Abzugs). Leer, wenn es keine gibt.
 */
export function gleicherGrund(h: GuHistorie, auftraggeberId: string, grund: Kuerzungsgrund, ausserProjektId: string): { projektId: string; kurz: string; beleg: Beleg; anker: string }[] {
  const ag = h.auftraggeber.find((x) => x.auftraggeber.id === auftraggeberId);
  if (!ag) return [];
  const treffer = [
    ...ag.kuerzungen.filter((x) => x.grund === grund).map((x) => ({ projektId: x.projektId, kurz: x.kurz, beleg: x.beleg, anker: x.bezug })),
    ...ag.abzuege.filter((x) => x.grund === grund).map((x) => ({ projektId: x.projektId, kurz: x.kurz, beleg: x.belege[0], anker: x.art })),
  ].filter((x) => x.projektId !== ausserProjektId);
  return treffer.filter((x, i) => treffer.findIndex((y) => y.projektId === x.projektId) === i);
}
