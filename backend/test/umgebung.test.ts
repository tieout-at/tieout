/**
 * The migration next to what else lives in the project: the v1 SQL of the WhatsApp agent, and the links of earlier
 * keys in kern/'s sample data, which fund_alias must hold one for one.
 */

import { readFileSync } from "node:fs";

import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

import { pruefeFirma } from "../../kern/src/index";
import { beispielFirma } from "../../kern/src/beispiel/index";

const sql = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

async function frisch(): Promise<PGlite> {
  const pg = new PGlite();
  await pg.exec(sql("./supabase-stubs.sql"));
  // The agent's SQL reads the company from the token (auth.jwt()), which the stubs leave out.
  await pg.exec("create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;");
  return pg;
}

it("applies after the v1 SQL of the WhatsApp agent, and that SQL still applies after it", async () => {
  const vorher = await frisch();
  await vorher.exec(sql("../../agent/worker/supabase.sql"));
  await expect(vorher.exec(sql("../migrations/001_basis.sql"))).resolves.toBeDefined();

  const nachher = await frisch();
  await nachher.exec(sql("../migrations/001_basis.sql"));
  await expect(nachher.exec(sql("../../agent/worker/supabase.sql"))).resolves.toBeDefined();
}, 30_000);

it("fund_alias holds exactly the earlier keys of kern/'s sample data", async () => {
  // the work of a WhatsApp-Meldung keeps its decisions once its signed Regiebericht is entered (005_eingang.sql)
  const offen = Object.entries(pruefeFirma(beispielFirma()).ergebnisse).flatMap(([projekt, e]) => e.luecken.filter((l) => l.art === "regiebericht").map((l) => `${projekt}/${l.schluessel}`));
  const b = pruefeFirma(beispielFirma(), [], offen.map((lueckeSchluessel) => ({ lueckeSchluessel, zeit: "2026-10-23T09:00", wer: "Abrechnung", gueltig: true })));
  const erwartet = Object.entries(b.ergebnisse)
    .flatMap(([projekt, e]) => e.abgleich.funde.flatMap((f) => f.fruehereSchluessel.map((k) => `${projekt}/${f.schluessel} <- ${projekt}/${k}`)))
    .sort();
  const pg = await frisch();
  await pg.exec(sql("../migrations/001_basis.sql"));
  await pg.exec(sql("../migrations/002_live.sql"));
  await pg.exec(sql("../migrations/003_datei_beleg.sql"));
  await pg.exec(sql("../migrations/004_eingaben.sql"));
  await pg.exec(sql("../migrations/005_eingang.sql"));
  const rows = (await pg.query<{ s: string }>("select schluessel || ' <- ' || frueher as s from public.fund_alias order by 1")).rows.map((r) => r.s);
  expect(rows).toEqual(erwartet);
  expect(rows.length).toBeGreaterThan(0);
}, 30_000);

it("002_live.sql and 005_eingang.sql put exactly the five lists of the company into Realtime, and nothing else", async () => {
  const pg = await frisch();
  await pg.exec(sql("../migrations/001_basis.sql"));
  await pg.exec(sql("../migrations/002_live.sql"));
  await pg.exec(sql("../migrations/003_datei_beleg.sql"));
  await pg.exec(sql("../migrations/004_eingaben.sql"));
  await pg.exec(sql("../migrations/005_eingang.sql"));
  const rows = (await pg.query<{ tablename: string }>("select tablename from pg_publication_tables where pubname = 'supabase_realtime' order by 1")).rows.map((r) => r.tablename);
  expect(rows).toEqual(["ablauf_einstellung", "aufgabe", "aufgabe_erledigt", "eingang", "entscheidung"]);
}, 30_000);
