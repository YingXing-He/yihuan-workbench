# 易欢工作台 · 安卓 App 套壳（Capacitor 在线加载模式）

> 路线 B：APK 只是个 WebView 壳，直接加载线上站点。站点任何更新自动生效，APK 一次构建长期使用。
> 前置：本机需安装 **Node.js 18+、Android Studio（含 Android SDK）**。沙盒环境无 Android 工具，无法在此构建，请在你的笔记本执行。

---

## 0. 安装 Android Studio（首次）

### 0.1 下载
访问官方下载页：

**https://developer.android.com/studio**

下载 **Android Studio（Windows 64-bit）**，大约 1GB。

### 0.2 安装
1. 双击安装包，一路默认下一步。
2. 到选择组件时，**确保勾选以下两项**：
   - ✅ **Android SDK**
   - ✅ **Android SDK Platform**
   - ✅ **Android Virtual Device**（可选，想模拟器测试就勾）
3. 安装路径建议默认（`C:\Program Files\Android\Android Studio`）。
4. 安装完成后**首次启动 Android Studio**，会弹出 "SDK Component Setup"，点 **Standard（标准）**，然后等它自动下载 SDK（约 2-4GB，看网速）。

### 0.3 设置环境变量（让命令行能找到）
安装完成后，把下面两个路径加入系统环境变量 `Path`：

```
C:\Users\你的用户名\AppData\Local\Android\Sdk\platform-tools
C:\Users\你的用户名\AppData\Local\Android\Sdk\cmdline-tools\latest\bin
```

> 如果你找不到 `AppData` 文件夹，在文件资源管理器地址栏输入 `%LOCALAPPDATA%\Android\Sdk` 即可打开。

### 0.4 验证
打开 PowerShell，输入：

```powershell
adb --version
```

有版本号输出说明 SDK 装好了。

---

## 1. 一键构建 APK（推荐）

在 `capacitor-app` 目录下，**右键 `build-apk.ps1` → 使用 PowerShell 运行**。

或命令行：

```powershell
powershell -ExecutionPolicy Bypass -File build-apk.ps1
```

脚本会自动完成：安装依赖 → 添加安卓平台 → 同步配置 → 构建 APK → 打开 APK 所在文件夹。

> 首次构建会下载 Gradle 和依赖，可能需要 **5-20 分钟**，请保持联网，不要关闭窗口。

---

## 2. 手动构建（如果脚本失败）

### 2.1 安装依赖

```bash
cd capacitor-app
npm install
```

### 2.2 添加安卓平台（首次）

```bash
npx cap add android
```

### 2.3 同步配置

```bash
npx cap sync android
```

### 2.4 用 Android Studio 打开并构建

```bash
npx cap open android
```

然后在 Android Studio 里：

1. 等右下角 "Gradle sync finished" 完成。
2. 顶部菜单 → **Build → Build Bundle(s) / APK(s) → Build APK(s)**。
3. 构建完成后右下角会弹出提示 "Build Analyzer detected..."，点 **locate** 即可找到 APK。

生成的文件路径：

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. 安装到手机

1. 用数据线把 APK 传到手机，或微信/QQ 发给自己。
2. 在手机上点击 APK 安装。
3. 如果提示「禁止安装未知来源应用」，去 **设置 → 安全 → 允许此来源** 打开即可。

> 这个 APK 不上架应用商店，仅自用（sideload）。

---

## 4. 切换国内托管地址（可选，解决手机加载慢）

如果以后接入了国内托管（如腾讯云 COS），编辑 `capacitor.config.ts` 的 `server.url`：

```ts
server: { url: 'https://你的国内域名/yihuan-workbench/' }
```

改完重跑：

```bash
npx cap sync android
```

然后重新构建 APK。

---

## 5. 唤起原生 App（B站/抖音/小红书/喜马拉雅）

站点内 `window.openMedia()` 通过 scheme（如 `bilibili://`、`snssdk1128://`、`xhsdiscover://`、`ximalaya://`）尝试唤起。

Capacitor WebView 默认允许 scheme 跳转，无需额外插件。若个别机型拦截，会在浏览器打开对应网页版。

---

## 6. 更新站点后

站点改完 push 到 GitHub Pages（或国内托管）后，**APK 无需重新构建**——下次打开 App 自动加载最新内容。
