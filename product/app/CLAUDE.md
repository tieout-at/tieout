# Schlusswerk: Projektregeln

Internes Prüfwerkzeug für österreichische HKLS- und Elektro-Subunternehmer: Vor der Schlussrechnung an den GU gleicht es LV, Aufmaß, Regie, Abschlagsrechnungen, Pläne, Mails und Fotos ab. Erst mit synthetischen Daten (MVP), dann mit echten Projektordnern (v1). Kein Kundenzugang.

Auftraggeber ist Maxi S. (kein Entwickler): Deutsch, Ergebnis zuerst, einfache Sprache, Fachbegriffe beim ersten Mal übersetzen. Die Regeln in `../../CLAUDE.md` (Repo-Wurzel) gelten zusätzlich.

## Wo was steht
- Strategie: `../../docs/Schlusswerk Dossier v3.md`, Abschnitt 3 (Produkt), 12 (Verworfen), 15 (Bau). Teamstand: `../../_STATUS.md`.
- Produkt-Dokumente in `../docs/`:
  - `Plan_MVP.md`, `Umfang_v1.md` (inkl. Nicht-Liste und Entscheidungen), `Inspiration_Muster.md`, `Pruefberichte_UI.md`.
  - `Demo_Faelle.md`: Lösungsliste der eingebauten Fälle. **Maßgeblich für Beträge.** Nicht im Code ändern, Abweichungen melden; Änderungen an der Liste nur mit Go von Maxi S.
- UI: nur aus `../ui-fundament/` (Design-System, `LIESMICH.md`).
- `src/domain/typen.ts`: Datenmodell „Datensatz mit Quelle“. Jedes Feld aus einem Dokument ist `Feld<T>` mit Quelle (Datei, Seite, Stelle, Rechteck) und Prüfstand (maschinell / bestätigt / blockiert). Freigabe zweistufig (übernommen M, freigegeben I) als eigener Typ außerhalb des Datensatzes.
- `src/engine/`: Rechenkern, reine Funktionen. `pruefe(datensatz)` in `index.ts` liefert Import-Stand, Ledger, Befunde (drei Listen plus Hinweis „braucht Anwalt“), Vorprüfung aus GU-Sicht, Hinweise, Prüfkaskade.
  - `befunde.ts`: Mehrmenge, Regie, Preisumrechnung (ÖNORM B 2111), Anmeldungen, Termin-/Behinderungs-Hinweise.
  - `vorpruefung.ts`: Kürzungsrisiken mit festen Gründen (`Kuerzungsgrund`), Hinweise „Mengenänderung über 20 %“.
  - `kaskade.ts`: Leistungssumme → Nachlass → Abzüge → Einbehalte → Zahlungen → Restforderung, Abgleich mit dem Vertrag.
  - `geld.ts`: Cent-Rechnung, Rundung, Formatierung.
- `src/demo/w21/`: synthetischer Datensatz „Wohnhausanlage Wien 21, HKLS-Los“ (`erzeuge.ts`, deterministisch), Katalog der 380 LV-Positionen, Lösungsliste für Tests (`loesung.ts`).
- `scripts/generate/`: schreibt `data/generated/w21.json` (läuft auch vor `build`).

## Regeln
- **Die KI liefert Fakten mit Quelle, die Rechnung ist Code.** Der Rechenkern liest nur den Datensatz, nie die Lösungsliste.
- Beträge sind ganze Cent, Mengen Hundertstel der Einheit, Sätze Basispunkte (3,8 % = 380). Rundung kaufmännisch pro Zeile (`rundeHalbAuf`). Keine Kommazahlen in Summen.
- Jeder Befund trägt Rechenweg und Belege mit Quelle. Der Mensch gibt jede Zeile frei.
- Nie das Wort „Claim“, nie „Forcierung“, keine Aussagen zur Präklusion oder rechtliche Würdigung. Termin- und Behinderungsfälle sind Hinweise ohne Betrag für die Kanzlei.
- Synthetische Daten immer als synthetisch kennzeichnen; Firmen sind fiktiv (Haustechnik Beispiel GmbH, Hochbau Beispiel GmbH).
- Echte Kundendaten nie ins Repo (`data/real/` ist ignoriert). Repo nie in OneDrive.

## Arbeitsweise
- `npm run typecheck`, `npm run lint`, `npm test` vor jedem Commit grün.
- Neue Regel = positiver Test und Gegenprobe in `regeln.test.ts`. Änderungen am Datensatz: `pruefung.test.ts` muss weiter genau die Lösungsliste treffen.
- Arbeit auf einem eigenen Branch, nach `main` nur über Pull Request. Push nur nach Go von Maxi S. Danach `../README.md` (Abschnitt „Stand“) nachziehen.

## Fachliche Annahmen (mit dem Insider prüfen)
- Mehrmenge: abgerechnet wird die Aufmaßmenge zum EP laut LV; K7 dient nur der Plausibilität. Mittellohnpreis 56,80 €/h aus der eigenen Kalkulation (K3).
- ÖNORM B 2110: Mengenänderung über 20 % kann einen neuen Einheitspreis auslösen; wir zeigen nur einen neutralen Hinweis, rechnen aber mit dem LV-EP.
- Preisumrechnung: Lohnanteil 40 % der aufgemessenen Leistung ab Stichtag; Leistung „ab Stichtag“ = Aufmaßblätter, deren Leistungszeitraum am oder nach dem Stichtag beginnt; Index Lohn Basis Angebotsmonat. Keine Bagatellgrenze, Regie nicht umgerechnet.
- Leistungssumme der Kaskade = Schlussrechnungs-Entwurf des Projektleiters + Liste 1. Abzüge des GU-Abzugsschreibens werden auf die Summe nach Nachlass gerechnet, Einbehalte auf den Betrag vor Einbehalten; der Deckungsrücklass gilt nur für Abschläge.
- Kürzungsrisiko „Aufmaß nicht gegengezeichnet“ nur für die Menge über der LV-Menge.
- Kürzungsrisiko „Stunden weichen ab“ nur, wenn der Regiebericht mehr Stunden zeigt als die Stundenliste derselben Woche.
- „Bezahlt“ im Ledger = in bezahlten AR enthalten minus Kürzungen des GU (vor Nachlass und Rücklässen).
- Felder mit Prüfstand „blockiert“ werden vom Rechenkern noch nicht ausgeklammert (offen für v1).
