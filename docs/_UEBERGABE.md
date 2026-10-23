# Handover: step 1, Hülle

**As of:** Friday, 23 October 2026, night, after step 0b. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** `docs/SPEZIFIKATION.md` accepted and the decisions E1 to E16 (section 10) answered by Maxi S. If a decision is still open when this chat starts, ask first; E2 (sidebar sections) and E12 ("Posten" or "Fund") change what this step builds.

## Goal

The empty app in the Attio layout: created, design tokens written down as `docs/DESIGN.md`, sidebar, header, search (Strg K) and every navigation point with an empty state, online at `app-neu.tieout.workers.dev`. No calculation and no amounts in this step; the screens stay empty until step 2 (Kern) and step 3 (Tabellen).

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md`, this file.
2. `docs/SPEZIFIKATION.md`: section 4 (screens, navigation, every Attio element with its verdict), section 6 (vocabulary), section 10 (decisions).
3. `../tieout-intern/docs/Plan_Neustart.md`, sections "Gemessene Vorlage" (Attio measurements) and "Technik" (stack).
4. Attio as reference: the workspace (access in the plan) and the screen recording `../_vorlagen/Attio.mp4`. Brand, icons, illustrations and texts are our own (Lucide icons, German words from the vocabulary).

## What to build

1. **App in `app/`:** Next.js (static export), React, TypeScript, Tailwind, shadcn with Base UI, Lucide, Inter self-hosted; check current versions before installing. Typecheck, lint, tests and build as npm scripts; CI per pull request.
2. **`docs/DESIGN.md` and tokens:** the measured Attio values (type, colours, sidebar 275 px, header 48 px, buttons 28 px, tables, record page, right panel) as Tailwind tokens; light only.
3. **Sidebar:** business switcher ("Haustechnik Beispiel GmbH (fiktiv)"), "Suche" (Strg K), "Start", "Aufgaben", "Berichte"; sections "Ihre Daten" (Belege, E-Mails, WhatsApp-Meldungen), "Digitaler Zwilling" (Betrieb, Auftraggeber, Projekte), "Ergebnis" (Posten or the word decided in E12, Schlussrechnungen); bottom "Erste Schritte", "Mitglieder einladen", "Beispieldaten".
4. **Header** (title, help) and **Strg K** search over the navigation points.
5. **Empty states** for every navigation point, in the Attio pattern, with our words; the project page shell with the step bar "Ihre Daten → Digitaler Zwilling → Ergebnis" and its tabs, empty.
6. **Online at `app-neu`:** new Cloudflare worker; repair the Git connection first (open point in `_STATUS.md`). The worker `app` (jury link, v1) stays untouched.

## Done when

- Typecheck, lint, tests, build green; CI green on the pull request.
- Browser light at 1440 px and 390 px; screenshot of each screen next to the matching Attio screen, shown to Maxi S.
- `app-neu` shows the shell; `app.tieout.workers.dev` still shows v1.
- `_STATUS.md` updated, this file rewritten for step 2 (Kern), pull request merged with Maxi S.'s go.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 1, Hülle. Lies `CLAUDE.md` und `docs/_UEBERGABE.md` und mach Schritt 1: die leere App im Attio-Aufbau, Tokens als `docs/DESIGN.md`, Seitenleiste mit den drei Abschnitten aus der Spezifikation, Kopfzeile, Strg K, alle Navigationspunkte mit Leerzuständen, online unter `app-neu`. Zeig mir jeden Bildschirm neben dem passenden Attio-Bildschirm. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor dem Push und vor allem in Cloudflare. Deutsch, einfach, Ergebnis zuerst.
