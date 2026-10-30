/**
 * The rules of migrations/001_basis.sql (003: the Beleg of a file, 004: checks of two free texts, 005: a signature that came back), played through in a local Postgres (PGlite) with two companies: what a member
 * sees, what they may add, and what the database refuses whatever the browser sends.
 */

import { readFileSync } from "node:fs";

import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const sql = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

const FIRMA_A = "aaaaaaaa-0000-4000-8000-000000000001";
const FIRMA_B = "bbbbbbbb-0000-4000-8000-000000000001";
const U = {
  anna: "00000000-0000-4000-8000-00000000000a", // A, Abrechnung
  georg: "00000000-0000-4000-8000-00000000000b", // A, Geschäftsführung
  beide: "00000000-0000-4000-8000-00000000000c", // A, Abrechnung and Geschäftsführung
  bernd: "00000000-0000-4000-8000-00000000000d", // A, Bauleitung
  berta: "00000000-0000-4000-8000-00000000000e", // B, Abrechnung and Geschäftsführung
  fremd: "00000000-0000-4000-8000-00000000000f", // signed in, member of no company
} as const;

let pg: PGlite;

/** Runs a query as a signed-in user (or as an anonymous visitor with null), as PostgREST would. */
async function als<T = Record<string, unknown>>(user: string | null, query: string, params: unknown[] = []): Promise<T[]> {
  await pg.exec("reset role");
  await pg.query("select set_config('request.jwt.claim.sub', $1, false)", [user ?? ""]);
  await pg.exec(user ? "set role authenticated" : "set role anon");
  try {
    return (await pg.query<T>(query, params)).rows;
  } finally {
    await pg.exec("reset role");
  }
}

const entscheiden = (user: string, fund: string, stand: string, grund: string | null = null) =>
  als(user, "insert into public.entscheidung (fund_schluessel, stand, grund) values ($1, $2, $3) returning *", [fund, stand, grund]);

beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(sql("./supabase-stubs.sql"));
  await pg.exec(sql("../migrations/001_basis.sql"));
  await pg.exec(sql("../migrations/003_datei_beleg.sql"));
  await pg.exec(sql("../migrations/004_eingaben.sql"));
  await pg.exec(sql("../migrations/002_live.sql"));
  await pg.exec(sql("../migrations/005_eingang.sql"));
  await pg.exec(`
    insert into public.firma (id, name) values ('${FIRMA_A}', 'Testfirma A'), ('${FIRMA_B}', 'Testfirma B');
    insert into auth.users (id) values ${Object.values(U).map((id) => `('${id}')`).join(", ")};
    insert into public.mitglied (user_id, firma_id, name, rollen) values
      ('${U.anna}', '${FIRMA_A}', 'Anna Abrechnung', '{abrechnung}'),
      ('${U.georg}', '${FIRMA_A}', 'Georg Geschäftsführung', '{geschaeftsfuehrung}'),
      ('${U.beide}', '${FIRMA_A}', 'Bea Beides', '{abrechnung,geschaeftsfuehrung}'),
      ('${U.bernd}', '${FIRMA_A}', 'Bernd Bauleitung', '{bauleitung}'),
      ('${U.berta}', '${FIRMA_B}', 'Berta B', '{abrechnung,geschaeftsfuehrung}');
  `);
});

