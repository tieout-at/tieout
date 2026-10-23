// Schlussbesprechungs-Blatt (UI-Runde 2, Option C „Belegt, Beleg fehlt, angemeldet“, gewählt von Maxi S. 23.10.).
// Am Schirm drei Spalten wie das Geld auf dem Dashboard, je mit Forderung und Untergrenze; jeder Posten führt zu
// seiner Seite. Gedruckt wird daraus das Blatt für den Termin (Option A): Tabelle mit Forderung, Untergrenze und
// einer leeren Spalte „Ergebnis“. Alle Beträge aus dem Rechenkern (`schlussbesprechung`). Nur für W21.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { excelDaten, firma, postenSlug, projekt, projektBesprechung, schlussrechnungIds, schonBeiAuftraggeber } from "@/daten/demo";
import { KUERZUNGSGRUND_TEXT, type GeldStand } from "@/engine";
import { ExcelKnopf } from "@/ui/Excel";
import { anzahl, betrag } from "@/ui/format";
import { GleicherGrund } from "@/ui/GleicherGrund";
import { teileTitel } from "@/ui/posten-texte";
import { DruckKnopf } from "@/ui/Schlussrechnung";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return schlussrechnungIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `Schlussbesprechung ${d.projekt.kurz}` };
}

const GRUPPE: Record<GeldStand, { titel: string; zeile: string }> = {
  belegt: { titel: "Belegt", zeile: "Liste 1" },
  beleg_fehlt: { titel: "Beleg fehlt", zeile: "Liste 2, ohne Unterschrift" },
  angemeldet: { titel: "Angemeldet", zeile: "Liste 2, nie bepreist" },
};

