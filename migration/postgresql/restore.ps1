$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
  }
}

if (-not $env:DATABASE_URL) { throw "DATABASE_URL is required" }

$schema = @(
  "migration/postgresql/schema.sql",
  "backup/database/schema.sql"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $schema) { throw "No schema.sql found" }
Write-Host "Applying schema: $schema"
& psql $env:DATABASE_URL -f $schema

$data = @(
  "migration/postgresql/updated_data.sql",
  "backup/database/data.sql"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($data) {
  Write-Host "Applying data: $data"
  & psql $env:DATABASE_URL -f $data
}

Write-Host "Restore complete."
