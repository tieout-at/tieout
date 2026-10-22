"""Drei LinkedIn-Banner (1584 x 396) in der tieout-CI als HTML, danach per Chrome headless als PNG."""
import os, subprocess

OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)

W, H = 1584, 396
PAPER, INK, ULTRA, WHITE = "#F4F6F9", "#0A1020", "#1D3BFF", "#FFFFFF"

FONTS = '<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">'


def mark(x, y, s, ink, dot):
    k = s / 32
    return (f'<g transform="translate({x},{y}) scale({k})">'
            f'<path d="M4 14V4h10M28 18v10H18" stroke="{ink}" stroke-width="3.2" fill="none" stroke-linecap="square"/>'
            f'<rect x="12" y="12" width="8" height="8" fill="{dot}"/></g>')


def grid(color, minor, major, step=24):
    return (f'<defs><pattern id="g1" width="{step}" height="{step}" patternUnits="userSpaceOnUse">'
            f'<path d="M{step} 0V{step}H0" fill="none" stroke="{color}" stroke-opacity="{minor}" stroke-width="1"/></pattern>'
            f'<pattern id="g2" width="{step*4}" height="{step*4}" patternUnits="userSpaceOnUse">'
            f'<path d="M{step*4} 0V{step*4}H0" fill="none" stroke="{color}" stroke-opacity="{major}" stroke-width="1"/></pattern></defs>'
            f'<rect width="{W}" height="{H}" fill="url(#g1)"/><rect width="{W}" height="{H}" fill="url(#g2)"/>')


def text_block(x, ink, accent, mono, markink, markdot):
    return f'''
  {mark(x, 92, 46, markink, markdot)}
  <text x="{x+62}" y="130" font-family="Inter Tight" font-weight="600" font-size="52" letter-spacing="-1.5" fill="{ink}">tieout</text>
  <text x="{x}" y="206" font-family="Inter Tight" font-weight="600" font-size="38" letter-spacing="-1" fill="{ink}">Schlussrechnungen,</text>
  <text x="{x}" y="250" font-family="Inter Tight" font-weight="600" font-size="38" letter-spacing="-1" fill="{accent}">die nichts liegen lassen.</text>
  <line x1="{x}" y1="288" x2="{x+560}" y2="288" stroke="{mono}" stroke-opacity=".35"/>
  <text x="{x}" y="316" font-family="IBM Plex Mono" font-size="15" letter-spacing="1.6" fill="{mono}">DER DIGITALE ZWILLING FÜR ELEKTRO- UND HKLS-BETRIEBE</text>
  <text x="{x}" y="344" font-family="IBM Plex Mono" font-weight="500" font-size="15" letter-spacing="1.6" fill="{accent}">TIEOUT.AT</text>'''


def iso_factory(ox, oy, u):
    def iso(x, y, z):
        return (ox + (x - y) * 0.866 * u, oy + (x + y) * 0.5 * u - z * u)
    return iso


def pts(ps):
    return " ".join(f"{a:.1f},{b:.1f}" for a, b in ps)


