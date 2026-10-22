// Symbol aus Lucide (ISC), 16 px, Strich 1,75 (Stil in bauteile.css). Immer dekorativ: Bedeutung trägt das Wort daneben.

import type { LucideIcon } from "lucide-react";

export function Ico({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="sw-ico" aria-hidden="true">
      <Icon />
    </span>
  );
}
