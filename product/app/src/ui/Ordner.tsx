"use client";

// Ordner: Belegmatrix (Vorlage: Hebbia Matrix, Harvey Review Table: Zeile = LV-Position, Spalte = Belegart, Zelle =
// Fundstelle zum Anklicken; „kein Beleg“ ist eine Aussage) und Dokumentliste (Kuro K-B: Dokumente als Datensätze,
// Duplikate erkannt). Reiter und Suche wie im Ledger.

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Belegart, DokumentZeile, MatrixZeile } from "@/daten/ordner";
import { datum } from "./format";
import { Ico } from "./Ico";

const SPALTEN: { art: Belegart; text: string }[] = [
  { art: "lv", text: "LV" },
  { art: "aufmass", text: "Aufmaß" },
  { art: "verrechnet", text: "Verrechnet in" },
  { art: "plan", text: "Plan" },
  { art: "mail", text: "Mail" },
  { art: "foto", text: "Foto" },
  { art: "zuruf", text: "Zuruf" },
];

type Ansicht = "befund" | "alle" | "dokumente" | "zurufe";

export function Ordner({ matrix, dokumente, basis, abgleich }: { matrix: MatrixZeile[]; dokumente: DokumentZeile[]; basis: string; abgleich: boolean }) {
  const dateien = dokumente.filter((x) => x.art !== "Zuruf");
  const zurufe = dokumente.filter((x) => x.art === "Zuruf");
  const mitBefund = matrix.filter((z) => z.befundHref);
  const [ansicht, setAnsicht] = useState<Ansicht>(mitBefund.length ? "befund" : "alle");
  const [suche, setSuche] = useState("");
  const s = suche.trim().toLowerCase();
  const reiter: { a: Ansicht; text: string; n: number }[] = [
    { a: "befund", text: "Positionen mit Befund", n: mitBefund.length },
    { a: "alle", text: "Alle Positionen", n: matrix.length },
    { a: "dokumente", text: "Dokumente", n: dateien.length },
    { a: "zurufe", text: "Zurufe", n: zurufe.length },
  ];

  return (
    <section className="ledger" aria-label="Ordner">
      <div className="zeit-leiste">
        <div className="sw-tabs zeit-filter" role="group" aria-label="Ansicht">
          {reiter
            .filter((r) => r.n > 0)
            .map((r) => (
              <button key={r.a} type="button" className="sw-tab" aria-pressed={ansicht === r.a} onClick={() => setAnsicht(r.a)}>
                {r.text}
                <span className="sw-count">{r.n.toLocaleString("de-AT")}</span>
              </button>
            ))}
        </div>
        <label className="sw-suche">
          <Ico icon={Search} />
          <input type="search" placeholder={ansicht === "dokumente" || ansicht === "zurufe" ? "Datei" : "Position oder Text"} value={suche} onChange={(ev) => setSuche(ev.target.value)} aria-label="Durchsuchen" />
        </label>
      </div>
      {ansicht === "dokumente" || ansicht === "zurufe" ? (
        <Dokumente liste={(ansicht === "zurufe" ? zurufe : dateien).filter((x) => !s || x.datei.toLowerCase().includes(s) || x.art.toLowerCase().includes(s))} basis={basis} />
      ) : (
        <Matrix
          zeilen={(ansicht === "befund" ? mitBefund : matrix).filter((z) => !s || z.nr.toLowerCase().includes(s) || z.kurztext.toLowerCase().includes(s))}
          basis={basis}
          abgleich={abgleich}
        />
      )}
    </section>
  );
}

function Matrix({ zeilen, basis, abgleich }: { zeilen: MatrixZeile[]; basis: string; abgleich: boolean }) {
  return (
    <div className="ledger-rahmen">
      <table className="sw-table tab-matrix" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 260 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 128 }} />
          <col style={{ width: 128 }} />
          <col style={{ width: 128 }} />
          <col style={{ width: 96 }} />
          <col style={{ width: 96 }} />
          <col style={{ width: 80 }} />
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
            <tr key={z.nr}>
              <td className="sw-td-2">
                <div className="sw-cell">
                  <b className="ledger-text">
                    <span className="sw-pos-nr">{z.nr}</span>
                    {z.kurztext}
                  </b>
                  {z.befundHref ? (
                    <Link href={z.befundHref} className="matrix-befund">
                      Befund öffnen
                    </Link>
                  ) : abgleich ? (
                    <span>Ohne Befund</span>
                  ) : null}
                </div>
              </td>
              {SPALTEN.map((x) => (
                <td key={x.art} className="matrix-zelle">
                  {z.zellen[x.art].length === 0 ? (
                    <span className="matrix-leer">{x.art === "verrechnet" ? "nicht verrechnet" : "kein Beleg"}</span>
                  ) : (
                    <>
                      {z.zellen[x.art].slice(0, 2).map((f) => (
                        <Link key={f.id} href={`${basis}/ordner/${f.id}${f.anker ? `#pos-${f.anker}` : ""}`} className="matrix-link">
                          {f.text}
                        </Link>
                      ))}
                      {z.zellen[x.art].length > 2 && <span className="sw-muted">+{z.zellen[x.art].length - 2}</span>}
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dokumente({ liste, basis }: { liste: DokumentZeile[]; basis: string }) {
  return (
    <div className="ledger-rahmen">
      <table className="sw-table tab-dokumente" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col />
          <col style={{ width: 120 }} />
          <col style={{ width: 112 }} />
          <col style={{ width: 104 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 120 }} />
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
              <td className="ledger-text">
                <Link href={`${basis}/ordner/${x.id}`} className="matrix-link dok-datei" title={x.datei}>
                  {x.datei}
                </Link>
              </td>
              <td>{x.art}</td>
              <td className="sw-num">{datum(x.datum)}</td>
              <td>{x.kanal}</td>
              <td className="r">{x.seiten}</td>
              <td>{x.duplikat && <span className="sw-dotlabel">Duplikat</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
