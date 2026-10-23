"use client";

// Ordner: Belegmatrix (Vorlage: Hebbia Matrix, Harvey Review Table: Zeile = LV-Position, Spalte = Belegart, Zelle =
// Fundstelle zum Anklicken; eine leere Zelle heißt „kein Beleg“) und Dokumentliste (Kuro K-B: Dokumente als Datensätze,
// Duplikate erkannt). Reiter und Suche wie im Ledger. Zeilen mit Befund öffnen den Befund (Klick, Enter, j/k).

// Tempo (gemessen 22.10.): Matrix-Zeilen sind memoisiert, viele neue Zeilen kommen in zwei Schritten (useStufenweise);
// Zellen und Dateien sind schlichte Links mit gemeinsamem Klick (useLinkFolgen) statt je ein next/link.

import { Search } from "lucide-react";
import Link from "next/link";
import { memo, useMemo } from "react";
import type { Belegart, DokumentZeile, MatrixZeile } from "@/daten/belege";
import { datum, zahl } from "./format";
import { MELDUNG } from "@/daten/belege";
import { useGemerkt } from "./herkunft";
import { Ico } from "./Ico";
import { useLinkFolgen, useStufenweise, Zeilennavigation } from "./Zeilennavigation";

const SPALTEN: { art: Belegart; text: string }[] = [
  { art: "lv", text: "LV" },
  { art: "aufmass", text: "Aufmaß" },
  { art: "verrechnet", text: "Verrechnet in" },
  { art: "plan", text: "Plan" },
  { art: "mail", text: "Mail" },
  { art: "foto", text: "Foto" },
  { art: "zuruf", text: "WhatsApp" },
];

type Ansicht = "befund" | "alle" | "dokumente" | "zurufe";

export function Belege({ matrix, dokumente, basis }: { matrix: MatrixZeile[]; dokumente: DokumentZeile[]; basis: string }) {
  const dateien = useMemo(() => dokumente.filter((x) => x.art !== MELDUNG), [dokumente]);
  const zurufe = useMemo(() => dokumente.filter((x) => x.art === MELDUNG), [dokumente]);
  const mitBefund = useMemo(() => matrix.filter((z) => z.befundHref), [matrix]);
  const [ansicht, setAnsicht] = useGemerkt<Ansicht>("ansicht", mitBefund.length ? "befund" : "alle");
  const [suche, setSuche] = useGemerkt("suche", "");
  const s = suche.trim().toLowerCase();
  const dok = ansicht === "dokumente" || ansicht === "zurufe";
  const docs = useMemo(
    () => (ansicht === "zurufe" ? zurufe : dateien).filter((x) => !s || x.datei.toLowerCase().includes(s) || x.art.toLowerCase().includes(s)),
    [ansicht, s, zurufe, dateien],
  );
  const zeilen = useMemo(
    () => (ansicht === "befund" ? mitBefund : matrix).filter((z) => !s || z.nr.toLowerCase().includes(s) || z.kurztext.toLowerCase().includes(s)),
    [ansicht, s, mitBefund, matrix],
  );
  const reiter: { a: Ansicht; text: string; n: number }[] = [
    { a: "befund", text: "Mit Posten", n: mitBefund.length },
    { a: "alle", text: "Alle Positionen", n: matrix.length },
    { a: "dokumente", text: "Dokumente", n: dateien.length },
    { a: "zurufe", text: "WhatsApp", n: zurufe.length },
  ];

  return (
    <section className="listenbereich" aria-label="Belege">
      <div className="zeit-leiste">
        <div className="sw-tabs zeit-filter" role="group" aria-label="Ansicht">
          {reiter
            .filter((r) => r.n > 0)
            .map((r) => (
              <button key={r.a} type="button" className="sw-tab" aria-pressed={ansicht === r.a} onClick={() => setAnsicht(r.a)}>
                {r.text}
                <span className="sw-count">{zahl(r.n)}</span>
              </button>
            ))}
        </div>
        <label className="sw-suche">
          <Ico icon={Search} />
          <input type="search" placeholder={ansicht === "dokumente" || ansicht === "zurufe" ? "Datei" : "Position oder Text"} value={suche} onChange={(ev) => setSuche(ev.target.value)} aria-label="Durchsuchen" />
        </label>
      </div>
      {dok ? <Dokumente liste={docs} basis={basis} /> : <Matrix alle={zeilen} basis={basis} />}
    </section>
  );
}

