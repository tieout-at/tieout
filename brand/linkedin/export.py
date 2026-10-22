"""LinkedIn-Dateien zum Hochladen: Logo (quadratisch, reines Weiß) und Titelbild der Firmenseite.

Logo: 400 x 400 (LinkedIn-Empfehlung) und 1200 x 1200. Titelbild: 1128 x 191 (Empfehlung), Export 4-fach = 4512 x 764.
Ausgabe: brand/linkedin/upload/
"""
import os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "upload")
os.makedirs(OUT, exist_ok=True)
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

LOGO = '''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#FFFFFF"/>
  <g transform="translate(80,80) scale(7.5)">
    <path d="M4 14V4h10M28 18v10H18" stroke="#0A1020" stroke-width="3.2" fill="none" stroke-linecap="square"/>
    <rect x="12" y="12" width="8" height="8" fill="#1D3BFF"/>
  </g>
</svg>'''


def render(svg_or_html, w, h, scale, name):
    page = svg_or_html if svg_or_html.lstrip().startswith("<!doctype") else (
        f'<!doctype html><html><head><meta charset="utf-8"><style>html,body{{margin:0;background:#fff}} svg{{display:block}}</style></head><body>{svg_or_html}</body></html>')
    hp = os.path.join(OUT, name + ".html")
    open(hp, "w", encoding="utf-8").write(page)
    png = os.path.join(OUT, name + ".png")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--force-device-scale-factor={scale}",
                    f"--window-size={w},{h}", "--virtual-time-budget=6000", f"--screenshot={png}", "file:///" + hp.replace("\\", "/")],
                   check=True, capture_output=True, timeout=90)
    os.remove(hp)
    print(png)


render(LOGO, 400, 400, 1, "tieout_linkedin_logo_400")
render(LOGO, 400, 400, 3, "tieout_linkedin_logo_1200")
for v in ("weiss", "blau"):
    html = open(os.path.join(HERE, f"tieout_firmenseite_rechnung_{v}.html"), encoding="utf-8").read()
    render(html, 1128, 191, 4, f"tieout_linkedin_titelbild_{v}_4512x764")
