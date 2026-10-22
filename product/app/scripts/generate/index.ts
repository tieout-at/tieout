// Schreibt den synthetischen Datensatz W21 nach data/generated/w21.json (reproduzierbar).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { erzeugeW21 } from "../../src/demo/w21/erzeuge";
import { pruefe } from "../../src/engine";

const datensatz = erzeugeW21();
const ziel = join(process.cwd(), "data", "generated");
mkdirSync(ziel, { recursive: true });
writeFileSync(join(ziel, "w21.json"), JSON.stringify(datensatz));
const e = pruefe(datensatz);
console.log(
  `w21.json: ${datensatz.lv.length} LV-Positionen, ${datensatz.dokumente.length} Dokumente; ` +
    `Befunde ${e.befunde.length}, Liste 1 ${e.summen.jetzt / 100} €, Vorprüfung ${e.vorpruefung.summe / 100} €`,
);
