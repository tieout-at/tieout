// Seite nicht gefunden, im Stil des Fundaments und mit Kennzeichnung „Synthetisch“.

import Link from "next/link";
import { Seitenkopf } from "@/ui/Seitenkopf";

export default function NichtGefunden() {
  return (
    <>
      <Seitenkopf pfad={[]} titel="Nicht gefunden" />
      <main className="scr-body">
        <p className="body">
          Diese Seite gibt es nicht. <Link href="/">Zu den Projekten</Link>
        </p>
      </main>
    </>
  );
}
