"use client";

// Freigabeleiste (Vorlage: Linear-Triage 1/2/3/H, reebuild-Freigabe: Stufen mit Rolle und Zeit, Attio-Verlauf).
// Stufe 1 Prüfung (M): Übernehmen 1, Verwerfen 2 mit Grund, Braucht Anwalt 3, Zurückstellen H.
// Stufe 2 Insider (I): Freigeben F, Zurück an Prüfung. Jede Entscheidung ist ein Eintrag; Rückgängig im Toast.

import { useEffect, useState } from "react";
import type { Liste } from "@/engine/typen";
import { GRUENDE_VERWERFEN, ROLLE_FUER, ROLLE_TEXT, schritte, standAus, type Aktion } from "@/zustand/freigabe";
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

export function Freigabeleiste({ projektId, schluessel, liste, titel }: { projektId: string; schluessel: string; liste: Liste; titel: string }) {
  const verlauf = useVerlauf(projektId);
  const stand = standAus(verlauf, schluessel, liste);
  const letzter = schritte(verlauf, schluessel).at(-1);
  const [gruende, setGruende] = useState(false);

  const entscheiden = (aktion: Aktion, grund?: string) => {
    eintragen(projektId, { schluessel, aktion, rolle: ROLLE_FUER[aktion], zeit: new Date().toISOString(), ...(grund ? { grund } : {}) });
    setGruende(false);
    zeigeToast(`${WORT[aktion]}: ${titel}`, () => rueckgaengig(projektId));
  };

  useEffect(() => {
    const taste = (ev: KeyboardEvent) => {
      if (ev.ctrlKey || ev.altKey || ev.metaKey || ev.repeat) return;
      if (ev.target instanceof Element && ev.target.closest("input, textarea, select")) return;
      const k = ev.key.toLowerCase();
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

  let knoepfe: React.ReactNode = null;
  if (liste === "anwalt") {
    knoepfe = null;
  } else if (stand === "freigegeben" || stand === "verworfen" || stand === "anwalt") {
    knoepfe = (
      <div className="sw-row">
        <button type="button" className="sw-btn sw-btn--sm" onClick={() => entscheiden("oeffnen")}>
          Wieder öffnen
        </button>
      </div>
    );
  } else if ((stand === "pruefen" || stand === "zurueckgestellt") && gruende) {
    knoepfe = (
      <div className="sw-reasons" role="group" aria-label="Grund für Verwerfen">
        {GRUENDE_VERWERFEN.map((g) => (
          <button key={g} type="button" className="sw-reason" onClick={() => entscheiden("verwerfen", g)}>
            {g}
          </button>
        ))}
        <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" onClick={() => setGruende(false)}>
          Abbrechen
        </button>
      </div>
    );
  } else if (stand === "pruefen" || stand === "zurueckgestellt") {
    knoepfe = (
      <div className="sw-row">
        <button type="button" className="sw-btn sw-btn--primary sw-btn--sm" onClick={() => entscheiden("uebernehmen")}>
          Übernehmen <span className="sw-kbd">1</span>
        </button>
        <button type="button" className="sw-btn sw-btn--sm" onClick={() => setGruende(true)}>
          Verwerfen <span className="sw-kbd">2</span>
        </button>
        <button type="button" className="sw-btn sw-btn--sm" onClick={() => entscheiden("anwalt")}>
          Braucht Anwalt <span className="sw-kbd">3</span>
        </button>
        {stand === "pruefen" && (
          <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" onClick={() => entscheiden("zurueckstellen")}>
            Zurückstellen <span className="sw-kbd">H</span>
          </button>
        )}
      </div>
    );
  } else if (stand === "uebernommen") {
    knoepfe = (
      <div className="sw-row">
        <button type="button" className="sw-btn sw-btn--primary sw-btn--sm" onClick={() => entscheiden("freigeben")}>
          Freigeben als Insider <span className="sw-kbd">F</span>
        </button>
        <button type="button" className="sw-btn sw-btn--sm" onClick={() => entscheiden("zurueck")}>
          Zurück an Prüfung
        </button>
      </div>
    );
  }

  return (
    <div className="sw-decide">
      {knoepfe}
      <div className="sw-decide__line">
        <StandMarke stand={stand} />
        {letzter ? (
          <>
            <span className="sw-person">
              <span className="sw-avatar">{letzter.rolle}</span>
              {ROLLE_TEXT[letzter.rolle]}
            </span>
            <span className="sw-num">{uhrzeit(letzter.zeit)}</span>
            {letzter.grund && <span>Grund: {letzter.grund}</span>}
          </>
        ) : (
          liste !== "anwalt" && <span>Noch nicht entschieden</span>
        )}
      </div>
    </div>
  );
}
