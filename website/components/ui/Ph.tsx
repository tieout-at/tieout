import { Fragment } from "react";

const PATTERN = /\[\[(?:PLATZHALTER|PLACEHOLDER)(?::\s*([^\]]*))?\]\]/g;

/** Rendert Text und markiert Platzhalter wie [[PLATZHALTER: Rolle]] sichtbar. */
export function Ph({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    parts.push(
      <span key={i} className="ph" title="Platzhalter">
        {m[1] ? m[1] : "Platzhalter"}
      </span>,
    );
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}
