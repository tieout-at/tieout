"use client";

// Echter Chat gegen den Zuruf-Agenten (Schalter ZURUF_ECHT an). Gleiche Hülle wie die vorgespielte Szene: Monteur
// rechts, Agent links. Der Server merkt sich nichts; der Gesprächsstand liegt im Browser und geht bei jeder Nachricht mit.
// Gespeicherte Einträge landen je Projekt in der Ablage (zustand/zurufe.ts), nie im Rechenkern.

import { RotateCcw, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Knopf, Leistungsereignis, Nachricht } from "../../../zuruf/src/typen";
import { ZURUF_URL } from "@/zuruf/schalter";
import { alsZeile, browserAblage, chatLesen, chatSchreiben, useChat, type ChatZeile, type ZurufRoutenAntwort } from "@/zustand/zurufe";
import { neueZurufId } from "@/zuruf/abbildung";
import { Ico } from "./Ico";

/** Ein Absender je Browser; der Agent kennt ihn nur als Kennung und Rolle (§ 96a ArbVG: keine Namen). */
const ABSENDER = "demo-monteur";

function kennung(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Uhrzeit in Wien, wie die Zeitachse (der Server legt die Zeit in Wiener Ortszeit ab). */
function uhrzeit(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vienna" });
}

export function ZurufChat({
  projektId,
  demoAnzahl,
  kurz,
  onNeu,
  onZu,
}: {
  projektId: string;
  /** Zurufe der Demo je Projekt: neue Nummern laufen danach weiter (W21: Z7). */
  demoAnzahl: Record<string, number>;
  kurz: Record<string, string>;
  /** Ein neuer Zuruf liegt in einem Projekt (Kennung des App-Zurufs, Nummer, Projekt). */
  onNeu: (zurufId: string, nr: string, projekt: string) => void;
  onZu: () => void;
}) {
  const chat = useChat();
  const [wartet, setWartet] = useState(false);
  const [text, setText] = useState("");
  const verlauf = useRef<HTMLDivElement>(null);
  const feld = useRef<HTMLInputElement>(null);

  useEffect(() => {
    feld.current?.focus();
  }, []);

  useEffect(() => {
    verlauf.current?.scrollTo({ top: verlauf.current.scrollHeight, behavior: "smooth" });
  }, [chat.zeilen.length, wartet]);

  useEffect(() => {
    const taste = (ev: KeyboardEvent) => ev.key === "Escape" && onZu();
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [onZu]);

  const ablegen = (neu: Leistungsereignis[], nachrichten: Nachricht[]) => {
    for (const e of neu) {
      const projekt = e.eintrag.projektId?.wert;
      if (!projekt) continue;
      const liste = browserAblage.anhaengen(projekt, [e], nachrichten, demoAnzahl[projekt] ?? 0);
      const z = liste.find((x) => x.ereignis.id === e.id);
      if (z) onNeu(neueZurufId(e.id), z.nr, projekt);
    }
  };

  const senden = async (inhalt: string, knopf?: Knopf) => {
    if (wartet || !inhalt.trim()) return;
    const vorher = chatLesen();
    const jetzt = new Date().toISOString();
    const n: Nachricht = { id: kennung(), absenderId: ABSENDER, zeit: jetzt, art: knopf ? "knopf" : "text", inhalt: inhalt.trim(), knopfId: knopf?.id };
    const eigene: ChatZeile = { von: "absender", text: n.inhalt, zeit: jetzt };
    chatSchreiben({ ...vorher, zeilen: [...vorher.zeilen.map((z) => ({ ...z, knoepfe: undefined })), eigene] });
    setText("");
    setWartet(true);
    try {
      const r = await fetch(ZURUF_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stand: vorher.stand, nachrichten: [n], rolle: "monteur" }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const daten = (await r.json()) as ZurufRoutenAntwort;
      const zeit = new Date().toISOString();
      const aktuell = chatLesen();
      chatSchreiben({ stand: daten.stand, zeilen: [...aktuell.zeilen, ...daten.antworten.map((a) => alsZeile(a, zeit))] });
      ablegen(daten.neu, daten.stand.nachrichten);
    } catch {
      const aktuell = chatLesen();
      chatSchreiben({ ...aktuell, zeilen: [...aktuell.zeilen, { von: "agent", text: "Keine Verbindung zum Agenten. Bitte gleich noch einmal.", zeit: jetzt }] });
    } finally {
      setWartet(false);
      feld.current?.focus();
    }
  };

  const letzte = chat.zeilen.at(-1);
  return (
    <div className="szene" role="dialog" aria-modal="false" aria-label="Zuruf per WhatsApp, echter Agent">
      <div className="szene__kopf">
        <span className="szene__avatar" aria-hidden="true">
          S
        </span>
        <span className="szene__wer">
          <b>Zuruf-Agent</b>
          <span>{wartet ? "schreibt …" : `Synthetisch, ${kurz[projektId] ?? ""}`}</span>
        </span>
        <span className="szene__aktionen">
          <button
            type="button"
            className="sw-btn sw-btn--ghost sw-btn--sm"
            aria-label="Gespräch neu beginnen"
            title="Gespräch neu beginnen"
            disabled={wartet || chat.zeilen.length === 0}
            onClick={() => chatSchreiben(null)}
          >
            <Ico icon={RotateCcw} />
          </button>
          <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" aria-label="Chat schließen" onClick={onZu}>
            <Ico icon={X} />
          </button>
        </span>
      </div>
      <div className="szene__verlauf" ref={verlauf} aria-live="polite">
        {chat.zeilen.length === 0 && <span className="szene__tag">Schreib, was du gemacht hast, wie auf der Baustelle.</span>}
        {chat.zeilen.map((z, i) => (
          <div key={i} className={z.von === "absender" ? "szene__msg szene__msg--aus" : "szene__msg szene__msg--ein"}>
            <span className="szene__text">{z.text}</span>
            <span className="chat__zeit">{uhrzeit(z.zeit)}</span>
          </div>
        ))}
        {wartet && (
          <div className="szene__msg szene__msg--ein szene__tippt" aria-label="Agent schreibt">
            <i />
            <i />
            <i />
          </div>
        )}
        {!wartet && letzte?.von === "agent" && letzte.knoepfe?.length ? (
          <div className="szene__knoepfe">
            {letzte.knoepfe.map((k) => (
              <button key={k.id} type="button" className="sw-btn sw-btn--sm" onClick={() => senden(k.titel, k)}>
                {k.titel}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <form
        className="szene__eingabe"
        onSubmit={(ev) => {
          ev.preventDefault();
          void senden(text);
        }}
      >
        <input
          ref={feld}
          className="szene__input"
          value={text}
          onChange={(ev) => setText(ev.target.value)}
          placeholder="Nachricht"
          aria-label="Nachricht"
          maxLength={1000}
          disabled={wartet}
        />
        <button type="submit" className="sw-btn sw-btn--primary szene__senden" aria-label="Senden" disabled={wartet || !text.trim()}>
          <Ico icon={Send} />
        </button>
      </form>
    </div>
  );
}
