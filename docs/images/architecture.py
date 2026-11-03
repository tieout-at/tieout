"""Draws the architecture picture of the README in the style of the website section 03 (paper, ink, ultramarine).

Run from the repository root: python docs/images/architecture.py docs/images/architecture.svg
"""
import sys

INK, BLUE, PAPER, GRID, FINE, MUTED, LINE = "#0A1020", "#1D3BFF", "#F4F6F9", "#D5DCE6", "#E8ECF2", "#8A94A6", "#C9D2DF"
SANS = "Inter, 'Segoe UI', Helvetica, Arial, sans-serif"
MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
W, H = 1200, 620
o = []
a = o.append

def text(x, y, s, size=14, fill=INK, font=SANS, weight=400, anchor="start", ls=0, extra=""):
    a(f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" letter-spacing="{ls}" {extra}>{s}</text>')

def mono(x, y, s, size=11, fill=BLUE, anchor="start", ls=1.5):
    text(x, y, s, size, fill, MONO, 400, anchor, ls)

a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="tieout architecture: your data flows into a digital twin of the business and its projects, which produces a final invoice with evidence for every line">')
a('<defs>')
a(f'<pattern id="fine" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="{FINE}" stroke-width="1"/></pattern>')
a(f'<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="url(#fine)"/><path d="M48 0H0V48" fill="none" stroke="{GRID}" stroke-width="1"/></pattern>')
a('</defs>')
a(f'<rect width="{W}" height="{H}" fill="{PAPER}"/><rect width="{W}" height="{H}" fill="url(#grid)"/>')
a(f'<rect x="20" y="20" width="{W-40}" height="{H-40}" fill="#FBFCFE" stroke="{GRID}"/>')

mono(48, 62, "01 · YOUR DATA")
mono(470, 62, "02 · DIGITAL TWIN")
mono(890, 62, "03 · RESULT")

# ---------- inputs ----------
def icon(kind, x, y):
    s = f'fill="none" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"'
    if kind == "db":
        a(f'<ellipse cx="{x+8}" cy="{y+3}" rx="6" ry="2.5" {s}/><path d="M{x+2} {y+3}V{y+13}c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V{y+3}M{x+2} {y+8}c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" {s}/>')
    elif kind == "calc":
        a(f'<rect x="{x+3}" y="{y+1}" width="10" height="14" rx="1" {s}/><path d="M{x+5} {y+4}h6M{x+5.5} {y+8}h1M{x+9.5} {y+8}h1M{x+5.5} {y+11}h1M{x+9.5} {y+11}h1" {s}/>')
    elif kind == "plan":
        a(f'<rect x="{x+1}" y="{y+1}" width="14" height="14" {s}/><path d="M{x+1} {y+7}h6V{y+15}M{x+7} {y+4}V{y+1}M{x+10} {y+7}h5" {s}/>')
    elif kind == "doc":
        a(f'<path d="M{x+3} {y+1}h7l3 3v11H{x+3}z" {s}/><path d="M{x+5.5} {y+7}h5M{x+5.5} {y+10}h5M{x+5.5} {y+13}h3" {s}/>')
    elif kind == "table":
        a(f'<rect x="{x+1}" y="{y+2}" width="14" height="12" {s}/><path d="M{x+1} {y+6}h14M{x+1} {y+10}h14M{x+6} {y+2}v12" {s}/>')
    elif kind == "mail":
        a(f'<rect x="{x+1}" y="{y+3}" width="14" height="10" {s}/><path d="M{x+1} {y+3}l7 5 7-5" {s}/>')
    elif kind == "chat":
        a(f'<path d="M{x+8} {y+1.5}a6.5 6.5 0 1 1-3.2 12.2L{x+1.5} {y+14.5}l.9-3.2A6.5 6.5 0 0 1 {x+8} {y+1.5}z" {s}/>')
    elif kind == "photo":
        a(f'<rect x="{x+1}" y="{y+4}" width="14" height="10" {s}/><path d="M{x+5} {y+4}l1.5-2h3L{x+11} {y+4}" {s}/><circle cx="{x+8}" cy="{y+9}" r="2.6" {s}/>')

groups = [
    ("SYSTEMS", [("db", "ERP", "invoices"), ("calc", "Estimating", "prices")]),
    ("DOCUMENTS", [("plan", "Plans", "with revision"), ("doc", "Bill of quantities", "PDF"), ("table", "Measurements", "Excel"), ("doc", "Timesheets", "scan")]),
    ("COMMUNICATION", [("mail", "Email", "instructions"), ("chat", "WhatsApp", "messages"), ("photo", "Photos", "voice notes")]),
]
BX, BW, BH, STEP = 70, 250, 36, 43
y = 86
mid_in = (378, 312)
ends = []
for gname, items in groups:
    top = y
    for kind, name, qual in items:
        a(f'<rect x="{BX}" y="{y}" width="{BW}" height="{BH}" fill="#FFFFFF" stroke="{LINE}"/>')
        icon(kind, BX + 12, y + BH / 2 - 8)
        text(BX + 40, y + 23, name, 14)
        mono(BX + BW - 12, y + 23, qual, 11, MUTED, "end", 0.3)
        ends.append((BX + BW, y + BH / 2))
        y += STEP
    bottom = y - STEP + BH
    a(f'<path d="M58 {top}V{bottom}" stroke="{GRID}" stroke-width="1"/>')
    cy = (top + bottom) / 2
    mono(46, cy, gname, 9, MUTED, "middle", 1.6)
    o[-1] = o[-1].replace("<text ", f'<text transform="rotate(-90 46 {cy})" ', 1)
    y += 14

for ex, ey in ends:
    a(f'<path d="M{ex} {ey}C{ex+40} {ey} {mid_in[0]-40} {mid_in[1]} {mid_in[0]} {mid_in[1]}" fill="none" stroke="{BLUE}" stroke-opacity="0.35" stroke-width="1.2"/>')

# ---------- twin ----------
L1 = [(478, 92), (842, 92), (808, 268), (444, 268)]
L2 = [(478, 330), (842, 330), (808, 516), (444, 516)]
def poly(pts, fill, stroke, extra=""):
    a(f'<polygon points="{" ".join(f"{x},{y}" for x, y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="1.3" {extra}/>')

# connection from input to both levels
for tx, ty in [(461, 180), (461, 423)]:
    a(f'<path d="M{mid_in[0]} {mid_in[1]}C{mid_in[0]+40} {mid_in[1]} {tx-40} {ty} {tx} {ty}" fill="none" stroke="{BLUE}" stroke-width="1.3"/>')
    a(f'<circle cx="{tx}" cy="{ty}" r="3.5" fill="#FFFFFF" stroke="{BLUE}" stroke-width="1.3"/>')
a(f'<circle cx="{mid_in[0]}" cy="{mid_in[1]}" r="3.5" fill="{BLUE}"/>')

# shadow planes
poly([(x + 6, y + 6) for x, y in L1], "#E3E8F0", "none")
poly(L1, "#FFFFFF", INK)
mono(500, 118, "LEVEL 1 · YOUR BUSINESS", 11)
mono(500, 136, "COMPANY KNOWLEDGE", 9, MUTED, ls=1.2)
for i, label in enumerate(["Clients", "Contracts", "Price base"]):
    x = 500 + i * 106
    a(f'<rect x="{x}" y="{146}" width="96" height="22" fill="#FFFFFF" stroke="{LINE}"/>')
    mono(x + 48, 161, label, 11, INK, "middle", 0.3)
projects = [["Vienna 21", "Linz South", "Graz East"], ["Mödling", "Baden", "St. Pölten"]]
for r, row in enumerate(projects):
    for c, name in enumerate(row):
        x, yy = 492 + c * 106 - r * 10, 180 + r * 40
        hl = (r, c) == (1, 2)
        a(f'<rect x="{x}" y="{yy}" width="96" height="32" fill="{BLUE if hl else "#FFFFFF"}" stroke="{BLUE if hl else LINE}"/>')
        mono(x + 7, yy + 12, "PROJECT", 7.5, "#C9D3FF" if hl else MUTED, ls=0.8)
        text(x + 7, yy + 26, name, 12.5, "#FFFFFF" if hl else INK, weight=600)
# projection from the chosen project down to level 2
a(f'<polygon points="694,252 790,252 842,330 478,330" fill="{BLUE}" fill-opacity="0.07"/>')
a(f'<path d="M694 252L478 330M790 252L842 330" stroke="{BLUE}" stroke-opacity="0.35" stroke-width="1"/>')

poly([(x + 6, y + 6) for x, y in L2], "#E3E8F0", "none")
poly(L2, "#F1F3FF", BLUE)
mono(500, 356, "LEVEL 2 · PROJECT ST. PÖLTEN", 11)
mono(500, 374, "WORK: ORDERED, BUILT, INVOICED", 9, MUTED, ls=1.2)
cols = [("ITEM", 492), ("ORDERED", 612), ("BUILT", 672), ("INVOICED", 726), ("OPEN", 790)]
for label, x in cols:
    mono(x, 398, label, 8.5, MUTED, ls=1)
a(f'<path d="M486 405H810" stroke="{LINE}"/>')
rows = [("Ventilation duct", 0.6, 0.95, 0.6, True), ("Roof unit", 0.0, 0.5, 0.0, True), ("Fire sealing", 0.85, 0.85, 0.55, True), ("WC units", 0.65, 0.65, 0.65, False)]
for i, (name, ord_, built, inv, op) in enumerate(rows):
    yy = 424 + i * 22
    sh = i * 4  # follow the slant of the plane
    text(492 - sh, yy, name, 12, INK)
    for val, x in [(ord_, 612), (built, 672), (inv, 726)]:
        a(f'<rect x="{x - sh}" y="{yy - 7}" width="{46 * val:.0f}" height="6" fill="{INK}" fill-opacity="0.22"/>') if val else mono(x - sh, yy, "–", 10, MUTED, ls=0)
    if op:
        a(f'<rect x="{786 - sh}" y="{yy - 11}" width="34" height="15" fill="{BLUE}"/>')
        mono(803 - sh, yy, "+ €", 9.5, "#FFFFFF", "middle", 0.3)
    else:
        a(f'<path d="M{797 - sh} {yy - 4}l3 3 6-6" fill="none" stroke="{MUTED}" stroke-width="1.4"/>')
mono(640, 568, "ONE TWIN FOR THE WHOLE BUSINESS, WITH INSIGHT INTO EVERY PROJECT", 9.5, MUTED, "middle", 1.4)

# ---------- result ----------
mid_out = (866, 300)
for sx, sy in [(826, 180), (826, 423)]:
    a(f'<path d="M{sx} {sy}C{sx+25} {sy} {mid_out[0]-25} {mid_out[1]} {mid_out[0]} {mid_out[1]}" fill="none" stroke="{BLUE}" stroke-width="1.3"/>')
a(f'<circle cx="{mid_out[0]}" cy="{mid_out[1]}" r="3.5" fill="{BLUE}"/>')
a(f'<path d="M{mid_out[0]} {mid_out[1]}H890" stroke="{BLUE}" stroke-width="1.3"/>')
CX, CY, CW, CH = 890, 86, 272, 436
a(f'<rect x="{CX + 8}" y="{CY + 8}" width="{CW}" height="{CH}" fill="#D9DFFF"/>')
a(f'<rect x="{CX}" y="{CY}" width="{CW}" height="{CH}" fill="#FFFFFF" stroke="{INK}" stroke-width="1.3"/>')
mono(CX + 18, CY + 30, "FINAL INVOICE", 9.5, MUTED, ls=1.4)
text(CX + 18, CY + 55, "Project St. Pölten", 18, INK, weight=600)
a(f'<path d="M{CX} {CY + 72}H{CX + CW}" stroke="{LINE}"/>')
checks = ["Forgotten hours found", "Extra quantities detected", "Plan changes included", "Checked like the client would", "Evidence for every line", "Released by a person"]
for i, label in enumerate(checks):
    yy = CY + 104 + i * 36
    a(f'<rect x="{CX + 18}" y="{yy - 12}" width="15" height="15" fill="#FFFFFF" stroke="{BLUE}" stroke-width="1.3"/>')
    a(f'<path d="M{CX + 21.5} {yy - 4.5}l3 3 5.5-6.5" fill="none" stroke="{BLUE}" stroke-width="1.6"/>')
    text(CX + 44, yy, label, 14, INK)
    if i < len(checks) - 1:
        a(f'<path d="M{CX + 18} {yy + 15}H{CX + CW - 18}" stroke="{FINE}" stroke-dasharray="2 3"/>')
yb = CY + 330
a(f'<path d="M{CX} {yb}H{CX + CW}" stroke="{LINE}"/>')
mono(CX + 18, yb + 26, "ADDITIONALLY", 9.5, MUTED, ls=1.4)
mono(CX + 18, yb + 40, "BILLABLE", 9.5, MUTED, ls=1.4)
for i, h in enumerate([16, 9, 11, 18, 8, 22, 26]):
    x = CX + 18 + i * 34
    a(f'<rect x="{x}" y="{yb + 88 - h}" width="28" height="{h}" fill="{BLUE if i == 4 else "#D9DFFF"}"/>')

a('</svg>')
open(sys.argv[1], "w", encoding="utf-8", newline="\n").write("\n".join(o) + "\n")
print("written")
