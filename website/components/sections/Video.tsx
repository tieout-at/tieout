"use client";

import { useEffect, useRef, useState } from "react";
import type { Messages } from "@/lib/i18n";

function Corner({ pos }: { pos: React.CSSProperties }) {
  return <span className="video__corner" style={pos} aria-hidden="true" />;
}

/** Am Handy zeigt der Abschnitt den Film im Hochformat 4:5, sonst 16:9. */
const NARROW = "(max-width: 600px)";

export function Video({ t }: { t: Messages["video"] }) {
  const film = useRef<HTMLVideoElement>(null);
  const [narrow, setNarrow] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(NARROW);
    const update = () => setNarrow(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);

  const format = narrow ? "4x5" : "16x9";

  function play() {
    setPlaying(true);
    void film.current?.play();
  }

  return (
    <section id="video" className="section section--blue">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <div className={narrow ? "video video--tall" : "video"}>
          <video
            key={format}
            ref={film}
            className="video__film"
            src={`/film/tieout-film-${format}.mp4`}
            poster={`/film/poster-${format}.jpg`}
            preload="none"
            playsInline
            controls={playing}
            aria-label={t.label}
          />
          {!playing && (
            <>
              <Corner pos={{ left: 14, top: 14, borderWidth: "2px 0 0 2px" }} />
              <Corner pos={{ right: 14, top: 14, borderWidth: "2px 2px 0 0" }} />
              <Corner pos={{ left: 14, bottom: 14, borderWidth: "0 0 2px 2px" }} />
              <Corner pos={{ right: 14, bottom: 14, borderWidth: "0 2px 2px 0" }} />
              <button type="button" className="video__play" aria-label={t.play} onClick={play}>
                <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                  <path d="M7 4l15 9-15 9z" fill="currentColor" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
