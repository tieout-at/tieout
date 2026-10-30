"use client";

import { ChevronsLeftRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { scanUrl, type ScanBeleg } from "@/lib/scans";
import { cn } from "@/lib/utils";

type Mode = "regler" | "nebeneinander" | "aenderung";
const MODES: { id: Mode; label: string }[] = [
  { id: "regler", label: "Regler" },
  { id: "nebeneinander", label: "Nebeneinander" },
  { id: "aenderung", label: "Nur die Änderung" },
];

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Two indexes of a plan laid exactly on top of each other. On opening the slider sweeps once from the old index to the
 * new one, so the change shows without being looked for; with reduced motion it simply rests there.
 */
export function PlanCompare({ title, project, belegId, vergleich, onClose }: { title: string; project: string; belegId: string; vergleich: NonNullable<ScanBeleg["vergleich"]>; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("regler");
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [x, setX] = useState(still ? 30 : 92);
  const dragging = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  // the focus comes in, stays in, and goes back to what opened the comparison
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    return () => opener?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key !== "Tab") return;
      const inside = [...(dialog.current?.querySelectorAll<HTMLElement>("button, [tabindex='0']") ?? [])];
      const at = inside.indexOf(document.activeElement as HTMLElement);
      const next = at < 0 ? 0 : (at + (e.shiftKey ? -1 : 1) + inside.length) % inside.length;
      e.preventDefault();
      inside[next]?.focus();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  useEffect(() => {
    if (still) return;
    const start = performance.now();
    let frame = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 1100);
      if (dragging.current) return;
      setX(92 - 62 * (1 - (1 - k) ** 3));
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [still]);

  const moveTo = (clientX: number) => {
    const r = stage.current?.getBoundingClientRect();
    if (r) setX(clamp(((clientX - r.left) / r.width) * 100));
  };
  const alt = scanUrl(project, `${vergleich.mit}-1.webp`);
  const neu = scanUrl(project, `${belegId}-1.webp`);

  return createPortal(
    <div ref={dialog} role="dialog" aria-modal="true" aria-label={`${title}: Index vergleichen`} className="fixed inset-0 z-[80] flex flex-col bg-surface">
      <header className="flex h-12 shrink-0 items-center gap-3 px-4 shadow-line-bottom">
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium">{title}</h2>
        <div role="group" aria-label="Ansicht" className="flex shrink-0 gap-0.5 max-md:hidden">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn("h-7 rounded-md px-2.5 text-xs outline-none focus-visible:outline-2 focus-visible:outline-accent", mode === m.id ? "bg-fill-hover font-medium text-fg" : "text-fg-secondary hover:bg-fill-hover")}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button ref={closeButton} type="button" aria-label="Vergleich schließen" onClick={onClose} className="flex size-7 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:size-11">
          <X className="size-4" aria-hidden />
        </button>
      </header>
      <div className="flex min-h-0 flex-1 overflow-auto bg-sidebar p-4 max-md:p-2">
        {mode === "nebeneinander" ? (
          <div className="m-auto grid w-full max-w-[1500px] grid-cols-2 gap-3 max-md:grid-cols-1">
            <Sheet src={alt} label={vergleich.links} />
            <Sheet src={neu} label={vergleich.rechts} />
          </div>
        ) : mode === "aenderung" ? (
          <div className="m-auto w-[min(100%,1200px,calc((100dvh-104px)*1.4145))]">
            <Sheet src={scanUrl(project, vergleich.aenderung)} label={vergleich.rechts} />
          </div>
        ) : (
          <div
            ref={stage}
            className="relative m-auto aspect-[1754/1240] w-[min(100%,1200px,calc((100dvh-80px)*1.4145))] shrink-0 touch-none overflow-hidden rounded-xs bg-surface shadow-ring select-none"
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              moveTo(e.clientX);
            }}
            onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static files at their real size */}
            <img src={alt} alt={`Plan ${vergleich.links}`} draggable={false} className="absolute inset-0 h-full w-full" />
            {/* eslint-disable-next-line @next/next/no-img-element -- static files at their real size */}
            <img src={neu} alt={`Plan ${vergleich.rechts}`} draggable={false} className="absolute inset-0 h-full w-full" style={{ clipPath: `inset(0 0 0 ${x}%)` }} />
            <span className="absolute top-2.5 left-2.5 rounded-sm bg-surface px-2 py-0.5 text-xs shadow-ring">{vergleich.links}</span>
            <span className="absolute top-2.5 right-2.5 rounded-sm bg-surface px-2 py-0.5 text-xs shadow-ring">{vergleich.rechts}</span>
            <div
              role="slider"
              tabIndex={0}
              aria-label="Vergleich der Indexe"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(x)}
              onKeyDown={(e) => {
                // a key takes over from the sweep
                dragging.current = true;
                if (e.key === "ArrowLeft") setX((v) => clamp(v - 3));
                if (e.key === "ArrowRight") setX((v) => clamp(v + 3));
                if (e.key === "Home") setX(0);
                if (e.key === "End") setX(100);
              }}
              className="group absolute top-0 bottom-0 w-0.5 -translate-x-1/2 cursor-ew-resize bg-accent outline-none"
              style={{ left: `${x}%` }}
            >
              <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent">
                <ChevronsLeftRight className="size-4" aria-hidden />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function Sheet({ src, label }: { src: string; label: string }) {
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-1.5">
      <figcaption className="text-xs text-fg-secondary">{label}</figcaption>
      {/* eslint-disable-next-line @next/next/no-img-element -- static files at their real size */}
      <img src={src} alt={`Plan ${label}`} draggable={false} className="block aspect-[1754/1240] w-full rounded-xs bg-surface shadow-ring" />
    </figure>
  );
}
