"use client";

// Arbeitsfläche eines Befunds: links Befund, Rechenweg und Beweiskette, unten die Freigabe; rechts das Original.
// Vorlagen: Beweiskette Linear-Aktivität und Payapps-Verlauf; Betrachter Kuro K-A (Original mit Markierung,
// Seitenminiaturen), Rossum. Ein Klick auf einen Beleg der Kette öffnet ihn rechts.

import { ChevronLeft, ChevronRight, FileText, Image as Bild, Mail, Map as Karte, MessageCircle, Ruler, Table, ZoomIn, ZoomOut, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Ico } from "./Ico";

export type BelegTyp = "lv" | "plan" | "mail" | "foto" | "aufmass" | "tabelle" | "zuruf" | "sonst";

export interface BelegAnsicht {
  key: string;
  titel: string;
  text: string;
  datum: string | null;
  datei: string;
  seite: number;
  seiten: number;
  /** Kurzname unter der Miniatur, z. B. „Plan D“. */
  kurz: string;
  typ: BelegTyp;
  seiteInhalt: React.ReactNode;
}

const SYMBOL: Record<BelegTyp, LucideIcon> = {
  lv: Table,
  plan: Karte,
  mail: Mail,
  foto: Bild,
  aufmass: Ruler,
  tabelle: Table,
  zuruf: MessageCircle,
  sonst: FileText,
};

const ZOOM = [80, 90, 100, 110, 125, 150];

export function Postenflaeche({ kopf, belege, freigabe, start = 0 }: { kopf: React.ReactNode; belege: BelegAnsicht[]; freigabe: React.ReactNode; start?: number }) {
  const [aktiv, setAktiv] = useState(start);
  const [zoom, setZoom] = useState(2);
  const betrachter = useRef<HTMLDivElement>(null);
  const b = belege[aktiv];

  const waehlen = (i: number) => {
    setAktiv(i);
    // Auf schmalen Bildschirmen liegt das Original unter der Kette: dorthin springen.
    if (window.innerWidth <= 900) betrachter.current?.scrollIntoView({ block: "start" });
  };

  return (
    <div className="split">
      <div className="split-left">
        <div className="split-scroll">
          {kopf}
          <section className="sw-stack" aria-label="Beweiskette">
            <span className="label">Beweiskette {belege.length}</span>
            <div className="sw-chain">
              {belege.map((x, i) => (
                <div key={x.key} className="sw-ev" aria-current={i === aktiv ? "true" : undefined} onClick={() => waehlen(i)}>
                  <span className="sw-ev__date">{x.datum ?? ""}</span>
                  <span className="sw-ev__rail" />
                  <div className="sw-ev__body">
                    <b>{x.titel}</b>
                    <span>{x.text}</span>
                    <button
                      type="button"
                      className="sw-source"
                      aria-pressed={i === aktiv}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        waehlen(i);
                      }}
                    >
                      <Ico icon={SYMBOL[x.typ]} />
                      {x.datei}
                      {x.seiten > 1 ? `, S. ${x.seite}` : ""}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        {freigabe}
      </div>
      <div className="split-right" ref={betrachter}>
        <div className="sw-viewer">
          <div className="sw-viewer__bar">
            <span className="sw-viewer__file" title={b.datei}>
              {b.datei}
              <span className="sw-muted">{b.seiten > 1 ? `, S. ${b.seite} / ${b.seiten}` : ""}</span>
            </span>
            <div className="sw-viewer__tools">
              <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" aria-label="Voriger Beleg" disabled={aktiv === 0} onClick={() => setAktiv(aktiv - 1)}>
                <Ico icon={ChevronLeft} />
              </button>
              <span className="sw-num">
                Beleg {aktiv + 1} von {belege.length}
              </span>
              <button
                type="button"
                className="sw-btn sw-btn--ghost sw-btn--sm"
                aria-label="Nächster Beleg"
                disabled={aktiv === belege.length - 1}
                onClick={() => setAktiv(aktiv + 1)}
              >
                <Ico icon={ChevronRight} />
              </button>
              <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" aria-label="Verkleinern" disabled={zoom === 0} onClick={() => setZoom(zoom - 1)}>
                <Ico icon={ZoomOut} />
              </button>
              <span className="zoom">{ZOOM[zoom]} %</span>
              <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" aria-label="Vergrößern" disabled={zoom === ZOOM.length - 1} onClick={() => setZoom(zoom + 1)}>
                <Ico icon={ZoomIn} />
              </button>
            </div>
          </div>
          <div className="sw-viewer__body">
            <div className="sw-viewer__canvas">
              <div className={`doc-zoom doc-zoom--${ZOOM[zoom]}`}>{b.seiteInhalt}</div>
            </div>
            <div className="sw-viewer__rail">
              {belege.map((x, i) => (
                <button
                  key={x.key}
                  type="button"
                  className="sw-thumb"
                  aria-current={i === aktiv ? "true" : undefined}
                  aria-label={`Beleg ${i + 1} von ${belege.length}, ${x.kurz}`}
                  onClick={() => setAktiv(i)}
                >
                  <span className="sw-thumb__page" aria-hidden="true">
                    {x.seiteInhalt}
                  </span>
                  <span aria-hidden="true">{x.kurz}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
