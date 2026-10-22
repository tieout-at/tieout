"use client";

// Toast (Vorlage: Linear, Playbook „Rückgängig statt Bestätigungsdialog“): ein Satz, Rückgängig, nach 5 Sekunden weg.

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

  useEffect(() => {
    melden = setM;
    return () => {
      melden = null;
    };
  }, []);

  useEffect(() => {
    if (!m) return;
    const t = setTimeout(() => setM(null), 5000);
    return () => clearTimeout(t);
  }, [m]);

  if (!m) return null;
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <div className="sw-toast">
        <span>{m.text}</span>
        {m.rueckgaengig && (
          <button
            type="button"
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
