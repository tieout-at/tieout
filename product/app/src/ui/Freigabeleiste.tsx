"use client";

// Freigabeleiste (Vorlage: Linear-Triage 1/2/3/H, reebuild-Freigabe: Stufen mit Rolle und Zeit, Attio-Verlauf).
// Stufe 1 Prüfung (M): Übernehmen 1, Verwerfen 2 mit Grund, Braucht Anwalt 3, Zurückstellen H.
// Stufe 2 Insider (I): Freigeben F, Zurück an Prüfung. Jede Entscheidung ist ein Eintrag; Rückgängig im Toast.
// Schutz gegen Doppelklick: jede Stufe hat eigene Knöpfe (key), Mehrfachklicks (detail > 1) zählen nicht.

import { useEffect, useRef, useState } from "react";
import type { Liste } from "@/engine/typen";
import { GRUENDE_VERWERFEN, ROLLE_FUER, schritte, standAus, type Aktion, type Eintrag } from "@/zustand/freigabe";
import { eintragen, rueckgaengig, useVerlauf } from "@/zustand/speicher";
import { StandMarke } from "./Stand";
import { zeigeToast } from "./Toast";

const WORT: Record<Aktion, string> = {
  uebernehmen: "Übernommen",
  freigeben: "Freigegeben",
  verwerfen: "Verworfen",
  anwalt: "Braucht Anwalt",
  zurueckstellen: "Zurückgestellt",
  zurueck: "Zurück an Prüfung",
  oeffnen: "Wieder geöffnet",
};

function uhrzeit(iso: string): string {
  const d = new Date(iso);
  const zwei = (n: number) => String(n).padStart(2, "0");
  return `${zwei(d.getDate())}.${zwei(d.getMonth() + 1)}.${d.getFullYear()}, ${zwei(d.getHours())}:${zwei(d.getMinutes())}`;
}

/** Klick nur einmal werten: der zweite Klick eines Doppelklicks trifft sonst den Knopf der nächsten Stufe. */
const einmal = (fn: () => void) => (ev: React.MouseEvent) => {
  if (ev.detail > 1) return;
  fn();
};

/** Ein Schritt im Verlauf: Rolle, Zeit, Grund. Das Wort nur, wenn es nicht schon im Stand davor steht. */
function Schritt({ e, wort = false }: { e: Eintrag; wort?: boolean }) {
  return (
    <span className="sw-decide__step">
      <span className="sw-person">
        <span className="sw-avatar">{e.rolle}</span>
        {wort && WORT[e.aktion]}
      </span>
      <span className="sw-num">{uhrzeit(e.zeit)}</span>
      {e.grund && <span>{e.grund}</span>}
    </span>
  );
}

