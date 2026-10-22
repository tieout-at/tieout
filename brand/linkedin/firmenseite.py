"""Titelbild für die LinkedIn-Unternehmensseite (1128 x 191, Export in doppelter Auflösung).

Links bleibt ein Drittel frei, dort liegt das Logo der Seite. Zwei Fassungen: blau und weiß.
"""
import os, subprocess

OUT = os.path.dirname(os.path.abspath(__file__))
W, H = 1128, 191
PAPER, INK, ULTRA = "#F4F6F9", "#0A1020", "#1D3BFF"
FONTS = '<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">'


def banner(bg, line, ink, accent, mono):
    x1 = W - 56  # rechter Rand des Textblocks
    return f'''<rect width="{W}" height="{H}" fill="{bg}"/>
  <defs>
    <pattern id="g1" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0V16H0" fill="none" stroke="{line}" stroke-opacity=".07"/></pattern>
    <pattern id="g2" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0V64H0" fill="none" stroke="{line}" stroke-opacity=".14"/></pattern>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#g1)"/><rect width="{W}" height="{H}" fill="url(#g2)"/>
  <text x="{x1}" y="78" text-anchor="end" font-family="Inter Tight" font-weight="600" font-size="32" letter-spacing="-.8" fill="{ink}">Schlussrechnungen,</text>
  <text x="{x1}" y="114" text-anchor="end" font-family="Inter Tight" font-weight="600" font-size="32" letter-spacing="-.8" fill="{accent}">die nichts liegen lassen</text>
  <line x1="{x1-430}" y1="140" x2="{x1}" y2="140" stroke="{mono}" stroke-opacity=".5"/>
  <line x1="{x1-430}" y1="135" x2="{x1-430}" y2="145" stroke="{mono}" stroke-opacity=".8"/>
  <line x1="{x1}" y1="135" x2="{x1}" y2="145" stroke="{mono}" stroke-opacity=".8"/>
  <text x="{x1}" y="164" text-anchor="end" font-family="IBM Plex Mono" font-size="11.5" letter-spacing="1.4" fill="{mono}">DER DIGITALE ZWILLING FÜR ELEKTRO- UND HKLS-BETRIEBE</text>'''


def mark(x, y, s, ink, dot):
    k = s / 32
    return (f'<g transform="translate({x},{y}) scale({k})">'
            f'<path d="M4 14V4h10M28 18v10H18" stroke="{ink}" stroke-width="3.2" fill="none" stroke-linecap="square"/>'
            f'<rect x="12" y="12" width="8" height="8" fill="{dot}"/></g>')


