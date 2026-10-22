"""30 Bildmarken für tieout auf einem Blatt (15 passend, 15 kreativer). Ausgabe: brand/logo/tieout_logo_vorschlaege.png."""
import os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
INK, U = "#0A1020", "#1D3BFF"
S = f'stroke="{INK}" fill="none"'
B = f'fill="{U}"'

MARKS = [
    # ---------- 15 passend ----------
    ("Abgleich", "zwei Mengen, Blau schließt die Lücke",
     f'<rect x="8" y="16" width="36" height="9" fill="{INK}"/><rect x="20" y="39" width="36" height="9" fill="{INK}"/><rect x="28" y="25" width="8" height="14" {B}/>'),
    ("Maßkette", "Bemaßung, der Punkt ist der Fund",
     f'<path d="M6 32H58M6 22V42M58 22V42" {S} stroke-width="4"/><circle cx="32" cy="32" r="7" {B}/>'),
    ("Zwei Ebenen", "Betrieb über Projekt, der Zwilling",
     f'<polygon points="20,8 58,8 46,27 8,27" {S} stroke-width="4"/><polygon points="18,36 56,36 44,56 6,56" {B}/>'),
    ("Ecke mit Haken", "Plan-Ecke, geprüft",
     f'<path d="M8 30V8h22" {S} stroke-width="6"/><path d="M22 40l9 9 19-21" stroke="{U}" stroke-width="7" fill="none"/>'),
    ("Ledger plus", "Liste, eine Zeile kommt dazu",
     f'<path d="M8 14H56M8 29H56M8 44H34" {S} stroke-width="6"/><path d="M47 37V53M39 45H55" stroke="{U}" stroke-width="6" fill="none"/>'),
    ("t aus Blöcken", "Monogramm im Raster",
     f'<rect x="22" y="6" width="11" height="44" fill="{INK}"/><rect x="10" y="18" width="34" height="10" fill="{INK}"/><rect x="40" y="44" width="12" height="12" {B}/>'),
    ("Fadenkreuz", "Messpunkt, wie die Seitennavigation",
     f'<circle cx="32" cy="32" r="17" {S} stroke-width="4"/><path d="M32 3V19M32 45V61M3 32H19M45 32H61" {S} stroke-width="4"/><rect x="27" y="27" width="10" height="10" {B}/>'),
    ("Klammer", "Beleg in Klammern gefasst",
     f'<path d="M20 9H9V55H20M44 9H55V55H44" {S} stroke-width="6"/><circle cx="32" cy="32" r="8" {B}/>'),
    ("Plus aus Feldern", "vier Felder, Mitte gefunden",
     f'<rect x="23" y="5" width="18" height="18" fill="{INK}"/><rect x="5" y="23" width="18" height="18" fill="{INK}"/><rect x="41" y="23" width="18" height="18" fill="{INK}"/><rect x="23" y="41" width="18" height="18" fill="{INK}"/><rect x="23" y="23" width="18" height="18" {B}/>'),
    ("Tie-Point", "zwei Punkte, verbunden",
     f'<path d="M20 40L44 24" {S} stroke-width="5"/><circle cx="15" cy="44" r="8" {S} stroke-width="5"/><circle cx="49" cy="20" r="9" {B}/>'),
    ("Rechnung", "Blatt mit Falz, blaue Zeile neu",
     f'<path d="M14 5H40L52 17V59H14Z" {S} stroke-width="5"/><path d="M40 5V17H52M22 30H44M22 40H44" {S} stroke-width="3"/><path d="M22 50H38" stroke="{U}" stroke-width="6"/>'),
    ("Winkelmaß", "Werkzeug, Messung im Eck",
     f'<polygon points="8,8 18,8 18,46 56,46 56,56 8,56" fill="{INK}"/><path d="M28 46V40M36 46V40M44 46V40" {S} stroke-width="3"/><rect x="22" y="22" width="12" height="12" {B}/>'),
    ("to-Ligatur", "t und o greifen ineinander",
     f'<path d="M20 6V44a8 8 0 0 0 8 8h4M10 20H32" {S} stroke-width="7"/><circle cx="45" cy="40" r="12" stroke="{U}" stroke-width="7" fill="none"/>'),
    ("Stapel", "drei Belege, der oberste zählt",
     f'<rect x="6" y="34" width="24" height="24" {S} stroke-width="4"/><rect x="20" y="20" width="24" height="24" {S} stroke-width="4" style="fill:#fff"/><rect x="34" y="6" width="24" height="24" {B}/>'),
    ("Ecken plus", "heutiges Zeichen, weiterentwickelt",
     f'<path d="M5 22V5h17M59 42v17H42" {S} stroke-width="6"/><path d="M32 20V44M20 32H44" stroke="{U}" stroke-width="8"/>'),
    # ---------- 15 kreativer ----------
    ("Ausreißer", "ein Punkt verlässt das Raster: out",
     "".join(f'<circle cx="{x}" cy="{y}" r="4" fill="{INK}"/>' for x in (12, 26, 40) for y in (26, 40, 54) if (x, y) != (40, 26)) + f'<circle cx="54" cy="10" r="6" {B}/>'),
    ("Kabel-t", "ein Kabel formt das t",
     f'<path d="M30 4V40c0 14 16 14 20 4M14 18H46" {S} stroke-width="7" stroke-linecap="round"/><rect x="44" y="36" width="12" height="9" rx="2" {B}/>'),
    ("Fliege", "tie, wörtlich genommen",
     f'<polygon points="5,14 27,27 27,37 5,50" fill="{INK}"/><polygon points="59,14 37,27 37,37 59,50" fill="{INK}"/><rect x="26" y="25" width="12" height="14" {B}/>'),
    ("Iso-Würfel", "Bauteil im Raum, oben der Fund",
     f'<polygon points="32,5 57,18 32,31 7,18" {B}/><polygon points="7,18 32,31 32,59 7,46" {S} stroke-width="4"/><polygon points="57,18 57,46 32,59 32,31" fill="{INK}"/>'),
    ("Steckdose", "Elektro, sofort erkennbar",
     f'<circle cx="32" cy="32" r="25" {S} stroke-width="5"/><rect x="20" y="22" width="6" height="16" fill="{INK}"/><rect x="38" y="22" width="6" height="16" fill="{INK}"/><rect x="28" y="43" width="8" height="8" {B}/>'),
    ("Rohrbogen", "HKLS, Bogen mit Flansch",
     f'<path d="M14 58V38a20 20 0 0 1 20-20H58" {S} stroke-width="10"/><rect x="52" y="9" width="7" height="18" {B}/><rect x="5" y="52" width="18" height="7" {B}/>'),
    ("Grundriss", "Raum mit Tür, Fund im Raum",
     f'<path d="M30 56H56V8H8V56H18" {S} stroke-width="5"/><path d="M30 56A12 12 0 0 0 18 44" {S} stroke-width="2"/><circle cx="40" cy="24" r="7" {B}/>'),
    ("Waage", "beauftragt gegen gebaut",
     f'<path d="M32 10V54M18 54H46M8 18H56" {S} stroke-width="5"/><polygon points="8,18 2,34 14,34" fill="{INK}"/><polygon points="56,18 50,34 62,34" {B}/>'),
    ("Plan-Haken", "zwei Planlinien werden ein Haken",
     f'<path d="M6 30L26 50L58 12" {S} stroke-width="7"/><rect x="20" y="44" width="12" height="12" {B}/>'),
    ("Überlappung", "Auftrag und Bau, die Schnittmenge",
     f'<rect x="7" y="7" width="32" height="32" {S} stroke-width="5"/><rect x="25" y="25" width="32" height="32" {S} stroke-width="5"/><rect x="25" y="25" width="14" height="14" {B}/>'),
    ("Zollstock", "Messen auf der Baustelle",
     f'<polyline points="5,50 19,20 33,50 47,20 59,40" {S} stroke-width="7" stroke-linejoin="miter"/><circle cx="33" cy="50" r="5" {B}/>'),
    ("Strichcode", "jede Position erfasst, die letzte neu",
     f'<rect x="8" y="12" width="4" height="40" fill="{INK}"/><rect x="15" y="12" width="7" height="40" fill="{INK}"/><rect x="25" y="12" width="3" height="40" fill="{INK}"/><rect x="31" y="12" width="6" height="40" fill="{INK}"/><rect x="40" y="12" width="3" height="40" fill="{INK}"/><rect x="47" y="12" width="9" height="40" {B}/>'),
    ("Pixel-t", "ein Pixel springt heraus",
     "".join(f'<rect x="{x}" y="{y}" width="8" height="8" fill="{INK}"/>' for x, y in [(24, 8), (24, 17), (24, 26), (24, 35), (24, 44), (15, 17), (33, 17), (33, 44)]) + f'<rect x="48" y="30" width="8" height="8" {B}/>'),
    ("Zielfeld", "eckige Zielscheibe, Treffer in Blau",
     f'<rect x="7" y="7" width="50" height="50" {S} stroke-width="4"/><rect x="18" y="18" width="28" height="28" {S} stroke-width="4"/><rect x="27" y="27" width="10" height="10" {B}/>'),
    ("Strom in Klammer", "Elektro trifft Beleg",
     f'<path d="M18 9H9V55H18M46 9H55V55H46" {S} stroke-width="6"/><polygon points="36,8 22,35 31,35 26,56 42,27 33,27" {B}/>'),
]