describe("Datensilo je Firma", () => {
  it("a member sees only the own company and its members", async () => {
    expect(await als(U.anna, "select name from public.firma")).toEqual([{ name: "Testfirma A" }]);
    expect((await als(U.anna, "select name from public.mitglied")).length).toBe(4);
    expect(await als(U.berta, "select name from public.mitglied")).toEqual([{ name: "Berta B" }]);
  });

  it("company B never sees what company A decided, and the other way round", async () => {
    await entscheiden(U.anna, "p1/silo", "geprueft");
    await entscheiden(U.berta, "p1/silo", "geprueft");
    const a = await als<{ person: string }>(U.anna, "select person from public.entscheidung where fund_schluessel = 'p1/silo'");
    const b = await als<{ person: string }>(U.berta, "select person from public.entscheidung where fund_schluessel = 'p1/silo'");
    expect(a.map((r) => r.person)).toEqual(["Anna Abrechnung"]);
    expect(b.map((r) => r.person)).toEqual(["Berta B"]);
  });

  it("the same find key is decided per company: B's check does not count for A", async () => {
    await entscheiden(U.berta, "p1/getrennt", "geprueft");
    await expect(entscheiden(U.georg, "p1/getrennt", "freigegeben")).rejects.toThrow(/Von gefunden geht es nicht zu freigegeben/);
  });

  it("an anonymous visitor reads and writes nothing", async () => {
    await expect(als(null, "select * from public.entscheidung")).rejects.toThrow(/permission denied/);
    await expect(als(null, "select * from public.firma")).rejects.toThrow(/permission denied/);
    await expect(entscheidenAnonym()).rejects.toThrow(/permission denied/);
  });

  it("a signed-in account without a company sees nothing and cannot add", async () => {
    expect(await als(U.fremd, "select * from public.entscheidung")).toEqual([]);
    expect(await als(U.fremd, "select * from public.mitglied")).toEqual([]);
    await expect(entscheiden(U.fremd, "p1/fremd", "geprueft")).rejects.toThrow(/Nur Mitglieder/);
  });
});

const entscheidenAnonym = () => als(null, "insert into public.entscheidung (fund_schluessel, stand) values ('p1/x', 'geprueft')");

describe("Der Server schreibt wer und wann", () => {
  it("company, person and time come from the server", async () => {
    const [row] = await entscheiden(U.anna, "p1/stempel", "geprueft");
    expect(row).toMatchObject({ firma_id: FIRMA_A, user_id: U.anna, person: "Anna Abrechnung", rolle: "abrechnung" });
  });

  it("the browser cannot send another company, person or time", async () => {
    await expect(als(U.anna, `insert into public.entscheidung (fund_schluessel, stand, firma_id) values ('p1/f', 'geprueft', '${FIRMA_B}')`)).rejects.toThrow(/permission denied/);
    await expect(als(U.anna, `insert into public.entscheidung (fund_schluessel, stand, user_id) values ('p1/f', 'geprueft', '${U.georg}')`)).rejects.toThrow(/permission denied/);
    await expect(als(U.anna, "insert into public.entscheidung (fund_schluessel, stand, zeit) values ('p1/f', 'geprueft', '2020-01-01')")).rejects.toThrow(/permission denied/);
  });

  it("nothing is ever changed or deleted", async () => {
    await entscheiden(U.anna, "p1/fest", "geprueft");
    for (const table of ["entscheidung", "aufgabe", "aufgabe_erledigt", "ablauf_einstellung", "datei", "mitglied", "firma"]) {
      const column = table === "firma" ? "name" : "firma_id";
      await expect(als(U.beide, `update public.${table} set ${column} = ${column}`)).rejects.toThrow(/permission denied/);
      await expect(als(U.beide, `delete from public.${table}`)).rejects.toThrow(/permission denied/);
    }
  });

  it("members cannot add members or companies", async () => {
    await expect(als(U.beide, `insert into public.mitglied (user_id, firma_id, name, rollen) values ('${U.fremd}', '${FIRMA_A}', 'X', '{abrechnung}')`)).rejects.toThrow(/permission denied/);
    await expect(als(U.beide, "insert into public.firma (name) values ('Neu')")).rejects.toThrow(/permission denied/);
  });
});

