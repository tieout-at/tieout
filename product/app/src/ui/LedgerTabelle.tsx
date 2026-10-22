"use client";

// Ledger: jede LV-Position mit LV-Menge, Aufmaß, verrechnet, bezahlt und Differenz (Vorlage: reebuild R-B
// „Ausgelesene Positionen“, Linear „Group by“ mit Gruppenkopf und Filter als Reiter, Attio-Suche über der Tabelle).
// Werte kommen fertig aus dem Rechenkern; hier wird nur gefiltert und formatiert. Keine Marken je Zeile:
// „Nicht verrechnet“ zeigt die Spalte Differenz, die nächste AR ihre Menge in einer eigenen Spalte.

// Tempo (gemessen 22.10.): Zeilen sind memoisiert, damit beim Filtern nur neue Zeilen gebaut werden; viele neue Zeilen
// kommen in zwei Schritten (useStufenweise), damit Reiter und Suche sofort antworten.

import { Search } from "lucide-react";
import Link from "next/link";
import { memo, useMemo, useState } from "react";
import type { LedgerZeile } from "@/engine/typen";
import { menge } from "@/engine/geld";
import { betrag, zahl } from "./format";
import { Ico } from "./Ico";
import { useStufenweise, Zeilennavigation } from "./Zeilennavigation";

/** Nur die Felder, die die Tabelle zeigt oder filtert (geht als Daten an den Browser). */
export interface LedgerReihe
  extends Pick<LedgerZeile, "positionNr" | "kurztext" | "einheit" | "lvMenge" | "aufmassMenge" | "verrechnetMenge" | "bezahltBetrag" | "differenzBetrag" | "naechsteArMenge"> {
  /** Befund zu dieser Position, falls es einen gibt. */
  befundHref: string | null;
}

type Filter = "alle" | "differenz" | "ueber" | "naechste" | "offen";

const FILTER: { f: Filter; text: string; passt: (z: LedgerReihe) => boolean }[] = [
  { f: "alle", text: "Alle", passt: () => true },
  { f: "differenz", text: "Nicht verrechnet", passt: (z) => z.differenzBetrag > 0 },
  { f: "ueber", text: "Über LV-Menge", passt: (z) => z.aufmassMenge > z.lvMenge },
  { f: "naechste", text: "Nächste AR", passt: (z) => z.naechsteArMenge > 0 },
  { f: "offen", text: "Nicht aufgemessen", passt: (z) => z.aufmassMenge === 0 },
];

function gruppeVon(nr: string): string {
  return nr.slice(0, 2);
}

const nrVon = (z: LedgerReihe) => z.positionNr;

export function LedgerTabelle({ zeilen, gruppen }: { zeilen: LedgerReihe[]; gruppen: Record<string, string> }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const [suche, setSuche] = useState("");
  const anzahl = useMemo(() => FILTER.map((x) => zeilen.filter(x.passt).length), [zeilen]);
  const sichtbar = useMemo(() => {
    const f = FILTER.find((x) => x.f === filter)!;
    const s = suche.trim().toLowerCase();
    return zeilen.filter((z) => f.passt(z) && (!s || z.positionNr.toLowerCase().includes(s) || z.kurztext.toLowerCase().includes(s)));
  }, [zeilen, filter, suche]);
  const tabelle = useTabelle(sichtbar, useStufenweise(sichtbar, nrVon), gruppen);

  return (
    <section className="ledger" aria-label="Ledger">
      <div className="zeit-leiste">
        <div className="sw-tabs zeit-filter" role="group" aria-label="Filter">
          {FILTER.map((x, i) => {
            const n = anzahl[i];
            if (n === 0 && x.f !== "alle") return null;
            return (
              <button key={x.f} type="button" className="sw-tab" aria-pressed={filter === x.f} onClick={() => setFilter(x.f)}>
                {x.text}
                <span className="sw-count">{zahl(n)}</span>
              </button>
            );
          })}
        </div>
        <label className="sw-suche">
          <Ico icon={Search} />
          <input type="search" placeholder="Position oder Text" value={suche} onChange={(ev) => setSuche(ev.target.value)} aria-label="Positionen durchsuchen" />
        </label>
      </div>
      {tabelle}
    </section>
  );
}