# ---------- 1: Blaupause, Rohbau mit Kran ----------
def banner_blueprint():
    iso = iso_factory(420, 214, 38)
    L = []
    line = lambda a, b, op=.5, w=1.4, dash="": L.append(
        f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#fff" stroke-opacity="{op}" stroke-width="{w}" {dash}/>')
    fh = 1.1
    for li in range(5):
        z = li * fh
        xe = 4 if li < 4 else 2
        poly = [iso(0, 0, z), iso(xe, 0, z), iso(xe, 3, z), iso(0, 3, z)]
        L.append(f'<polygon points="{pts(poly)}" fill="#fff" fill-opacity=".06" stroke="#fff" stroke-opacity=".8" stroke-width="1.5"/>')
        if li < 4:
            for x in range(0, 5):
                for y in range(0, 4):
                    if li == 3 and x > 2:
                        continue
                    line(iso(x, y, z), iso(x, y, z + fh), .5, 1.1)
    for x in (0, 1, 2):
        for y in (0, 3):
            line(iso(x, y, 4 * fh), iso(x, y, 4 * fh + .55), .6, 1.1, 'stroke-dasharray="3 3"')
    # Kran: Mast rechts vom Bau, Ausleger waagrecht im Bild
    mx, my, top = 6.2, -0.6, 6.4
    m1, m2 = (mx, my), (mx + .3, my - .3)
    for (x, y) in (m1, m2):
        line(iso(x, y, 0), iso(x, y, top), .85, 1.5)
    z = 0
    while z < top - .45:
        line(iso(*m1, z), iso(*m2, z + .45), .45, 1)
        line(iso(*m2, z + .45), iso(*m1, z + .9), .45, 1)
        z += .9
    j0, j1 = iso(mx - 1.4, my + 1.4, top), iso(mx + 3.2, my - 3.2, top)
    line(j0, j1, .9, 2)
    peak = iso(mx + .15, my - .15, top + 1.0)
    line(peak, j1, .55, 1)
    line(peak, j0, .55, 1)
    L.append(f'<rect x="{j0[0]:.1f}" y="{j0[1]:.1f}" width="22" height="14" fill="#fff" fill-opacity=".85"/>')
    hk = iso(mx + 2.2, my - 2.2, top)
    hk2 = iso(mx + 2.2, my - 2.2, top - 2.2)
    line(hk, hk2, .7, 1)
    L.append(f'<rect x="{hk2[0]-11:.1f}" y="{hk2[1]:.1f}" width="22" height="16" fill="none" stroke="#fff" stroke-width="1.6"/>')
    # Leitungsweg (Elektro) an der Fassade, mit Messpunkten
    route = [iso(.3, 3, .4), iso(3.6, 3, .4), iso(3.6, 3, fh + .4), iso(.8, 3, fh + .4), iso(.8, 3, 2 * fh + .4), iso(3.2, 3, 2 * fh + .4), iso(3.2, 3, 3 * fh + .4), iso(1.4, 3, 3 * fh + .4)]
    L.append(f'<polyline points="{pts(route)}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>')
    for p in route:
        L.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="5" fill="{ULTRA}" stroke="#fff" stroke-width="2.4"/>')
    # Bemaßung
    a, b = iso(0, 3.8, 0), iso(4, 3.8, 0)
    line(a, b, .8, 1.2)
    for p in (a, b):
        line((p[0] - 5, p[1] - 5), (p[0] + 5, p[1] + 5), .9, 1.4)
    mxp, myp = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    L.append(f'<text x="{mxp+8:.0f}" y="{myp+20:.0f}" font-family="IBM Plex Mono" font-size="13" fill="#fff" fill-opacity=".85" transform="rotate(30 {mxp+8:.0f} {myp+20:.0f})">12,00</text>')
    drawing = "".join(L)
    corner = '<text x="40" y="44" font-family="IBM Plex Mono" font-size="12" letter-spacing="1.5" fill="#fff" fill-opacity=".7">BLATT 01 · ROHBAU · M 1:200</text>'
    return f'''<rect width="{W}" height="{H}" fill="{ULTRA}"/>
  {grid("#fff", .1, .22)}
  {corner}
  {drawing}
  {text_block(960, WHITE, WHITE, "#ffffff", WHITE, INK)}'''


# ---------- 2: Papier, Grundriss mit Leitungsweg ----------
def banner_plan():
    L = []
    wall = lambda d: L.append(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="square"/>')
    thin = lambda d, op=.45: L.append(f'<path d="{d}" fill="none" stroke="{INK}" stroke-opacity="{op}" stroke-width="1.2"/>')
    x0, y0, x1, y1 = 300, 70, 820, 340
    wall(f"M{x0} {y0}H{x1}V{y1}H{x0}Z")
    wall(f"M520 {y0}V190 M520 240V{y1}")
    wall(f"M520 210H600 M650 210H{x1}")
    wall(f"M{x0} 250H360 M410 250H520")
    # Türen
    for a in ["M520 190 A50 50 0 0 0 470 240 L520 240", "M600 210 A50 50 0 0 1 650 160 L650 210", "M360 250 A50 50 0 0 1 410 200 L410 250"]:
        thin(a, .45)
    # Fenster
    for xa in (360, 640):
        L.append(f'<rect x="{xa}" y="{y0-4}" width="90" height="8" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"/>')
    # Raumnamen
    for tx, ty, t in [(330, 110, "BÜRO 1.04"), (550, 110, "BESPRECHUNG"), (600, 250, "TECHNIK"), (318, 278, "STIEGE")]:
        L.append(f'<text x="{tx}" y="{ty}" font-family="IBM Plex Mono" font-size="12" letter-spacing="1.2" fill="{INK}" fill-opacity=".55">{t}</text>')
    # Stiege
    for i in range(8):
        thin(f"M{400+i*16} 262V330", .3)
    # Steckdosen und Leitungsweg
    sockets = [(300, 160), (440, 340), (520, 130), (700, 70), (820, 150), (820, 290), (690, 340)]
    route = "M760 285 L760 150 L700 150 L700 95 M760 150 L795 150 M760 285 L795 285 M700 150 L560 150 L560 130 L535 130 M560 150 L560 300 L690 300 L690 325 M560 300 L440 300 L440 325 M440 300 L330 300 L330 160 L315 160"
    L.append(f'<path d="{route}" fill="none" stroke="{ULTRA}" stroke-width="2" stroke-dasharray="7 5"/>')
    L.append(f'<rect x="742" y="268" width="36" height="34" fill="{ULTRA}"/><text x="760" y="290" text-anchor="middle" font-family="IBM Plex Mono" font-size="11" font-weight="500" fill="#fff">UV</text>')
    for i, (sx, sy) in enumerate(sockets):
        hl = i in (1, 4)
        fill = ULTRA if hl else PAPER
        L.append(f'<circle cx="{sx}" cy="{sy}" r="9" fill="{fill}" stroke="{ULTRA}" stroke-width="2"/>')
    # Markierung gefunden
    for sx, sy, dx, dy in [(440, 340, 18, 22), (820, 150, -110, -34)]:
        L.append(f'<g transform="translate({sx+dx},{sy+dy})"><rect width="92" height="22" fill="{ULTRA}"/><text x="46" y="15" text-anchor="middle" font-family="IBM Plex Mono" font-size="11" letter-spacing="1" fill="#fff">GEFUNDEN</text></g>')
    # Bemaßung oben
    dims = [(300, 520, "5,50"), (520, 820, "7,50")]
    for a, b, t in dims:
        thin(f"M{a} 40H{b}", .6)
        for p in (a, b):
            thin(f"M{p-5} 45L{p+5} 35", .8)
            thin(f"M{p} 30V60", .3)
        L.append(f'<text x="{(a+b)/2}" y="32" text-anchor="middle" font-family="IBM Plex Mono" font-size="12" fill="{INK}" fill-opacity=".7">{t}</text>')
    thin(f"M860 {y0}V{y1}", .6)
    for p in (y0, y1):
        thin(f"M855 {p+5}L865 {p-5}", .8)
    L.append(f'<text x="878" y="210" font-family="IBM Plex Mono" font-size="12" fill="{INK}" fill-opacity=".7" transform="rotate(90 878 210)">6,75</text>')
    corner = f'<text x="40" y="44" font-family="IBM Plex Mono" font-size="12" letter-spacing="1.5" fill="{ULTRA}">E-PLAN · 1. OG · INDEX D</text>'
    return f'''<rect width="{W}" height="{H}" fill="{PAPER}"/>
  {grid(INK, .05, .1)}
  {corner}
  {"".join(L)}
  {text_block(960, INK, ULTRA, INK, INK, ULTRA)}'''


# ---------- 3: Tinte, Zwilling in zwei Ebenen ----------
def banner_twin():
    L = []
    SK = 70

    def plane(x, y, w, h, label, active):
        p = f"{x+SK},{y} {x+w},{y} {x+w-SK},{y+h} {x},{y+h}"
        L.append(f'<polygon points="{p}" fill="{ULTRA if active else "#fff"}" fill-opacity="{.16 if active else .04}" stroke="{"#5b74ff" if active else "#fff"}" stroke-opacity="{1 if active else .45}" stroke-width="1.5"/>')
        L.append(f'<text x="{x+SK+18}" y="{y+26}" font-family="IBM Plex Mono" font-size="12" letter-spacing="1.4" fill="#8a9bff">{label}</text>')

    def sh(x, y, top, h):
        return x - SK * ((y - top) / h)

    # Eingänge links
    chips = ["ERP", "LV", "PLÄNE", "AUFMASS", "E-MAIL", "WHATSAPP", "FOTOS"]
    for i, c in enumerate(chips):
        y = 52 + i * 46
        L.append(f'<rect x="40" y="{y}" width="118" height="30" fill="none" stroke="#fff" stroke-opacity=".35"/>')
        L.append(f'<text x="54" y="{y+20}" font-family="IBM Plex Mono" font-size="12" letter-spacing="1" fill="#fff" fill-opacity=".8">{c}</text>')
        L.append(f'<path d="M158 {y+15} C 230 {y+15}, 250 {130 if i < 4 else 280}, 330 {130 if i < 4 else 280}" fill="none" stroke="#5b74ff" stroke-opacity=".6" stroke-width="1.3"/>')
        L.append(f'<circle r="3.5" fill="#fff"><animateMotion dur="1s" repeatCount="1" fill="freeze" keyPoints="{.3+i*.08:.2f};{.3+i*.08:.2f}" keyTimes="0;1" path="M158 {y+15} C 230 {y+15}, 250 {130 if i < 4 else 280}, 330 {130 if i < 4 else 280}"/></circle>')
    # Ebene 1
    t1, h1 = 40, 150
    plane(300, t1, 560, h1, "EBENE 1 · BETRIEB", False)
    for r, y in enumerate((96, 140)):
        for c in range(4):
            x = sh(412 + c * 104, y, t1, h1)
            hl = r == 0 and c == 0
            L.append(f'<rect x="{x:.1f}" y="{y}" width="92" height="30" fill="{ULTRA if hl else "none"}" stroke="{"#5b74ff" if hl else "#fff"}" stroke-opacity="{1 if hl else .4}"/>')
            L.append(f'<text x="{x+8:.1f}" y="{y+19}" font-family="IBM Plex Mono" font-size="10.5" letter-spacing=".8" fill="#fff" fill-opacity="{1 if hl else .6}">PROJEKT {r*4+c+1:02d}</text>')
    # Ebene 2
    t2, h2 = 222, 150
    plane(300, t2, 560, h2, "EBENE 2 · PROJEKT 01", True)
    cols = [0, 210, 290, 370]
    heads = ["POSITION", "LV", "GEBAUT", "OFFEN"]
    for i, hd in enumerate(heads):
        x = sh(380 + cols[i], 270, t2, h2)
        L.append(f'<text x="{x:.1f}" y="270" font-family="IBM Plex Mono" font-size="10.5" letter-spacing=".8" fill="#fff" fill-opacity=".55">{hd}</text>')
    rows = [("Steckdose UP", "120", "126", "+6"), ("Leuchten Stiege", "24", "28", "+4"), ("Kabeltrasse", "340 m", "340 m", "✓")]
    for ri, r in enumerate(rows):
        y = 298 + ri * 26
        x0 = sh(380, y, t2, h2)
        if r[3] != "✓":
            L.append(f'<rect x="{x0-8:.1f}" y="{y-17}" width="420" height="24" fill="{ULTRA}" fill-opacity=".45"/>')
        for i, v in enumerate(r):
            x = sh(380 + cols[i], y, t2, h2)
            L.append(f'<text x="{x:.1f}" y="{y}" font-family="{"Inter Tight" if i == 0 else "IBM Plex Mono"}" font-size="13" font-weight="{600 if i in (0, 3) else 400}" fill="#fff">{v}</text>')
    # Verbindung zwischen den Ebenen
    a = sh(412, 126, t1, h1)
    L.append(f'<path d="M{a:.1f} 126 L{sh(380, 240, t2, h2):.1f} 240" stroke="#5b74ff" stroke-dasharray="3 4" stroke-width="1.3"/>')
    L.append(f'<path d="M{a+92:.1f} 126 L{sh(800, 240, t2, h2):.1f} 240" stroke="#5b74ff" stroke-dasharray="3 4" stroke-width="1.3"/>')
    # Messpunkte an den Ecken
    for x, y in [(300 + SK, t1), (860, t1), (300, t2 + h2), (860 - SK, t2 + h2)]:
        L.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#fff"/>')
    return f'''<rect width="{W}" height="{H}" fill="{INK}"/>
  {grid("#fff", .045, .09)}
  {"".join(L)}
  {text_block(960, WHITE, "#7d90ff", "#c9d2ff", WHITE, ULTRA)}'''


DESIGNS = {
    "tieout_linkedin_1_blaupause": banner_blueprint(),
    "tieout_linkedin_2_eplan": banner_plan(),
    "tieout_linkedin_3_zwilling": banner_twin(),
}

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
for name, body in DESIGNS.items():
    html = f'''<!doctype html><html><head><meta charset="utf-8">{FONTS}
<style>html,body{{margin:0;padding:0;background:#000}} svg{{display:block}}</style></head>
<body><svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{body}</svg></body></html>'''
    hp = os.path.join(OUT, name + ".html")
    open(hp, "w", encoding="utf-8").write(html)
    png = os.path.join(OUT, name + ".png")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size={W},{H}", "--virtual-time-budget=6000", f"--screenshot={png}", "file:///" + hp.replace("\\", "/")],
                   check=True, capture_output=True, timeout=90)
    print(png, os.path.getsize(png))