describe("Prüfung, Freigabe und vier Augen", () => {
  it("check by the Abrechnung, release by another person of the Geschäftsführung", async () => {
    await entscheiden(U.anna, "p1/f1", "geprueft");
    const [row] = await entscheiden(U.georg, "p1/f1", "freigegeben");
    expect(row).toMatchObject({ stand: "freigegeben", rolle: "geschaeftsfuehrung", person: "Georg Geschäftsführung" });
    await entscheiden(U.anna, "p1/f1", "in_schlussrechnung");
  });

  it("the site manager neither checks nor releases", async () => {
    await expect(entscheiden(U.bernd, "p1/f2", "geprueft")).rejects.toThrow(/macht die Abrechnung/);
    await expect(entscheiden(U.bernd, "p1/f2", "nicht_verrechnen", "Grund")).rejects.toThrow(/macht die Abrechnung/);
  });

  it("the Abrechnung does not release, the Geschäftsführung alone does not check", async () => {
    await entscheiden(U.anna, "p1/f3", "geprueft");
    await expect(entscheiden(U.anna, "p1/f3", "freigegeben")).rejects.toThrow(/macht die Geschäftsführung/);
    await expect(entscheiden(U.georg, "p1/f4", "geprueft")).rejects.toThrow(/macht die Abrechnung/);
  });

  it("a person holding both roles does not release what they checked", async () => {
    await entscheiden(U.beide, "p1/f5", "geprueft");
    await expect(entscheiden(U.beide, "p1/f5", "freigegeben")).rejects.toThrow(/Vier Augen/);
    await entscheiden(U.georg, "p1/f5", "freigegeben");
    await entscheiden(U.anna, "p1/f6", "geprueft");
    await entscheiden(U.beide, "p1/f6", "freigegeben");
  });

  it("taken up again counts as a new check by the person who took it up", async () => {
    await entscheiden(U.anna, "p1/f7", "geprueft");
    await entscheiden(U.beide, "p1/f7", "nicht_verrechnen", "schon mit einem Nachtrag verrechnet");
    await entscheiden(U.beide, "p1/f7", "geprueft");
    await expect(entscheiden(U.beide, "p1/f7", "freigegeben")).rejects.toThrow(/Vier Augen/);
    await entscheiden(U.georg, "p1/f7", "freigegeben");
  });
});

