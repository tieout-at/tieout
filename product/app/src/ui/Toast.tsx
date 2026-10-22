"use client";

// Toast (Vorlage: Linear, Playbook „Rückgängig statt Bestätigungsdialog“): ein Satz, Rückgängig, nach 5 Sekunden weg.
// Hält an, solange Maus oder Fokus darauf liegen; Strg+Z (Cmd+Z) löst Rückgängig aus, solange er sichtbar ist.

import { Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Ico } from "./Ico";

interface Meldung {
  id: number;
  text: string;
  rueckgaengig?: () => void;
}

let melden: ((m: Meldung) => void) | null = null;
let zaehler = 0;

export function zeigeToast(text: string, rueckgaengig?: () => void) {
  melden?.({ id: ++zaehler, text, rueckgaengig });
}

export function ToastBereich() {
  const [m, setM] = useState<Meldung | null>(null);
  const [angehalten, setAngehalten] = useState(false);

  useEffect(() => {
    melden = setM;
    return () => {
      melden = null;
    };
  }, []);

  useEffect(() => {
    if (!m || angehalten) return;
    const t = setTimeout(() => setM(null), 5000);
    return () => clearTimeout(t);
  }, [m, angehalten]);

  useEffect(() => {
    if (!m?.rueckgaengig) return;
    const taste = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && ev.key.toLowerCase() === "z") {
        ev.preventDefault();
        m.rueckgaengig?.();
        setM(null);
      }
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [m]);

  if (!m) return null;
  return (
    <div
      className="toast-wrap"
      role="status"
      aria-live="polite"
      onMouseEnter={() => setAngehalten(true)}
      onMouseLeave={() => setAngehalten(false)}
      onFocus={() => setAngehalten(true)}
      onBlur={() => setAngehalten(false)}
    >
      <div className="sw-toast">
        <span>{m.text}</span>
        {m.rueckgaengig && (
          <button
            type="button"
            title="Rückgängig (Strg+Z)"
            onClick={() => {
              m.rueckgaengig?.();
              setM(null);
            }}
          >
            <Ico icon={Undo2} />
            Rückgängig
          </button>
        )}
      </div>
    </div>
  );
}
