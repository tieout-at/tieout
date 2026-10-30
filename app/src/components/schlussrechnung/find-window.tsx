"use client";

import { useEffect, useState } from "react";

import { keep } from "@/components/charts/tones";
import { DecisionConfirm } from "@/components/fund/decision-confirm";
import { PeekAction, PeekFacts, PeekFigure, PeekHeader } from "@/components/table/peek";
import { Button } from "@/components/ui/button";
import { SideWindow } from "@/components/ui/side-window";
import { useActor } from "@/lib/account";
import { checkedBy, yourMoves } from "@/lib/decision-rules";
import { currentState, decide, DECISION_TEXT, gapBeforeRelease, localTime, moves, onStorageChange, readDecisions, type Decision, type Move } from "@/lib/decisions";
import type { Gap, InvoiceFind, InvoiceView } from "@/lib/invoice";

const Title = ({ className, children }: { className?: string; children: React.ReactNode }) => <h3 className={className}>{children}</h3>;

function Body({ find, v, onClose, onGap }: { find: InvoiceFind; v: InvoiceView; onClose: () => void; onGap: (g: Gap) => void }) {
  const [list, setList] = useState<Decision[]>([]);
  const [asking, setAsking] = useState<Move | null>(null);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    const load = () => setList(readDecisions());
    load();
    return onStorageChange(load);
  }, []);
  const keys = [find.key, ...find.earlierKeys];
  const state = currentState(list, keys, find.decision);
  const { allowed, why } = yourMoves(moves(state), useActor(), checkedBy(list, keys));
  const entry = v.changes.entries.find((c) => c.find.key === find.key);
  const waiting = v.pending.find((x) => x.find.key === find.key);
  const gap = v.gaps.find((g) => g.find?.key === find.key && !g.closed);
  const gapText = waiting ? gapBeforeRelease(waiting.stand === "Beleg fehlt" ? "beleg_fehlt" : "nachtrag_nicht_gelegt") : null;
  const open = [...(entry?.risk ? [`Kürzungsrisiko: ${entry.risk.reason}`] : []), ...(gapText ? [gapText] : [])];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <PeekHeader chip={find.number} title={find.name} sub={v.project.name} onClose={onClose} />
      <PeekFigure label={waiting ? "in Klärung, nicht addiert" : "zusätzlich verrechenbar"} value={find.amount.text} line="netto, vor Nachlass" />
      <PeekFacts
        rows={[
          { label: "Entscheidung", value: DECISION_TEXT[state] },
          ...(entry?.risk ? [{ label: "Kürzungsrisiko", value: keep(`${entry.risk.reason}, ${entry.risk.amount.text}`) }] : []),
          ...(waiting ? [{ label: "Belegstand", value: waiting.stand }] : []),
        ]}
      />
      <div className="flex flex-col gap-2 px-4 py-3">
        {asking ? (
          <DecisionConfirm
            move={asking}
            amount={find.amount.text}
            open={open}
            subject={`${find.number} ${find.name}`}
            title={Title}
            onConfirm={(grund) => {
              const { refused } = decide(keys, find.decision, { fundSchluessel: find.key, zeit: localTime(), wer: asking.wer, stand: asking.stand, ...(grund ? { grund } : {}) });
              setNote(refused);
              setAsking(null);
            }}
            onCancel={() => setAsking(null)}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {allowed.map((m, i) => (
                <Button key={m.stand} variant={i === 0 && m.stand !== "nicht_verrechnen" ? "primary" : "secondary"} onClick={() => setAsking(m)}>
                  {m.label}
                </Button>
              ))}
              {gap && <Button onClick={() => onGap(gap)}>Lücke schließen</Button>}
            </div>
            {why && <p className="text-xs text-fg-secondary">{why}</p>}
            {note && (
              <p role="status" className="text-xs text-fg-secondary">
                {note}
              </p>
            )}
          </>
        )}
      </div>
      <PeekAction href={find.href}>Fund öffnen</PeekAction>
    </div>
  );
}

/** A step of the Treppe in a window: the find, its decision taken right here, and the staircase walks beside it. */
export function FindWindow({ find, v, onClose, onGap }: { find: InvoiceFind | null; v: InvoiceView; onClose: () => void; onGap: (g: Gap) => void }) {
  return (
    <SideWindow open={!!find} onClose={onClose} title={find ? `${find.number} ${find.name}` : "Fund"}>
      {find && <Body key={find.key} find={find} v={v} onClose={onClose} onGap={onGap} />}
    </SideWindow>
  );
}
