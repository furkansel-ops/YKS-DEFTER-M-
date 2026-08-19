$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlPath = Join-Path $root 'index.html'
$html = [IO.File]::ReadAllText($htmlPath, [Text.Encoding]::UTF8)
$errors = [Collections.Generic.List[string]]::new()

function Add-Error([string]$message) { $script:errors.Add($message) }

$required = @('index.html','YKS-Defterim.html','manifest.webmanifest','sw.js','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','YKS-Baslat.cmd','YKS-Baslat.ps1')
foreach ($name in $required) { if (-not (Test-Path -LiteralPath (Join-Path $root $name))) { Add-Error "Eksik dosya: $name" } }

$idPattern = '\bid\s*=\s*[\x22\x27]([^\x22\x27]+)[\x22\x27]'
$ids = [regex]::Matches($html, $idPattern) | ForEach-Object { $_.Groups[1].Value }
$ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object { Add-Error "Yinelenen id: $($_.Name) ($($_.Count))" }

$functions = [regex]::Matches($html, '\bfunction\s+([A-Za-z_$][\w$]*)\s*\(') | ForEach-Object { $_.Groups[1].Value }
$functions | Group-Object | Where-Object Count -gt 1 | ForEach-Object { Add-Error "Yinelenen fonksiyon: $($_.Name)" }

$refPattern = '\bel\([\x22\x27]([^\x22\x27]+)[\x22\x27]\)'
$refs = [regex]::Matches($html, $refPattern) | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
foreach ($ref in $refs) { if ($ref -notin $ids) { Add-Error "HTML'de bulunmayan öğe: $ref" } }

$apiKeys = [regex]::Matches($html, 'AIza[0-9A-Za-z_-]{20,}')
if ($apiKeys.Count -gt 1) { Add-Error 'Birden fazla gömülü Google API anahtarı var.' }
if ($apiKeys.Count -eq 1 -and $html -notmatch 'const YT_BUILTIN_KEY="AIza') { Add-Error 'API anahtarı beklenmeyen bir konumda.' }
if ($html -notmatch 'id="dSegYDT"' -or $html -notmatch 'id="pt_SOZ"' -or $html -notmatch 'id="pt_DIL"') { Add-Error 'YDT/SÖZ/DİL desteği eksik.' }
if ($html -notmatch 'id="monthReportBox"' -or $html -notmatch 'id="anaCmpBox"') { Add-Error 'Ayrılmış rapor/karşılaştırma alanları eksik.' }
if ($html -notmatch 'function playlistIdFromUrl' -or $html -notmatch 'function openDirectPlaylist' -or $html -notmatch 'listType=playlist') { Add-Error 'Anahtarsız oynatma listesi desteği eksik.' }
if ($html -notmatch 'function openExternalUrl' -or $html -notmatch '/__open_brave') { Add-Error 'YouTube bağlantılarını Brave ile açma desteği eksik.' }
if ($html -notmatch '(?s)\.thcard\.open\s*\{[^}]*position:fixed' -or $html -notmatch 'function closeTeacher') { Add-Error 'Hoca ayrıntısının tam ekran desteği eksik.' }

try { Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'manifest.webmanifest') | ConvertFrom-Json | Out-Null } catch { Add-Error "Manifest geçersiz JSON: $($_.Exception.Message)" }
if ((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root 'index.html')).Hash -ne
    (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root 'YKS-Defterim.html')).Hash) {
  Add-Error 'index.html ile YKS-Defterim.html aynı sürüm değil.'
}

if ($errors.Count) {
  Write-Host "BASARISIZ: $($errors.Count) sorun" -ForegroundColor Red
  $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
  exit 1
}

Write-Host "BASARILI: $($ids.Count) oge, $($functions.Count) fonksiyon ve gerekli dosyalar dogrulandi." -ForegroundColor Green
