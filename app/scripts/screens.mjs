// Screenshots of every screen with the locally installed Microsoft Edge (playwright-core, no browser download).
// Usage: node scripts/screens.mjs [base-url] [out-dir]
// Example: node scripts/screens.mjs http://localhost:3100 qa-shots
// Writes <out-dir>/<width>/<name>.png for 1440 × 900, 390 × 844 and 1912 × 930 (the viewport of the Attio references).

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.argv[3] ?? "qa-shots";
// optional: only the screens whose name starts with this ("fundseite")
const only = process.argv[4] ?? "";

const SIZES = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 820, height: 1180 },
  { width: 390, height: 844 },
  { width: 1912, height: 930 },
];

/** Every page of the shell; `act` runs before the picture (open the search, a menu, ...). */
const SCREENS = [
  { name: "start", path: "/" },
  { name: "aufgaben", path: "/aufgaben/" },
  { name: "berichte", path: "/berichte/" },
  { name: "ablaeufe", path: "/ablaeufe/" },
  { name: "ablauf-abschluss", path: "/ablaeufe/abschluss-lauf/" },
  { name: "ablauf-abschlag", path: "/ablaeufe/lauf-je-abschlagsrechnung/" },
  { name: "ablauf-meldung", path: "/ablaeufe/meldung-zu-regiebericht/" },
  { name: "belege", path: "/belege/" },
  { name: "e-mails", path: "/e-mails/" },
  { name: "whatsapp-meldungen", path: "/whatsapp-meldungen/" },
  { name: "betrieb", path: "/betrieb/" },
  { name: "betrieb-mitglieder", path: "/betrieb/mitglieder/" },
  { name: "auftraggeber", path: "/auftraggeber/" },
  { name: "projekte", path: "/projekte/" },
  { name: "projekt-kiefernau", path: "/projekte/buerohaus-kiefernau/" },
  { name: "projekt", path: "/projekte/wohnpark-mooshaim/" },
  { name: "projekt-zeitstrahl", path: "/projekte/wohnpark-mooshaim/zeitstrahl/" },
  { name: "projekt-positionen", path: "/projekte/wohnpark-mooshaim/positionen/" },
  { name: "projekt-belege", path: "/projekte/wohnpark-mooshaim/belege/" },
  { name: "projekt-funde", path: "/projekte/wohnpark-mooshaim/funde/" },
  { name: "projekt-vertrag", path: "/projekte/wohnpark-mooshaim/vertrag/" },
  { name: "mappe", path: "/schlussrechnungen/wohnpark-mooshaim/mappe/" },
  { name: "mappe-leer", path: "/schlussrechnungen/buerohaus-kiefernau/mappe/" },
  { name: "beweispaket-f1", path: "/funde/wohnpark-mooshaim-f1/beweispaket/" },
  { name: "projekt-erlenhain", path: "/projekte/wohnhof-erlenhain/" },
  { name: "auftraggeber-hornfeld", path: "/auftraggeber/hornfeld-bau/" },
  { name: "funde", path: "/funde/" },
  {
    name: "funde-filter",
    path: "/funde/",
    act: async (page) => {
      await page.getByRole("button", { name: "Filter", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Belegstand" }).click();
      await page.getByRole("menuitemcheckbox", { name: /Beleg fehlt/ }).click();
    },
  },
  {
    name: "funde-in-klaerung",
    path: "/funde/",
    act: async (page) => {
      await page.getByRole("button", { name: "Alle Funde" }).click();
      await page.getByRole("menuitem", { name: "In Klärung" }).click();
    },
  },
  {
    name: "projekte-sortierung",
    path: "/projekte/",
    act: async (page) => {
      await page.getByRole("button", { name: /Sortiert nach/ }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  {
    name: "projekte-spalte",
    path: "/projekte/",
    // phones show the projects as a list (step 8a), without the "+" of the grid
    desktopOnly: true,
    act: async (page) => {
      await page.getByRole("button", { name: "Spalte hinzufügen" }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  { name: "uebersicht", path: "/uebersicht/" },
  // step 8a: the chosen find is in the address; F8 shows a find in Klärung, F2 a part of a find at risk
  { name: "uebersicht-f8", path: "/uebersicht/#f8" },
  { name: "uebersicht-f2", path: "/uebersicht/#f2" },
  { name: "uebersicht-kiefernau", path: "/uebersicht/buerohaus-kiefernau/" },
  // the find page: F1 with its first original, another Beleg chosen, the decision confirmed, a find in Klärung
  { name: "fundseite", path: "/funde/wohnpark-mooshaim-f1/" },
  {
    name: "fundseite-plan",
    path: "/funde/wohnpark-mooshaim-f1/",
    act: async (page) => {
      // phones fold the Belege; open the fold first when it is there
      const fold = page.getByRole("button", { name: /^Belege/ });
      if (await fold.first().isVisible().catch(() => false)) await fold.first().click().catch(() => {});
      await page.getByRole("button", { name: /Plan H-201, Index D/ }).first().click({ timeout: 5000 }).catch(() => {});
    },
  },
  {
    name: "fundseite-signatur",
    path: "/funde/wohnpark-mooshaim-f1/",
    act: async (page) => {
      await page.getByRole("button", { name: /Aufmaßblatt 12/ }).first().click({ timeout: 5000 }).catch(() => {});
    },
  },
  {
    name: "fundseite-pruefen",
    path: "/funde/wohnpark-mooshaim-f1/",
    act: async (page) => {
      await page.getByRole("button", { name: "Prüfen", exact: true }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  { name: "fundseite-f7", path: "/funde/wohnpark-mooshaim-f7/" },
  { name: "schlussrechnungen", path: "/schlussrechnungen/" },
  { name: "projekt-schlussrechnung", path: "/projekte/wohnpark-mooshaim/schlussrechnung/" },
  { name: "projekt-schlussrechnung-laufend", path: "/projekte/buerohaus-kiefernau/schlussrechnung/" },
  { name: "beweispaket", path: "/funde/wohnpark-mooshaim-f1/beweispaket/" },
  { name: "beweispakete", path: "/schlussrechnungen/wohnpark-mooshaim/beweispakete/" },
  { name: "nicht-gefunden", path: "/gibt-es-nicht/", expect404: true },
  {
    name: "suche",
    path: "/",
    act: async (page) => {
      await page.keyboard.press("Control+k");
      await page.getByRole("dialog").waitFor();
    },
  },
  {
    name: "suche-rb-11",
    path: "/",
    act: async (page) => {
      await page.keyboard.press("Control+k");
      await page.getByRole("dialog").waitFor();
      await page.keyboard.type("RB 11");
    },
  },
  {
    name: "betrieb-menue",
    path: "/",
    desktopOnly: true,
    act: async (page) => {
      await page.getByRole("button", { name: /Kronfeld Haustechnik/ }).first().click();
      await page.getByRole("menu").waitFor();
    },
  },
  {
    name: "hilfe-menue",
    path: "/belege/",
    act: async (page) => {
      await page.getByRole("button", { name: "Hilfe" }).click();
      await page.getByRole("menu").waitFor();
    },
  },
  {
    name: "erste-schritte",
    path: "/",
    desktopOnly: true,
    act: async (page) => {
      await page.getByRole("button", { name: /Erste Schritte/ }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  {
    name: "navigation-mobil",
    path: "/",
    mobileOnly: true,
    act: async (page) => {
      await page.getByRole("button", { name: "Navigation öffnen" }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  // tasks (step 7): four open ones around today and one ticked off, laid out in this browser
  { name: "aufgaben-gefuellt", path: "/aufgaben/", tasks: true },
  { name: "start-gefuellt", path: "/", tasks: true },
  {
    name: "aufgaben-erledigt",
    path: "/aufgaben/",
    tasks: true,
    act: async (page) => {
      await page.getByRole("button", { name: "Erledigt" }).click();
    },
  },
  {
    name: "aufgaben-neu",
    path: "/aufgaben/",
    tasks: true,
    act: async (page) => {
      await page.getByRole("button", { name: "Neue Aufgabe" }).first().click();
      await page.getByRole("dialog").getByLabel("Fund").selectOption("p1/meldung:W4");
    },
  },
  {
    name: "fundseite-aufgabe",
    path: "/funde/wohnpark-mooshaim-f1/",
    tasks: true,
    act: async (page) => {
      await page.getByRole("button", { name: "Aufgabe anlegen" }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  // the board by Entscheidung (step 6); last, because the browser then remembers the board as the view of these tables
  { name: "funde-board", path: "/funde/", act: (page) => showBoard(page) },
  { name: "projekt-funde-board", path: "/projekte/wohnpark-mooshaim/funde/", act: (page) => showBoard(page) },
  {
    name: "projekt-funde-board-aufgabe",
    path: "/projekte/wohnpark-mooshaim/funde/",
    desktopOnly: true,
    act: async (page) => {
      await showBoard(page);
      await page.getByRole("button", { name: "Entscheidung zu F6" }).click();
      await page.getByRole("menuitem", { name: "Aufgabe anlegen" }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  {
    name: "projekt-funde-board-pruefen",
    path: "/projekte/wohnpark-mooshaim/funde/",
    act: async (page) => {
      await showBoard(page);
      await page.getByRole("button", { name: "Entscheidung zu F1" }).click();
      await page.getByRole("menuitem", { name: "Prüfen" }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  // after decisions in this browser (step 6b): the core runs in the browser and every sum follows; last, because they stay
  { name: "entschieden-projekt", path: "/projekte/wohnpark-mooshaim/", decided: true },
  { name: "entschieden-projekt-funde-board", path: "/projekte/wohnpark-mooshaim/funde/", decided: true, act: (page) => showBoard(page) },
  { name: "entschieden-funde-board", path: "/funde/", decided: true, act: (page) => showBoard(page) },
  { name: "entschieden-projekte", path: "/projekte/", decided: true },
  { name: "entschieden-fundseite", path: "/funde/wohnpark-mooshaim-f1/", decided: true },
  { name: "entschieden-uebersicht", path: "/uebersicht/", decided: true },
];

/** Decisions as the decision bar records them: F1 not to be invoiced, F2 checked and released, Bürohaus F1 checked under its earlier key. */
const DECISIONS = [
  { fundSchluessel: "p1/plan:H-201:D", zeit: "2026-10-25T09:10", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Mit Nachtrag abgegolten" },
  { fundSchluessel: "p1/regie:9", zeit: "2026-10-25T09:20", wer: "Abrechnung", stand: "geprueft" },
  { fundSchluessel: "p1/regie:9", zeit: "2026-10-25T09:40", wer: "Geschäftsführung", stand: "freigegeben" },
  { fundSchluessel: "p2/meldung:P2-W1", zeit: "2026-10-25T09:30", wer: "Abrechnung", stand: "geprueft" },
];

/** Tasks as "Aufgabe anlegen" records them, due around the day the pictures are taken, and one tick. */
function seedTasks() {
  const day = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const task = (id, key, fund, slug, text, zustaendig, bis, zeit) => ({ id, fundSchluessel: key, fund, href: `/funde/${slug}/`, zeit, wer: "Abrechnung", text, zustaendig, bis });
  const tasks = [
    task("aufgabe-1", "p1/plan:H-201:D", "F1 Wohnpark Mooshaim", "wohnpark-mooshaim-f1", "Plan H-201 Index D und die E-Mail vom 07.04. beilegen, gemeinsames Aufmaß vereinbaren", "Bauleitung", day(3), `${day(-1)}T09:10`),
    task("aufgabe-2", "p1/regie:12", "F6 Wohnpark Mooshaim", "wohnpark-mooshaim-f6", "Regiebericht 12 vom Polier unterschreiben lassen", "Bauleitung", day(0), `${day(-1)}T09:20`),
    task("aufgabe-3", "p1/anmeldung:mail-0316", "F8 Wohnpark Mooshaim", "wohnpark-mooshaim-f8", "Nachtrag mit Preis legen", "Abrechnung", day(-1), `${day(-2)}T14:00`),
    task("aufgabe-4", "p3/regie:5", "F3 Volksschule Ahornbrunn", "volksschule-ahornbrunn-f3", "Regiebericht von der örtlichen Bauaufsicht unterschreiben lassen", "Bauleitung", null, `${day(-1)}T10:00`),
    task("aufgabe-5", "p1/regie:9", "F2 Wohnpark Mooshaim", "wohnpark-mooshaim-f2", "3 h Monteur mit der Bauleitung klären, bevor die Schlussrechnung hinausgeht", "Bauleitung", day(1), `${day(-2)}T11:00`),
  ];
  localStorage.setItem("tieout.aufgaben.v1", JSON.stringify(tasks));
  localStorage.setItem("tieout.aufgaben-erledigt.v1", JSON.stringify([{ aufgabeId: "aufgabe-5", zeit: `${day(0)}T08:30`, wer: "Bauleitung", erledigt: true }]));
}

/** Switches a find table to the board, unless the browser already remembers it. */
async function showBoard(page) {
  const views = page.getByRole("button", { name: /^(Alle Funde|Zusätzlich verrechenbar|In Klärung)$/ });
  if (await views.count()) {
    await views.click();
    await page.getByRole("menuitem", { name: "Nach Entscheidung" }).click();
  }
  await page.locator("section[aria-label]:visible").first().waitFor();
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const size of SIZES) {
    const dir = join(out, String(size.width));
    mkdirSync(dir, { recursive: true });
    const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, locale: "de-AT", reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    let current = null;
    page.on("pageerror", (e) => errors.push(`${current?.name}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !current?.expect404 && errors.push(`${current?.name}: ${m.text()}`));
    for (const screen of SCREENS) {
      if (only && !screen.name.startsWith(only)) continue;
      if (screen.desktopOnly && size.width < 768) continue;
      if (screen.mobileOnly && size.width >= 768) continue;
      current = screen;
      await page.goto(base + screen.path, { waitUntil: "networkidle" });
      if (screen.decided && !(await page.evaluate(() => localStorage.getItem("tieout.entscheidungen.v1")))) {
        await page.evaluate((list) => localStorage.setItem("tieout.entscheidungen.v1", JSON.stringify(list)), DECISIONS);
        await page.reload({ waitUntil: "networkidle" });
      }
      if (screen.tasks && !(await page.evaluate(() => localStorage.getItem("tieout.aufgaben.v1")))) {
        await page.evaluate(seedTasks);
        await page.reload({ waitUntil: "networkidle" });
      }
      await page.evaluate(() => document.fonts.ready);
      if (screen.act) await screen.act(page);
      await page.waitForTimeout(250);
      await page.screenshot({ path: join(dir, `${screen.name}.png`) });
      // The page itself never scrolls (h-dvh); content scrolls inside [data-scroll-area]. Check both, and every
      // element that sticks out of its column without being a scroll container of its own.
      const overflow = await page.evaluate(() => {
        const found = [];
        const doc = document.documentElement.scrollWidth - window.innerWidth;
        if (doc > 0) found.push(`page by ${doc} px`);
        for (const area of document.querySelectorAll("[data-scroll-area]")) {
          const wide = area.scrollWidth - area.clientWidth;
          if (wide > 0) found.push(`content area by ${wide} px`);
        }
        const main = document.querySelector("main");
        const edge = main ? main.getBoundingClientRect().right : window.innerWidth;
        for (const el of document.querySelectorAll("main *")) {
          if (el.closest("[class*='overflow-x-auto'], [class*='overflow-auto']")) continue;
          const sticksOut = el.getBoundingClientRect().right - edge;
          if (sticksOut > 1 && el.getBoundingClientRect().width > 0) {
            found.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 24)}" by ${Math.round(sticksOut)} px`);
            if (found.length > 4) break;
          }
        }
        return found;
      });
      if (overflow.length) errors.push(`${screen.name}: too wide: ${overflow.join("; ")}`);
    }
    if (errors.length) console.log(`${size.width}: ${errors.length} problem(s)\n  ${[...new Set(errors)].join("\n  ")}`);
    else console.log(`${size.width}: ${SCREENS.length} screens, no errors`);
    await context.close();
  }
} finally {
  await browser.close();
}