describe("Ein Schritt nach dem anderen", () => {
  it("no release before a check, no check twice, nothing after the invoice", async () => {
    await expect(entscheiden(U.georg, "p1/s1", "freigegeben")).rejects.toThrow(/Von gefunden geht es nicht zu freigegeben/);
    await expect(entscheiden(U.anna, "p1/s1", "in_schlussrechnung")).rejects.toThrow(/Von gefunden geht es nicht zu in_schlussrechnung/);
    await entscheiden(U.anna, "p1/s1", "geprueft");
    await expect(entscheiden(U.anna, "p1/s1", "geprueft")).rejects.toThrow(/Von geprueft geht es nicht zu geprueft/);
    await entscheiden(U.georg, "p1/s1", "freigegeben");
    await entscheiden(U.anna, "p1/s1", "in_schlussrechnung");
    await expect(entscheiden(U.anna, "p1/s1", "nicht_verrechnen", "zu spät")).rejects.toThrow(/Von in_schlussrechnung geht es nicht zu nicht_verrechnen/);
  });

  it("Nicht verrechnen needs a reason, blanks are no reason", async () => {
    await expect(entscheiden(U.anna, "p1/s2", "nicht_verrechnen")).rejects.toThrow(/check/);
    await expect(entscheiden(U.anna, "p1/s2", "nicht_verrechnen", "   ")).rejects.toThrow(/check/);
    await expect(entscheiden(U.anna, "p1/s2", "nicht_verrechnen", "\t\u00a0\u2003")).rejects.toThrow(/check/);
    const [row] = await entscheiden(U.anna, "p1/s2", "nicht_verrechnen", " \u00a0doppelt\t ");
    expect(row.grund).toBe("doppelt");
    await expect(entscheiden(U.anna, "p1/s2b", "nicht_verrechnen", "ok\u202etxt")).rejects.toThrow(/check/);
  });

  it("decisions under an earlier key of the same work count, both ways (fund_alias)", async () => {
    // In the sample data the Regiebericht 6 of Bürohaus Kiefernau was the WhatsApp-Meldung P2-W1.
    await entscheiden(U.anna, "p2/meldung:P2-W1", "geprueft");
    await expect(entscheiden(U.anna, "p2/regie:6", "geprueft")).rejects.toThrow(/Von geprueft geht es nicht zu geprueft/);
    await expect(entscheiden(U.beide, "p2/regie:6", "freigegeben")).resolves.toHaveLength(1);
    await entscheiden(U.anna, "p2/regie:6", "in_schlussrechnung");
    // Once in the invoice, the old key cannot bring the work back.
    await expect(entscheiden(U.anna, "p2/meldung:P2-W1", "nicht_verrechnen", "zurück")).rejects.toThrow(/Von in_schlussrechnung/);
  });

  it("the browser cannot pass another find off as an earlier key (review finding, 28.10.2026)", async () => {
    // Georg alone cannot release a find nobody checked by borrowing Anna's check of another find.
    await entscheiden(U.anna, "p1/anderer", "geprueft");
    await expect(als(U.georg, "insert into public.entscheidung (fund_schluessel, fruehere_schluessel, stand) values ('p1/ungeprueft', '{p1/anderer}', 'freigegeben')")).rejects.toThrow(/fruehere_schluessel/);
    await expect(entscheiden(U.georg, "p1/ungeprueft", "freigegeben")).rejects.toThrow(/Von gefunden geht es nicht zu freigegeben/);
    // The browser cannot write a link of its own either.
    await expect(als(U.beide, "insert into public.fund_alias (schluessel, frueher) values ('p1/y', 'p1/anderer')")).rejects.toThrow(/permission denied/);
    await expect(als(U.beide, "select * from public.fund_alias")).rejects.toThrow(/permission denied/);
  });

  it("entries are ordered by the moment they passed the check, never by a tie of the clock", async () => {
    await pg.exec("reset role");
    await pg.query("select set_config('request.jwt.claim.sub', $1, false)", [U.anna]);
    await pg.exec("set role authenticated");
    // Two steps in one transaction: now() would give both the same time.
    await pg.exec("begin; insert into public.entscheidung (fund_schluessel, stand) values ('p1/zeit', 'geprueft'); insert into public.entscheidung (fund_schluessel, stand, grund) values ('p1/zeit', 'nicht_verrechnen', 'doppelt'); commit;");
    const [r] = (await pg.query<{ n: number; folge: boolean; zeit: boolean }>("select count(*)::int as n, (array_agg(folge order by id))[2] > (array_agg(folge order by id))[1] as folge, (array_agg(zeit order by id))[2] >= (array_agg(zeit order by id))[1] as zeit from public.entscheidung where fund_schluessel = 'p1/zeit'")).rows;
    await pg.exec("reset role");
    expect(r).toEqual({ n: 2, folge: true, zeit: true });
  });

  it("an unknown state is refused", async () => {
    await expect(entscheiden(U.anna, "p1/s3", "gefunden")).rejects.toThrow(/nicht zu gefunden/);
  });
});

