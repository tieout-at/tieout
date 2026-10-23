// Dashboard der Firma (UI-Runde 1, Schritt 2, Option A „Lagebild“; Vorlage: Linear „My issues“ für „Als Nächstes“,
// Stripe-Übersicht für die eine große Zahl, Attio-Karten für die Projekte, Planraster der Website).
// In fünf Sekunden: wie viel jetzt verrechenbar ist, wo es liegt, was als Nächstes dran ist.
// Alle Beträge aus dem Rechenkern; „jetzt verrechenbar“ und „angemeldet und offen“ stehen nie zusammengezählt.

import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { firma, hatSchlussrechnung, navDaten, zuEntscheiden } from "@/daten/demo";
import type { Ampel, ProjektZeile } from "@/engine";
import { Bauglyphe } from "@/ui/Bauglyphe";
import { anzahl, betrag, datum } from "@/ui/format";
import { Ico } from "@/ui/Ico";
import { Kennzahl } from "@/ui/Kennzahl";
import { Panel } from "@/ui/Panel";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { FreigabeStriche, FreigegebenZahl } from "@/ui/Stand";
import { HINWEIS_ERP } from "@/ui/posten-texte";
import { WeiterPruefen } from "@/ui/WeiterPruefen";

export const metadata: Metadata = { title: "Übersicht" };

/** Ampel als Wort (Bauteil „Projektliste mit Ampel“, src/ui/README.md). */
const AMPEL: Record<Ampel, { klasse: string; wort: string }> = {
  rot: { klasse: "sw-dotlabel sw-dotlabel--neg", wort: "Bald legen" },
  gelb: { klasse: "sw-dotlabel sw-dotlabel--warn", wort: "Beträge offen" },
  gruen: { klasse: "sw-dotlabel sw-dotlabel--pos", wort: "Nichts offen" },
  grau: { klasse: "sw-dotlabel", wort: "Kein Abgleich" },
};