export function Freigabeleiste({ projektId, schluessel, liste, titel }: { projektId: string; schluessel: string; liste: Liste; titel: string }) {
  const verlauf = useVerlauf(projektId);
  const stand = standAus(verlauf, schluessel, liste);
  const eigene = schritte(verlauf, schluessel);
  const uebernahme = [...eigene].reverse().find((e) => e.aktion === "uebernehmen");
  const letzter = eigene.at(-1);
  const [gruende, setGruende] = useState(false);
  const [nachEntscheidung, setNachEntscheidung] = useState(false);
  const knoepfe = useRef<HTMLDivElement>(null);

  const entscheiden = (aktion: Aktion, grund?: string) => {
    const e: Eintrag = { schluessel, aktion, rolle: ROLLE_FUER[aktion], zeit: new Date().toISOString(), ...(grund ? { grund } : {}) };
    eintragen(projektId, e);
    setGruende(false);
    setNachEntscheidung(true);
    zeigeToast(`${WORT[aktion]}: ${titel}`, () => rueckgaengig(projektId, e));
  };

  // Nach einer Entscheidung oder beim Öffnen der Gründe den Fokus auf die nächste Aktion setzen.
  useEffect(() => {
    if (!nachEntscheidung && !gruende) return;
    knoepfe.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [stand, gruende, nachEntscheidung]);

  useEffect(() => {
    const taste = (ev: KeyboardEvent) => {
      if (ev.ctrlKey || ev.altKey || ev.metaKey || ev.repeat) return;
      if (ev.target instanceof Element && ev.target.closest("input, textarea, select")) return;
      const k = ev.key.toLowerCase();
      if (gruende) {
        if (k === "escape") setGruende(false);
        return;
      }
      if (liste === "anwalt") return;
      if (stand === "pruefen" || stand === "zurueckgestellt") {
        if (k === "1") entscheiden("uebernehmen");
        else if (k === "2") setGruende(true);
        else if (k === "3") entscheiden("anwalt");
        else if (k === "h" && stand === "pruefen") entscheiden("zurueckstellen");
      } else if (stand === "uebernommen" && k === "f") entscheiden("freigeben");
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });

  let inhalt: React.ReactNode = null;
  if (liste === "anwalt") {
    inhalt = null;
  } else if (gruende) {
    inhalt = (
      <div key="gruende" className="sw-reasons" role="group" aria-label="Grund für Verwerfen">
        {GRUENDE_VERWERFEN.map((g) => (
          <button key={g} type="button" className="sw-reason" onClick={einmal(() => entscheiden("verwerfen", g))}>
            {g}
          </button>
        ))}
        <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" onClick={() => setGruende(false)}>
          Abbrechen <span className="sw-kbd">Esc</span>
        </button>
      </div>
    );
  } else if (stand === "pruefen" || stand === "zurueckgestellt") {
    inhalt = (
      <div key="stufe1" className="sw-row">
        <button type="button" className="sw-btn sw-btn--primary sw-btn--sm" title="Übernehmen (Taste 1)" onClick={einmal(() => entscheiden("uebernehmen"))}>
          Übernehmen
        </button>
        <button type="button" className="sw-btn sw-btn--sm" title="Verwerfen (Taste 2)" onClick={einmal(() => setGruende(true))}>
          Verwerfen
        </button>
        <button type="button" className="sw-btn sw-btn--sm" title="Braucht Anwalt (Taste 3)" onClick={einmal(() => entscheiden("anwalt"))}>
          Braucht Anwalt
        </button>
        {stand === "pruefen" && (
          <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" title="Zurückstellen (Taste H)" onClick={einmal(() => entscheiden("zurueckstellen"))}>
            Zurückstellen
          </button>
        )}
      </div>
    );
  } else if (stand === "uebernommen") {
    // Freigeben steht bewusst nicht an der Stelle von Übernehmen (Schutz gegen versehentliche zweite Stufe).
    inhalt = (
      <div key="stufe2" className="sw-row">
        <button type="button" className="sw-btn sw-btn--sm" onClick={einmal(() => entscheiden("zurueck"))}>
          Zurück an Prüfung
        </button>
        <button type="button" className="sw-btn sw-btn--primary sw-btn--sm" title="Freigeben als Insider (Taste F)" onClick={einmal(() => entscheiden("freigeben"))}>
          Freigeben als Insider
        </button>
      </div>
    );
  } else {
    inhalt = (
      <div key="fertig" className="sw-row">
        <button type="button" className="sw-btn sw-btn--sm" onClick={einmal(() => entscheiden("oeffnen"))}>
          Wieder öffnen
        </button>
      </div>
    );
  }

  return (
    <div className="sw-decide">
      <div ref={knoepfe}>{inhalt}</div>
      <div className="sw-decide__line">
        <StandMarke stand={stand} />
        {stand === "freigegeben" && uebernahme && <Schritt e={uebernahme} wort />}
        {/* „Prüfen“ sagt schon, dass nichts entschieden ist: kein zweiter Satz dazu. */}
        {letzter && stand !== "pruefen" && <Schritt e={letzter} />}
      </div>
    </div>
  );
}
