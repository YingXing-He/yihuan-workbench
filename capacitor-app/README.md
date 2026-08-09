# 易欢工作台 · 安卓 App 套壳（Capacitor 在线加载模式）

> 路线 B：APK 只是个 WebView 壳，直接加载线上站点。站点任何更新自动生效，APK 一次构建长期使用。
> 前置：本机需安装 **Node.js 18+、Android Studio（含 Android SDK + 一个虚拟/真机）**。沙盒环境无 Android 工具，无法在此构建，请在你的笔记本执行。

## 1. 安装依赖
```bash
cd capacitor-app
npm install
```

## 2. 添加安卓平台（首次）
```bash
npx cap add android
```

## 3. 构建 APK
```bash
npx cap sync android      # 同步配置到安卓工程
npx cap open android      # 用 Android Studio 打开，点 Build → Build Bundle(s) / APK(s) → Build APK
```
或命令行（需先配置 gradle 环境）：
```bash
cd android && ./gradlew assembleDebug
```
生成的 `android/app/build/outputs/apk/debug/app-debug.apk` 即为可安装的调试包（sideload 到手机即可，不上架应用商店）。

## 4. 切换国内托管地址（可选，解决手机加载慢）
编辑 `capacitor.config.ts` 的 `server.url` 为你的国内域名（Gitee Pages / 腾讯云 COS CDN）：
```ts
server: { url: 'https://你的国内域名/yihuan-workbench/' }
```
改完重跑 `npx cap sync android` 再构建。

## 5. 唤起原生 App（B站/抖音/小红书/喜马拉雅）
站点内 `window.openMedia()` 通过 scheme（如 `bilibili://`、`snssdk1128://`、`xhsdiscover://`、`ximalaya://`）尝试唤起，
Capacitor WebView 默认允许 scheme 跳转，无需额外插件。若个别机型拦截，会在浏览器打开对应网页版。

## 6. 更新站点后
站点改完 push 到 GitHub Pages（或国内托管）后，**APK 无需重新构建**——下次打开 App 自动加载最新内容。
