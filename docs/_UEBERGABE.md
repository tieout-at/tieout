# Handover: step 8d, Kompakt und klar

**As of:** Monday, 26 October 2026, afternoon, after step 8c. Written by Claude for Maxi S.
**Folder:** open `C:\Users\maxis\dev\tieout` as the project in Claude Code. Strategy next to it in `../tieout-intern` (read only).
**Precondition:** the pull request of `schritt-8c-umschalten` is merged, https://app.tieout.workers.dev shows v2 (Start says "zusätzlich verrechenbar 22.632,96 €"), https://app-v1.tieout.workers.dev shows v1, CI `App`, `Kern` and `Lösungsliste` are green on `main`. If not, ask Maxi S. first.
**Setup (Maxi S., 26.10.2026):** a chat of its own with full focus, the strongest model, an advisor, a high token budget and a board. Quality before speed.

## Goal

Every page of the app compact, clear at a glance, refined, visual and interactive like Linear and Attio: the picture first, details on a click. No page that reads like a book, no long scrolling, no small text walls (his words: "Text, Text, Text, kleine Schrift" is what to avoid). And before that, one question of principle about the sample data and the core.

## Read first

1. `CLAUDE.md`, `docs/_STATUS.md` (rows 8a to 8d, open points of 8b and 8c), this file.
2. `docs/DESIGN.md` (the whole file; it holds every measured value and the design language of steps 8 and 8a: one question, one figure, one statement, explanations behind an info icon, only exceptions marked).
3. `docs/SPEZIFIKATION.md` sections 3, 4 and 7.1 and `docs/Demo_Faelle.md` (solution list v3) for the question of principle.
4. `../tieout-intern/docs/kundentests/2026-10-26_kundentest-4_vergleich-v1-v2.md` (the comparison test of 8c) and the reports of tests 2 and 3 next to it.
5. The playbook of Maxi S. (`C:\Users\maxis\OneDrive - WU Wien\B Claude\_setup\Playbook.md`), the parts on design and UI.

## Steps

1. **Question of principle, answer before anything is built.** Are the sample data and the calculation core too complex for a realistic first customer? The first customers will have small projects, not a 750.000 € Wohnpark with 77 Belege and 286 positions. Should data and core become fundamentally simpler, shorter and more realistic, not only smaller? Give options (for example: keep, trim the main project, a small main project plus the large one as a second example, a new simpler model) with what each costs (solution list, `kern/` tests, amount audit, pages) and a recommendation. Weigh one finding of 8c against it: the Geschäftsführer and the Abrechnerin both said that part of their wish to buy came from the larger amounts of the sample data, and that a project with 3.000 € to 5.000 € extra hardly pays for the service. Simpler must not mean "not worth buying". Sample data, solution list, core and amounts change only with a go of Maxi S.
2. **Board of all pages, before and after.** Every page at 1440 px and 390 px as it is (`npm run screens`), next to a draft of how it becomes compact and visual; references from Linear and Attio (and Mercury, Ramp, Rillet where they fit). Show it to Maxi S. as a board and get his choice per page before building. He chose the picture over a calmer list twice in 8b and wanted the step 4 Übersicht back: a reviewer's score for "Ruhe" is not his bar on its own.
3. **Build page by page** after his go, shared parts first (project head, tabs, cards, tables), then the pages. Amounts compared page by page with `main` after each part.
4. **Review:** an independent reviewer per round at 1440 and 390 px, every finding re-measured; then a short customer test with the three roles on the new pages.

## Starting points

From step 8b and the comparison test of 8c (re-measured):

- **Start:** answers "how much in how many projects" only under Berichte; v1 showed the sum per project as bars right on the start page, the Geschäftsführer named that the best part of v1.
- **Positionen at 1440 px:** eight number columns, position texts cut; idea from 8b: one small bar per row for beauftragt, erbracht, verrechnet.
- **Phones:** the project head and tabs take 360 of 844 px, the tabs Vertrag, Funde and Schlussrechnung lie outside the screen at 390 px; fold the head to one line while scrolling.
- **Zeitstrahl:** the axis shows months only; the Bauleiter wants to see the order of WhatsApp, Regiebericht and Stundenzettel by day at a glance (v1's Zeitachse had day and time per event).
- **Berichte:** the card "Wer hat bisher gekürzt?" shows the largest Auftraggeber's sum as its figure, read as the total.
- **Projekt:** the pair Restforderung 89.274,41 € and "laut Vertrag 92.882,45 €" is not understood; its info icon only jumps to the Schlussrechnung.
- **Fund:** the Rechenweg line repeats "126 m"; find numbers F1 to F3 repeat across projects (a project short name in front?).
- **Belege:** shown as rebuilt field lists, not as a sheet; looks less real than v1's viewer (real scans come with step 10).

Not in 8d: export to the invoicing program (a small step of its own after 8d, v1 had an Excel file), persons, roles and shared decisions (step 10), a reason per correction (step 10).

## Good to know

- **Tools:** `npm run screens` photographs every page at five widths with the local Edge; the amount audit of 8b builds `main` in a folder of its own and compares every euro amount of every exported page (description in the 8b handover in git history, `git show c92c0b9:docs/_UEBERGABE.md`); on Git Bash pass URL paths with `MSYS_NO_PATHCONV=1`.
- **Cloudflare since 8c:** `app` builds `/app` from `main` (previews per branch), `app-v1` is frozen (builds off), `app-neu` is frozen at the last build before the switch (builds off; delete with a go). Way back to v1 on the public link: Deployments of `app`, roll back to version 4f4d1872.
- **Open from 8b:** one date per Beleg everywhere (the Belege list uses the file date).

## Done when

- The answer to the question of principle and the board of all pages before and after are accepted by Maxi S.
- The pages are built as chosen, every page at least as good as before in an independent review at 1440 and 390 px, amounts unchanged unless he gave a go, check and amount audit green, checked live.
- `_STATUS.md` updated, this file rewritten for the next step.

## Start prompt for the next chat (copy into a new chat in `C:\Users\maxis\dev\tieout`)

> Ich bin Maxi S. Schritt 8d, Kompakt und klar, mit vollem Fokus. Lies `CLAUDE.md` und `docs/_UEBERGABE.md`. Zuerst die Grundsatzfrage: Sind Beispieldaten und Rechenkern zu komplex für einen realistischen ersten Kunden? Gib mir Optionen mit Aufwand und eine Empfehlung, bevor du etwas baust. Dann ein Board aller Seiten vorher und nachher, ich wähle je Seite. Sag mir vor jedem Teil in zwei Sätzen, was passiert, und hol dir mein Go vor allem, was nach außen geht (Push, Merge, Cloudflare). Beispieldaten, Lösungsliste, Kern und Beträge nur mit meinem Go. Deutsch, einfach, Ergebnis zuerst.
