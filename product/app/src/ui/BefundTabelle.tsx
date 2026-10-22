// Befunde als dichte Arbeitstabelle (Vorlage: Linear „Group by“ mit Gruppenkopf, reebuild R-B, Ramp: Hinweis an der Zeile).
// Gruppiert nach Liste mit Zwischensumme; Kürzungsrisiko als Warnsymbol am Betrag.

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { Befund } from "@/engine/typen";
import { ART_TEXT, LISTEN, teileTitel } from "./befund-texte";
import { betrag } from "./format";
import { Ico } from "./Ico";
import { StandZelle } from "./Stand";
import { Zeilennavigation } from "./Zeilennavigation";

export function BefundTabelle({
  projektId,
  befunde,
  risiken,
  href,
}: {
  projektId: string;
  befunde: Befund[];
  /** Schlüssel der Befunde mit Kürzungsrisiko aus GU-Sicht. */
  risiken: Set<string>;
  /** Ziel einer Zeile; ohne: Zeilen sind nicht anklickbar. */
  href?: (b: Befund) => string;
}) {
  const gruppen = LISTEN.map((l) => ({ ...l, posten: befunde.filter((b) => b.liste === l.liste) })).filter((g) => g.posten.length);
  return (
    <Zeilennavigation>
      <table className="sw-table tab-befunde liste-mobil" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col />
          <col style={{ width: 128 }} />
          <col style={{ width: 24 }} />
          <col style={{ width: 140 }} />
        </colgroup>
        <thead>
          <tr>
            <th>Posten</th>
            <th className="r">Betrag</th>
            <th />
            <th>Stand</th>
          </tr>
        </thead>
        <tbody>
          {gruppen.length === 0 && (
            <tr>
              <td colSpan={4} className="sw-muted">
                Keine Treffer.
              </td>
            </tr>
          )}
          {gruppen.map((g) => (
            <GruppenZeilen key={g.liste} g={g} projektId={projektId} risiken={risiken} href={href} />
          ))}
        </tbody>
      </table>
    </Zeilennavigation>
  );
}

function GruppenZeilen({
  g,
  projektId,
  risiken,
  href,
}: {
  g: (typeof LISTEN)[number] & { posten: Befund[] };
  projektId: string;
  risiken: Set<string>;
  href?: (b: Befund) => string;
}) {
  const summe = g.posten.reduce((s, b) => s + (b.betrag ?? 0), 0);
  return (
    <>
      <tr className="grp">
        <td>
          <span className={g.ton === "neutral" ? "sw-dotlabel" : `sw-dotlabel sw-dotlabel--${g.ton}`}>{g.text}</span>
          <span className="sw-count">{g.posten.length}</span>
        </td>
        <td className="r">{g.liste === "anwalt" ? "" : betrag(summe)}</td>
        <td className="nur-breit" />
        <td className="nur-breit" />
      </tr>
      {g.posten.map((b) => {
        const t = teileTitel(b.titel);
        const ziel = href?.(b);
        return (
          <tr key={b.schluessel} data-href={ziel} tabIndex={ziel ? 0 : undefined}>
            <td className="sw-td-2">
              <div className="sw-cell">
                <b>
                  {t.kennung && <span className="sw-pos-nr">{t.kennung}</span>}
                  {ziel ? (
                    <Link href={ziel} className="row-link" tabIndex={-1}>
                      {t.text}
                    </Link>
                  ) : (
                    t.text
                  )}
                </b>
                <span>{ART_TEXT[b.art]}</span>
              </div>
            </td>
            <td className="r">{b.betrag !== null && betrag(b.betrag)}</td>
            <td className="risk nur-breit">
              {risiken.has(b.schluessel) && (
                <span className="sw-risk" role="img" title="Kürzungsrisiko aus GU-Sicht" aria-label="Kürzungsrisiko aus GU-Sicht">
                  <Ico icon={TriangleAlert} />
                </span>
              )}
            </td>
            <td className="nur-breit">
              <StandZelle projektId={projektId} schluessel={b.schluessel} liste={b.liste} leerBeiPruefen />
            </td>
          </tr>
        );
      })}
    </>
  );
}
