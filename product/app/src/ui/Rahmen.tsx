"use client";

// Rahmen der App: Seitenleiste links, Inhalt rechts. Die Anmeldeseite steht für sich, ohne Seitenleiste.

import { usePathname } from "next/navigation";

export function Rahmen({ seitenleiste, children }: { seitenleiste: React.ReactNode; children: React.ReactNode }) {
  const pfad = usePathname();
  if (pfad.startsWith("/anmelden")) return <>{children}</>;
  return (
    <div className="scr">
      {seitenleiste}
      <div className="scr-main">{children}</div>
    </div>
  );
}
