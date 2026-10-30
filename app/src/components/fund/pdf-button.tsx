"use client";

import { FileDown } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Makes a PDF on the click and hands it over: the writer and the sheets load only then. One file per click, however fast
 * the clicks come. While the sheets load the button says so; a failure says it in words.
 */
export function PdfButton({ make, label = "PDF" }: { make: () => Promise<void>; label?: string }) {
  const [state, setState] = useState<"ruhig" | "arbeitet" | "fehler">("ruhig");
  const busy = useRef(false);
  const click = async () => {
    if (busy.current) return;
    busy.current = true;
    setState("arbeitet");
    try {
      await make();
      setState("ruhig");
    } catch {
      setState("fehler");
    } finally {
      setTimeout(() => {
        busy.current = false;
      }, 1000);
    }
  };
  return (
    <span className="ml-auto flex items-center gap-2">
      {state === "fehler" && (
        <span role="status" className="text-xs text-fg-secondary">
          Das PDF ließ sich nicht erstellen. Bitte noch einmal.
        </span>
      )}
      <Button variant="primary" onClick={click} disabled={state === "arbeitet"}>
        <FileDown />
        {state === "arbeitet" ? "Wird erstellt" : label}
      </Button>
    </span>
  );
}
