// Prüft alle Szenario-Dateien gegen das Format. Aufruf: npm run szenarien:pruefen
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { SzenarioSchema } from "../src/szenario.ts";
import { projektNachId } from "../src/firma.ts";

const ordner = ["szenarien", "szenarien/zurueck"];
let fehler = 0;
let anzahl = 0;
const ids = new Set<string>();
for (const o of ordner) {
  let dateien: string[] = [];
  try {
    dateien = readdirSync(o).filter((d) => d.endsWith(".json"));
  } catch {
    continue;
  }
  for (const d of dateien) {
    anzahl++;
    const datei = path.join(o, d);
    const ergebnis = SzenarioSchema.safeParse(JSON.parse(readFileSync(datei, "utf8")));
    if (!ergebnis.success) {
      fehler++;
      console.log(`FEHLER ${datei}: ${ergebnis.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    const s = ergebnis.data;
    if (`${s.id}.json` !== d) { fehler++; console.log(`FEHLER ${datei}: id passt nicht zum Dateinamen`); }
    if (ids.has(s.id)) { fehler++; console.log(`FEHLER ${datei}: id doppelt`); }
    ids.add(s.id);
    for (const e of [...s.wahrheit.eintraege, ...s.erwartung.eintraege]) {
      if (e.projektId && !projektNachId(e.projektId)) { fehler++; console.log(`FEHLER ${datei}: unbekanntes Projekt ${e.projektId}`); }
    }
  }
}
console.log(`${anzahl} Szenarien, ${fehler} Fehler`);
process.exit(fehler ? 1 : 0);