describe("Aufgaben und Einstellungen", () => {
  const aufgabe = (user: string, id: string, href = "/projekte/p1/funde/f1/") =>
    als(user, "insert into public.aufgabe (id, fund_schluessel, fund, href, text, zustaendig, bis) values ($1, 'p1/f1', 'F1 Wohnpark Mooshaim', $2, 'Regiebericht unterschreiben lassen', 'Bauleitung', '2026-11-05') returning *", [id, href]);

  it("every member, the site manager too, creates and ticks tasks of the own company", async () => {
    const [t] = await aufgabe(U.bernd, "t1");
    expect(t).toMatchObject({ firma_id: FIRMA_A, person: "Bernd Bauleitung" });
    await als(U.bernd, "insert into public.aufgabe_erledigt (aufgabe_id, erledigt) values ('t1', true)");
    expect(await als(U.berta, "select * from public.aufgabe")).toEqual([]);
  });

  it("a member of B cannot tick a task of A", async () => {
    await aufgabe(U.anna, "t2");
    await expect(als(U.berta, "insert into public.aufgabe_erledigt (aufgabe_id, erledigt) values ('t2', true)")).rejects.toThrow(/foreign key/);
  });

  it("a task only links inside the app", async () => {
    await expect(aufgabe(U.anna, "t3", "javascript:alert(1)")).rejects.toThrow(/check/);
    await expect(aufgabe(U.anna, "t4", "//boese.example/")).rejects.toThrow(/check/);
    await expect(aufgabe(U.anna, "t5", "https://boese.example/")).rejects.toThrow(/check/);
  });

  it("a task has a text that is not blank and does not turn the reading direction", async () => {
    const mitText = (id: string, text: string) =>
      als(U.anna, "insert into public.aufgabe (id, fund_schluessel, fund, href, text, zustaendig) values ($1, 'p1/f1', 'F1', '/', $2, 'Abrechnung')", [id, text]);
    await expect(mitText("t6", "\t\u00a0 ")).rejects.toThrow(/check/);
    await expect(mitText("t7", "Rechnung \u202efdp.exe")).rejects.toThrow(/check/);
    await expect(mitText("t8", "Aufmaßblatt 12 gegenzeichnen lassen")).resolves.toEqual([]);
  });

  it("the Abläufe are set by the Abrechnung or the Geschäftsführung, not by the site", async () => {
    await als(U.anna, "insert into public.ablauf_einstellung (block, feld, wert) values ('abschluss/mengenaenderung', 'schwelle', '20')");
    await expect(als(U.bernd, "insert into public.ablauf_einstellung (block, feld, wert) values ('abschluss/mengenaenderung', 'schwelle', '0')")).rejects.toThrow(/row-level security/);
    await expect(als(U.anna, "insert into public.ablauf_einstellung (block, feld, wert) values ('x', 'farbe', 'rot')")).rejects.toThrow(/check/);
  });

  it("a setting takes only the values the app offers, a find key no hidden characters (004, review finding)", async () => {
    const setzen = (feld: string, wert: string) => als(U.anna, "insert into public.ablauf_einstellung (block, feld, wert) values ('aufgabe-bauleitung', $1, $2)", [feld, wert]);
    await expect(setzen("zustaendig", "Geschäftsführung")).resolves.toEqual([]);
    await expect(setzen("frist", "14")).resolves.toEqual([]);
    await expect(setzen("zustaendig", "Hausmeister")).rejects.toThrow(/check/);
    await expect(setzen("frist", "bald")).rejects.toThrow(/check/);
    await expect(setzen("schwelle", "1000")).rejects.toThrow(/check/);
    const versteckt = `p1/regie:${String.fromCharCode(0x202e)}9`;
    await expect(entscheiden(U.anna, versteckt, "geprueft")).rejects.toThrow(/check/);
    await expect(entscheiden(U.anna, `p1/regie:9${String.fromCharCode(10)}`, "geprueft")).rejects.toThrow(/check/);
    await expect(als(U.anna, "insert into public.aufgabe (id, fund_schluessel, fund, href, text, zustaendig) values ('t-004', $1, 'F1', '/funde/', 'x', 'Bauleitung')", [versteckt])).rejects.toThrow(/check/);
    await expect(entscheiden(U.anna, "p1/plan:H-201:D", "nicht_verrechnen", "Test 004")).resolves.toHaveLength(1);
  });
});

