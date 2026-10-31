// Position table of Ebene 2 (SPEZIFIKATION.md 2.3): the website table "Leistungen: beauftragt, erbracht, verrechnet",
// one row per position of the Leistungsverzeichnis, plus one row for every service without a position (Regiebericht,
// hours from a WhatsApp-Meldung, a notified change, the Preisumrechnung). Rewrites `baueLedger` of the v1 core.
// The footer shows "Zusätzlich verrechenbar" and "In Klärung" separately, never one total.

import { menge } from "./geld";
import { arbeitsdatum, aufmassMenge, baueKontext, verrechnetMenge, vorGrenze } from "./kontext";
import type { Cent, Datensatz, Einheit, Hundertstel } from "./modell";
import { datumText, type Abgleich } from "./regeln";
import type { Belegstand, Fund } from "./typen";
import { regieSchluessel } from "./modell";

export interface Positionszeile {
  art: "position" | "regie" | "meldung" | "aenderung" | "preisumrechnung" | "pauschale";
  /** Stable key of the row: the position number, "regie:9", or the key of the find without a position. */
  schluessel: string;
  positionNr: string | null;
  /** "22.04.12B Plattenheizkörper Typ 22 VK, 600/1000" or the service ("Regiebericht 9, Steigleitung umgelegt"). */
  text: string;
  einheit: Einheit | null;
  ep: Cent | null;
  /** Quantity in the Leistungsverzeichnis; null ("–") without a position. */
  beauftragt: Hundertstel | null;
  /** Measured quantity (for ongoing projects up to the last Abschlagsrechnung), or hours. */
  erbracht: Hundertstel | null;
  /** Quantity in the own Entwurf, or without one in the Abschlagsrechnungen (a cumulative one is read as cumulative, never added up). */
  verrechnet: Hundertstel | null;
  /** Measured after the last Abschlagsrechnung: goes into the next one, no find. */
  nachGrenze: Hundertstel;
  /** The cells as the table shows them. */
  zellen: { beauftragt: string; erbracht: string; verrechnet: string };
  /** Amount not yet invoiced. */
  offen: Cent;
  belegstand: Belegstand | null;
  fundSchluessel: string | null;
}

export interface Positionstabelle {
  zeilen: Positionszeile[];
  fusszeile: { zusaetzlichVerrechenbar: Cent; inKlaerung: Cent };
}

const stundenText = (m: Hundertstel, h: Hundertstel) => [m ? `${menge(m)} h Monteur` : "", h ? `${menge(h)} h Helfer` : ""].filter(Boolean).join(", ") || "0 h";

export function positionstabelle(d: Datensatz, a: Abgleich): Positionstabelle {
  const k = baueKontext(d);
  const fundZu = new Map<string, { fund: Fund; offen: Cent }>();
  // a position may carry two finds (Mehrmenge above, "erbracht, nicht verrechnet" below the Leistungsverzeichnis)
  for (const f of a.funde) for (const p of f.positionen) fundZu.set(p.positionNr, { fund: fundZu.get(p.positionNr)?.fund ?? f, offen: (fundZu.get(p.positionNr)?.offen ?? 0) + p.betrag });

  const positionen: Positionszeile[] = d.positionen.map((p) => {
    const nr = p.nr.wert;
    const einheit = p.einheit.wert;
    const erbracht = aufmassMenge(k, nr, true);
    const verrechnet = verrechnetMenge(k, nr);
    const z = fundZu.get(nr);
    const pausch = einheit === "psch";
    return {
      art: "position",
      schluessel: nr,
      positionNr: nr,
      text: `${nr} ${p.kurztext.wert}`,
      einheit,
      ep: p.ep.wert,
      beauftragt: p.menge.wert,
      erbracht: pausch && erbracht === 0 ? null : erbracht,
      verrechnet,
      nachGrenze: aufmassMenge(k, nr) - erbracht,
      zellen: { beauftragt: menge(p.menge.wert, einheit), erbracht: pausch && erbracht === 0 ? "–" : menge(erbracht, einheit), verrechnet: menge(verrechnet, einheit) },
      offen: z?.offen ?? 0,
      belegstand: z?.fund.belegstand ?? null,
      fundSchluessel: z?.fund.schluessel ?? null,
    };
  });

  const regieFund = new Map(a.funde.filter((f) => f.art === "regie").map((f) => [f.schluessel, f] as const));
  const regie: Positionszeile[] = d.regie
    .filter((rb) => k.regieVerrechnet.has(rb.nr) || vorGrenze(k, arbeitsdatum(rb)))
    .map((rb) => {
      const f = regieFund.get(regieSchluessel(rb));
      const stunden = rb.stundenMonteur.wert + rb.stundenHelfer.wert;
      const verrechnet = k.regieVerrechnet.has(rb.nr);
      return {
        art: "regie",
        schluessel: regieSchluessel(rb),
        positionNr: null,
        text: `Regiebericht ${rb.nr}, ${rb.taetigkeit.wert}`,
        einheit: "h",
        ep: null,
        beauftragt: null,
        erbracht: stunden,
        verrechnet: verrechnet ? stunden : 0,
        nachGrenze: 0,
        zellen: { beauftragt: "–", erbracht: stundenText(rb.stundenMonteur.wert, rb.stundenHelfer.wert), verrechnet: verrechnet ? stundenText(rb.stundenMonteur.wert, rb.stundenHelfer.wert) : "0 h" },
        offen: f?.betrag ?? 0,
        belegstand: f?.belegstand ?? null,
        fundSchluessel: f?.schluessel ?? null,
      };
    });

  const ohnePosition: Positionszeile[] = a.funde
    .filter((f) => f.art !== "regie" && f.positionen.length === 0)
    .map((f) => {
      if (f.art === "stunden_ohne_regiebericht") {
        const m = d.meldungen.find((x) => `meldung:${x.nr}` === f.schluessel)!;
        return {
          art: "meldung" as const,
          schluessel: f.schluessel,
          positionNr: null,
          text: `WhatsApp-Meldung ${datumText(m.zeitpunkt.slice(0, 10))}, ${m.taetigkeit.wert}`,
          einheit: "h" as const,
          ep: null,
          beauftragt: null,
          erbracht: m.stundenMonteur.wert + m.stundenHelfer.wert,
          verrechnet: 0,
          nachGrenze: 0,
          zellen: { beauftragt: "–", erbracht: stundenText(m.stundenMonteur.wert, m.stundenHelfer.wert), verrechnet: "0 h" },
          offen: f.betrag,
          belegstand: f.belegstand,
          fundSchluessel: f.schluessel,
        };
      }
      const datum = f.art === "aenderung_angemeldet" || f.art === "pauschale" ? ` (E-Mail ${datumText(f.arbeitsdatum)})` : "";
      return {
        art: f.art === "aenderung_angemeldet" ? ("aenderung" as const) : f.art === "pauschale" ? ("pauschale" as const) : ("preisumrechnung" as const),
        schluessel: f.schluessel,
        positionNr: null,
        text: `${f.titel}${datum}`,
        einheit: null,
        ep: null,
        beauftragt: null,
        erbracht: null,
        verrechnet: null,
        nachGrenze: 0,
        zellen: { beauftragt: "–", erbracht: "–", verrechnet: "–" },
        offen: f.belegstand === null ? 0 : f.betrag,
        belegstand: f.belegstand,
        fundSchluessel: f.schluessel,
      };
    });

  return {
    zeilen: [...positionen, ...regie, ...ohnePosition],
    fusszeile: { zusaetzlichVerrechenbar: a.summen.zusaetzlichVerrechenbar, inKlaerung: a.summen.inKlaerung },
  };
}
