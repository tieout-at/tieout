"use client";

import { useAccount } from "@/lib/account";

/**
 * Where an entry is kept, said where it is made: "vorerst nur in diesem Browser gespeichert" in the demo, "gespeichert
 * für Testfirma A" with an account. `inline` runs on inside a sentence, `start` opens one, `satz` is a sentence.
 */
export function SavedWhere({ variant }: { variant: "inline" | "start" | "satz" }) {
  const account = useAccount();
  const words = account.stand === "konto" ? `gespeichert für ${account.firma}` : "vorerst nur in diesem Browser gespeichert";
  if (variant === "inline") return <>{words}</>;
  const start = words.charAt(0).toUpperCase() + words.slice(1);
  return <>{variant === "satz" ? `${start}.` : start}</>;
}
