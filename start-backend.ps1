# 单独启动后端服务的脚本
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$backendPath = Join-Path $scriptDir "backend"

# 读取API密钥
if (Test-Path (Join-Path $scriptDir "env-example.txt")) {
    $envContent = Get-Content (Join-Path $scriptDir "env-example.txt") | Where-Object { $_ -match "GEMINI_API_KEY=(.+)" }
    if ($envContent) {
        $env:GEMINI_API_KEY = ($envContent -split "=")[1]
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  后端服务 (端口8000)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

Set-Location $backendPath
python -m uvicorn app.main:app --reload --port 8000

