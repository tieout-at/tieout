"use client";

import { useEffect, useRef, useState } from "react";

/** Blendet Inhalte beim Scrollen ruhig ein. */
export function Reveal({ children, delay = 0, as: Tag = "div", className = "" }: { children: React.ReactNode; delay?: number; as?: "div" | "li" | "article"; className?: string }) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${inView ? "reveal--in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
