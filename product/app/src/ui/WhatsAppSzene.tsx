"use client";

// Zuruf-Szene (Mock, kein echter Agent, keine echte Nummer): Der Monteur schickt Foto und Sprachnachricht, der Agent
// fasst zusammen, ein Tipp auf „Ja“ bestätigt, und der Eintrag erscheint in der Zeitachse. Inhalte aus dem Zuruf des
// Datensatzes. Vorlage: Chat-Ansicht eines Messengers, neutral gehalten (keine fremde Marke). Sicht des Monteurs:
// seine Nachrichten rechts, der Agent links, gleich wie auf der Belegseite des Zurufs.

import { Check, Mic, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Ico } from "./Ico";

export interface SzeneMeldung {
  id: string;
  nr: string;
  absender: string;
  /** „08.09.2026“: sichtbar als Tagesmarke, damit Chat, Zeitachse und Stichtag zusammenpassen. */
  datum: string;
  uhrzeit: string;
  /** Uhrzeit der Bestätigung („Ja“). */
  uhrzeitJa: string;
  foto: boolean;
  transkript: string;
  zusammenfassung: string;
}

// Takt der Szene in Millisekunden: Foto, Sprachnachricht, Transkript, Agent schreibt, Zusammenfassung.
const TAKT = [300, 1100, 2300, 3000, 4300];

// Wellenform der Sprachnachricht (feste Höhen, damit Server und Browser dasselbe zeichnen).
const WELLE = [5, 9, 14, 8, 16, 11, 6, 13, 18, 10, 7, 15, 12, 5, 9, 17, 11, 8, 14, 6, 10, 16, 9, 5, 12, 8];

export function WhatsAppSzene({ z, onJa, onZu }: { z: SzeneMeldung; onJa: () => void; onZu: () => void }) {
  // Ohne Bewegung (Systemeinstellung) steht alles sofort da. Die Szene öffnet erst nach einem Klick, also im Browser.
  const [ruhig] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [schritt, setSchritt] = useState(ruhig ? TAKT.length : 0);
  const [bestaetigt, setBestaetigt] = useState(false);
  const verlauf = useRef<HTMLDivElement>(null);
  const schliessen = useRef<HTMLButtonElement>(null);
  const uhrJa = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fokus in die Szene; Timer nach „Ja“ beim Schließen abräumen.
  useEffect(() => {
    schliessen.current?.focus();
    return () => {
      if (uhrJa.current) clearTimeout(uhrJa.current);
    };
  }, []);

  useEffect(() => {
    if (ruhig) return;
    const uhren = TAKT.map((ms, i) => setTimeout(() => setSchritt(i + 1), ms));
    return () => uhren.forEach(clearTimeout);
  }, [ruhig]);

  useEffect(() => {
    verlauf.current?.scrollTo({ top: verlauf.current.scrollHeight, behavior: "smooth" });
  }, [schritt, bestaetigt]);

  useEffect(() => {
    const taste = (ev: KeyboardEvent) => ev.key === "Escape" && onZu();
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [onZu]);

  const ja = () => {
    setBestaetigt(true);
    uhrJa.current = setTimeout(onJa, 900);
  };

  return (
    <div className="szene" role="dialog" aria-modal="false" aria-label={`WhatsApp-Meldung ${z.nr}, vorgespielt`}>
      <div className="szene__kopf">
        <span className="szene__avatar" aria-hidden="true">
          S
        </span>
        <span className="szene__wer">
          <b>WhatsApp-Agent</b>
          <span>{schritt === 4 ? "schreibt …" : "Vorgespielt"}</span>
        </span>
        <button ref={schliessen} type="button" className="sw-btn sw-btn--ghost sw-btn--sm" aria-label="Szene schließen" onClick={onZu}>
          <Ico icon={X} />
        </button>
      </div>
      <div className="szene__verlauf" ref={verlauf} aria-live="polite">
        <span className="szene__tag">{z.datum}</span>
        {schritt >= 1 && z.foto && (
          <div className="szene__msg szene__msg--aus szene__msg--neu">
            <div className="sw-photo">
              <span>Foto (synthetisch)</span>
            </div>
            <span className="chat__zeit">{z.uhrzeit}</span>
          </div>
        )}
        {schritt >= 2 && (
          <div className="szene__msg szene__msg--aus szene__msg--neu">
            <span className="szene__sprache">
              <Ico icon={Play} />
              <svg viewBox="0 0 130 20" aria-hidden="true">
                {WELLE.map((h, i) => (
                  <rect key={i} x={i * 5} y={10 - h / 2} width="2.5" height={h} rx="1" />
                ))}
              </svg>
              <span>0:14</span>
            </span>
            {schritt >= 3 && <span className="szene__transkript">„{z.transkript}“</span>}
            <span className="chat__zeit">{z.uhrzeit}</span>
          </div>
        )}
        {schritt === 4 && (
          <div className="szene__msg szene__msg--ein szene__tippt" aria-label="Agent schreibt">
            <i />
            <i />
            <i />
          </div>
        )}
        {schritt >= 5 && (
          <div className="szene__msg szene__msg--ein szene__msg--neu">
            <span>Danke. So habe ich es verstanden: {z.zusammenfassung} Stimmt das?</span>
            <span className="chat__zeit">{z.uhrzeit}</span>
          </div>
        )}
        {bestaetigt && (
          <>
            <div className="szene__msg szene__msg--aus szene__msg--kurz szene__msg--neu">
              Ja<span className="chat__zeit">{z.uhrzeitJa}</span>
            </div>
            <div className="szene__msg szene__msg--ein szene__msg--neu">
              <span>Gespeichert.</span>
            </div>
          </>
        )}
      </div>
      <div className="szene__eingabe">
        {schritt >= 5 && !bestaetigt ? (
          <>
            <button type="button" className="sw-btn sw-btn--primary" onClick={ja} autoFocus>
              <Ico icon={Check} />
              Ja
            </button>
            <button type="button" className="sw-btn" disabled title="In der Demo nur Ja">
              Ändern
            </button>
          </>
        ) : (
          <span className="szene__feld">
            <Ico icon={Mic} />
            Nachricht
          </span>
        )}
      </div>
    </div>
  );
}
