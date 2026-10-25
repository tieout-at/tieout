# tieout v2: design

**As of:** 25 October 2026, step 7 (Aufgaben und Start). Written by Claude for Maxi S.
**Rule:** layout, behaviour, sizes and spacing follow Attio (app.attio.com); brand, colours, icons, illustrations and words are tieout's own. The tokens live in `app/src/app/globals.css` (`@theme`); this file explains each value and where it comes from. Light only; a dark theme is not planned before the switch-over.

**Sources:** *measured* means read from the computed styles of app.attio.com in Maxi S.'s workspace (23.10.2026, `../tieout-intern/docs/Plan_Neustart.md` "Gemessene Vorlage", and again on 23.10.2026 at night for this file); *brand* means `brand/README.md` and `website/app/globals.css`; *ours* means decided in this step, with the reason.

## Typeface

Inter (variable, self-hosted from `@fontsource-variable/inter`, no request to Google). Attio sets every piece of UI text in weight 500 and tightens the larger sizes. Numbers of positions, Belege and dates in the readouts of "Übersicht" use `font-mono`, the brand's IBM Plex Mono 400 and 500 (self-hosted from `@fontsource/ibm-plex-mono`), never a system mono.

| Token | Size / line | Weight | Letter spacing | Used for | Source |
|---|---|---|---|---|---|
| `text-2xs` | 11 / 11 px | 400, upper case | +0.02 em | key caps ("STRG", "K") | measured |
| `text-xs` | 12 / 16 px | 500 | 0 | section headings in the sidebar, secondary lines, hints | measured |
| `text-sm` (body) | 14 / 20 px | 500 | −0.005 em | all UI text | measured |
| `text-base` | 16 / 20 px | 600 | −0.01 em | business name in the sidebar | measured |
| `text-base` | 16 / 20 px | 500 | −0.01 em | search input | measured |
| `text-lg` | 18 / 24 px | 600 | −0.02 em | name on a record page (project, business) | measured |
| `text-xl` | 20 / 24 px | 600 | −0.02 em | greeting on Start, title of an empty state | measured |

## Colours

Ink and ultramarine come from the brand; the greys are Attio's alphas, applied to our ink. Colour carries meaning only (state, the one accent); everything else is ink and grey.

| Token | Value | Used for | Source |
|---|---|---|---|
| `fg` | `#0a1020` | text | brand ink (Attio: `#101112`) |
| `fg-secondary` | ink at 63 % | secondary text, icons, section headings | measured alpha |
| `fg-help` | ink at 55 % | "Hilfe" in the header | measured alpha |
| `fg-muted` | ink at 58 % | hints, key caps, counters | Attio's 50 % has 3.55:1 on white; 58 % reaches 4.67:1 (AA), for screens read on site (design review, 25.10.2026) |
| `fg-faint` | ink at 30 % | separators in text, open status circles | ours |
| `surface` | `#ffffff` | page, buttons, popups | measured |
| `sidebar` | `#fbfbfb` | sidebar; the open tab | measured |
| `line` | `#eeeff1` | every 1 px line and ring | measured |
| `fill-hover` | black at 4 % | hover and the active sidebar entry | measured |
| `fill-subtle` | black at 2 % | quiet chips | measured |
| `fill-selected` | `#f6f7f7` | highlighted row in the search | measured |
| `count` | `#505155` | numbers in small counters | measured |
| `accent` | `#1d3bff` | the one primary button of a screen, focus ring, a chosen source and its mark, the trace on "Übersicht", the square in pictures, the drag state of the board; never for links or icons without an action | brand ultramarine (Attio: `#266df0`); 6.73:1 with white; kept after an independent design review (25.10.2026), a duller shade would hardly differ and break with the website |
| `grid` | `#e8ecf2` | plan grid in empty-state pictures | brand grid minor |
| `cell`, `cell-edge` | `#e6e9ef`, ink at 10 % | a cell of the Abgleich on "Übersicht" | ours |
| `state-red-edge` | `#c4312f` | red as text (an overdue date), 5.49:1 on white; the dot stays `state-red` (3.91:1) | ours, measured contrast |
| `state-*-edge` | darker green, yellow, orange | 1 px inner contour of a coloured cell, so it reaches 3:1 against white; lines and cells share one yellow | ours, measured contrast |
| `sweep` | `#a9b6ff` | the light that travels along a traced line | ours |

## Sizes and spacing

