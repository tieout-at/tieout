"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Zeigt Inhalte auf schmalen Bildschirmen genau wie am Laptop und verkleinert sie als Ganzes.
 * Unter `width` Pixeln Containerbreite wird skaliert; mit `zoom` lässt sich die Originalgröße
 * per Antippen öffnen und seitlich wischen.
 */
export function Fit({ width, zoom, hint, children }: { width: number; zoom?: boolean; hint?: string; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      const s = Math.min(1, o.clientWidth / width);
      setScale(s);
      setHeight(i.offsetHeight * s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);

  const on = scale < 1;
  const zoomed = on && open;

  return (
    <div className={`fit ${on ? "fit--on" : ""} ${zoomed ? "fit--open" : ""}`}>
      <div
        ref={outer}
        className="fit__frame"
        style={on && !zoomed ? { height } : undefined}
        onClick={zoom && on ? () => setOpen((v) => !v) : undefined}
      >
        <div ref={inner} className="fit__inner" style={on ? { width, transform: zoomed ? undefined : `scale(${scale})`, transformOrigin: "top left" } : undefined}>
          {children}
        </div>
      </div>
      {zoom && on && hint && <p className="fit__hint">{hint}</p>}
    </div>
  );
}
