"""Titelbild für die LinkedIn-Unternehmensseite (1128 x 191, Export in doppelter Auflösung).

Links bleibt ein Drittel frei, dort liegt das Logo der Seite. Zwei Fassungen: blau und weiß.
"""
import os, subprocess

OUT = os.path.dirname(os.path.abspath(__file__))
W, H = 1128, 191
PAPER, INK, ULTRA = "#F4F6F9", "#0A1020", "#1D3BFF"
FONTS = '<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">'


def banner(bg, line, ink, accent, mono):
    x1 = W - 56  # rechter Rand des Textblocks
    return f'''<rect width="{W}" height="{H}" fill="{bg}"/>
  <defs>
    <pattern id="g1" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0V16H0" fill="none" stroke="{line}" stroke-opacity=".07"/></pattern>
    <pattern id="g2" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0V64H0" fill="none" stroke="{line}" stroke-opacity=".14"/></pattern>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#g1)"/><rect width="{W}" height="{H}" fill="url(#g2)"/>
  <text x="{x1}" y="78" text-anchor="end" font-family="Inter Tight" font-weight="600" font-size="32" letter-spacing="-.8" fill="{ink}">Schlussrechnungen,</text>
  <text x="{x1}" y="114" text-anchor="end" font-family="Inter Tight" font-weight="600" font-size="32" letter-spacing="-.8" fill="{accent}">die nichts liegen lassen.</text>
  <line x1="{x1-430}" y1="140" x2="{x1}" y2="140" stroke="{mono}" stroke-opacity=".5"/>
  <line x1="{x1-430}" y1="135" x2="{x1-430}" y2="145" stroke="{mono}" stroke-opacity=".8"/>
  <line x1="{x1}" y1="135" x2="{x1}" y2="145" stroke="{mono}" stroke-opacity=".8"/>
  <text x="{x1}" y="164" text-anchor="end" font-family="IBM Plex Mono" font-size="11.5" letter-spacing="1.4" fill="{mono}">DER DIGITALE ZWILLING FÜR ELEKTRO- UND HKLS-BETRIEBE</text>'''


DESIGNS = {
    "tieout_firmenseite_blau": banner(ULTRA, "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"),
    "tieout_firmenseite_weiss": banner(PAPER, INK, INK, ULTRA, INK),
}

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
for name, body in DESIGNS.items():
    html = f'''<!doctype html><html><head><meta charset="utf-8">{FONTS}
<style>html,body{{margin:0;padding:0}} svg{{display:block}}</style></head>
<body><svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{body}</svg></body></html>'''
    hp = os.path.join(OUT, name + ".html")
    open(hp, "w", encoding="utf-8").write(html)
    png = os.path.join(OUT, name + ".png")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                    f"--window-size={W},{H}", "--virtual-time-budget=6000", f"--screenshot={png}", "file:///" + hp.replace("\\", "/")],
                   check=True, capture_output=True, timeout=90)
    print(png, os.path.getsize(png))
