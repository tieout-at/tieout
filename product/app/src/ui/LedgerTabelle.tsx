"use client";

// Ledger: jede LV-Position mit LV-Menge, Aufmaß, verrechnet, bezahlt und Differenz (Vorlage: reebuild R-B
// „Ausgelesene Positionen“, Linear „Group by“ mit Gruppenkopf und Filter als Reiter, Attio-Suche über der Tabelle).
// Werte kommen fertig aus dem Rechenkern; hier wird nur gefiltert und formatiert. Keine Marken je Zeile:
// „Nicht verrechnet“ zeigt die Spalte Differenz, die nächste AR ihre Menge in einer eigenen Spalte.

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { LedgerZeile } from "@/engine/typen";
import { menge } from "@/engine/geld";
import { betrag } from "./format";
import { GruppenTitel } from "./Gruppe";
import { Ico } from "./Ico";
import { Zeilennavigation } from "./Zeilennavigation";

export interface LedgerReihe extends LedgerZeile {
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

export function LedgerTabelle({ zeilen, gruppen }: { zeilen: LedgerReihe[]; gruppen: Record<string, string> }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const [suche, setSuche] = useState("");
  const f = FILTER.find((x) => x.f === filter)!;
  const s = suche.trim().toLowerCase();
  const sichtbar = zeilen.filter((z) => f.passt(z) && (!s || z.positionNr.toLowerCase().includes(s) || z.kurztext.toLowerCase().includes(s)));
  const lgs = [...new Set(sichtbar.map((z) => gruppeVon(z.positionNr)))];

  return (
    <section className="ledger" aria-label="Ledger">
      <div className="zeit-leiste">
        <div className="sw-tabs zeit-filter" role="group" aria-label="Filter">
          {FILTER.map((x) => {
            const n = zeilen.filter(x.passt).length;
            if (n === 0 && x.f !== "alle") return null;
            return (
              <button key={x.f} type="button" className="sw-tab" aria-pressed={filter === x.f} onClick={() => setFilter(x.f)}>
                {x.text}
                <span className="sw-count">{n.toLocaleString("de-AT")}</span>
              </button>
            );
          })}
        </div>
        <label className="sw-suche">
          <Ico icon={Search} />
          <input type="search" placeholder="Position oder Text" value={suche} onChange={(ev) => setSuche(ev.target.value)} aria-label="Positionen durchsuchen" />
        </label>
      </div>
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
            {sichtbar.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={9} className="sw-muted">
                    Keine Treffer.
                  </td>
                </tr>
              </tbody>
            )}
              {lgs.map((lg) => {
                const teil = sichtbar.filter((z) => gruppeVon(z.positionNr) === lg);
                return (
                  <LgZeilen key={lg} gruppe={lg} titel={`${lg} ${gruppen[lg] ?? "Übrige Leistungen"}`} zeilen={teil} />
                );
              })}
          </table>
        </div>
      </Zeilennavigation>
    </section>
  );
}

function LgZeilen({ gruppe, titel, zeilen }: { gruppe: string; titel: string; zeilen: LedgerReihe[] }) {
  return (
    <tbody data-gruppe={gruppe}>
      <tr className="grp">
        <td colSpan={9}>
          <GruppenTitel>
            {titel}
            <span className="sw-count">{zeilen.length}</span>
          </GruppenTitel>
        </td>
      </tr>
      {zeilen.map((z) => (
        <tr key={z.positionNr} data-href={z.befundHref ?? undefined} tabIndex={z.befundHref ? 0 : undefined}>
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
      ))}
    </tbody>
  );
}
