param(
  [int]$Port = 8787,
  [string]$Root = (Resolve-Path ".").Path
)

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
$listener.Start()
Write-Host "Static server running at http://127.0.0.1:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".mjs" = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg" = "image/svg+xml"
  ".ico" = "image/x-icon"
}

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $client.NoDelay = $true
    $client.ReceiveTimeout = 5000
    $client.SendTimeout = 5000
    $stream = $client.GetStream()
    $stream.ReadTimeout = 5000
    $stream.WriteTimeout = 5000
    $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $line = $reader.ReadLine()
    if (-not $line) {
      $client.Close()
      continue
    }

    $contentLength = 0
    while (($header = $reader.ReadLine()) -ne $null -and $header -ne "") {
      if ($header -match "^Content-Length:\s*(\d+)") {
        $contentLength = [int]$matches[1]
      }
    }

    $parts = $line.Split(" ")
    if ($parts.Count -lt 2) {
      $client.Close()
      continue
    }
    $method = $parts[0]
    $path = [System.Uri]::UnescapeDataString($parts[1].Split("?")[0])
    if ($path -eq "/") { $path = "/index.html" }

    if ($path -eq "/api/ai-status" -and $method -eq "GET") {
      $json = '{"live":false,"source":"fallback","model":"offline-fallback"}'
      $body = [System.Text.Encoding]::UTF8.GetBytes($json)
      $response = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
      $bytes = [System.Text.Encoding]::ASCII.GetBytes($response)
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Write($body, 0, $body.Length)
      $client.Close()
      continue
    }

    if ($path -eq "/api/diplomacy" -and $method -eq "POST") {
      if ($contentLength -gt 0) {
        $buffer = New-Object char[] $contentLength
        [void]$reader.ReadBlock($buffer, 0, $contentLength)
      }
      $json = '{"reply":"Могу обсуждать режим тишины, обмен и гарантии, но без конкретного пакета давление не остановлю. Назовите первый пункт сделки и кто будет контролировать выполнение.","effect":"none","intensity":1}'
      $body = [System.Text.Encoding]::UTF8.GetBytes($json)
      $response = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
      $bytes = [System.Text.Encoding]::ASCII.GetBytes($response)
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Write($body, 0, $body.Length)
      $client.Close()
      continue
    }

    if ($method -ne "GET" -and $method -ne "HEAD") {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Method not allowed")
      $response = "HTTP/1.1 405 Method Not Allowed`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $bytes = [System.Text.Encoding]::ASCII.GetBytes($response)
      $stream.Write($bytes, 0, $bytes.Length)
      if ($method -ne "HEAD") { $stream.Write($body, 0, $body.Length) }
      $client.Close()
      continue
    }

    $relative = $path.TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar
    $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $relative))
    if (-not $filePath.StartsWith([System.IO.Path]::GetFullPath($Root))) {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
      $response = "HTTP/1.1 403 Forbidden`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $bytes = [System.Text.Encoding]::ASCII.GetBytes($response)
      $stream.Write($bytes, 0, $bytes.Length)
      if ($method -ne "HEAD") { $stream.Write($body, 0, $body.Length) }
      $client.Close()
      continue
    }

    if (-not [System.IO.File]::Exists($filePath)) {
      $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $response = "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $bytes = [System.Text.Encoding]::ASCII.GetBytes($response)
      $stream.Write($bytes, 0, $bytes.Length)
      if ($method -ne "HEAD") { $stream.Write($body, 0, $body.Length) }
      $client.Close()
      continue
    }

    $data = [System.IO.File]::ReadAllBytes($filePath)
    $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
    $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
    $response = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($data.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($response)
    $stream.Write($bytes, 0, $bytes.Length)
    if ($method -ne "HEAD") { $stream.Write($data, 0, $data.Length) }
  } catch {
    Write-Host $_.Exception.Message
  } finally {
    $client.Close()
  }
}
