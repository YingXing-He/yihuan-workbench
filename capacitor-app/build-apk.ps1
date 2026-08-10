# build-apk.ps1 —— 易欢工作台 APK 一键构建脚本
# 前置：已安装 Node.js + Android Studio（含 Android SDK）
# 运行：在 capacitor-app 目录下，右键此文件 → 使用 PowerShell 运行
# 或命令行：powershell -ExecutionPolicy Bypass -File build-apk.ps1

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

function Check-Command($cmd) {
    try { Invoke-Expression "$cmd --version" | Out-Null; return $true }
    catch { return $false }
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  易欢工作台 · APK 构建脚本" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# 1. 检查 Node
if (-not (Check-Command "node")) {
    Write-Host "❌ 未找到 Node.js，请先安装：https://nodejs.org/" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ Node 版本：$(node -v)"

# 2. 安装依赖
Write-Host ""
Write-Host "📦 正在安装 Capacitor 依赖..." -ForegroundColor Yellow
npm install

# 3. 首次添加安卓平台
if (-not (Test-Path "android" -PathType Container)) {
    Write-Host ""
    Write-Host "📱 首次添加安卓平台..." -ForegroundColor Yellow
    npx cap add android
} else {
    Write-Host ""
    Write-Host "📱 安卓平台已存在，跳过 add" -ForegroundColor Green
}

# 4. 同步配置
Write-Host ""
Write-Host "🔄 正在同步配置到安卓工程..." -ForegroundColor Yellow
npx cap sync android

# 5. 尝试命令行构建 APK
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path "android\gradlew.bat") {
    Write-Host ""
    Write-Host "🔨 正在构建 APK（首次会下载 Gradle，可能需要几分钟）..." -ForegroundColor Yellow
    Set-Location android
    try {
        .\gradlew.bat assembleDebug
        Set-Location ..
        if (Test-Path $apkPath) {
            Write-Host ""
            Write-Host "✅ APK 构建成功！" -ForegroundColor Green
            Write-Host "📂 文件位置：$((Resolve-Path $apkPath).Path)" -ForegroundColor Green
            # 打开所在文件夹并选中 APK
            explorer "/select,$(Resolve-Path $apkPath).Path"
        } else {
            Write-Host "⚠️ 构建命令已执行，但未找到 APK 文件。请用 Android Studio 打开 android 目录手动 Build。" -ForegroundColor Yellow
        }
    } catch {
        Set-Location ..
        Write-Host ""
        Write-Host "⚠️ 命令行构建失败，请改用 Android Studio 手动构建：" -ForegroundColor Yellow
        Write-Host "   1. 运行：npx cap open android" -ForegroundColor Yellow
        Write-Host "   2. 在 Android Studio 里点菜单 Build → Build Bundle(s) / APK(s) → Build APK(s)" -ForegroundColor Yellow
        pause
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "⚠️ 未找到 android\gradlew.bat，请确保 Android Studio 已正确安装。" -ForegroundColor Yellow
    Write-Host "   首次建议运行：npx cap open android" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "🎉 完成！把 APK 传到手机上安装即可。" -ForegroundColor Green
pause