def rechnung(bg, line, ink, accent, mono, markdot, hl, hltext):
    """Belege (Plan, Mail, Foto, Zuruf) laufen in die Schlussrechnung, fehlende Positionen kommen dazu."""
    l = lambda d, op=.75, w=1.3, extra="": f'<path d="{d}" fill="none" stroke="{line}" stroke-opacity="{op}" stroke-width="{w}" {extra}/>'
    t = lambda x, y, s, size=9.5, op=.8, anchor="start", fill=None: (
        f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="IBM Plex Mono" font-size="{size}" letter-spacing="1.1" fill="{fill or line}" fill-opacity="{op}">{s}</text>')
    g = []
    # Belege links: Plan, Mail, Foto, Zuruf
    ys = [34, 74, 114, 154]
    x0 = 352
    for y in ys:
        g.append(f'<rect x="{x0}" y="{y-12}" width="34" height="24" fill="{bg}" stroke="{line}" stroke-opacity=".85" stroke-width="1.3"/>')
    g.append(l(f"M{x0+6} {ys[0]-4}H{x0+28}M{x0+6} {ys[0]+3}H{x0+20}M{x0+14} {ys[0]-12}V{ys[0]+12}", .55, 1))
    g.append(l(f"M{x0} {ys[1]-12}L{x0+17} {ys[1]+1}L{x0+34} {ys[1]-12}", .85, 1.3))
    g.append(l(f"M{x0+4} {ys[2]+9}L{x0+14} {ys[2]-1}L{x0+21} {ys[2]+6}L{x0+25} {ys[2]+2}L{x0+31} {ys[2]+9}", .85, 1.2))
    g.append(f'<circle cx="{x0+26}" cy="{ys[2]-5}" r="2.6" fill="{line}" fill-opacity=".85"/>')
    g.append(l(f"M{x0+8} {ys[3]-3}H{x0+26}M{x0+8} {ys[3]+3}H{x0+20}", .55, 1))
    for y, lab in zip(ys, ["Plan", "Mail", "Foto", "Zuruf"]):
        g.append(f'<text x="{x0 + 44}" y="{y + 6}" font-family="Inter Tight" font-weight="600" font-size="16" fill="{line}">{lab}</text>')
    # Linien in die Rechnung
    ix, iy0, iw, ih = 560, 18, 176, 156
    for i, y in enumerate(ys):
        ty = iy0 + 54 + i * 6
        g.append(l(f"M{x0+92} {y} C {x0+150} {y}, {ix-60} {ty}, {ix} {ty}", .5, 1.2))
        g.append(f'<circle cx="{x0+92}" cy="{y}" r="2.6" fill="{line}"/>')
    # Rechnungsblatt
    g.append(f'<path d="M{ix} {iy0}H{ix+iw-16}L{ix+iw} {iy0+16}V{iy0+ih}H{ix}Z" fill="{bg}" stroke="{line}" stroke-opacity=".9" stroke-width="1.5"/>')
    g.append(l(f"M{ix+iw-16} {iy0}V{iy0+16}H{ix+iw}", .6, 1.2))
    g.append(f'<text x="{ix + 12}" y="{iy0 + 22}" font-family="Inter Tight" font-weight="600" font-size="15" fill="{line}">Schlussrechnung</text>')
    rows = [False, False, True, False, True]
    for i, add in enumerate(rows):
        y = iy0 + 42 + i * 18
        if add:
            g.append(f'<rect x="{ix+6}" y="{y-11}" width="{iw-12}" height="18" fill="{hl}"/>')
            g.append(f'<text x="{ix+11}" y="{y+4}" font-family="Inter Tight" font-size="16" font-weight="700" fill="{hltext}">+</text>')
            g.append(f'<path d="M{ix+24} {y-2}H{ix+96}M{ix+iw-52} {y-2}H{ix+iw-14}" stroke="{hltext}" stroke-width="3"/>')
        else:
            g.append(l(f"M{ix+12} {y-2}H{ix+96}M{ix+iw-52} {y-2}H{ix+iw-14}", .45, 3))
    yt = iy0 + ih - 18
    g.append(l(f"M{ix+12} {yt-12}H{ix+iw-12}", .7, 1))
    g.append(l(f"M{ix+iw-62} {yt-2}H{ix+iw-14}", .9, 3.5))
    g.append(l(f"M{ix+iw-62} {yt+6}H{ix+iw-14}", .6, 1))
    x1 = 784
    return f'''<rect width="{W}" height="{H}" fill="{bg}"/>
  <defs>
    <pattern id="g1" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0V16H0" fill="none" stroke="{line}" stroke-opacity=".06"/></pattern>
    <pattern id="g2" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0V64H0" fill="none" stroke="{line}" stroke-opacity=".12"/></pattern>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#g1)"/><rect width="{W}" height="{H}" fill="url(#g2)"/>
  {"".join(g)}
  {mark(x1, 36, 30, ink, markdot)}
  <text x="{x1+42}" y="62" font-family="Inter Tight" font-weight="600" font-size="34" letter-spacing="-1" fill="{ink}">tieout</text>
  <text x="{x1}" y="104" font-family="Inter Tight" font-weight="600" font-size="26" letter-spacing="-.6" fill="{ink}">Schlussrechnungen,</text>
  <text x="{x1}" y="134" font-family="Inter Tight" font-weight="600" font-size="26" letter-spacing="-.6" fill="{accent}">die nichts liegen lassen</text>
  <text x="{x1}" y="166" font-family="Inter Tight" font-weight="500" font-size="17" fill="{mono}" fill-opacity=".85">Für Elektro- und HKLS-Betriebe</text>'''


DESIGNS = {
    "tieout_firmenseite_blau": banner(ULTRA, "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"),
    "tieout_firmenseite_weiss": banner(PAPER, INK, INK, ULTRA, INK),
    "tieout_firmenseite_rechnung_blau": rechnung(ULTRA, "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", INK, "#FFFFFF", ULTRA),
    "tieout_firmenseite_rechnung_weiss": rechnung(PAPER, INK, INK, ULTRA, INK, ULTRA, ULTRA, "#FFFFFF"),
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
