// Originalseite eines Belegs mit markierter Fundstelle (Vorlage: Kuro K-A, Rossum: Rahmen um den Wert).
// MVP: Die Seite wird aus dem synthetischen Datensatz gezeichnet; echte PDFs (pdf.js mit Markierung aus den
// Quell-Koordinaten) ersetzen das später, die Schnittstelle (Datensatz + Beleg) bleibt gleich.
// Markiert wird immer die Stelle, auf die die Quelle des Belegs zeigt, nie ein vom Rechenkern formulierter Satz.

import type { Datensatz, Dokument, Quelle, Rechnung, Zuruf } from "@/domain/typen";
import { menge, prozentText } from "@/engine/geld";
import type { Beleg } from "@/engine/typen";
import { betrag, datum, zeitpunkt } from "./format";

function Synth() {
  return <span className="sw-page__synth">Synthetisch</span>;
}

/** Gleiche Stelle wie in der Quelle des Belegs? */
function trifft(q: Quelle, stelle: string | undefined): boolean {
  return !!q.stelle && !!stelle && (q.stelle === stelle || q.stelle.startsWith(`${stelle},`) || stelle.startsWith(q.stelle));
}

function Mark({ an, risiko = false, children }: { an: boolean; risiko?: boolean; children: React.ReactNode }) {
  if (!an) return <>{children}</>;
  return <span className={risiko ? "sw-mark sw-mark--risk" : "sw-mark"}>{children}</span>;
}

function Kopf({ zeilen }: { zeilen: [string, React.ReactNode][] }) {
  return (
    <div className="sw-page__head">
      {zeilen.map(([k, v]) => (
        <KopfZeile key={k} k={k} v={v} />
      ))}
    </div>
  );
}

