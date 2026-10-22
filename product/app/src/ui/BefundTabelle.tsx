// Befunde als dichte Arbeitstabelle (Vorlage: Linear „Group by“ mit Gruppenkopf, reebuild R-B, Ramp: Hinweis an der Zeile).
// Gruppiert nach Liste mit Zwischensumme aus dem Rechenkern (`summen`); Kürzungsrisiko als Warnsymbol am Betrag. Eine Zeile je Posten, die Art als
// gedämpfte Spalte, die in schmalen Spalten wegfällt (tabellen.css).

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { Befund, Ergebnis } from "@/engine/typen";
import { ART_TEXT, LISTEN, teileTitel } from "./befund-texte";
import { betrag } from "./format";
import { Ico } from "./Ico";
import { StandZelle } from "./Stand";
import { Zeilennavigation } from "./Zeilennavigation";

export function BefundTabelle({
  projektId,
  befunde,
  summen,
  risiken,
  href,
  nachOffen,
}: {
  projektId: string;
  befunde: Befund[];
  /** Summen je Liste aus dem Rechenkern, die Oberfläche addiert nichts. */
  summen: Ergebnis["summen"];
  /** Schlüssel der Befunde mit Kürzungsrisiko aus GU-Sicht. */
  risiken: Set<string>;
  /** Ziel einer Zeile; ohne: Zeilen sind nicht anklickbar. */
  href?: (b: Befund) => string;
  /** Zeilen hinter „Angemeldet und offen“, z. B. neue Zurufe aus dem Browser (ohne Betrag, ohne Summe). */
  nachOffen?: ReactNode;
}) {
  const gruppen = LISTEN.map((l) => ({ ...l, posten: befunde.filter((b) => b.liste === l.liste) })).filter((g) => g.posten.length);
  return (
    <Zeilennavigation>
      <table className="sw-table tab-liste tab-befunde liste-mobil">
        <colgroup>
          <col />
          <col className="befund-art" style={{ width: 216 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 24 }} />
          <col style={{ width: 136 }} />
        </colgroup>
        <thead>
          <tr>
            <th>Posten</th>
            <th className="befund-art">Art</th>
            <th className="r">Betrag</th>
            <th />
            <th>Stand</th>
          </tr>
        </thead>
        <tbody>
          {gruppen.length === 0 && (
            <tr>
              <td colSpan={5} className="sw-muted">
                Nichts offen.
              </td>
            </tr>
          )}
          {gruppen.map((g) => (
            <Fragment key={g.liste}>
              <GruppenZeilen g={g} summe={g.liste === "anwalt" ? null : summen[g.liste]} projektId={projektId} risiken={risiken} href={href} />
              {g.liste === "offen" && nachOffen}
            </Fragment>
          ))}
          {!gruppen.some((g) => g.liste === "offen") && nachOffen}
        </tbody>
      </table>
    </Zeilennavigation>
  );
}

function GruppenZeilen({
  g,
  summe,
  projektId,
  risiken,
  href,
}: {
  g: (typeof LISTEN)[number] & { posten: Befund[] };
  summe: number | null;
  projektId: string;
  risiken: Set<string>;
  href?: (b: Befund) => string;
}) {
  return (
    <>
      <tr className="grp">
        <td>
          <span className={g.ton === "neutral" ? "sw-dotlabel" : `sw-dotlabel sw-dotlabel--${g.ton}`}>{g.text}</span>
          <span className="sw-count">{g.posten.length}</span>
        </td>
        <td className="befund-art nur-breit" />
        <td className="r">{summe === null ? "" : betrag(summe)}</td>
        <td className="nur-breit" />
        <td className="nur-breit" />
      </tr>
      {g.posten.map((b) => {
        const t = teileTitel(b.titel);
        const ziel = href?.(b);
        return (
          <tr key={b.schluessel} data-href={ziel} tabIndex={ziel ? 0 : undefined}>
            <td title={b.titel}>
              <span className="sw-pos-nr">{t.kennung}</span>
              {ziel ? (
                <Link href={ziel} className="row-link" tabIndex={-1}>
                  {t.text}
                </Link>
              ) : (
                t.text
              )}
            </td>
            <td className="befund-art neben nur-breit">{ART_TEXT[b.art]}</td>
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