const MONAT = ["Jän", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

/** Datum als Kalenderblatt: Monat oben, Tag groß (Linear-Fälligkeit, Apple-Kalender). */
function Blatt({ iso, dringend }: { iso: string; dringend?: boolean }) {
  return (
    <span className={dringend ? "db-blatt db-blatt--dringend" : "db-blatt"} title={datum(iso)}>
      <span>{MONAT[Number(iso.slice(5, 7)) - 1]}</span>
      <b>{Number(iso.slice(8, 10))}</b>
    </span>
  );
}

/** Kürzungsrisiko aus GU-Sicht als eigener Schritt direkt unter der Schlussrechnung des Projekts (ohne eigene Frist). */
function RisikoSchritt({ p, anzahlRisiken, summe }: { p: ProjektZeile; anzahlRisiken: number; summe: number }) {
  return (
    <li className="db-schritt">
      <span className="db-blatt db-blatt--symbol" aria-hidden="true">
        <Ico icon={ShieldAlert} />
      </span>
      <span className="db-schritt__text">
        <Link href={hatSchlussrechnung(p.projektId) ? `/projekte/${p.projektId}/schlussrechnung/` : `/projekte/${p.projektId}/posten/`} className="db-schritt__link">
          Kürzungsrisiko {p.kurz} vorbeugen
        </Link>
        <span className="meta sw-muted">
          {betrag(summe)} in {anzahl(anzahlRisiken, "Position", "Positionen")}
        </span>
      </span>
    </li>
  );
}

function datumZeile(p: ProjektZeile): string {
  if (!p.datum) return "";
  const text = { legen_bis: "legen bis", letzte_ar: "letzte AR", gelegt: "Schlussrechnung gelegt", schlusszahlung: "Schlusszahlung" }[p.datum.art];
  return `${text} ${datum(p.datum.wert)}`;
}

export default function Dashboard() {
  const { daten, ergebnis: e } = firma();
  const nav = new Map(navDaten().projekte.map((p) => [p.id, p]));
  const offen = e.projekte.filter((p) => p.jetzt !== null);
  const zu = e.projekte.filter((p) => p.jetzt === null);
  // Reihenfolge im Balken und in der Legende: größter Betrag zuerst (nur Sortierung, keine Rechnung).
  const mitJetzt = offen.filter((p) => (p.jetzt ?? 0) > 0).sort((a, b) => (b.jetzt ?? 0) - (a.jetzt ?? 0));
  const entscheiden = new Map(offen.map((p) => [p.projektId, zuEntscheiden(p.projektId, e.ergebnisse[p.projektId])]));
  const fristen = offen
    .filter((p) => p.datum?.art === "legen_bis" && p.datum.wert >= e.stichtag)
    .sort((a, b) => a.datum!.wert.localeCompare(b.datum!.wert));
  const risiken = offen.filter((p) => (e.ergebnisse[p.projektId].vorpruefung?.risiken.length ?? 0) > 0);

  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name }]} titel="Übersicht" />
      <main className="scr-body db">
        <section className="db-kopf">
          <div className="db-held">
            <span className="label">Jetzt verrechenbar</span>
            <span className="db-held__zahl">{betrag(e.summen.jetzt)}</span>
            <span className="db-held__ctx">
              {anzahl(e.summen.postenJetzt, "Posten", "Posten")} in {anzahl(e.summen.projekteMitJetzt, "Projekt", "Projekten")}
            </span>
            <div className="db-balken" aria-hidden="true">
              {mitJetzt.map((p, i) => (
                <span key={p.projektId} className="db-balken__teil" data-stufe={Math.min(i, 3)} style={{ width: `${((p.jetzt ?? 0) / e.summen.jetzt) * 100}%` }} />
              ))}
            </div>
            <ul className="db-legende">
              {mitJetzt.map((p, i) => (
                <li key={p.projektId}>
                  <Link href={`/projekte/${p.projektId}/`}>
                    <span className="db-legende__farbe" data-stufe={Math.min(i, 3)} aria-hidden="true" />
                    <span className="db-legende__name">{p.name}</span>
                    <b>{betrag(p.jetzt ?? 0)}</b>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="db-neben">
              <Kennzahl
                label="Angemeldet und offen"
                wert={betrag(e.summen.offen)}
                kontext={
                  <span className="db-teile">
                    <span>
                      <b>{betrag(e.geld.beleg_fehlt.betrag)}</b> Beleg fehlt
                    </span>
                    <span>
                      <b>{betrag(e.geld.angemeldet.betrag)}</b> nicht angeboten
                    </span>
                  </span>
                }
              />
              <Kennzahl
                label="Nur außerhalb ERP"
                wert={betrag(e.ausserhalbErp.betrag)}
                kontext={
                  <span className="db-teile">
                    <span>
                      {e.ausserhalbErp.anzahl} von {e.ausserhalbErp.vonAnzahl} Posten, verrechenbar und angemeldet
                    </span>
                    <span className="sw-muted">Annahme: Datei gleich ERP</span>
                  </span>
                }
                hinweis={HINWEIS_ERP}
              />
            </div>
          </div>

          <Panel titel="Als Nächstes" className="db-naechstes">
            <ol className="db-schritte">
              {fristen.map((p, i) => {
                const v = e.ergebnisse[p.projektId].vorpruefung;
                return (
                  <Fragment key={p.projektId}>
                    <li className="db-schritt">
                      <Blatt iso={p.datum!.wert} dringend={p.ampel === "rot"} />
                      <span className="db-schritt__text">
                        <Link href={`/projekte/${p.projektId}/`} className="db-schritt__link">
                          Schlussrechnung {p.kurz} legen
                        </Link>
                        <span className="meta sw-muted">
                          <FreigegebenZahl projektId={p.projektId} posten={entscheiden.get(p.projektId) ?? []} /> im Projekt freigegeben
                        </span>
                      </span>
                      <WeiterPruefen
                        projektId={p.projektId}
                        posten={entscheiden.get(p.projektId) ?? []}
                        text="Prüfen"
                        className={i === 0 ? "sw-btn sw-btn--accent sw-btn--sm db-schritt__knopf" : "sw-btn sw-btn--sm db-schritt__knopf"}
                      />
                    </li>
                    {v && v.risiken.length > 0 && <RisikoSchritt p={p} anzahlRisiken={v.risiken.length} summe={v.summe} />}
                  </Fragment>
                );
              })}
              {risiken
                .filter((p) => !fristen.includes(p))
                .map((p) => {
                  const v = e.ergebnisse[p.projektId].vorpruefung!;
                  return <RisikoSchritt key={p.projektId} p={p} anzahlRisiken={v.risiken.length} summe={v.summe} />;
                })}
            </ol>
          </Panel>
        </section>

        <section className="db-projekte" aria-labelledby="db-projekte-titel">
          <h2 id="db-projekte-titel" className="section-title">
            Projekte im Abgleich <span className="sw-count">{offen.length}</span>
          </h2>
          <div className="db-karten">
            {offen.map((p) => {
              const n = nav.get(p.projektId);
              const posten = entscheiden.get(p.projektId) ?? [];
              const a = AMPEL[p.ampel];
              return (
                <Link key={p.projektId} href={`/projekte/${p.projektId}/`} className="db-karte" data-ampel={p.ampel}>
                  <span className="db-karte__kopf">
                    {n && <Bauglyphe art={n.gebaeude} geschosse={n.geschosse} dringend={p.ampel === "rot"} />}
                    <span className={a.klasse}>{a.wort}</span>
                  </span>
                  <span className="db-karte__name">{p.name}</span>
                  <span className="db-karte__ag">
                    <span className="sw-pos-nr">{p.kurz}</span>
                    {p.auftraggeber.name}
                  </span>
                  <span className="db-karte__label">Jetzt verrechenbar</span>
                  <span className="db-karte__betrag">{betrag(p.jetzt ?? 0)}</span>
                  <span className="db-karte__zeile" title="Angemeldet und offen">
                    <span>Angemeldet</span>
                    <b>{betrag(p.offen ?? 0)}</b>
                  </span>
                  <span className="db-karte__fuss">
                    {posten.length > 0 ? (
                      <>
                        <FreigabeStriche projektId={p.projektId} posten={posten} />
                        <span>
                          <FreigegebenZahl projektId={p.projektId} posten={posten} /> freigegeben
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="ab-striche" aria-hidden="true" />
                        <span>keine Posten</span>
                      </>
                    )}
                  </span>
                  <span className="db-karte__datum">{datumZeile(p)}</span>
                </Link>
              );
            })}
          </div>

          {zu.length > 0 && (
            <>
              <h2 className="section-title db-projekte__zu">
                Schlussrechnung gelegt oder abgeschlossen <span className="sw-count">{zu.length}</span>
              </h2>
              <ul className="db-fertig">
                {zu.map((p) => {
                  const n = nav.get(p.projektId);
                  return (
                    <li key={p.projektId}>
                      <Link href={`/projekte/${p.projektId}/`}>
                        {n && <Bauglyphe art={n.gebaeude} geschosse={n.geschosse} ruhig />}
                        <span className="db-fertig__name">
                          <span className="sw-pos-nr">{p.kurz}</span>
                          {p.name}
                        </span>
                        <span className="db-fertig__ag">{p.auftraggeber.name}</span>
                        <span className="db-fertig__datum">{datumZeile(p)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </main>
    </>
  );
}
