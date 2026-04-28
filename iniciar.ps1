# Script de inicialização do Método Stack
$nodePath = "C:\Users\angel\node-portable\node-v22.15.0-win-x64"
$env:PATH = "$nodePath;$env:PATH"

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "  Metodo Stack — iniciando..." -ForegroundColor Cyan
Write-Host "  Acesse: http://localhost:3000" -ForegroundColor Green
Write-Host "  Pressione Ctrl+C para parar." -ForegroundColor Gray
Write-Host ""

npm run dev