describe("Dateien", () => {
  const SHA = "a".repeat(64);
  const datei = (user: string, name = "Regiebericht 11.pdf", typ = "application/pdf", groesse = 120_000) =>
    als<{ pfad: string; firma_id: string }>(user, "insert into public.datei (projekt_id, name, typ, groesse, sha256) values ('p1', $1, $2, $3, $4) returning *", [name, typ, groesse, SHA]);
  const ablegen = (user: string, pfad: string) => als(user, "insert into storage.objects (bucket_id, name) values ('dateien', $1)", [pfad]);

  it("a file is stored at the place of its row, in the own company's folder, and read only there", async () => {
    const [d] = await datei(U.anna);
    expect(d.pfad.startsWith(`${FIRMA_A}/`)).toBe(true);
    await ablegen(U.anna, d.pfad);
    expect(await als(U.georg, "select name from storage.objects")).toEqual([{ name: d.pfad }]);
    expect(await als(U.berta, "select name from storage.objects")).toEqual([]);
    expect(await als(U.berta, "select * from public.datei")).toEqual([]);
  });

  it("nobody stores a file without its row, in another place, or over an existing one", async () => {
    await expect(ablegen(U.anna, `${FIRMA_A}/ohne-zeile`)).rejects.toThrow(/row-level security/);
    const [d] = await datei(U.anna);
    await expect(ablegen(U.berta, d.pfad)).rejects.toThrow(/row-level security/);
    await expect(ablegen(U.georg, d.pfad)).rejects.toThrow(/row-level security/);
    await ablegen(U.anna, d.pfad);
    expect(await als(U.anna, "update storage.objects set name = name where name = $1 returning name", [d.pfad])).toEqual([]);
    expect(await als(U.anna, "delete from storage.objects where name = $1 returning name", [d.pfad])).toEqual([]);
  });

  it("only PDF, JPEG and PNG up to 20 MB, with a well-formed checksum and a plain name", async () => {
    await expect(datei(U.anna, "x.exe", "application/x-msdownload")).rejects.toThrow(/check/);
    await expect(datei(U.anna, "gross.pdf", "application/pdf", 20_971_521)).rejects.toThrow(/check/);
    await expect(datei(U.anna, "../a.pdf")).rejects.toThrow(/check/);
    await expect(datei(U.anna, "a\\b.pdf")).rejects.toThrow(/check/);
    await expect(datei(U.anna, "a\tb.pdf")).rejects.toThrow(/check/);
    await expect(datei(U.anna, "Rechnung\u202efdp.pdf")).rejects.toThrow(/check/);
    await expect(datei(U.anna, "Aufmaßblatt 12 (Seite 2).pdf")).resolves.toHaveLength(1);
    await expect(als(U.anna, "insert into public.datei (projekt_id, name, typ, groesse, sha256) values ('p1', 'a.pdf', 'application/pdf', 1, 'xyz')")).rejects.toThrow(/check/);
    await expect(als(U.anna, `insert into public.datei (projekt_id, name, typ, groesse, sha256, pfad) values ('p1', 'a.pdf', 'application/pdf', 1, '${SHA}', '${FIRMA_B}/x')`)).rejects.toThrow(/permission denied/);
  });

  it("names the Beleg it belongs to (003), only as a plain key", async () => {
    const mit = (beleg: string) =>
      als<{ beleg_id: string; pfad: string }>(U.anna, "insert into public.datei (projekt_id, beleg_id, name, typ, groesse, sha256) values ('wohnpark-mooshaim', $1, 'rb9.pdf', 'application/pdf', 10, $2) returning *", [beleg, SHA]);
    const [d] = await mit("rb-9");
    expect(d.beleg_id).toBe("rb-9");
    expect(d.pfad.startsWith(`${FIRMA_A}/`)).toBe(true);
    await expect(mit("../rb-9")).rejects.toThrow(/check/);
    await expect(mit("RB 9")).rejects.toThrow(/check/);
    await expect(mit("x".repeat(81))).rejects.toThrow(/check/);
    expect(await als(U.berta, "select * from public.datei where beleg_id = 'rb-9'")).toEqual([]);
  });
});

