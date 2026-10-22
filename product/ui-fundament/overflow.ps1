param([string]$Html, [string]$Hash = "cockpit", [int]$Width = 390)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$dir = Split-Path $Html
$f = Join-Path $dir "overflow-probe.html"
$probe = @'
<script>
setTimeout(function(){
  var W = document.documentElement.clientWidth, out = [];
  document.querySelectorAll("body *").forEach(function(e){
    var r = e.getBoundingClientRect();
    if (r.right > W + 1 && r.width > 0) {
      var p = e.parentElement, pr = p ? p.getBoundingClientRect() : null;
      if (!pr || pr.right <= W + 1) out.push(e.tagName + "." + (e.className || "").toString().replace(/ /g, ".") + " right=" + Math.round(r.right) + " w=" + Math.round(r.width));
    }
  });
  var pre = document.createElement("pre"); pre.id = "probe"; pre.textContent = "W=" + W + "\n" + out.slice(0, 30).join("\n"); document.body.appendChild(pre);
}, 1500);
</script>
'@
$content = [System.IO.File]::ReadAllText($Html, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($f, $content + $probe, (New-Object System.Text.UTF8Encoding $false))
$u = ([System.Uri]$f).AbsoluteUri + "#" + $Hash
$dom = & $edge --headless=new --disable-gpu --user-data-dir="$env:TEMP\edge-shot-profile" --virtual-time-budget=5000 --window-size="$Width,900" --dump-dom $u 2>$null
$m = [regex]::Match(($dom -join "`n"), '<pre id="probe">([\s\S]*?)</pre>')
$m.Groups[1].Value
