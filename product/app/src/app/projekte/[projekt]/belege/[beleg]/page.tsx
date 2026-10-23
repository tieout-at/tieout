// Ein Beleg im Original (importiertes Dokument oder WhatsApp-Meldung): links die Fakten und die Posten, die ihn
// zitieren, rechts die Seite. Ziel jedes Eintrags der Zeitachse.

import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { postenSlug, firma, projekt, projektIds } from "@/daten/demo";
import { geleseneFelder, type Korrektur } from "@/daten/felder";
import { zitate } from "@/daten/zeitachse";
import type { Datensatz, DokumentArt } from "@/domain/typen";
import type { Beleg } from "@/engine";
import { menge } from "@/engine/geld";
import { ART_TEXT, teileTitel } from "@/ui/posten-texte";
import { AnkerMarke } from "@/ui/AnkerMarke";
import { Belegseite } from "@/ui/Belegseite";
import { betrag, datum, zahl, zeitpunkt } from "@/ui/format";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string; beleg: string }> };

const ART: Record<DokumentArt, string> = {
  vertrag: "Bauvertrag",
  lv: "Leistungsverzeichnis",
  k7: "K7-Blätter",
  aufmass: "Aufmaßblatt",
  regie: "Regiebericht",
  stundenliste: "Stundenliste",
  abschlag: "Abschlagsrechnung",
  zahlung: "Zahlung",
  sr_entwurf: "Schlussrechnung, Entwurf",
  schlussrechnung: "Schlussrechnung",
  nachtrag: "Nachtragsangebot",
  indexblatt: "Indexblatt",
  mail: "Mail",
  foto: "Foto",
  plan: "Plan",
  gu_abzug: "Abzugsschreiben",
  gu_korrektur: "Korrekturblatt",
};

/** Dateiname als Titel: Umbruchstellen nach „_“, damit lange Namen an Wortgrenzen umbrechen. */
function umbrechbar(name: string) {
  return name.split("_").map((teil, i, alle) => (
    <Fragment key={i}>
      {teil}
      {i < alle.length - 1 && (
        <>
          _<wbr />
        </>
      )}
    </Fragment>
  ));
}

/** Korrigiertes Feld lesbar: Bezeichnung aus der Stelle, Wert in seiner Einheit. */
function korrekturText(d: Datensatz, k: Korrektur): { was: string; wert: string; vorher: string; anker?: string } {
  if (k.feld === "menge") {
    const nr = k.stelle.match(/\d\d\.\d\d\.\d\d[A-Z]/)?.[0] ?? k.stelle;
    const einheit = d.lv.find((p) => p.nr.wert === nr)?.einheit.wert;
    return { was: `${nr} Menge`, wert: menge(Number(k.wert), einheit), vorher: menge(Number(k.vorher), einheit), anker: `#pos-${nr}` };
  }
  const was = (k.stelle.split(", ").at(-1) ?? k.feld).replace(/^EXIF /, "");
  if (k.feld.startsWith("stunden")) return { was, wert: menge(Number(k.wert), "h"), vorher: menge(Number(k.vorher), "h") };
  const zeit = (x: number | string) => (String(x).length > 10 ? zeitpunkt(String(x)) : datum(String(x)));
  return { was, wert: zeit(k.wert), vorher: zeit(k.vorher) };
}

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds().flatMap(({ projekt: id }) => {
    const { d } = projekt(id);
    return [...d.dokumente.map((x) => x.id), ...d.zurufe.map((z) => z.id)].map((beleg) => ({ projekt: id, beleg }));
  });
}

function finde(d: Datensatz, id: string) {
  const dok = d.dokumente.find((x) => x.id === id);
  const zuruf = d.zurufe.find((z) => z.id === id);
  if (!dok && !zuruf) notFound();
  return { dok, zuruf };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projekt: id, beleg } = await params;
  const { d } = projekt(id);
  const { dok, zuruf } = finde(d, beleg);
  return { title: `${d.projekt.kurz} ${zuruf ? `WhatsApp-Meldung ${zuruf.nr}` : dok!.dateiname}` };
}