describe("Unterschrift liegt vor (005)", () => {
  const SHA = "b".repeat(64);
  const datei = async (user: string, beleg: string) =>
    (await als<{ id: string }>(user, "insert into public.datei (projekt_id, beleg_id, name, typ, groesse, sha256) values ('wohnpark-mooshaim', $1, 'blatt.pdf', 'application/pdf', 10, $2) returning id", [beleg, SHA]))[0].id;
  const eintragen = (user: string, luecke: string, gueltig: boolean, dateiId: string | null) =>
    als<{ firma_id: string; person: string }>(user, "insert into public.eingang (luecke_schluessel, gueltig, datei_id) values ($1, $2, $3) returning *", [luecke, gueltig, dateiId]);

  it("the Abrechnung and the Bauleitung enter it, the server stamps who, and it stays in the company", async () => {
    const id = await datei(U.anna, "rb-12");
    const [e] = await eintragen(U.bernd, "p1/unterschrift:rb-12", true, id);
    expect(e).toMatchObject({ firma_id: FIRMA_A, person: "Bernd Bauleitung" });
    expect(await als(U.georg, "select luecke_schluessel from public.eingang")).toEqual([{ luecke_schluessel: "p1/unterschrift:rb-12" }]);
    expect(await als(U.berta, "select * from public.eingang")).toEqual([]);
  });

  it("the Geschäftsführung alone does not", async () => {
    const id = await datei(U.anna, "rb-12");
    await expect(eintragen(U.georg, "p1/unterschrift:rb-12", true, id)).rejects.toThrow(/Abrechnung oder die Bauleitung/);
    await expect(als(null, "insert into public.eingang (luecke_schluessel, gueltig) values ('p1/unterschrift:rb-12', false)")).rejects.toThrow(/permission denied/);
    await expect(eintragen(U.fremd, "p1/unterschrift:rb-12", false, null)).rejects.toThrow(/Nur Mitglieder/);
  });

  it("needs the signed sheet of this very Beleg, in the own company", async () => {
    await expect(eintragen(U.anna, "p1/unterschrift:rb-12", true, null)).rejects.toThrow(/Ohne das unterschriebene Blatt/);
    const anderes = await datei(U.anna, "rb-9");
    await expect(eintragen(U.anna, "p1/unterschrift:rb-12", true, anderes)).rejects.toThrow(/Ohne das unterschriebene Blatt/);
    const fremd = await datei(U.berta, "rb-12");
    await expect(eintragen(U.anna, "p1/unterschrift:rb-12", true, fremd)).rejects.toThrow(/Ohne das unterschriebene Blatt/);
  });

  it("a WhatsApp-Meldung has its sheet under the lower-case Beleg", async () => {
    const id = await datei(U.anna, "w4");
    await expect(eintragen(U.anna, "p1/regiebericht:W4", true, id)).resolves.toHaveLength(1);
  });

  it("taking it back needs no file, and nothing is ever changed or removed", async () => {
    await expect(eintragen(U.anna, "p1/unterschrift:rb-12", false, null)).resolves.toHaveLength(1);
    await expect(als(U.anna, "update public.eingang set gueltig = true")).rejects.toThrow(/permission denied/);
    await expect(als(U.anna, "delete from public.eingang")).rejects.toThrow(/permission denied/);
  });

  it("takes only well-formed keys and no column of the server", async () => {
    await expect(eintragen(U.anna, "p1/nachtrag:mail-0316", false, null)).rejects.toThrow(/check/);
    await expect(eintragen(U.anna, "unterschrift:rb-12", false, null)).rejects.toThrow(/check/);
    await expect(eintragen(U.anna, "p1/unterschrift:../x", false, null)).rejects.toThrow(/check/);
    await expect(als(U.anna, `insert into public.eingang (luecke_schluessel, gueltig, firma_id) values ('p1/unterschrift:rb-12', false, '${FIRMA_B}')`)).rejects.toThrow(/permission denied/);
  });
});