def card(i, name, note, inner):
    return f'''<div class="card"><div class="num">{i:02d}</div>
<svg viewBox="0 0 64 64" class="mark">{inner}</svg>
<div class="lock"><svg viewBox="0 0 64 64" class="mini">{inner}</svg><span>tieout</span></div>
<div class="name">{name}</div><div class="note">{note}</div></div>'''


html = f'''<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
body{{margin:0;background:#F4F6F9;font-family:'Inter Tight';color:{INK};padding:48px 56px}}
h1{{margin:0 0 6px;font-size:34px;letter-spacing:-.02em}} p.sub{{margin:0 0 28px;font-family:'IBM Plex Mono';font-size:13px;color:#5a6272;letter-spacing:.04em}}
h2{{font-family:'IBM Plex Mono';font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:{U};margin:30px 0 14px;font-weight:500}}
.grid{{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}}
.card{{position:relative;background:#fff;border:1px solid rgba(10,16,32,.12);padding:22px 20px 18px;display:flex;flex-direction:column;align-items:center}}
.num{{position:absolute;top:10px;left:12px;font-family:'IBM Plex Mono';font-size:11px;color:#8a92a2}}
.mark{{width:96px;height:96px;margin:6px 0 16px}}
.lock{{display:flex;align-items:center;gap:8px;margin-bottom:12px}} .mini{{width:26px;height:26px}} .lock span{{font-weight:600;font-size:24px;letter-spacing:-.03em}}
.name{{font-weight:600;font-size:15px}} .note{{font-family:'IBM Plex Mono';font-size:11px;color:#5a6272;text-align:center;margin-top:4px;line-height:1.35}}
</style></head><body>
<h1>tieout · 30 Bildmarken</h1><p class="sub">TINTE #0A1020 · ULTRAMARIN #1D3BFF · JE ZEICHEN ALLEIN UND MIT WORTMARKE</p>
<h2>01–15 · passend</h2><div class="grid">{''.join(card(i+1, *m) for i, m in enumerate(MARKS[:15]))}</div>
<h2>16–30 · kreativer</h2><div class="grid">{''.join(card(i+16, *m) for i, m in enumerate(MARKS[15:]))}</div>
</body></html>'''

hp = os.path.join(HERE, "vorschlaege.html")
open(hp, "w", encoding="utf-8").write(html)
png = os.path.join(HERE, "tieout_logo_vorschlaege.png")
subprocess.run([r"C:\Program Files\Google\Chrome\Application\chrome.exe", "--headless=new", "--disable-gpu", "--hide-scrollbars",
                "--force-device-scale-factor=2", "--window-size=1500,2050", "--virtual-time-budget=6000", f"--screenshot={png}",
                "file:///" + hp.replace("\\", "/")], check=True, capture_output=True, timeout=120)
print(png, len(MARKS))
