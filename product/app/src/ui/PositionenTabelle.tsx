"use client";

// Ledger: jede LV-Position mit LV-Menge, Aufmaß, verrechnet, bezahlt und Differenz (Vorlage: reebuild R-B
// „Ausgelesene Positionen“, Linear „Group by“ mit Gruppenkopf und Filter als Reiter, Attio-Suche über der Tabelle).
// Werte kommen fertig aus dem Rechenkern; hier wird nur gefiltert und formatiert.
// UI-Runde 1, Schritt 4 (d6 und k4, Option A „eine Tabelle“): Stand als Wort vorne, Mengen mit Einheit, Euro-Spalten
// getrennt rechts; LV, Aufmaß und Verrechnet öffnen die Zeile im Original (Anker „#pos-…“ auf der Belegseite).

// Tempo (gemessen 22.10.): Zeilen sind memoisiert, damit beim Filtern nur neue Zeilen gebaut werden; viele neue Zeilen
// kommen in zwei Schritten (useStufenweise), damit Reiter und Suche sofort antworten.

import { Search } from "lucide-react";
import Link from "next/link";
import { memo, useMemo } from "react";
import type { LedgerZeile } from "@/engine/typen";
import { menge } from "@/engine/geld";
import { betrag, zahl } from "./format";
import { GruppenTitel } from "./Gruppe";
import { useGemerkt } from "./herkunft";
import { Ico } from "./Ico";
import { useStufenweise, Zeilennavigation } from "./Zeilennavigation";

/** Nur die Felder, die die Tabelle zeigt oder filtert (geht als Daten an den Browser). */
export interface PositionsReihe
  extends Pick<LedgerZeile, "positionNr" | "kurztext" | "einheit" | "lvMenge" | "aufmassMenge" | "verrechnetMenge" | "bezahltBetrag" | "differenzBetrag" | "naechsteArMenge"> {
  /** Befund zu dieser Position, falls es einen gibt. */
  befundHref: string | null;
  /** Aufmaßblätter mit dieser Position (Dokument-IDs, ältestes zuerst); die Zelle öffnet das letzte. */
  aufmassBlaetter: string[];
  /** Rechnung, in der die verrechnete Menge steht (Entwurf oder letzte AR mit der Position). */
  verrechnetIn: string | null;
}

/** Wo die Zahlen im Original stehen: Belegseiten des Projekts und Kurznamen für den Tooltip. */
export interface Originale {
  basis: string;
  lv: string | null;
  namen: Record<string, string>;
}

type Filter = "alle" | "differenz" | "ueber" | "naechste" | "offen";

const FILTER: { f: Filter; text: string; passt: (z: PositionsReihe) => boolean }[] = [
  { f: "alle", text: "Alle", passt: () => true },
  { f: "differenz", text: "Nicht verrechnet", passt: (z) => z.differenzBetrag > 0 },
  { f: "ueber", text: "Über LV-Menge", passt: (z) => z.aufmassMenge > z.lvMenge },
  { f: "naechste", text: "Nächste AR", passt: (z) => z.naechsteArMenge > 0 },
  { f: "offen", text: "Nicht aufgemessen", passt: (z) => z.aufmassMenge === 0 },
];

/** Stand als Wort, das wichtigste zuerst (gleiche Regeln wie die Filter). */
function stand(z: PositionsReihe): { wort: string; klasse: string } | null {
  if (z.differenzBetrag > 0) return { wort: "Nicht verrechnet", klasse: "sw-dotlabel sw-dotlabel--warn" };
  if (z.aufmassMenge > z.lvMenge) return { wort: "Über LV-Menge", klasse: "sw-dotlabel" };
  if (z.naechsteArMenge > 0) return { wort: "Nächste AR", klasse: "sw-dotlabel" };
  if (z.aufmassMenge === 0) return { wort: "Nicht aufgemessen", klasse: "sw-dotlabel pos-stand--leise" };
  return null;
}

function gruppeVon(nr: string): string {
  return nr.slice(0, 2);
}

const nrVon = (z: PositionsReihe) => z.positionNr;

