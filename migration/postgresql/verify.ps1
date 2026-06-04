$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root
npm run verify-migration --workspace=migration-toolkit
