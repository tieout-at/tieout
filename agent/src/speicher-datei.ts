// Nur Node: Arbeitsspeicher, der zusätzlich in JSONL-Dateien schreibt (eingang.jsonl, ereignisse.jsonl).
// Für Simulator und Lernschleife; nie in den Worker oder den Browser importieren.

import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { Arbeitsspeicher } from "./speicher.ts";

export class Dateispeicher extends Arbeitsspeicher {
  constructor(private ordner: string) {
    super();
    mkdirSync(ordner, { recursive: true });
  }

  protected override schreibe(datei: string, objekt: unknown): void {
    appendFileSync(path.join(this.ordner, datei), JSON.stringify(objekt) + "\n");
  }
}