| Element | Values | Source |
|---|---|---|
| Sidebar | 275 px wide, `#fbfbfb`, 1 px line right | measured |
| Business row | 48 px, chip 20 px + name 16/600, chevron; button "Seitenleiste ausblenden" 28 px at the right | measured |
| Search row | padding 10 12 11; button 28 px, radius 8, padding 4 4 4 6, gap 6, white with `shadow-button`; key caps right | measured |
| Sidebar entry | 28 px, radius 9, padding 0 4 0 8, gap 6, icon 16 px; active and hover `fill-hover`; 1 px between entries; list padding 0 8 | measured |
| Section heading ("Ihre Daten") | 28 px, radius 6, padding 4 4 4 8, chevron 16 px, 12/16 secondary; 12 px above, 4 px to its list | measured |
| Bottom rows | "Erste Schritte" pill 28 px centred; "Mitglieder einladen" and "Beispieldaten" 28 px rows, each with a 1 px line above | measured layout, our rows |
| Header | 48 px, padding 10 12, 1 px line below; title with its 16 px icon left, "Hilfe" right (28 px, radius 8, padding 4 8 4 6) | measured |
| Buttons | 28 px, radius 8, padding 4 8 4 6, gap 6. Secondary: white with `shadow-button`. Primary: `accent`, white text, `shadow-primary`. Large (empty states): 32 px, radius 9, padding 6 10 6 8 | measured |
| Key caps | 20 px high, min 20 px wide, radius 6, padding 0 4, 1 px inner ring | measured |
| Popups (menus, popovers) | radius 12, padding 4, items 32 px with radius 8, `shadow-popup` | measured radius and ring, our shadow |
| Search (Strg K) | 740 px wide, 14 % from the top, radius 12, nothing dimmed behind it; input row 52 px (16 px text, padding 4 16); group heading 12 px with padding 16 6 8; items 36 px, radius 12, padding 6 12 6 6, highlighted `fill-selected`; icon chip 24 px; footer 44 px with a line above, arrows left, primary "Öffnen" right | measured |
| Empty state | column 380 px, centred; picture 215 × 140; 24 px to the text; title 20/24/600 (the name of the page, as Attio's "Notes"); one line 14/20 secondary, 8 px below the title; action 16 px below | measured |
| Section empty state (Start) | title 14 px secondary, one line 12 px muted, 2 px apart, centred | measured ("Meetings" on Home) |
| Record head | object chip 28 px, name 18/24/600, one line of facts below; padding 20 24 16 | measured name, our padding |
| Tabs | 28 px, radius 8, padding 4 8; the open tab on `sidebar` with a 1 px `line` ring | measured |
| Step bar (project page) | from 1024 px three columns 1 : 1 : 1.35 with 16 px gap, below that one step per row; per step: number in a 20 px chip, step name, a line to the next step; run steps as 24 px chips; the step's tabs below | ours, built from the measured chips and tabs |
| Table: bars | view bar and sort and filter bar each 48 px, padding 10 12, gap 8; view switcher and "Ansicht" as secondary buttons; "Sortiert nach" white with `shadow-button`; "Filter" quiet (`fill-subtle`, `fg-muted`); active filters as chips with a cross; a line below the second bar | measured ("Companies", 24.10.2026) |
| Table: grid | header 40 px, rows 36 px (44 px below 768 px), cells padding 0 12, 1 px `line` right and below, text 14/500; first column 250 px and fixed (132 px below 768 px, so the amounts stay in view); checkbox 16 px, radius 6, ring black at 9 %; numbers right aligned with tabular figures, headers always left; a "+" after the last header adds a column | measured; phone width ours |
| Table: footer | 36 px, line above, fixed to the bottom of the table; counter right aligned in the first column ("14 Funde", "3 von 14 Funden"); per column a sum chosen as in Attio's "Add calculation", but only fixed sums from `kern/`: label 12 px secondary, amount 14 px; when a filter cuts a group apart it says "keine feste Summe" | measured layout, rule from SPEZIFIKATION.md 4.2 |
| Tags | 24 px, radius 6, `fill-subtle` with ring, padding 0 6; the colour is only an 8 px dot: red, yellow, orange, green, grey (`state-*` tokens) | measured pill, our dot |

## Record pages (step 4)

Attio's record layout, measured on `qa-shots/attio/record.jpg`: the record head (chip, name, one line of facts) and the step bar span the page; on the tab "Überblick" a 374 px column on the left holds "Angaben" and "Vertrag" (rows of at least 40 px, label 132 px, value with its detail on a second line in 12 px; hovering or focusing a value read from a document names its place in the original, on phones that place is written under the value). On the right: highlights as cards in a grid of 3 columns from 1280 px (2 below, also on phones), title 12 px secondary, value 16/600 with tabular figures, at most two quiet lines; a card with a target is a link. Below them "Verlauf" (Attio's Activity): newest first, append only, the first 5 entries and "Alle anzeigen". Small tables inside a record (projects of an Auftraggeber, cuts, deductions, Nachträge) are `MiniTable`: 36 px rows with 1 px lines, amounts right aligned and never wrapped. Below 1024 px the two columns stack, highlights first.

