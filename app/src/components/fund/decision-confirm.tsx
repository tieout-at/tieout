"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Move } from "@/lib/decisions";

export const field =
  "w-full rounded-md bg-surface px-2 py-1.5 text-sm shadow-[inset_0_0_0_1px_var(--color-line)] outline-none focus-visible:shadow-[inset_0_0_0_1px_var(--color-accent)] max-md:text-base";

/**
 * The confirmation of one decision on one find, the same on the find page (in the decision bar's popup) and on the
 * board (after a card was moved): what happens, who it is noted as, what is still open before a release, and for
 * "Nicht verrechnen" a required reason. Nothing is recorded until it is confirmed here.
 */
export function DecisionConfirm({
  move,
  amount,
  open,
  subject,
  title: Title,
  onConfirm,
  onCancel,
}: {
  move: Move;
  amount: string;
  /** What is still open on the find, shown before it is released: the risk, the remedy and the tasks. */
  open: string[];
  /** The find, named on the board where the page does not say it ("F1 14 Wohnungen Typ C: …"). */
  subject?: string;
  /** The heading element of the surrounding popup or dialog, so it names the popup for screen readers. */
  title: React.ComponentType<{ className?: string; children: React.ReactNode }>;
  onConfirm: (grund?: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const about = subject && <p className="line-clamp-2 text-xs text-fg">{subject}</p>;

  if (move.stand === "nicht_verrechnen") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (reason.trim()) onConfirm(reason.trim());
        }}
        className="flex flex-col gap-2"
      >
        <Title className="p-0 text-sm text-fg">Nicht verrechnen</Title>
        {about}
        <label className="flex flex-col gap-1 text-xs text-fg-secondary">
          Grund
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required placeholder="Zum Beispiel: schon mit einem Nachtrag verrechnet" className={field} />
        </label>
        <p className="text-xs text-fg-muted">Vermerkt als {move.wer}, bis zur Anmeldung nur in diesem Browser.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" disabled={!reason.trim()}>
            Nicht verrechnen
          </Button>
        </div>
      </form>
    );
  }

  const release = move.stand === "freigegeben";
  const again = move.label === "Wieder aufnehmen";
  return (
    <div className="flex flex-col">
      <Title className="p-0 pb-1 text-sm text-fg">{release ? "Für die Schlussrechnung freigeben?" : again ? "Wieder aufnehmen?" : "Rechenweg und Belege geprüft?"}</Title>
      {about && <div className="pb-1">{about}</div>}
      <p className="text-xs text-fg-secondary">
        {release ? `${amount} werden für die Schlussrechnung freigegeben.` : again ? "Der Fund zählt wieder und geht zur Freigabe." : "Danach gibt die Geschäftsführung frei."} Vermerkt als{" "}
        {move.wer}, bis zur Anmeldung nur in diesem Browser.
      </p>
      {release && open.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 rounded-md bg-fill-subtle px-2 py-1.5 text-xs shadow-ring">
          {open.map((o) => (
            <li key={o}>
              <span className="text-fg-secondary">Noch offen: </span>
              {o}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <Button onClick={onCancel}>Abbrechen</Button>
        <Button variant="primary" onClick={() => onConfirm(again ? "wieder aufgenommen" : undefined)}>
          {move.label === "Prüfen" ? "Als geprüft vermerken" : move.label}
        </Button>
      </div>
    </div>
  );
}
