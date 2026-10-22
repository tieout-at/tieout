# Marke

Logo, Farben und LinkedIn-Grafiken von **tieout**. Alles wird per Skript aus SVG erzeugt und mit Chrome headless als PNG gerendert, damit es jederzeit gleich neu entsteht.

## Grundlagen

| | |
|---|---|
| Name | **tieout**, immer klein, ohne Punkt |
| Bildmarke | zwei Plan-Ecken in Tinte, Quadrat in Ultramarin (`website/components/ui/Logo.tsx`) |
| Farben | Papier `#F4F6F9`, Tinte `#0A1020`, Ultramarin `#1D3BFF` |
| Schriften | Inter Tight (Text), IBM Plex Mono (Beschriftungen) |
| Bildsprache | Planraster, Maßketten, Linienzeichnungen |

Details und Regeln für die Website: [`website/STRUKTUR.md`](../website/STRUKTUR.md).

## Ordner

| Pfad | Inhalt |
|---|---|
| [`linkedin/upload/`](linkedin/upload/README.md) | **Fertige Dateien** für LinkedIn: Logo (reines Weiß, 400 und 1200 px), Titelbild der Firmenseite (weiß, blau) |
| `linkedin/entwuerfe/` | Entwürfe: drei Banner fürs persönliche Profil (Blaupause, E-Plan, Zwilling), Firmenseite ohne und mit Skizze |
| `linkedin/erzeugen.py` | erzeugt die drei Banner fürs persönliche Profil (1584 × 396) |
| `linkedin/firmenseite.py` | erzeugt die Titelbilder der Firmenseite (1128 × 191, doppelte Auflösung) |
| `linkedin/export.py` | erzeugt die Upload-Dateien in `linkedin/upload/` |

## Neu erzeugen

Braucht Python 3 und Google Chrome.

```bash
python brand/linkedin/firmenseite.py
python brand/linkedin/export.py
```

Die HTML-Zwischendateien in `linkedin/entwuerfe/` stehen nicht im Repository (`brand/.gitignore`).
