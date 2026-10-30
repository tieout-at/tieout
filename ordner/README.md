# ordner

Turns a company's data into a real folder of synthetic documents. Everything is fictitious; every sheet carries "Beispieldaten, synthetisch".

`npm run erzeugen` (needs a local Microsoft Edge) reads `Firmendaten` from `kern/` and writes, per Beleg:

| Where | What | In git |
|---|---|---|
| `app/public/belege/<projekt>/<beleg>-<seite>.webp` | the sheet as a picture | yes |
| `app/public/belege/<projekt>/<beleg>.json` | the measured box of every value on each sheet, and for a changed plan what it is compared with | yes |
| `ordner/ausgabe/<projekt>/<datei>.pdf` | the file as it lies in a folder: pictures of pages, no text in them | no |
| `ordner/ausgabe/<projekt>/<beleg>.soll.json` | the values reading that file must give (`gelesen()` of the core) | no |

`npm run erzeugen -- nur=ab-12,plan-h201-d` redraws single Belege. Same company and profile give the same files.

## Rules

- **Values only from the core.** Every value on a sheet is a field of `gelesen()` with its place; a form without a field for it prints it under "Vermerke", so nothing the twin read can go missing. Nothing here computes or invents an amount. `app/src/lib/scans.test.ts` proves that every value has its place on a sheet, inside the page.
- **The places are measured, not typed.** Each value sits in an element with `data-place`; the run reads its box from the finished sheet. Reading a customer's folder in step 18 returns the same shape, so the viewer needs no second path.
- **The look lives in a profile** (`src/profil.ts`). A second company needs its data and a profile, no new code. The company held back for step 18 must never be tuned on.
- **A wrong number stops the run.** Quantities, amounts, prices and position numbers are read back from each finished sheet and compared with the core; a difference or a sheet that does not fit ends the run with an error.
- **Text invented for the paper** is limited to what a sheet needs around the values: form labels, the sender "Haustechnik Großhandel", a greeting, the sentence "Zur Information, Näheres siehe Betreff." on e-mails the core has no text for, and the floor plans (`src/plaene.ts`). No addresses, phone numbers or names of people.

## Not yet here

- Photos: the 10 photos of Wohnpark Mooshaim stay drawn in the viewer; they need real synthetic pictures.
- E-mails as `.eml` or `.msg`, Excel files as `.xlsx`: in `ausgabe/` everything is a PDF for now, though the Beleg's file name says otherwise.
- Pages the twin read nothing from (most of a contract) are left out.
