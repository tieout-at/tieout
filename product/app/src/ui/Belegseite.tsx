// Originalseite eines Belegs mit markierter Fundstelle (Vorlage: Kuro K-A, Rossum: Rahmen um den Wert).
// MVP: Die Seite wird aus dem synthetischen Datensatz gezeichnet; echte PDFs (pdf.js mit Markierung aus den
// Quell-Koordinaten) ersetzen das später, die Schnittstelle (Datensatz + Beleg) bleibt gleich.

import type { Datensatz, Dokument, Zuruf } from "@/domain/typen";
import type { Beleg } from "@/engine/typen";
import { betrag, datum, zeitpunkt } from "./format";
import { menge } from "@/engine/geld";

function Synth() {
  return <span className="sw-page__synth">Synthetisch</span>;
}

function Kopf({ zeilen }: { zeilen: [string, React.ReactNode][] }) {
  return (
    <div className="sw-page__head">
      {zeilen.map(([k, v]) => (
        <Zeile key={k} k={k} v={v} />
      ))}
    </div>
  );
}

function Zeile({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <span>{k}</span>
      <b>{v}</b>
    </>
  );
}

function Tabelle({ kopf, zeilen, markiert }: { kopf: string[]; zeilen: React.ReactNode[][]; markiert: number }) {
  return (
    <table className="sw-dt">
      <thead>
        <tr>
          {kopf.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {zeilen.map((z, i) => (
          <tr key={i} className={i === markiert ? "hl" : undefined}>
            {z.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Ausschnitt um die markierte Zeile, damit die Seite lesbar bleibt. */
function ausschnitt<T>(liste: T[], index: number, umfang = 6): { teil: T[]; markiert: number } {
  const start = Math.max(0, Math.min(index - Math.floor(umfang / 2), liste.length - umfang));
  return { teil: liste.slice(start, start + umfang), markiert: index - start };
}

function positionAus(stelle: string | undefined): string | null {
  return stelle?.match(/\d\d\.\d\d\.\d\d[A-Z]|Z-\d+/)?.[0] ?? null;
}

function ZurufSeite({ z }: { z: Zuruf }) {
  return (
    <>
      <b>Zuruf {z.nr} über WhatsApp</b>
      <div className="sw-doc-meta">{zeitpunkt(z.zeitpunkt)}</div>
      <Kopf
        zeilen={[
          ["Absender", z.absender],
          ["Ort", z.ort.wert],
          ["Foto", z.foto ?? "kein Foto"],
        ]}
      />
      <p>
        <span className="sw-mark">„{z.transkript.wert}“</span>
      </p>
      <div className="sw-sig">
        <div>Bestätigt von {z.bestaetigt.von}, {zeitpunkt(z.bestaetigt.zeitpunkt)}</div>
      </div>
    </>
  );
}

function Inhalt({ d, dok, beleg }: { d: Datensatz; dok: Dokument; beleg: Beleg }) {
  const stelle = beleg.quelle.stelle;
  switch (dok.art) {
    case "lv": {
      const nr = positionAus(stelle);
      const i = Math.max(0, d.lv.findIndex((p) => p.nr.wert === nr));
      const { teil, markiert } = ausschnitt(d.lv, i);
      return (
        <>
          <b>Leistungsverzeichnis</b>
          <div className="sw-doc-meta">ÖNORM A 2063, Seite {beleg.quelle.seite}</div>
          <Tabelle
            kopf={["Pos.", "Kurztext", "Menge", "EP"]}
            markiert={markiert}
            zeilen={teil.map((p) => [p.nr.wert, p.kurztext.wert, menge(p.menge.wert, p.einheit.wert), betrag(p.ep.wert)])}
          />
        </>
      );
    }
    case "aufmass": {
      const blatt = d.aufmass.find((b) => b.dokumentId === dok.id);
      if (!blatt) break;
      const nr = positionAus(stelle);
      const i = Math.max(0, blatt.zeilen.findIndex((z) => z.positionNr.wert === nr));
      const { teil, markiert } = ausschnitt(blatt.zeilen, i);
      const unterschriftRisiko = stelle === "Unterschrift Auftraggeber" || !blatt.unterschriftAG.wert;
      return (
        <>
          <b>Aufmaßblatt {blatt.nr}</b>
          <div className="sw-doc-meta">
            erstellt {datum(blatt.datum.wert)}, Leistung {datum(blatt.leistungVon.wert)} bis {datum(blatt.leistungBis.wert)}
          </div>
          <Tabelle
            kopf={["Pos.", "Ort", "Menge"]}
            markiert={nr ? markiert : -1}
            zeilen={teil.map((z) => [z.positionNr.wert, z.ort.wert, menge(z.menge.wert, d.lv.find((p) => p.nr.wert === z.positionNr.wert)?.einheit.wert)])}
          />
          <div className="sw-sig">
            <div>Auftragnehmer: unterschrieben</div>
            {blatt.unterschriftAG.wert ? (
              <div>Auftraggeber: gegengezeichnet</div>
            ) : (
              <div className={unterschriftRisiko ? "sw-mark--risk" : undefined}>Auftraggeber: keine Unterschrift</div>
            )}
          </div>
        </>
      );
    }
    case "regie": {
      const rb = d.regie.find((r) => r.dokumentId === dok.id);
      if (!rb) break;
      return (
        <>
          <b>Regiebericht {rb.nr.wert}</b>
          <div className="sw-doc-meta">{datum(rb.datum.wert)}</div>
          <Tabelle
            kopf={["Leistung", "Menge"]}
            markiert={stelle?.startsWith("Stunden Monteur") ? 1 : -1}
            zeilen={[
              ["Tätigkeit", rb.taetigkeit.wert],
              ["Monteur", `${menge(rb.stundenMonteur.wert)} h`],
              ["Helfer", `${menge(rb.stundenHelfer.wert)} h`],
              ["Material", betrag(rb.material.wert)],
            ]}
          />
          <div className="sw-sig">
            <div>Auftragnehmer: unterschrieben</div>
            {rb.unterschriftAG.wert ? <div>Bauleitung GU: unterschrieben</div> : <div className="sw-mark--risk">Bauleitung GU: keine Unterschrift</div>}
          </div>
        </>
      );
    }
    case "mail": {
      const m = d.mails.find((x) => x.dokumentId === dok.id);
      if (!m) break;
      return (
        <>
          <Kopf
            zeilen={[
              ["Von", m.von.wert],
              ["An", m.an.wert],
              ["Datum", datum(m.datum.wert)],
              ["Betreff", m.betreff.wert],
            ]}
          />
          {m.zitat && (
            <p>
              <span className="sw-mark">{m.zitat.wert}</span>
            </p>
          )}
        </>
      );
    }
    case "plan": {
      const plan = d.plaene.find((x) => x.dokumentId === dok.id);
      if (!plan) break;
      return (
        <>
          <b>
            Plan {plan.planNr.wert}, Index {plan.index.wert}
          </b>
          <div className="sw-doc-meta">
            {plan.titel.wert}, {datum(plan.datum.wert)}
          </div>
          <div className="doc-plan">
            {plan.vermerke.length ? (
              plan.vermerke.map((v) => (
                <p key={v.text.wert}>
                  <span className={v.typ === "aenderung" ? "sw-mark" : undefined}>{v.text.wert}</span>
                </p>
              ))
            ) : (
              <p>{plan.titel.wert}</p>
            )}
          </div>
        </>
      );
    }
    case "foto": {
      const ft = d.fotos.find((x) => x.dokumentId === dok.id);
      return (
        <>
          <div className="sw-photo">
            <span>Beispielfoto (synthetisch)</span>
          </div>
          <Kopf
            zeilen={[
              ["Datei", dok.dateiname],
              ["Aufnahme", ft ? zeitpunkt(ft.exifDatum.wert) : datum(dok.datum)],
              ["Ort", ft?.ort.wert ?? ""],
            ]}
          />
        </>
      );
    }
    default:
      break;
  }
  return (
    <>
      <b>{dok.dateiname}</b>
      <div className="sw-doc-meta">
        {datum(dok.datum)}
        {stelle ? `, ${stelle}` : ""}
      </div>
      <p>
        <span className="sw-mark">{beleg.text}</span>
      </p>
    </>
  );
}

export function Belegseite({ d, beleg }: { d: Datensatz; beleg: Beleg }) {
  const zuruf = d.zurufe.find((z) => z.id === beleg.quelle.dokumentId);
  const dok = d.dokumente.find((x) => x.id === beleg.quelle.dokumentId);
  return (
    <div className="sw-page">
      <Synth />
      {zuruf ? <ZurufSeite z={zuruf} /> : dok ? <Inhalt d={d} dok={dok} beleg={beleg} /> : <p>Kein Beleg.</p>}
    </div>
  );
}

/** Dateiname und Seitenzahl für Beleg-Chip und Betrachter. */
export function belegDatei(d: Datensatz, beleg: Beleg): { datei: string; seite: number; seiten: number } {
  const zuruf = d.zurufe.find((z) => z.id === beleg.quelle.dokumentId);
  if (zuruf) return { datei: `WhatsApp ${zuruf.nr}`, seite: 1, seiten: 1 };
  const dok = d.dokumente.find((x) => x.id === beleg.quelle.dokumentId);
  return { datei: dok?.dateiname ?? beleg.quelle.dokumentId, seite: beleg.quelle.seite, seiten: dok?.seiten ?? 1 };
}
