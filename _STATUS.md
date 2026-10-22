# Status

**Stand:** Donnerstag, 22. Oktober 2026
**Pflege:** jeden Sonntag nach der Kennzahlen-Runde aktualisieren (30 Minuten, Dossier v3 Abschnitt 14).

## Entschieden

- Dossier v3 ist der gültige Stand. v2 ist Archiv.
- Kernprodukt: Firmen-Zwilling mit Projektzwillingen, erste Anwendung Schlussrechnung.
- Gates R1 bis R5 und der Endentscheid (So 31.1.2027) bleiben unverändert.
- Sub-Seite bleibt. Wechsel auf die GU-Seite ist geprüft und verworfen.

## Gates

| Gate | Datum | Stand |
|---|---|---|
| R1 Insider | Term Sheet Fr 20.11., hart Fr 4.12. | offen |
| R4 Recht | Fr 4.12. | offen |
| R2 Ordner | Fr 11.12. | offen |
| R3 Geld | Fr 22.1.2027 | offen |
| R5 Zahlung | Fr 29.1.2027 | offen |

## Diese Woche (KW 43, laut Dossier v3 Abschnitt 14)

- Dossier v3 mit dem Team durchgehen
- Repo außerhalb OneDrive (erledigt) und `Umfang_v1.md` anlegen
- Demo Klickpfad festlegen, Generator für synthetische Daten starten
- Entwurf Gründervertrag (A), Entwurf #glaubandich Text (B)

## Offen für Maxi (Website)

- Produktverständnis für die Website: erledigt (siehe Dossier v3 Abschnitt 0 und 3)
- 22.10.: Arbeitstitel „Tieout.“ (vorher „EndPoint.“), CI Planraster (Papier, Tinte, Ultramarin), Website online unter endpoint-preview.pages.dev. Domain tieout.at gekauft (easyname, Inhaber Maxi D.), Zone in Cloudflare angelegt und mit der Website verbunden. Offen: Nameserver bei easyname auf cheryl/hugh.ns.cloudflare.com umstellen, sobald der CloudPit-Zugang da ist
- 22.10.: GTM und Monetarisierung offen, daher keine Preise und kein „Check anfragen“ auf der Website
- Offen: Markenprüfung und Domain, Hosting, „Ghost“ klären, Team-Rollen und Fotos
- Frage ans Team: Ist „Zwilling“ für Inhaber zu abstrakt? Alternativ „Wissensdatenbank des Betriebs“ testen

## Produkt

- 22.10.: Produktstand von Maxi S. nach `product/` übernommen: Plan und Umfang (an v3 angepasst), Lösungsliste der Demo-Fälle, Rechenkern mit 58 Tests, UI-Fundament. Überblick in `product/README.md`.
- 22.10. abends (Maxi S.): Datenmodell Firma → Auftraggeber → Projekt mit Zurufen und 7 kleinen Projekten (Tests treffen die Lösungsliste v2 cent-genau). Demo-App mit Firmenübersicht, Projekt-Übersicht, Befunden und Befund-Seite mit Original und zweistufiger Freigabe. CI prüft jeden PR. Stand und nächste Schritte in `product/README.md`.
- 22.10. nachts (Maxi S. mit Claude): Seitenleiste neu, Zeitachse, WhatsApp-Szene, Ledger mit 380 Positionen, Ordner mit Belegmatrix. Online auf main, unabhängig geprüft. Zielgruppe geschärft (`docs/research_notes/Zielgruppe_Challenge.md`), Namensvorschläge in PR #19 (Team entscheidet). Nächster Chat: `_UEBERGABE.md`.
- Offen fürs Team: Hosting der Demo (Vercel Hobby deployt keine privaten Org-Repos), GitHub-Plan für den Schutz von main, Name, Logo, Akzentfarbe (in der App Platzhalter).
- 22.10. spät (Maxi S. mit Claude, vier parallele Sitzungen): Stile je Bereich geteilt (#24), Ablauf 1 bis 4 auf der Projektübersicht mit echten Zahlen und Links (#27), Politur ohne Ampelpunkte und Farbflächen (#28), alle Tabellen einheitlich 36 px ohne Verschieben (#29), zentrale Tokens (#33), Prüfbefunde (#35). Unabhängig geprüft: alle Beträge centgenau, keine kaputten Links. Website-Check mit Widersprüchen auf der Website: `docs/research_notes/Website_Check_2026-10-22.md`.
- 22.10.: Name und Logo stehen: **Tieout.**, Domain tieout.at (noch nicht live). Nächste Schritte Produkt (Rebranding, Link, UI an die Website, Tempo, Zuruf-Agent von Santino aus PR #25): `_UEBERGABE.md`.
- Offen: Wer baut was (Produkt, Website), Entscheidung in der Sonntagsrunde 25.10.
- 22.10.: Planung Zuruf-Agent (WhatsApp, Stufe 2 vorgezogen, nur synthetisch) in `product/zuruf/` auf Branch `zuruf/plan`. Go des Teams zu `GESTALTUNG.md` und `PLAN.md` offen.

## Noch nicht angelegt

- Dossier v1 (v2 verweist für Quellen zu Recht, Markt und Exits auf v1 Abschnitt 18; liegt nicht in diesem Ordner)

## Ordner

- 22.10.: aufgeräumt. v2 nach `docs/archiv/`, Kuro/reebuild-Fakten aus v2 nach `docs/research_notes/Kuro_reebuild_Fakten.md`.
- 22.10.: privates GitHub Repository angelegt, liegt in der Organisation `schlusswerk` (github.com/schlusswerk/schlusswerk) (Monorepo: `docs/`, `business/`, `product/`, `website/`, `video/`). Repo außerhalb OneDrive: erledigt.
