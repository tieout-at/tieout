param([string]$Html, [string]$Hash = "cockpit", [int]$Width = 1280)
$dir = Split-Path $Html
$f = Join-Path $dir "measure-probe.html"
$probe = @'
<script>
setTimeout(function(){
  var o = [];
  var t = document.querySelector(".sw-table"), p = t && t.closest(".sw-panel");
  if (t) o.push("Tabelle " + Math.round(t.getBoundingClientRect().width) + " / Panel " + Math.round(p.getBoundingClientRect().width));
  var tr = document.querySelector(".sw-table tbody tr"); if (tr) o.push("Zeilenhoehe " + Math.round(tr.getBoundingClientRect().height));
  var h = document.querySelector(".sw-pagehead"), n = document.querySelector(".sw-notice");
  o.push("Kopf " + Math.round(h.getBoundingClientRect().height) + (n ? " + Leiste " + Math.round(n.getBoundingClientRect().height) : " (keine Leiste)"));
  var W = document.documentElement.clientWidth, over = [];
  document.querySelectorAll("body *").forEach(function(e){ var r = e.getBoundingClientRect(); if (r.width > 0 && r.right > W + 1) { var p = e.parentElement.getBoundingClientRect(); if (p.right <= W + 1) over.push(e.tagName + "." + String(e.className).split(" ")[0]); } });
  document.querySelectorAll(".sw-panel").forEach(function(p){ if (p.scrollWidth > p.clientWidth + 1) over.push("Panel scrollt: " + p.scrollWidth + "/" + p.clientWidth); });
  o.push("Ueberlauf: " + (over.length ? over.join(", ") : "keiner"));
  document.querySelectorAll(".sw-panel__head").forEach(function(e){ o.push("Panelkopf " + Math.round(e.getBoundingClientRect().height)); });
  var pre = document.createElement("pre"); pre.id = "probe"; pre.textContent = o.join("\n"); document.body.appendChild(pre);
}, 1500);
</script>
'@
$content = [System.IO.File]::ReadAllText($Html, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($f, $content + $probe, (New-Object System.Text.UTF8Encoding $false))
$u = ([System.Uri]$f).AbsoluteUri + "#" + $Hash
$out = Join-Path $dir "measure-dom.html"
cmd /c "`"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`" --headless=new --disable-gpu --user-data-dir=`"%TEMP%\edge-probe`" --virtual-time-budget=5000 --window-size=$Width,900 --dump-dom `"$u`" > `"$out`" 2>nul"
$s = $null
for ($i = 0; $i -lt 40 -and -not $s; $i++) { try { $s = [System.IO.File]::ReadAllText($out) } catch { [System.Threading.Thread]::Sleep(500) } }
$m = [regex]::Match($s, '<pre id="probe">([\s\S]*?)</pre>')
"[$Width px, #$Hash]"; $m.Groups[1].Value