export function PositionenTabelle({ zeilen, gruppen, originale }: { zeilen: PositionsReihe[]; gruppen: Record<string, string>; originale: Originale }) {
  const [filter, setFilter] = useGemerkt<Filter>("filter", "alle");
  const [suche, setSuche] = useGemerkt("suche", "");
  const anzahl = useMemo(() => FILTER.map((x) => zeilen.filter(x.passt).length), [zeilen]);
  const sichtbar = useMemo(() => {
    const f = FILTER.find((x) => x.f === filter)!;
    const s = suche.trim().toLowerCase();
    return zeilen.filter((z) => f.passt(z) && (!s || z.positionNr.toLowerCase().includes(s) || z.kurztext.toLowerCase().includes(s)));
  }, [zeilen, filter, suche]);
  // Spalte „Nächste AR“ nur bei Projekten in Ausführung, die eine haben (mit Entwurf ist sie immer leer)
  const naechste = anzahl[FILTER.findIndex((x) => x.f === "naechste")] > 0;
  const tabelle = useTabelle(sichtbar, useStufenweise(sichtbar, nrVon), gruppen, originale, naechste);

  return (
    <section className="listenbereich" aria-label="LV-Positionen">
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
function useTabelle(sichtbar: PositionsReihe[], zeigen: PositionsReihe[], gruppen: Record<string, string>, o: Originale, naechste: boolean) {
  return useMemo(() => {
    const lgs = [...new Set(zeigen.map((z) => gruppeVon(z.positionNr)))];
    const spalten = naechste ? 9 : 8;
    return (
      <Zeilennavigation>
        <div className="positionen-rahmen">
          <table className="sw-table tab-liste tab-positionen">
            <colgroup>
              <col style={{ width: 96 }} />
              <col />
              <col style={{ width: 144 }} />
              <col style={{ width: 88 }} />
              <col style={{ width: 88 }} />
              <col style={{ width: 96 }} />
              {naechste && <col style={{ width: 96 }} />}
              <col style={{ width: 120 }} />
              <col style={{ width: 112 }} />
            </colgroup>
            <thead>
              <tr>
                <th>Position</th>
                <th>Kurztext</th>
                <th>Stand</th>
                <th className="r pos-menge-start">LV</th>
                <th className="r">Aufmaß</th>
                <th className="r">Verrechnet</th>
                {naechste && <th className="r">Nächste AR</th>}
                <th className="r pos-euro-start">Bezahlt</th>
                <th className="r">Differenz</th>
              </tr>
            </thead>
            {sichtbar.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={spalten} className="sw-muted">
                    Keine Treffer.
                  </td>
                </tr>
              </tbody>
            )}
            {lgs.map((lg) => {
              const teil = zeigen.filter((z) => gruppeVon(z.positionNr) === lg);
              const n = sichtbar.filter((z) => gruppeVon(z.positionNr) === lg).length;
              return <LgZeilen key={lg} gruppe={lg} titel={`${lg} ${gruppen[lg] ?? "Übrige Leistungen"}`} anzahl={n} zeilen={teil} o={o} naechste={naechste} spalten={spalten} />;
            })}
          </table>
        </div>
      </Zeilennavigation>
    );
  }, [sichtbar, zeigen, gruppen, o, naechste]);
}

function LgZeilen(props: { gruppe: string; titel: string; anzahl: number; zeilen: PositionsReihe[]; o: Originale; naechste: boolean; spalten: number }) {
  const { gruppe, titel, anzahl, zeilen, o, naechste, spalten } = props;
  return (
    <tbody data-gruppe={gruppe}>
      <tr className="grp">
        <td colSpan={spalten}>
          <GruppenTitel>
            {titel}
            <span className="sw-count">{anzahl}</span>
          </GruppenTitel>
        </td>
      </tr>
      {zeilen.map((z) => (
        <Zeile key={z.positionNr} z={z} o={o} naechste={naechste} />
      ))}
    </tbody>
  );
}

/** Zahl, die ihre Zeile im Original öffnet; ohne Beleg bleibt es eine Zahl. */
function ImOriginal({ o, dok, nr, titel, children }: { o: Originale; dok: string | null; nr: string; titel: string; children: React.ReactNode }) {
  if (!dok) return <>{children}</>;
  return (
    <a href={`${o.basis}/belege/${dok}/#pos-${nr}`} className="pos-original" title={titel} tabIndex={-1}>
      {children}
    </a>
  );
}

const Zeile = memo(function Zeile({ z, o, naechste }: { z: PositionsReihe; o: Originale; naechste: boolean }) {
  const s = stand(z);
  const letztes = z.aufmassBlaetter.at(-1) ?? null;
  return (
    <tr data-href={z.befundHref ?? undefined} tabIndex={z.befundHref ? 0 : undefined}>
      <td className="sw-pos-nr">{z.positionNr}</td>
      <td className="positionen-text" title={z.kurztext}>
        {z.befundHref ? (
          <Link href={z.befundHref} className="row-link" tabIndex={-1}>
            {z.kurztext}
          </Link>
        ) : (
          z.kurztext
        )}
      </td>
      <td>{s && <span className={s.klasse}>{s.wort}</span>}</td>
      <td className="r pos-menge-start">
        <ImOriginal o={o} dok={o.lv} nr={z.positionNr} titel="Im LV öffnen">
          {menge(z.lvMenge, z.einheit)}
        </ImOriginal>
      </td>
      <td className={z.aufmassMenge > z.lvMenge ? "r positionen-ueber" : "r"}>
        {z.aufmassMenge > 0 && (
          <ImOriginal o={o} dok={letztes} nr={z.positionNr} titel={z.aufmassBlaetter.length > 1 ? `Summe aus ${z.aufmassBlaetter.map((x) => o.namen[x]).join(", ")}, öffnet ${letztes ? o.namen[letztes] : ""}` : `Aus ${letztes ? o.namen[letztes] : ""}`}>
            {menge(z.aufmassMenge, z.einheit)}
          </ImOriginal>
        )}
      </td>
      <td className="r">
        {z.verrechnetMenge > 0 && (
          <ImOriginal o={o} dok={z.verrechnetIn} nr={z.positionNr} titel={z.verrechnetIn ? `In ${o.namen[z.verrechnetIn]}` : ""}>
            {menge(z.verrechnetMenge, z.einheit)}
          </ImOriginal>
        )}
      </td>
      {naechste && <td className="r">{z.naechsteArMenge > 0 ? menge(z.naechsteArMenge, z.einheit) : ""}</td>}
      <td className="r pos-euro-start">{z.bezahltBetrag !== 0 ? betrag(z.bezahltBetrag) : ""}</td>
      <td className="r">{z.differenzBetrag > 0 ? betrag(z.differenzBetrag) : ""}</td>
    </tr>
  );
});