function KopfZeile({ k, v }: { k: string; v: React.ReactNode }) {
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
function ausschnitt<T>(liste: T[], index: number, umfang = 14): { teil: T[]; markiert: number } {
  if (index < 0) return { teil: liste.slice(0, umfang), markiert: -1 };
  const start = Math.max(0, Math.min(index - Math.floor(umfang / 2), liste.length - umfang));
  return { teil: liste.slice(start, start + umfang), markiert: index - start };
}

function positionAus(stelle: string | undefined): string | null {
  return stelle?.match(/\d\d\.\d\d\.\d\d[A-Z]|Z-\d+/)?.[0] ?? null;
}

function Titel({ titel, meta }: { titel: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <>
      <b className="doc-title">{titel}</b>
      {meta && <div className="sw-doc-meta">{meta}</div>}
    </>
  );
}

function Unterschriften({ ag, an, risiko }: { ag: React.ReactNode; an?: React.ReactNode; risiko?: boolean }) {
  return (
    <div className="sw-sig">
      <div>{an ?? "Auftragnehmer: unterschrieben"}</div>
      <div className={risiko ? "sw-mark--risk" : undefined}>{ag}</div>
    </div>
  );
}

function RechnungsSeite({ d, r, beleg }: { d: Datensatz; r: Rechnung; beleg: Beleg }) {
  const nr = positionAus(beleg.quelle.stelle);
  const zeilen = r.zeilen.map((z) => {
    if (z.typ === "lv" || z.typ === "zusatz") {
      const lv = d.lv.find((p) => p.nr.wert === z.positionNr.wert);
      return { key: z.positionNr.wert, z: [z.positionNr.wert, z.typ === "zusatz" ? z.text.wert : (lv?.kurztext.wert ?? ""), menge(z.menge.wert, lv?.einheit.wert), betrag(z.betrag.wert)] };
    }
    if (z.typ === "regie") return { key: z.regieNr.wert, z: [z.regieNr.wert, "Regie", "", betrag(z.betrag.wert)] };
    return { key: "pg", z: ["", "Preisumrechnung", "", betrag(z.betrag.wert)] };
  });
  const regie = beleg.quelle.stelle?.match(/RB-\d+/)?.[0];
  const i = zeilen.findIndex((x) => x.key === (nr ?? regie));
  const { teil, markiert } = ausschnitt(zeilen, i);
  return (
    <>
      <Titel titel={r.art === "abschlag" ? `Abschlagsrechnung ${r.nr.wert}` : "Schlussrechnung, Entwurf des Projektleiters"} meta={`vom ${datum(r.datum.wert)}`} />
      <Tabelle kopf={["Pos.", "Text", "Menge", "Betrag"]} markiert={markiert} zeilen={teil.map((x) => x.z)} />
      <p className="doc-sum">
        Summe <Mark an={beleg.quelle.stelle?.startsWith("Summe") ?? false}>{betrag(r.summe.wert)}</Mark>
      </p>
    </>
  );
}

function VertragsSeite({ d, beleg }: { d: Datensatz; beleg: Beleg }) {
  const v = d.vertrag;
  const stelle = beleg.quelle.stelle;
  const NAME: Record<string, string> = {
    nachlass: "Nachlass",
    baustrom_bauwasser: "Baustrom und Bauwasser",
    deckungsruecklass: "Deckungsrücklass auf Abschlagsrechnungen",
    haftruecklass: "Haftrücklass auf die Schlussrechnung",
    bauschadensumlage: "Bauschadensumlage",
  };
  type Punkt = [string, string, React.ReactNode];
  const punkte: Punkt[] = [
    ["Pkt. 1.2", "Grundlage", v.norm.wert],
    ["Pkt. 2.1", "Auftragssumme netto", betrag(v.auftragssumme.wert)],
    ["Pkt. 6.3", "Regiesätze Monteur und Helfer", `${betrag(v.regiesatzMonteur.wert)} und ${betrag(v.regiesatzHelfer.wert)} je Stunde`],
  ];
  for (const s of v.saetze) punkte.push([`Pkt. ${s.punkt}`, NAME[s.art] ?? s.art, prozentText(s.satz.wert, 2)]);
  for (const p of v.pauschalen) punkte.push([`Pkt. ${p.punkt}`, "Pauschal enthalten", p.text.wert]);
  const pg = v.preisgleitung;
  if (pg) punkte.push([`Pkt. ${pg.punkt}`, "Veränderliche Preise", `Lohnanteil ${prozentText(pg.lohnanteil.wert, 0)}, ${pg.indexName.wert}, Leistungen ab ${datum(pg.stichtag.wert)}`]);
  punkte.sort((a, b) => a[0].localeCompare(b[0], "de", { numeric: true }));
  const i = punkte.findIndex(([pkt]) => !!stelle && stelle.startsWith(pkt));
  return (
    <>
      <Titel titel="Bauvertrag" meta={`vom ${datum(v.datum.wert)}, Seite ${beleg.quelle.seite}`} />
      <Tabelle kopf={["Punkt", "Regelung", "Inhalt"]} markiert={i} zeilen={punkte.map(([a, b, c]) => [a, b, c])} />
    </>
  );
}

/** Plan mit Planrahmen und Schriftfeld; Heizkörper je Top nach Index (Vorlage: Trunk Tools, Kuro). */
function PlanSeite({ d, dok, beleg }: { d: Datensatz; dok: Dokument; beleg: Beleg }) {
  const plan = d.plaene.find((x) => x.dokumentId === dok.id);
  if (!plan) return null;
  const heizkoerper = plan.vermerke.some((v) => v.positionNr.wert.startsWith("22.04"));
  const geaendert = plan.vermerke.some((v) => v.typ === "aenderung");
  const tops = Array.from({ length: 7 }, (_, i) => i);
  return (
    <>
      <svg className="doc-plan" viewBox="0 0 540 380" role="img" aria-label={`Plan ${plan.planNr.wert}, Index ${plan.index.wert}`}>
        <rect x="8" y="8" width="524" height="364" fill="none" stroke="var(--doc-figure)" strokeWidth="1.5" />
        <text x="24" y="36" fontSize="12" fontWeight="600" fill="var(--doc-figure)">
          {plan.titel.wert}
        </text>
        {tops.map((i) => {
          const x = 24 + i * 70;
          return (
            <g key={i}>
              <rect x={x} y="60" width="66" height="150" fill="none" stroke="var(--doc-figure)" strokeWidth="1" />
              <text x={x + 33} y="76" fontSize="10" textAnchor="middle" fill="var(--doc-figure)">
                Top {7 + i}
              </text>
              {heizkoerper && !geaendert && <rect x={x + 25} y="194" width="16" height="6" fill="var(--doc-figure)" />}
              {heizkoerper && geaendert && (
                <>
                  <line x1={x + 22} y1="84" x2={x + 22} y2="210" stroke="var(--doc-figure)" strokeWidth="0.8" strokeDasharray="3 2" />
                  <rect x={x + 4} y="194" width="14" height="6" fill="var(--doc-figure)" />
                  <rect x={x + 26} y="194" width="14" height="6" fill="var(--doc-mark-line)" />
                  <rect x={x + 46} y="194" width="14" height="6" fill="var(--doc-mark-line)" />
                  <rect x={x + 23} y="189" width="40" height="16" rx="3" fill="none" stroke="var(--doc-mark-line)" strokeWidth="1.2" />
                </>
              )}
              {!heizkoerper && <line x1={x} y1="135" x2={x + 66} y2="135" stroke="var(--doc-figure)" strokeWidth="3" />}
            </g>
          );
        })}
        <rect x="330" y="300" width="194" height="64" fill="var(--doc-paper)" stroke="var(--doc-figure)" />
        <text x="340" y="320" fontSize="10" fill="var(--doc-figure)">
          Plan {plan.planNr.wert}
        </text>
        <text x="340" y="337" fontSize="10" fill="var(--doc-figure)">
          Index {plan.index.wert}, {datum(plan.datum.wert)}
        </text>
        <text x="340" y="354" fontSize="10" fill="var(--doc-ink-secondary)">
          Haustechnik Beispiel GmbH
        </text>
      </svg>
      {plan.vermerke.map((v) => (
        <p key={v.text.wert} className="doc-note">
          <Mark an={v.text.wert === beleg.text || trifft(beleg.quelle, v.text.quelle.stelle)}>{v.text.wert}</Mark>
        </p>
      ))}
    </>
  );
}

/** Zuruf als Chat (WhatsApp-Muster): Foto, Sprachnachricht mit Transkript, Zusammenfassung des Agenten, „Ja“. */
function ZurufSeite({ z }: { z: Zuruf }) {
  const stunden = [
    z.stundenMonteur.wert ? `${menge(z.stundenMonteur.wert)} h Monteur` : "",
    z.stundenHelfer.wert ? `${menge(z.stundenHelfer.wert)} h Helfer` : "",
  ].filter(Boolean);
  return (
    <div className="chat">
      <div className="chat__kopf">
        <b>{z.absender}</b>
        <span>WhatsApp, {zeitpunkt(z.zeitpunkt)}</span>
      </div>
      {z.foto && (
        <div className="chat__msg chat__msg--ein">
          <div className="sw-photo">
            <span>Foto (synthetisch)</span>
          </div>
          <span className="chat__zeit">{z.zeitpunkt.slice(11, 16)}</span>
        </div>
      )}
      <div className="chat__msg chat__msg--ein">
        <span className="chat__label">Sprachnachricht, Transkript</span>
        <span className="sw-mark">„{z.transkript.wert}“</span>
        <span className="chat__zeit">{z.zeitpunkt.slice(11, 16)}</span>
      </div>
      <div className="chat__msg chat__msg--aus">
        So habe ich es verstanden: {z.taetigkeit.wert.includes(z.ort.wert) ? "" : `${z.ort.wert}. `}{z.taetigkeit.wert}.{stunden.length ? ` ${stunden.join(", ")}.` : ""}
        {z.angewiesenVon ? ` Angewiesen von: ${z.angewiesenVon.wert}.` : ""} Stimmt das?
      </div>
      <div className="chat__msg chat__msg--ein chat__msg--kurz">
        Ja<span className="chat__zeit">{z.bestaetigt.zeitpunkt.slice(11, 16)}</span>
      </div>
    </div>
  );
}

function Inhalt({ d, dok, beleg }: { d: Datensatz; dok: Dokument; beleg: Beleg }) {
  const stelle = beleg.quelle.stelle;
  switch (dok.art) {
    case "lv": {
      const nr = positionAus(stelle);
      const i = d.lv.findIndex((p) => p.nr.wert === nr);
      const { teil, markiert } = ausschnitt(d.lv, i);
      return (
        <>
          <Titel titel="Leistungsverzeichnis" meta={`ÖNORM A 2063, Seite ${beleg.quelle.seite}`} />
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
      const i = blatt.zeilen.findIndex((z) => z.positionNr.wert === nr);
      const { teil, markiert } = ausschnitt(blatt.zeilen, i);
      return (
        <>
          <Titel titel={`Aufmaßblatt ${blatt.nr}`} meta={<Mark an={trifft(beleg.quelle, "Kopf, Leistungszeitraum")}>Leistung {datum(blatt.leistungVon.wert)} bis {datum(blatt.leistungBis.wert)}, erstellt {datum(blatt.datum.wert)}</Mark>} />
          <Tabelle
            kopf={["Pos.", "Ort", "Menge"]}
            markiert={markiert}
            zeilen={teil.map((z) => [z.positionNr.wert, z.ort.wert, menge(z.menge.wert, d.lv.find((p) => p.nr.wert === z.positionNr.wert)?.einheit.wert)])}
          />
          <Unterschriften
            ag={blatt.unterschriftAG.wert ? "Auftraggeber: gegengezeichnet" : "Auftraggeber: keine Unterschrift"}
            risiko={!blatt.unterschriftAG.wert && trifft(beleg.quelle, "Unterschrift Auftraggeber")}
          />
        </>
      );
    }
    case "regie": {
      const rb = d.regie.find((r) => r.dokumentId === dok.id);
      if (!rb) break;
      const unterschrift = trifft(beleg.quelle, "Unterschrift Auftraggeber");
      const zeilen: [string, React.ReactNode, string][] = [
        ["Tätigkeit", rb.taetigkeit.wert, "Tätigkeit"],
        ["Monteur", `${menge(rb.stundenMonteur.wert)} h`, "Stunden Monteur"],
        ["Helfer", `${menge(rb.stundenHelfer.wert)} h`, "Stunden Helfer"],
        ["Material", betrag(rb.material.wert), "Material"],
      ];
      return (
        <>
          <Titel titel={`Regiebericht ${rb.nr.wert}`} meta={datum(rb.datum.wert)} />
          <Tabelle kopf={["Leistung", "Menge"]} markiert={zeilen.findIndex(([, , s]) => trifft(beleg.quelle, s))} zeilen={zeilen.map(([a, b]) => [a, b])} />
          <Unterschriften
            ag={<Mark an={unterschrift && rb.unterschriftAG.wert}>{rb.unterschriftAG.wert ? "Bauleitung GU: unterschrieben" : "Bauleitung GU: keine Unterschrift"}</Mark>}
            risiko={!rb.unterschriftAG.wert}
          />
        </>
      );
    }
    case "stundenliste": {
      const sl = d.stundenlisten.find((s) => s.dokumentId === dok.id);
      if (!sl) break;
      return (
        <>
          <Titel titel="Stundenliste" meta={`${datum(sl.von.wert)} bis ${datum(sl.bis.wert)}`} />
          <Tabelle
            kopf={["Regiebericht", "Monteur", "Helfer"]}
            markiert={sl.eintraege.findIndex((e) => trifft(beleg.quelle, e.stundenMonteur.quelle.stelle))}
            zeilen={sl.eintraege.map((e) => [e.regieNr.wert, `${menge(e.stundenMonteur.wert)} h`, `${menge(e.stundenHelfer.wert)} h`])}
          />
        </>
      );
    }
    case "abschlag":
    case "sr_entwurf": {
      const r = dok.art === "sr_entwurf" ? d.entwurf : d.abschlaege.find((x) => x.dokumentId === dok.id);
      if (!r) break;
      return <RechnungsSeite d={d} r={r} beleg={beleg} />;
    }
    case "vertrag":
      return <VertragsSeite d={d} beleg={beleg} />;
    case "indexblatt": {
      const ix = d.indexblatt;
      if (!ix) break;
      return (
        <>
          <Titel titel={`Indexblatt ${ix.name.wert}`} meta={`Stand ${datum(ix.stand.wert)}`} />
          <Tabelle
            kopf={["Zeitpunkt", "Indexwert"]}
            markiert={trifft(beleg.quelle, ix.aktuell.quelle.stelle) ? 1 : trifft(beleg.quelle, ix.basis.quelle.stelle) ? 0 : -1}
            zeilen={[
              [ix.basis.quelle.stelle ?? "Basis", menge(ix.basis.wert)],
              [ix.aktuell.quelle.stelle ?? "aktuell", menge(ix.aktuell.wert)],
            ]}
          />
        </>
      );
    }
    case "gu_korrektur": {
      const kb = d.korrekturblaetter.find((x) => x.dokumentId === dok.id);
      if (!kb) break;
      return (
        <>
          <Titel titel={`Korrekturblatt ${kb.rechnungNr.wert}`} meta={`des Auftraggebers vom ${datum(kb.datum.wert)}`} />
          <Tabelle
            kopf={["Pos.", "Kürzung", "Grund"]}
            markiert={kb.zeilen.findIndex((z) => trifft(beleg.quelle, z.kuerzung.quelle.stelle))}
            zeilen={kb.zeilen.map((z) => [z.positionNr.wert, betrag(z.kuerzung.wert), z.grund.wert])}
          />
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
              <Mark an>{m.zitat.wert}</Mark>
            </p>
          )}
          <p>Mit freundlichen Grüßen</p>
        </>
      );
    }
    case "plan":
      return <PlanSeite d={d} dok={dok} beleg={beleg} />;
    case "foto": {
      const ft = d.fotos.find((x) => x.dokumentId === dok.id);
      return (
        <>
          <div className="sw-photo">
            <span>Foto (synthetisch)</span>
          </div>
          <Kopf
            zeilen={[
              ["Datei", dok.dateiname],
              ["Aufnahme", ft ? zeitpunkt(ft.exifDatum.wert) : datum(dok.datum)],
              ["Ort", <Mark key="ort" an>{ft?.ort.wert ?? ""}</Mark>],
            ]}
          />
        </>
      );
    }
    default:
      break;
  }
  return <Titel titel={dok.dateiname} meta={datum(dok.datum)} />;
}

export function Belegseite({ d, beleg }: { d: Datensatz; beleg: Beleg }) {
  const zuruf = d.zurufe.find((z) => z.id === beleg.quelle.dokumentId);
  if (zuruf) {
    return (
      <div className="sw-page sw-page--chat">
        <Synth />
        <ZurufSeite z={zuruf} />
      </div>
    );
  }
  const dok = d.dokumente.find((x) => x.id === beleg.quelle.dokumentId);
  return (
    <div className="sw-page">
      <Synth />
      {dok ? <Inhalt d={d} dok={dok} beleg={beleg} /> : <p>Kein Beleg.</p>}
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
