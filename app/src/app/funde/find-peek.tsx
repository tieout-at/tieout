"use client";

import { DotText, PeekAction, PeekFacts, PeekFigure, PeekHeader } from "@/components/table/peek";
import type { FindRow } from "@/lib/kern-data";

export const STAND_COLOUR = { belegt: "var(--color-data-money)", beleg_fehlt: "var(--color-data-gap)", nachtrag_nicht_gelegt: "var(--color-data-change)" } as const;

/**
 * A find in the peek window of a table (step 8d): number and name, the amount with its money word, then Belegstand,
 * Kürzungsrisiko with its part amount, what closes a gap, Art, Arbeitsdatum, Belegquelle, Entscheidung; "Fund öffnen"
 * leads to the find page. Every figure is the row's, from the core.
 */
export function FindPeek({ row, decision, onClose }: { row: FindRow; decision: string; onClose: () => void }) {
  const money = row.belegstand === null ? "Betrag" : row.belegstand.state === "belegt" ? "zusätzlich verrechenbar" : "in Klärung";
  const part = row.risk && row.risk.amount.cent !== row.amount.cent;
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <PeekHeader chip={row.number} title={row.name} sub={row.project.name} onClose={onClose} />
      <PeekFigure label={money} value={row.amount.text} line="netto, vor Nachlass" />
      <PeekFacts
        rows={[
          { label: "Belegstand", value: row.belegstand ? <DotText colour={STAND_COLOUR[row.belegstand.state]}>{row.belegstand.text}</DotText> : "keiner" },
          ...(row.risk
            ? [
                {
                  label: row.risk.alreadyCut ? "Schon gekürzt" : "Kürzungsrisiko",
                  value: (
                    <DotText colour={row.risk.alreadyCut ? "var(--color-state-grey)" : "var(--color-data-risk)"}>
                      {row.risk.reason}
                      {part ? `, ${row.risk.amount.text}` : ""}
                    </DotText>
                  ),
                },
              ]
            : []),
          ...(row.remedy || row.taskText ? [{ label: row.risk ? "Abhilfe" : "Was fehlt", value: row.taskText || row.remedy }] : []),
          { label: "Entscheidung", value: decision },
          { label: "Art", value: row.kind },
          { label: "Arbeitsdatum", value: row.workDate.text },
          { label: "Belegquelle", value: row.sources.join(", ") },
          { label: "Beschreibung", value: <span className="text-fg-secondary">{row.detail}</span> },
        ]}
      />
      <PeekAction href={row.href}>Fund öffnen</PeekAction>
    </div>
  );
}