export default async function Schlussbesprechung({ params }: Props) {
  const id = (await params).projekt;
  const s = projektBesprechung(id);
  if (!s) notFound();
  const { d, e } = projekt(id);
  const { daten } = firma();
  const basis = `/projekte/${id}`;
  const ag = daten.auftraggeber.find((a) => a.id === d.projekt.auftraggeberId);
  const risiko = new Map((e.vorpruefung?.risiken ?? []).filter((r) => r.befundSchluessel && !r.bereitsGekuerzt).map((r) => [r.befundSchluessel!, r]));
  const ausserhalb = e.befunde.filter((b) => b.liste === "anwalt" || b.liste === "verloren");
  const anzahlPosten = s.gruppen.reduce((n, g) => n + g.posten.length, 0);

  return (
    <>
      <Seitenkopf
        pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `${basis}/` }]}
        titel="Schlussbesprechung"
        aktion={
          <span className="sw-row">
            <ExcelKnopf daten={excelDaten(id)!} />
            <DruckKnopf text="Blatt drucken" />
          </span>
        }
      />
      <main className="scr-body bs">
        <section className="bs-kopf">
          <div className="bs-kopf__zahl">
            <span className="label">Forderung</span>
            <span className="bs-kopf__betrag">{betrag(s.forderung)}</span>
            <span className="bs-kopf__ctx">
              Untergrenze <b>{betrag(s.untergrenze)}</b>, Spielraum {betrag(s.spielraum)}
            </span>
          </div>
          <span className="meta sw-muted">
            mit {ag?.name}, {anzahl(anzahlPosten, "Posten", "Posten")}
          </span>
        </section>

        <div className="bs-raster">
          {s.gruppen.map((g) => (
            <section key={g.stand} className={`bs-gruppe bs-gruppe--${g.stand}`} aria-labelledby={`bs-${g.stand}`}>
              <div className="bs-gruppe__kopf">
                <span className="bs-gruppe__zeile1">
                  <h2 id={`bs-${g.stand}`} className="section-title">
                    {GRUPPE[g.stand].titel}
                  </h2>
                  <b>{betrag(g.forderung)}</b>
                </span>
                <span className="bs-gruppe__zeile2">
                  <span>
                    {GRUPPE[g.stand].zeile}, {anzahl(g.posten.length, "Posten", "Posten")}
                  </span>
                  <span>
                    Untergrenze <b>{betrag(g.untergrenze)}</b>
                  </span>
                </span>
              </div>
              <ul className="bs-posten">
                {g.posten.map((p) => {
                  const t = teileTitel(p.titel);
                  const r = risiko.get(p.schluessel);
                  return (
                    <li key={p.schluessel}>
                      <Link href={`${basis}/posten/${postenSlug(p.schluessel)}/`} className="bs-posten__a" title={`Untergrenze: ${p.rechenweg}`}>
                        <span className="bs-posten__zeile">
                          <span className="bs-posten__titel">
                            {t.kennung && <span className="sw-pos-nr">{t.kennung}</span>}
                            <span>{t.text}</span>
                          </span>
                          <b>{betrag(p.forderung)}</b>
                        </span>
                        <span className="bs-posten__zeile bs-posten__klein">
                          <span className={r ? "bs-posten__risiko" : undefined}>{r ? `${KUERZUNGSGRUND_TEXT[r.grund]}, Risiko ${betrag(r.betrag)}` : p.untertitel}</span>
                          <span>ab {betrag(p.untergrenze)}</span>
                        </span>
                        {r && <GleicherGrund treffer={schonBeiAuftraggeber(id, r.grund)} ohneLink />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {ausserhalb.length > 0 && (
          <p className="bs-fuss">
            <b>Nicht in dieser Besprechung</b>
            {ausserhalb.map((b) => (
              <Link key={b.schluessel} href={`${basis}/posten/${postenSlug(b.schluessel)}/`}>
                {b.titel}
                {b.liste === "anwalt" ? ", braucht Anwalt" : `, verloren${b.betrag !== null ? ` ${betrag(b.betrag)}` : ""}`}
              </Link>
            ))}
          </p>
        )}

        {/* Druck (Option A): das Blatt für den Termin, mit leerer Spalte für das Ergebnis */}
        <section className="bs-druck" aria-hidden="true">
          <div className="bs-druck__kopf">
            <div>
              <span className="label">Schlussbesprechung</span>
              <b>
                {d.projekt.name}, {d.projekt.los}
              </b>
              <span>mit {ag?.name}, Termin am ____________, Teilnehmer ____________</span>
            </div>
            <dl>
              <div>
                <dt>Forderung</dt>
                <dd>{betrag(s.forderung)}</dd>
              </div>
              <div>
                <dt>Untergrenze</dt>
                <dd>{betrag(s.untergrenze)}</dd>
              </div>
              <div>
                <dt>Ergebnis</dt>
                <dd>____________</dd>
              </div>
            </dl>
          </div>
          <table>
            <thead>
              <tr>
                <th>Posten</th>
                <th>Beleg</th>
                <th className="r">Forderung</th>
                <th className="r">Untergrenze</th>
                <th>Ergebnis</th>
              </tr>
            </thead>
            <tbody>
              {s.gruppen.map((g) => [
                <tr key={`${g.stand}-k`} className="bs-druck__gruppe">
                  <td colSpan={5}>{GRUPPE[g.stand].titel}</td>
                </tr>,
                ...g.posten.map((p) => {
                  const r = risiko.get(p.schluessel);
                  return (
                    <tr key={p.schluessel}>
                      <td>{p.titel}</td>
                      <td>{r ? KUERZUNGSGRUND_TEXT[r.grund] : p.untertitel}</td>
                      <td className="r">{betrag(p.forderung)}</td>
                      <td className="r">{betrag(p.untergrenze)}</td>
                      <td className="bs-druck__leer" />
                    </tr>
                  );
                }),
              ])}
            </tbody>
          </table>
          {ausserhalb.length > 0 && (
            <p>
              Nicht in dieser Besprechung:{" "}
              {ausserhalb.map((b) => `${b.titel}${b.liste === "anwalt" ? ", braucht Anwalt" : ", verloren"}`).join("; ")}
            </p>
          )}
        </section>
      </main>
    </>
  );
}
