// Schreibt die synthetischen Datensätze nach data/generated/ (reproduzierbar): W21 einzeln und die ganze Firma.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { erzeugeFirma } from "../../src/demo/firma/erzeuge";
import { pruefeFirma } from "../../src/engine";

const firma = erzeugeFirma();
const ziel = join(process.cwd(), "data", "generated");
mkdirSync(ziel, { recursive: true });
writeFileSync(join(ziel, "firma.json"), JSON.stringify(firma));
writeFileSync(join(ziel, "w21.json"), JSON.stringify(firma.projekte[0]));
const e = pruefeFirma(firma);
for (const p of e.projekte) {
  console.log(`${p.kurz.padEnd(4)} ${String(p.befunde).padStart(2)} Befunde  jetzt ${p.jetzt === null ? "–" : p.jetzt / 100} €  offen ${p.offen === null ? "–" : p.offen / 100} €  ${p.ampel}`);
}
console.log(`Firma: jetzt verrechenbar ${e.summen.jetzt / 100} €, angemeldet und offen ${e.summen.offen / 100} €`);