export default async function BelegSeite({ params }: Props) {
  const { projekt: id, beleg: belegId } = await params;
  const { d, e } = projekt(id);
  const { daten } = firma();
  const { dok, zuruf } = finde(d, belegId);
  const beleg: Beleg = { titel: "", text: "", quelle: { dokumentId: belegId, seite: 1 } };
  const kopien = dok ? d.dokumente.filter((x) => x.inhaltHash === dok.inhaltHash).length - 1 : 0;
  const befunde = (zitate(e).get(belegId) ?? []).map((s) => e.befunde.find((b) => b.schluessel === s)!);
  const datei = zuruf ? `WhatsApp ${zuruf.nr}` : dok!.dateiname;
  const felder = geleseneFelder(d, belegId);

  const fakten: [string, string][] = zuruf
    ? [
        ["Art", "WhatsApp-Meldung"],
        ["Kanal", "WhatsApp"],
        ["Absender", zuruf.absender],
        ["Zeitpunkt", zeitpunkt(zuruf.zeitpunkt)],
        ["Bestätigt", zeitpunkt(zuruf.bestaetigt.zeitpunkt)],
      ]
    : [
        ["Art", ART[dok!.art]],
        ["Kanal", dok!.kanal === "whatsapp" ? "WhatsApp" : "Import"],
        ["Datum", datum(dok!.datum)],
        ["Seiten", String(dok!.seiten)],
        ...(kopien > 0 ? ([["Duplikate", `${kopien} zusammengeführt`]] as [string, string][]) : []),
      ];

  return (
    <>
      <Seitenkopf
        pfad={[
          { text: daten.firma.name, href: "/" },
          { text: d.projekt.kurz, href: `/projekte/${id}/` },
          { text: "Belege", href: `/projekte/${id}/belege/` },
        ]}
        titel={zuruf ? `WhatsApp-Meldung ${zuruf.nr}` : ART[dok!.art]}
        zurueck={`/projekte/${id}/belege/`}
      />
      <div className="split">
        <div className="split-left">
          <div className="split-scroll">
            <div className="fhead">
              <h2 className="page-title">{zuruf ? zuruf.taetigkeit.wert : umbrechbar(datei)}</h2>
            </div>
            <div className="kv">
              {fakten.map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            {felder.gelesen > 0 && (
              <section className="sw-stack" aria-label="Eingelesen">
                <span className="label">Eingelesen</span>
                <div className="kv">
                  <div>
                    <span>{felder.gelesen === 1 ? "1 Feld" : `${zahl(felder.gelesen)} Felder`}</span>
                    <b>{felder.korrekturen.length === 0 ? "maschinell gelesen" : `davon ${felder.korrekturen.length} korrigiert`}</b>
                  </div>
                  {felder.korrekturen.map((k) => {
                    const t = korrekturText(d, k);
                    return (
                      <div key={`${k.feld}-${k.stelle}`} className="beleg-korrektur">
                        <span>{t.anker ? <a href={t.anker}>{t.was}</a> : t.was}</span>
                        <b>
                          {t.wert}
                          <span className="beleg-korrektur__vorher">von Hand korrigiert, vorher {t.vorher}</span>
                        </b>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            {befunde.length > 0 && (
              <section className="sw-stack" aria-label="Zitiert in">
                <span className="label">Zitiert in {befunde.length}</span>
                <div className="kv">
                  {befunde.map((b) => {
                    const t = teileTitel(b.titel);
                    return (
                      <Link key={b.schluessel} href={`/projekte/${id}/posten/${postenSlug(b.schluessel)}/`}>
                        <span>
                          {t.kennung && <span className="sw-pos-nr">{t.kennung}</span>}
                          {t.kennung ? t.text : ART_TEXT[b.art]}
                        </span>
                        <b>{b.betrag !== null ? betrag(b.betrag) : ""}</b>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
        <div className="split-right">
          <div className="sw-viewer">
            <div className="sw-viewer__bar">
              <span className="sw-viewer__file" title={datei}>
                {datei}
              </span>
            </div>
            <div className="sw-viewer__body beleg-body">
              <div className="sw-viewer__canvas">
                <div className="doc-zoom">
                  <Belegseite d={d} beleg={beleg} ganz />
                  <AnkerMarke />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
