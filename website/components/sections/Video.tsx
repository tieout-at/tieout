"use client";

import { useState } from "react";
import type { Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";

function Corner({ pos }: { pos: React.CSSProperties }) {
  return <span className="video__corner" style={pos} aria-hidden="true" />;
}

export function Video({ t }: { t: Messages["video"] }) {
  const [clicked, setClicked] = useState(false);
  return (
    <section id="video" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <div className="video">
          <div className="video__grid" />
          <Corner pos={{ left: 14, top: 14, borderWidth: "2px 0 0 2px" }} />
          <Corner pos={{ right: 14, top: 14, borderWidth: "2px 2px 0 0" }} />
          <Corner pos={{ left: 14, bottom: 46, borderWidth: "0 0 2px 2px" }} />
          <Corner pos={{ right: 14, bottom: 46, borderWidth: "0 2px 2px 0" }} />
          <button type="button" className="video__play" aria-label={t.play} onClick={() => setClicked(true)}>
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
              <path d="M7 4l15 9-15 9z" fill="currentColor" />
            </svg>
          </button>
          <div className="video__meta">
            <Ph text={t.placeholder} />
            <span aria-live="polite">{clicked ? t.soon : "00:00 / 03:00"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
