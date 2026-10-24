// Screenshots of every screen with the locally installed Microsoft Edge (playwright-core, no browser download).
// Usage: node scripts/screens.mjs [base-url] [out-dir]
// Example: node scripts/screens.mjs http://localhost:3100 qa-shots
// Writes <out-dir>/<width>/<name>.png for 1440 × 900, 390 × 844 and 1912 × 930 (the viewport of the Attio references).

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.argv[3] ?? "qa-shots";

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
  { name: "belege", path: "/belege/" },
  { name: "e-mails", path: "/e-mails/" },
  { name: "whatsapp-meldungen", path: "/whatsapp-meldungen/" },
  { name: "betrieb", path: "/betrieb/" },
  { name: "betrieb-mitglieder", path: "/betrieb/mitglieder/" },
  { name: "auftraggeber", path: "/auftraggeber/" },
  { name: "projekte", path: "/projekte/" },
  { name: "projekt-kiefernau", path: "/projekte/buerohaus-kiefernau/" },
  { name: "projekt", path: "/projekte/wohnpark-mooshaim/" },
  { name: "projekt-positionen", path: "/projekte/wohnpark-mooshaim/positionen/" },
  { name: "projekt-belege", path: "/projekte/wohnpark-mooshaim/belege/" },
  { name: "projekt-funde", path: "/projekte/wohnpark-mooshaim/funde/" },
  { name: "projekt-vertrag", path: "/projekte/wohnpark-mooshaim/vertrag/" },
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
    act: async (page) => {
      await page.getByRole("button", { name: "Spalte hinzufügen" }).click();
      await page.getByRole("dialog").waitFor();
    },
  },
  { name: "uebersicht", path: "/uebersicht/" },
  {
    // the trace of F1: hover on wide screens, the sheet on phones
    name: "uebersicht-spur",
    path: "/uebersicht/",
    act: async (page) => {
      const row = page.locator('[data-target="fund:F1"]').first();
      if ((page.viewportSize()?.width ?? 0) < 768) await row.click();
      else await row.hover();
    },
  },
  {
    // the money block "zusätzlich verrechenbar" with every finding it holds
    name: "uebersicht-geld",
    path: "/uebersicht/",
    act: async (page) => {
      const block = page.locator('[data-target="block:zusaetzlich"]').first();
      if ((page.viewportSize()?.width ?? 0) < 768) await block.click();
      else await block.hover();
    },
  },
  { name: "uebersicht-kiefernau", path: "/uebersicht/buerohaus-kiefernau/" },
  { name: "schlussrechnungen", path: "/schlussrechnungen/" },
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
];

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
      if (screen.desktopOnly && size.width < 768) continue;
      if (screen.mobileOnly && size.width >= 768) continue;
      current = screen;
      await page.goto(base + screen.path, { waitUntil: "networkidle" });
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
