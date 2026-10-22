// Listet alle Platzhalter in Texten und Seiten. Vor dem Livegang muss die Liste leer sein.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["messages", "app", "components"].filter((r) => existsSync(r));
const re = /\[\[(PLATZHALTER|PLACEHOLDER)[^\]]*\]\]/g;
let total = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(json|tsx?|css)$/.test(name)) {
      const hits = readFileSync(p, "utf8").match(re) ?? [];
      if (hits.length) {
        total += hits.length;
        console.log(`${p}: ${hits.length}`);
        for (const h of new Set(hits)) console.log(`  ${h}`);
      }
    }
  }
}

roots.forEach(walk);
console.log(`\nPlatzhalter gesamt: ${total}`);
process.exitCode = total > 0 ? 1 : 0;
