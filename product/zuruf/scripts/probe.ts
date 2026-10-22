// Einzelner echter Durchlauf gegen die API, zum schnellen Ausprobieren. Aufruf: npx tsx scripts/probe.ts "Text"
import { ZurufAgent } from "../src/agent.ts";
import { Arbeitsspeicher } from "../src/speicher.ts";
import { kiVersteher } from "../src/verstehen.ts";
import { kostenUsd, verbrauch } from "../src/llm.ts";

const speicher = new Arbeitsspeicher();
speicher.setzeEinwilligung("probe", "monteur");
const agent = new ZurufAgent(speicher, kiVersteher());
let i = 0;
for (const text of process.argv.slice(2)) {
  const istKnopf = text.startsWith("#");
  const t0 = Date.now();
  const antworten = await agent.verarbeite(
    istKnopf
      ? { id: `p${++i}`, absenderId: "probe", zeit: "2026-10-22T14:32:00+02:00", art: "knopf", knopfId: text.slice(1), inhalt: text.slice(1) }
      : { id: `p${++i}`, absenderId: "probe", zeit: "2026-10-22T14:32:00+02:00", art: "sprache", inhalt: text },
  );
  console.log(`> ${text}  (${Date.now() - t0} ms)`);
  for (const a of antworten) console.log(`  [${a.zweck}] ${a.text.replace(/\n/g, "\n    ")}${a.knoepfe ? `\n    Knöpfe: ${a.knoepfe.map((k) => k.titel).join(" | ")}` : ""}${a.liste ? `\n    Liste: ${a.liste.eintraege.map((k) => k.titel).join(" | ")}` : ""}`);
}
console.log(JSON.stringify(speicher.ereignisse().map((e) => ({ status: e.status, offen: e.offen, eintrag: Object.fromEntries(Object.entries(e.eintrag).map(([k, v]) => [k, v.wert])) })), null, 1));
console.log("verworfen:", agent.protokoll.verworfen, "fehler:", agent.protokoll.fehler);
console.log(`Anfragen ${verbrauch.anfragen}, ca. ${kostenUsd().toFixed(4)} USD`);
