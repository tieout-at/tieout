// Übersicht eines Projekts ohne Abgleich (UI-Runde 1, Schritt 4, Sackgassen P6 bis P8). Gleiche Sprache wie die
// Schlussrechnung von W21: links die Abrechnung als Blatt (Schlussrechnung, Kürzungen, Abzüge, Haftrücklass,
// Abschläge, Schlusszahlung), jede Zeile mit ihrem Beleg; rechts die Kürzungen, die Nachträge und was dieser
// Auftraggeber bisher gekürzt, abgezogen und beauftragt hat (GU-Historie). Nur Fakten mit Beleg, keine Bewertung.
// Alle Beträge aus dem Rechenkern (`abrechnung`, `guHistorie`).

import { Check, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { SchonBeiAuftraggeber } from "@/daten/demo";
import { prozentText } from "@/engine/geld";
import { KUERZUNGSGRUND_TEXT, type Abrechnung, type AbrechnungsZeile, type AuftraggeberHistorie, type Beleg } from "@/engine";
import { anzahl, betrag, datum } from "./format";
import { GleicherGrund } from "./GleicherGrund";
import { Ico } from "./Ico";

/** Anker der Zeile im Zahlungsavis (ids `pos-…` auf der Belegseite). */
function avisAnker(z: AbrechnungsZeile): string {
  if (z.art === "abzug" && z.abzugArt) return `#pos-${z.abzugArt}`;
  if (z.art === "kuerzung") return "#pos-kuerzung";
  if (z.art === "zahlung") return "#pos-abschlagszahlungen";
  if (z.art === "ergebnis") return "#pos-zahlbetrag";
  return "";
}

function Chip({ basis, b, anker }: { basis: string; b: Beleg; anker: string }) {
  const vertrag = b.titel.match(/^Vertrag Pkt\. (.+)$/)?.[1];
  const ziel = vertrag ? `#pkt-${vertrag}` : b.titel === "Zahlungsavis" ? anker : "";
  return (
    <Link href={`${basis}/belege/${b.quelle.dokumentId}/${ziel}`} className="sw-source" title={`${b.text}, Seite ${b.quelle.seite}${b.datum ? `, ${datum(b.datum)}` : ""}`}>
      {b.titel}
    </Link>
  );
}

export function AbrechnungBlatt({
  basis,
  name,
  a,
  gleicherGrund,
}: {
  basis: string;
  name: string;
  a: Abrechnung;
  /** Gleicher Grund bei diesem Auftraggeber in anderen Projekten, für Abzüge ohne Vertragspunkt. */
  gleicherGrund: SchonBeiAuftraggeber[];
}) {
  const letzte = a.zeilen.length - 1;
  return (
    <section className="sr-mappe" aria-label="Abrechnung der Schlussrechnung">
      <div className="sr-blatt">
        <div className="sr-blatt__kopf">
          <span>
            <b>Abrechnung</b> {name}
          </span>
          <span className="sr-marke">Schlussrechnung vom {datum(a.rechnung.datum)}</span>
        </div>
        <table className="sr-kaskade">
          <colgroup>
            <col />
            <col style={{ width: 72 }} />
            <col style={{ width: 144 }} />
          </colgroup>
          <thead className="sr-nur-vorlesen">
            <tr>
              <th>Zeile und Beleg</th>
              <th>Satz</th>
              <th>Betrag</th>
            </tr>
          </thead>
          <tbody>
            {a.zeilen.map((z, i) => {
              const warn = z.pruefung === "abzug_ohne_vertragspunkt" || z.pruefung === "abweichung";
              const klasse = i === letzte ? "sr-zeile sr-zeile--rest" : z.art === "summe" ? "sr-zeile sr-zeile--summe" : "sr-zeile";
              return (
                <tr key={z.bezeichnung} className={klasse} data-warn={warn ? "" : undefined}>
                  <td>
                    {z.bezeichnung}
                    {z.pruefung === "abzug_ohne_vertragspunkt" && (
                      <>
                        <span className="sr-pruefung sr-pruefung--warn">Abzug ohne Vertragspunkt</span>
                        <span className="sr-historie">
                          <GleicherGrund treffer={gleicherGrund} />
                        </span>
                      </>
                    )}
                    {z.pruefung === "abweichung" && <span className="sr-pruefung sr-pruefung--warn">weicht vom Vertrag ab</span>}
                    {z.belege.length > 0 && (
                      <span className="sr-belege">
                        {z.belege.map((b) => (
                          <Chip key={`${b.quelle.dokumentId}-${b.titel}`} basis={basis} b={b} anker={avisAnker(z)} />
                        ))}
                      </span>
                    )}
                    {z.art === "ergebnis" && (
                      <span className={a.schlusszahlung.stimmt ? "ab-nachgerechnet" : "ab-nachgerechnet ab-nachgerechnet--warn"}>
                        <Ico icon={a.schlusszahlung.stimmt ? Check : TriangleAlert} />
                        {a.schlusszahlung.stimmt ? "Zahlbetrag nachgerechnet, stimmt" : `Avis zeigt ${betrag(a.schlusszahlung.betrag)}`}
                      </span>
                    )}
                  </td>
                  <td className="sr-satz">{z.satz !== null ? prozentText(z.satz, 2) : ""}</td>
                  <td className="r">{betrag(z.betrag)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Kuerzungen({ basis, a, gleich }: { basis: string; a: Abrechnung; gleich: (grund: Abrechnung["kuerzungen"][number]["grund"]) => SchonBeiAuftraggeber[] }) {
  if (!a.kuerzungen.length) return null;
  return (
    <section className="sr-vorpruefung" aria-labelledby="ab-kuerzungen">
      <div className="sr-vorpruefung__kopf">
        <h2 id="ab-kuerzungen" className="section-title">
          Gekürzt vom Auftraggeber
        </h2>
        <span className="meta sw-muted">
          {betrag(a.gekuerzt)} in {anzahl(a.kuerzungen.length, "Position", "Positionen")}
        </span>
      </div>
      <ul className="sr-risiken">
        {a.kuerzungen.map((k) => (
          <li key={k.bezug}>
            <Link href={`${basis}/belege/${k.beleg.quelle.dokumentId}/#pos-${k.bezug}`} className="sr-risiko" data-gekuerzt>
              <span className="sr-risiko__kopf">
                <b>{k.bezug}</b>
                <span>{betrag(k.betrag)}</span>
              </span>
              <span className="sr-risiko__grund">{KUERZUNGSGRUND_TEXT[k.grund]}</span>
              <GleicherGrund treffer={gleich(k.grund)} ohneLink />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Nachtraege({ basis, a }: { basis: string; a: Abrechnung }) {
  if (!a.nachtraege.length) return null;
  return (
    <section className="sr-vorpruefung" aria-labelledby="ab-nachtraege">
      <div className="sr-vorpruefung__kopf">
        <h2 id="ab-nachtraege" className="section-title">
          Nachträge
        </h2>
        <span className="meta sw-muted">
          {a.nachtraege.filter((n) => n.beauftragt).length} von {a.nachtraege.length} beauftragt
        </span>
      </div>
      <ul className="sr-risiken">
        {a.nachtraege.map((n) => (
          <li key={n.nr}>
            <Link href={`${basis}/belege/${n.beleg.quelle.dokumentId}/`} className="sr-risiko">
              <span className="sr-risiko__kopf">
                <b>
                  <span className="sw-pos-nr">{n.nr}</span>
                  {n.titel}
                </b>
                <span>{betrag(n.betrag)}</span>
              </span>
              <span className={n.beauftragt ? "ab-stand" : "ab-stand ab-stand--nein"}>{n.beauftragt ? "beauftragt" : "abgelehnt"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Was dieser Auftraggeber über alle Projekte der Firma gekürzt, abgezogen und beauftragt hat. */
export function AuftraggeberBisher({ h }: { h: AuftraggeberHistorie }) {
  // Je Grund die Projekte mit Sprung zum Original dort (erste Zeile im Korrekturblatt oder im Zahlungsavis)
  const gruende = new Map<string, Map<string, string>>();
  const merke = (grund: string, kurz: string, href: string) => {
    const projekte = gruende.get(grund) ?? new Map<string, string>();
    if (!projekte.has(kurz)) projekte.set(kurz, href);
    gruende.set(grund, projekte);
  };
  for (const k of h.kuerzungen) merke(KUERZUNGSGRUND_TEXT[k.grund], k.kurz, `/projekte/${k.projektId}/belege/${k.beleg.quelle.dokumentId}/#pos-${k.bezug}`);
  for (const x of h.abzuege) merke(KUERZUNGSGRUND_TEXT[x.grund], x.kurz, `/projekte/${x.projektId}/belege/${x.belege[0].quelle.dokumentId}/#pos-${x.art}`);
  const zeilen: [string, string, string][] = [
    ...(h.kuerzungen.length
      ? [["Gekürzt", betrag(h.kuerzungenSumme), `${anzahl(h.kuerzungen.length, "Position", "Positionen")} in ${anzahl(h.kuerzungenProjekte, "Projekt", "Projekten")}`] as [string, string, string]]
      : []),
    ...(h.abzuege.length ? [["Abzüge ohne Vertragspunkt", betrag(h.abzuegeSumme), `in ${anzahl(h.abzuege.length, "Projekt", "Projekten")}`] as [string, string, string]] : []),
    [
      "Nachträge beauftragt",
      `${h.nachtraege.beauftragt} von ${h.nachtraege.anzahl}`,
      h.nachtraege.quote !== null ? `${prozentText(h.nachtraege.quote)} von ${betrag(h.nachtraege.betrag)}` : "",
    ],
    ...h.schlusszahlung.map((s): [string, string, string] => [`Schlusszahlung ${s.kurz}`, `nach ${anzahl(s.tage, "Tag", "Tagen")}`, `am ${datum(s.bezahlt)}`]),
  ];
  return (
    <section className="sr-vorpruefung" aria-labelledby="ab-bisher">
      <div className="sr-vorpruefung__kopf">
        <h2 id="ab-bisher" className="section-title">
          {h.auftraggeber.name} bisher
        </h2>
        <span className="meta sw-muted">
          {anzahl(h.projekte, "Projekt", "Projekte")}, {h.abgeschlossen} abgeschlossen
        </span>
      </div>
      <dl className="ab-bisher">
        {zeilen.map(([k, w, ctx]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>
              <b>{w}</b>
              {ctx && <span>{ctx}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {gruende.size > 0 && (
        <ul className="ab-gruende" aria-label="Gründe">
          <li className="label" aria-hidden="true">
            Gründe
          </li>
          {[...gruende].map(([grund, projekte]) => (
            <li key={grund}>
              <span>{grund}</span>
              <span className="ab-gruende__projekte">
                {[...projekte].map(([kurz, href]) => (
                  <Link key={kurz} href={href} className="gleich__link">
                    {kurz}
                  </Link>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
