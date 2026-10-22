param([string]$Html, [string]$OutDir)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
New-Item -ItemType Directory -Force $OutDir | Out-Null
$qa = Join-Path $OutDir "qa.html"
$content = [System.IO.File]::ReadAllText($Html, [System.Text.Encoding]::UTF8)
foreach ($theme in "light", "dark") {
  $f = Join-Path $OutDir "qa-$theme.html"
  $pre = "<!doctype html><html lang=""de"" data-theme=""$theme""><head><meta charset=""utf-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1""></head><body>"
  [System.IO.File]::WriteAllText($f, $pre + $content + "</body></html>", (New-Object System.Text.UTF8Encoding $false))
}
$shots = @(
  @("light", "cockpit", "1440,900"), @("light", "befund", "1440,900"), @("light", "vorpruefung", "1440,1300"), @("light", "zwilling", "1440,900"),
  @("dark", "cockpit", "1440,900"), @("dark", "befund", "1440,900"), @("light", "cockpit", "390,1600")
)
foreach ($s in $shots) {
  $u = ([System.Uri](Join-Path $OutDir ("qa-" + $s[0] + ".html"))).AbsoluteUri + "#" + $s[1]
  $out = Join-Path $OutDir ($s[0] + "-" + $s[1] + "-" + ($s[2] -replace ",", "x") + ".png")
  & $edge --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$env:TEMP\edge-shot-profile" --virtual-time-budget=6000 --window-size=$($s[2]) --screenshot="$out" $u 2>$null | Out-Null
  Write-Output $out
}