const nrVon = (z: MatrixZeile) => z.nr;
const idVon = (x: DokumentZeile) => x.id;

function Matrix({ alle, basis }: { alle: MatrixZeile[]; basis: string }) {
  const folgen = useLinkFolgen();
  const zeilen = useStufenweise(alle, nrVon);
  return (
    <Zeilennavigation>
      <table className="sw-table tab-liste tab-matrix">
        <colgroup>
          <col />
          <col style={{ width: 72 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 136 }} />
          <col style={{ width: 144 }} />
          <col style={{ width: 88 }} />
          <col style={{ width: 88 }} />
          <col style={{ width: 72 }} />
        </colgroup>
        <thead>
          <tr>
            <th>LV-Position</th>
            {SPALTEN.map((x) => (
              <th key={x.art}>{x.text}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zeilen.length === 0 && (
            <tr>
              <td colSpan={8} className="sw-muted">
                Keine Treffer.
              </td>
            </tr>
          )}
          {zeilen.map((z) => (
            <MatrixReihe key={z.nr} z={z} basis={basis} folgen={folgen} />
          ))}
        </tbody>
      </table>
    </Zeilennavigation>
  );
}

const MatrixReihe = memo(function MatrixReihe({ z, basis, folgen }: { z: MatrixZeile; basis: string; folgen: ReturnType<typeof useLinkFolgen> }) {
  return (
    <tr data-href={z.befundHref ?? undefined} tabIndex={z.befundHref ? 0 : undefined}>
      <td title={`${z.nr} ${z.kurztext}`}>
        <span className="sw-pos-nr">{z.nr}</span>
        {z.befundHref ? (
          <Link href={z.befundHref} className="row-link" tabIndex={-1}>
            {z.kurztext}
          </Link>
        ) : (
          z.kurztext
        )}
      </td>
      {SPALTEN.map((x) => (
        <td key={x.art} className="matrix-zelle">
          {z.zellen[x.art].slice(0, 2).map((f) => (
            // Schrägstrich vor dem Anker wie bei next/link mit trailingSlash
            <a key={f.id} className="matrix-link" href={`${basis}/belege/${f.id}/${f.anker ? `#pos-${f.anker}` : ""}`} {...folgen}>
              {f.text}
            </a>
          ))}
          {z.zellen[x.art].length > 2 && <span className="sw-muted">+{z.zellen[x.art].length - 2}</span>}
        </td>
      ))}
    </tr>
  );
});

function Dokumente({ liste: alle, basis }: { liste: DokumentZeile[]; basis: string }) {
  const folgen = useLinkFolgen();
  const liste = useStufenweise(alle, idVon);
  return (
    <div className="tw">
      <table className="sw-table tab-liste tab-dokumente">
        <colgroup>
          <col />
          <col style={{ width: 136 }} />
          <col style={{ width: 104 }} />
          <col style={{ width: 104 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 96 }} />
        </colgroup>
        <thead>
          <tr>
            <th>Datei</th>
            <th>Art</th>
            <th>Datum</th>
            <th>Kanal</th>
            <th className="r">Seiten</th>
            <th>Stand</th>
          </tr>
        </thead>
        <tbody>
          {liste.length === 0 && (
            <tr>
              <td colSpan={6} className="sw-muted">
                Keine Treffer.
              </td>
            </tr>
          )}
          {liste.map((x) => (
            <tr key={x.id} className={x.duplikat ? "dok-duplikat" : undefined}>
              <td title={x.datei}>
                <a className="matrix-link dok-datei" href={`${basis}/belege/${x.id}/`} {...folgen}>
                  {x.datei}
                </a>
              </td>
              <td>{x.art}</td>
              <td className="sw-num">{datum(x.datum)}</td>
              <td className="neben">{x.kanal}</td>
              <td className="r">{x.seiten}</td>
              <td>{x.duplikat && "Duplikat"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