## Find page (step 5)

Attio's record page with the chat panel open (`qa-shots/attio/record-panel.jpg`, measured 24.10.2026: panel 360 px, 1 px line left, header 48 px with padding 0 10 0 16, title 14/500), with the chat turned into the original (SPEZIFIKATION.md 4.2). Address `/funde/<projekt>-f1/`; every finding row of "Funde", of the project tab and of the Übersicht (its readout and its sheet) leads there.

- **Head:** record head with the number as a chip, the name (the title up to its first colon) and one line of facts; at the right "1 von 8 in Wohnpark Mooshaim" and the two arrows to the previous and next find (Attio's "11 of 22"). Below it the decision bar as Attio's action bar: the next step as the primary button ("Prüfen", then "Freigeben", "Wieder aufnehmen" after "Nicht verrechnen"), "Nicht verrechnen" with a required reason, "Aufgabe anlegen" with the Abhilfe as its text. Each opens a 320 px popup and is confirmed there; one find at a time, never in bulk. Each popup says that the entry stays in this browser until sign-in; no permanent line under the bar.
- **Body, in reading order, each fact once:** highlights "Betrag", "Belegstand", "Kürzungsrisiko" (reason and amount), "Entscheidung" (2 × 2, 4 in a row from 1536 px); the weak spot (what the risk means, Abhilfe and "Gleicher Grund" at the Auftraggeber, or "Was fehlt" for a find in Klärung); "Rechenweg" as one card, a row per step with its amount right, the formula and where the quantity comes from ("14 Stk = 100 Stk aufgemessen − 86 Stk verrechnet"), and one chip per source (the page only for a Beleg of more than 4 pages); the sum row in 600; the K7 Gegenprobe folded below the card ("Gegenprobe mit der Preisbasis"); "Belege" split into "Belegen die Leistung" and "Belegen den Preis"; "Verlauf" with corrections to these Belege, confirmed WhatsApp-Meldungen, decisions and tasks.
- **Original (ours: 400 px instead of Attio's 360, a page needs a little more room than a chat):** from 1024 px a column at the right that stays in place while the page scrolls; below 1024 px a panel from the right (tablet) or a sheet from the bottom at 85 % height (phone) that opens when a source is tapped. Header 48 px with the kind's icon, the Beleg, "Seite 1 von 2" and arrows; a line with the marked place and its review state ("maschinell gelesen", "korrigiert, vorher 01.04.2026"); then the page as a sheet of paper on `sidebar` (file name and date on top, the title only once, in the header; a place every line of an Aufmaßblatt shares is written once in its head). A chosen source is `accent-soft` with accent text, the same in the chips, the Belege list and the mark.
- **Pages:** drawn from the values the twin read (`kern/` `gelesen`), in the layout of the kind: list (Aufmaßblatt with its signature field, Leistungsverzeichnis), letter (E-Mail), message (WhatsApp-Meldung), plan (clouds on the plan grid and the Plankopf), photo (no picture in the sample data, its data below), and every other kind as its read values with place and name. Values a layout does not show are listed under it, so every mark is visible. Each page says "Beispieldaten: die Seite ist aus den gelesenen Werten nachgebildet, kein Scan."
- **Mark:** `accent-soft` with a 2 px accent bar on the left, never yellow (yellow means "Beleg fehlt"). The panel scrolls the mark into its middle without moving the page.

## Board and phone list (step 6)

Attio's "Deals" board ("Pipeline"), measured 25.10.2026 on a filled board in Maxi S.'s workspace (`qa-shots/attio/deals-board.jpg`, local only), then checked against overload with Maxi S., a fresh customer tester and an independent design review (25.10.2026). In tieout it is the view "Nach Entscheidung" of the find tables ("Funde" and the project tab "Funde"), next to "Alle Funde" in the view switcher, with the same sort and filter bar; the view switcher shows a kanban icon for it, and "Ansicht" (columns) is hidden there.

- **Table "Alle Funde":** Fund (the short name, first column 270 px), Projekt (only on "Funde" of the business), Betrag, Belegstand, Entscheidung, Kürzungsrisiko; Art, Beschreibung, Belegquelle and Arbeitsdatum come back through "Ansicht" or "+". In the project tab everything a decision needs is in view at 1440 px.
- **Columns:** 268 px, `sidebar` grey, radius 16, 8 px apart, padding 10 at the left; head 36 px with the Lucide icon of the state (no coloured dot: colour carries meaning only), the name 14/600 and the count chip. Order: "Gefunden", "Geprüft", "Freigegeben", "In der Schlussrechnung", then "Nicht verrechnen" 16 px apart. "In der Schlussrechnung" and "Nicht verrechnen" fold to a 44 px strip (icon, count, name written upwards) while empty, as Linear's folded groups, so the whole flow fits at 1440 px; a strip opens while a card that may go there is dragged. An empty column says what is missing in plain `fg-muted` text, never in a box that looks like a button. The board is as tall as the screen below the two bars; columns scroll on their own.
- **Cards (only what a decision needs):** 246 px, white, radius 12, ring black at 6 %, 12 px apart, padding 10 12; the number chip and the short name of the find page in up to three lines ("14 Wohnungen Typ C: Wohnküche geteilt, je 1 Heizkörper mehr"); one 12 px line with what was found ("+168 m über dem Leistungsverzeichnis", the core's `untertitel`); the amount, and a Belegstand tag only when it is not "belegt"; the Kürzungsrisiko when there is one; in the column "Nicht verrechnen" the reason given instead; the project only on the business board, and the number of tasks when there are any. Art, Rechenweg and Belege are one click away on the find page. The menu "…" at the bottom right (`fg-muted`, always visible, 44 px on phones) offers the decisions the find can take, each with the icon of its column.
- **Kürzungsrisiko, one form everywhere** (`RiskText`): an 8 px red dot (grey once "schon gekürzt"), "Kürzungsrisiko: Aufmaß nicht gegengezeichnet", and the amount only where it is a part of the find ("Stunden weichen ab, 194,40 €"); in the table without the word the column already says.
- **Moving is deciding (SPEZIFIKATION.md 4.2):** a card dropped on a column, or a decision chosen in its menu, opens the confirmation of the decision bar (`components/fund/decision-confirm.tsx`) as a 320 px dialog with a light dim behind it; it names the find, says what happens and whose decision it is noted as ("Vermerkt als Entscheidung der Abrechnung, vorerst nur in diesem Browser gespeichert"), and before a release lists what is still open. Until it is confirmed a dashed card in the target column says "wartet auf Bestätigung"; nothing is recorded before, one find and one step at a time, never in bulk. While a card is dragged the columns that take it get an accent ring and a dashed "Hier ablegen", the others fade; a card let go over a column that does not take it gets the reason ("Erst prüfen, dann freigeben", "Freigegebene Funde kommen in die Schlussrechnung, wenn sie erstellt wird. Von Hand geht das nicht."). After a decision a note at the bottom right, above the sums, says what happened ("F1 ist geprüft.", "F7 wird nicht verrechnet.") with "Fund öffnen". The rules are `moves()` and `refusal()` in `lib/decisions.ts`; `decide()` checks them again against the latest list of the browser before recording, and every page reloads decisions when another tab records one. On the board of the business the number goes with its project ("F1 Wohnpark Mooshaim").
- **Sums (Attio's "Add calculation" under each column):** only the fixed sums of `kern/` that cover exactly the cards of the column ("zusätzlich verrechenbar", "in Klärung", label 12 px secondary, amount 14 px, `columnSums()` in `lib/table.ts`). Where `kern/` has no sum for exactly these finds, because a filter splits a group or a decision is only in this browser, the label stays and says "nicht gerechnet", with the reason on hover; the tables do the same (decided by Maxi S., 25.10.2026: no sums of the app). "Nicht verrechnen" says "zählt in keiner Summe". A find set to "Nicht verrechnen" in the browser leaves its group (`countedGroups`).
- **Phones (below 768 px):** the board becomes one list grouped by Entscheidung, each group with a sticky 40 px head (icon, name, count) and its sums below; empty groups are left out; deciding goes through the menu of each row. The find table becomes a list (`phoneRow` of `DataTable`): number, short name in up to two lines and amount on top, the Entscheidung (not in a group that already says it) and a Belegstand only when it is not "belegt" as tags, then the Kürzungsrisiko and the project in 12 px; the counter and the fixed sums at the bottom (customer test 2). The step bar of a project is one row of tabs that scrolls sideways, the steps parted by a thin line, without the run steps, so a tab starts at about 350 px instead of 650 px.

## Tasks and Start (step 7)

Attio's "Tasks" and "Home", measured on `qa-shots/attio/tasks.jpg` and `home.jpg` (local only).

- **"Aufgaben":** the bar of the tables (48 px): "Sortiert nach Frist" (or "Angelegt, neueste zuerst"), the quiet "Filter" with Zuständig and Projekt and the active filters as chips, "Neue Aufgabe" as the primary button at the right (on phones a 44 px "+"). Below a header of 34 px with icons (Aufgabe, Erledigen bis, Fund, Zuständig; columns 1fr, 170, 240, 160 px). Open tasks in groups by due date ("Überfällig", "Heute", "Nächste 7 Tage", "Später", "Ohne Frist"), each with a 26 px head on `fill-subtle` and its count, as Attio's "Today 1"; rows of at least 42 px with the 16 px circle, the text in up to two lines, the due date ("Heute" in the orange edge colour, an overdue date in red with "überfällig" for screen readers, the group says it), the find as number chip and project, the role. Done tasks fold under "Erledigt" (struck through, green circle, "erledigt 25.10.2026"). On phones each row is the circle, the text and one 12 px line with due date, role and find. The sidebar shows the number of open tasks next to "Aufgaben".
- **Ticking off is appended:** the circle appends a tick (`TaskCheck` in `lib/decisions.ts`, noted as the role in charge), "Rückgängig" in the note at the bottom appends an opening again; the latest counts, the Verlauf of the find shows both ("Bauleitung hakte die Aufgabe ab: …"). A ticked task is no longer named on the card of the board nor before a release.
- **"Aufgabe anlegen"** (Attio's "Create task" modal, `components/aufgaben/task-dialog.tsx`): one 520 px dialog with a light dim, from "Aufgaben" ("Neue Aufgabe"), from Start ("+"), from the decision bar of a find and from the menu "…" of a card on the board. On a find the find is set and its Abhilfe is the text; on "Aufgaben" and Start the find is chosen first (grouped by project) and brings its Abhilfe, unless a text of one's own was written. The Bauleitung is proposed; the deadline of the project is named; "Vorerst nur in diesem Browser gespeichert."
- **Start** (decision E3, the 592 px column of Attio's Home): the greeting; the money of the business as two cards ("zusätzlich verrechenbar" with "davon mit Kürzungsrisiko", "in Klärung" with "Beleg fehlt oder Nachtrag nicht gelegt"), each a link to "Funde"; "Als Nächstes" with the next check (Abrechnung) and the next release (Geschäftsführung), each the first such find of the project due first, with its amount and how many follow, a jump to the find page; "Fristen"; "Aufgaben" with the three open tasks due first, each with its circle (overdue says "überfällig" in letters here), "Alle anzeigen" and "+". Money and "Als Nächstes" come from `startView()` in `lib/kern-data.ts`, built with the page and computed again in the browser after a decision (`live.ts`).

## "Übersicht" (Digitaler Zwilling)

The page that shows the flow of the website section 03 with the real data of one project (decided with Maxi S. on 24.10.2026, `SPEZIFIKATION.md` 4.4). Three columns in a CSS grid sized by the stage width, not the viewport: "Ihre Daten" (every Beleg as a tick in a ruler per group, the ones that prove a finding long and in ink), "Digitaler Zwilling" ("Wissen aus Ihrem Betrieb" with Auftraggeber, Vertrag and Preisbasis, then the Abgleich: one cell per position of the Leistungsverzeichnis in its order and one per service without a position, coloured only where the Abgleich found something, in the Belegstand colour of that finding) and "Ergebnis" (the two money words apart, each finding as a row). Hairline evidence lines of equal weight, gradient from ink into the Belegstand colour; a Beleg proves money, it does not contain it, so no line is sized by an amount. Pointing at a finding or a money figure (or Tab and Enter) traces it: the proving Belege slide out as cards (240 ms, `ease-soft`, 30 ms stagger), the lines draw from the money back to them and a light (`sweep`) travels along them; everything else dims. The own Entwurf is drawn dashed as "verrechnet laut Entwurf" and never counted as proof. An entrance of about 1,2 s plays once per session (ticks, lines, cells, money), none with reduced motion; there is no automatic tour (it disturbs reading, WCAG 2.2.2). Below a stage width of 740 px the columns stack with the money first, and a tap opens the trace as a sheet from the bottom. Every number in `components/zwilling/config.ts`; layout functions are pure and tested with real, small, large (2.000 Belege), long and empty data (`layout.test.ts`).

## Icons and pictures

- **Icons:** Lucide, stroke 2, in `fg-secondary` (the active sidebar entry in `fg`). 16 px in entries, buttons and titles; 18 px for the buttons that open or hide the sidebar, the menu and the search on phones (as Attio's sidebar button, measured); 14 px inside the 24 px chips of the search. No colour chips per object as in Attio's "Records": colour stays reserved for meaning.
- **Empty-state pictures:** Attio's frame (215 × 140, a grid that fades out to the edges) drawn in tieout's own language from the brand: plan grid, a dimension line, the Lucide icon of the page at 32 px with stroke 1.25 on a white card, and the ultramarine square of the logo at its corner. No Attio illustration is copied.
- **Business chip:** 20 px, radius 6, ink with the white initial "K".

## Behaviour

- **Strg K** (⌘ K on a Mac) opens and closes the search everywhere; Escape closes it. The search understands "LV", "AR 3", "RB 11", "AB 12", "EP", "AG", "SR" and shows the full words; lower case counts as an abbreviation only with a number ("rb 11"), so "ab" still finds "Abläufe". Umlauts may be typed or left out (`app/src/lib/search.ts`, with tests).
- **Sidebar sections** fold open and closed like Attio's "Records". The sidebar itself can be hidden with the button next to the business name; the choice is remembered in the browser.
- **Below 768 px** the sidebar becomes a panel from the left that scrolls as a whole, opened with the menu button in the header; the header also gets a search button. Tap targets are at least 44 px there (entries, tabs, buttons, menu and search rows), inputs use 16 px text, and no page scrolls sideways.
- **No button before it works** (SPEZIFIKATION.md 3.3): empty states only offer actions that exist ("Wohnpark Mooshaim öffnen"). "Erste Schritte" lists its three steps marked "folgt" instead of linking to empty pages; the members page says that inviting comes with sign-in. "Ordner importieren", inviting and exports come with the steps that build them.
- **One truth on every screen:** what the sample company already has in the shell (the project, its Auftraggeber, its deadline) appears the same everywhere; Start shows the deadline of Wohnpark Mooshaim as a plain date.
- **Links:** an internal link is ink with a faint underline that darkens on hover (`link-quiet`, Attio names a record in ink); a find is named by its number chip and project. Blue text is not a link colour.
- **Phones:** buttons, bar buttons and filter chips look 32 px high and take a 44 px tap through an invisible frame (`before:-inset-y-1.5`), source chips look 24 px; rows and menu items stay 44 px.
- **Words:** German, full words, vocabulary of SPEZIFIKATION.md section 6. `app/scripts/check-words.mjs` runs after every build and fails on a forbidden word, an abbreviation, a dash used as punctuation, an amount or an open placeholder, in the exported pages (text and read-out attributes) and in every string of `app/src/` (text that only appears after a click).

## Not taken from Attio

Chat panel and "Ask Attio", the AI input on Home, Sequences, Favorites, notifications inbox, share button, the trial row, colour chips per object, dark mode. Each verdict is in SPEZIFIKATION.md 4.2.

## Checking a screen

`npm run screens` in `app/` (with the app served on port 3100) photographs every screen with the locally installed Edge at 1440 × 900, 1024 × 768, 820 × 1180, 390 × 844 and 1912 × 930 (the viewport of the Attio references) into `app/qa-shots/`, and reports console errors and anything wider than its column. `node scripts/compare.mjs` then puts each screen next to its Attio reference (`qa-shots/vergleich/`). Attio reference pictures are taken from Maxi S.'s workspace and never kept in this public repository.