/** `sichtbar`: alle Treffer (Zähler je Gruppe), `zeigen`: die davon schon gebauten Zeilen (useStufenweise). */
function useTabelle(sichtbar: LedgerReihe[], zeigen: LedgerReihe[], gruppen: Record<string, string>) {
  return useMemo(() => {
    const lgs = [...new Set(zeigen.map((z) => gruppeVon(z.positionNr)))];
    return (
      <Zeilennavigation>
        <div className="ledger-rahmen">
          <table className="sw-table tab-liste tab-ledger">
            <colgroup>
              <col style={{ width: 96 }} />
              <col />
              <col style={{ width: 64 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 96 }} />
            </colgroup>
            <thead>
              <tr>
                <th>Position</th>
                <th>Kurztext</th>
                <th>Einheit</th>
                <th className="r">LV</th>
                <th className="r">Aufmaß</th>
                <th className="r">Verrechnet</th>
                <th className="r">Bezahlt</th>
                <th className="r">Differenz</th>
                <th className="r">Nächste AR</th>
              </tr>
            </thead>
            <tbody>
              {sichtbar.length === 0 && (
                <tr>
                  <td colSpan={9} className="sw-muted">
                    Keine Treffer.
                  </td>
                </tr>
              )}
              {lgs.map((lg) => {
                const teil = zeigen.filter((z) => gruppeVon(z.positionNr) === lg);
                const n = sichtbar.filter((z) => gruppeVon(z.positionNr) === lg).length;
                return <LgZeilen key={lg} titel={`${lg} ${gruppen[lg] ?? "Übrige Leistungen"}`} anzahl={n} zeilen={teil} />;
              })}
            </tbody>
          </table>
        </div>
      </Zeilennavigation>
    );
  }, [sichtbar, zeigen, gruppen]);
}

function LgZeilen({ titel, anzahl, zeilen }: { titel: string; anzahl: number; zeilen: LedgerReihe[] }) {
  return (
    <>
      <tr className="grp">
        <td colSpan={9}>
          {titel}
          <span className="sw-count">{anzahl}</span>
        </td>
      </tr>
      {zeilen.map((z) => (
        <Zeile key={z.positionNr} z={z} />
      ))}
    </>
  );
}

const Zeile = memo(function Zeile({ z }: { z: LedgerReihe }) {
  return (
    <tr data-href={z.befundHref ?? undefined} tabIndex={z.befundHref ? 0 : undefined}>
      <td className="sw-pos-nr">{z.positionNr}</td>
      <td className="ledger-text" title={z.kurztext}>
        {z.befundHref ? (
          <Link href={z.befundHref} className="row-link" tabIndex={-1}>
            {z.kurztext}
          </Link>
        ) : (
          z.kurztext
        )}
      </td>
      <td className="neben">{z.einheit}</td>
      <td className="r">{menge(z.lvMenge)}</td>
      <td className={z.aufmassMenge > z.lvMenge ? "r ledger-ueber" : "r"}>{z.aufmassMenge > 0 ? menge(z.aufmassMenge) : ""}</td>
      <td className="r">{z.verrechnetMenge > 0 ? menge(z.verrechnetMenge) : ""}</td>
      <td className="r">{z.bezahltBetrag !== 0 ? betrag(z.bezahltBetrag) : ""}</td>
      <td className="r">{z.differenzBetrag > 0 ? betrag(z.differenzBetrag) : ""}</td>
      <td className="r">{z.naechsteArMenge > 0 ? menge(z.naechsteArMenge) : ""}</td>
    </tr>
  );
});
