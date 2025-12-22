# 单独启动前端服务的脚本
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$frontendPath = Join-Path $scriptDir "frontend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  前端服务 (端口3000)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Set-Location $frontendPath
npm run dev

