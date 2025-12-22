# 星桥系统一键启动脚本 - 分别启动前后端

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  星桥系统 - 启动前后端服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取当前脚本目录
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }

# 检查环境变量
if (-not $env:GEMINI_API_KEY) {
    Write-Host "警告: 未设置GEMINI_API_KEY环境变量" -ForegroundColor Yellow
    Write-Host "从env-example.txt读取..." -ForegroundColor Yellow
    if (Test-Path (Join-Path $scriptDir "env-example.txt")) {
        $envContent = Get-Content (Join-Path $scriptDir "env-example.txt") | Where-Object { $_ -match "GEMINI_API_KEY=(.+)" }
        if ($envContent) {
            $env:GEMINI_API_KEY = ($envContent -split "=")[1]
            Write-Host "已从env-example.txt读取API密钥" -ForegroundColor Green
        }
    }
}

# 检查端口是否被占用
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port8000) {
    Write-Host "警告: 端口8000已被占用，正在关闭..." -ForegroundColor Yellow
    Stop-Process -Id $port8000.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

if ($port3000) {
    Write-Host "警告: 端口3000已被占用，正在关闭..." -ForegroundColor Yellow
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}


# 启动后端服务（新窗口）
Write-Host "启动后端服务 (端口8000)..." -ForegroundColor Green
$backendScriptPath = Join-Path $scriptDir "start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScriptPath`""

# 等待后端启动
Write-Host "等待后端服务启动..." -ForegroundColor Yellow

# 启动前端服务（新窗口）
Write-Host "启动前端服务 (端口3000)..." -ForegroundColor Green
$frontendScriptPath = Join-Path $scriptDir "start-frontend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScriptPath`""

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  服务启动完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "后端API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API文档: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "两个服务已在独立的PowerShell窗口中运行" -ForegroundColor Yellow
Write-Host "关闭对应的窗口即可停止对应服务" -ForegroundColor Yellow
Write-Host ""

# 检查后端是否启动成功
$backendHealthy = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendHealthy = $true
            Write-Host "后端服务启动成功!" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $backendHealthy) {
    Write-Host "后端服务启动失败，请检查错误信息" -ForegroundColor Red
}
