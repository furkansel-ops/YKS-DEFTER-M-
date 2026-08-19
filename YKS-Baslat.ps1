param([switch]$Test)
$ErrorActionPreference = 'Stop'
$appFolder = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8777

function Show-YksError([string]$message) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show($message, 'YKS Defterim', 'OK', 'Error') | Out-Null
}

$busy = $false
$client = [System.Net.Sockets.TcpClient]::new()
try { $client.Connect('127.0.0.1', $port); $busy = $true } catch {} finally { $client.Dispose() }
if ($busy) {
  Show-YksError '8777 numaralı bağlantı kullanımda. Kayıtların başka bir adreste açılmaması için uygulama başlatılmadı. Diğer programı kapatıp yeniden dene.'
  exit 1
}

$serverJob = Start-Job -ScriptBlock {
  param($folder, $listenPort)
  $listener = [System.Net.HttpListener]::new()
  $listener.Prefixes.Add("http://localhost:$listenPort/")
  $listener.Start()
  $mime = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.webmanifest'='application/manifest+json; charset=utf-8'; '.png'='image/png'; '.ico'='image/x-icon' }
  try {
    while ($listener.IsListening) {
      $ctx = $listener.GetContext()
      try {
        $relative = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
        if (-not $relative) { $relative = 'index.html' }
        if ($relative -eq '__open_brave') {
          $bravePaths = @(
            "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe",
            "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe",
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe"
          )
          $brave = $bravePaths | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
          if (-not $brave) { $ctx.Response.StatusCode = 503; continue }
          if ($ctx.Request.QueryString['dry'] -eq '1') {
            $bytes = [Text.Encoding]::UTF8.GetBytes('BRAVE_OK')
            $ctx.Response.StatusCode = 200
            $ctx.Response.ContentType = 'text/plain; charset=utf-8'
            $ctx.Response.ContentLength64 = $bytes.Length
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            continue
          }
          $targetText = $ctx.Request.QueryString['url']
          $target = $null
          try { $target = [Uri]$targetText } catch {}
          $allowed = @('youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtu.be')
          if (-not $target -or $target.Scheme -notin @('http','https') -or $target.Host.ToLowerInvariant() -notin $allowed) {
            $ctx.Response.StatusCode = 400; continue
          }
          Start-Process -FilePath $brave -ArgumentList $target.AbsoluteUri | Out-Null
          $ctx.Response.StatusCode = 204
          continue
        }
        $root = [IO.Path]::GetFullPath($folder) + [IO.Path]::DirectorySeparatorChar
        $file = [IO.Path]::GetFullPath((Join-Path $folder $relative))
        if (-not $file.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not [IO.File]::Exists($file)) {
          $ctx.Response.StatusCode = 404
        } else {
          $bytes = [IO.File]::ReadAllBytes($file)
          $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
          $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' })
          $ctx.Response.Headers['Cache-Control'] = 'no-store'
          $ctx.Response.ContentLength64 = $bytes.Length
          $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
      } finally { $ctx.Response.OutputStream.Close() }
    }
  } finally { $listener.Close() }
} -ArgumentList $appFolder, $port

try {
  $edgePaths = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  )
  $browser = $edgePaths | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if (-not $browser) { throw 'Edge veya Chrome bulunamadı.' }
  $ready = $false
  for ($i=0; $i -lt 50 -and -not $ready; $i++) {
    Start-Sleep -Milliseconds 100
    $probe = [System.Net.Sockets.TcpClient]::new()
    try { $probe.Connect('127.0.0.1', $port); $ready = $true } catch {} finally { $probe.Dispose() }
  }
  if (-not $ready) { throw 'Yerel uygulama sunucusu başlatılamadı.' }

  $profile = Join-Path $env:LOCALAPPDATA 'YKSDefterim\tarayici'
  if ($Test) {
    $braveTest = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$port/__open_brave?dry=1" -TimeoutSec 5
    if ($braveTest.StatusCode -ne 200) { throw 'Brave bağlantısı doğrulanamadı.' }
    $shot = Join-Path $env:TEMP 'yks-launcher-test.png'
    $testProfile = Join-Path $env:TEMP ('yks-launcher-test-profile-' + [Guid]::NewGuid().ToString('N'))
    $process = Start-Process -FilePath $browser -ArgumentList '--headless', '--disable-gpu', '--disable-extensions', '--no-first-run', "--user-data-dir=$testProfile", '--window-size=390,844', "--screenshot=$shot", "http://localhost:$port/" -WindowStyle Hidden -PassThru -Wait
    if ($process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $shot)) { throw 'Tarayıcı uygulama testini tamamlayamadı.' }
    Remove-Item -LiteralPath $shot -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $testProfile -Recurse -Force -ErrorAction SilentlyContinue
    Write-Output 'YKS_LAUNCHER_TEST_OK'
  } else {
    $process = Start-Process -FilePath $browser -ArgumentList "--app=http://localhost:$port/", '--window-size=1180,820', "--user-data-dir=$profile" -PassThru
    Wait-Process -Id $process.Id
  }
} catch {
  if ($Test) { Write-Error $_.Exception.Message } else { Show-YksError $_.Exception.Message }
} finally {
  Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
  Remove-Job -Job $serverJob -Force -ErrorAction SilentlyContinue
}
