import { CapacitorConfig } from '@capacitor/core';

// 「易欢工作台」安卓套壳配置（B 路线：在线加载模式）
// WebView 直接加载线上站点（GitHub Pages / 国内镜像皆可），无需打包前端资源，
// 站点任何更新自动生效，APK 一次构建长期使用。
const config: CapacitorConfig = {
  appId: 'com.yihuan.workbench',
  appName: '易欢工作台',
  // 加载地址：默认 GitHub Pages；上线国内托管后改此处即可（如 https://你的域名）
  server: {
    url: 'https://yingxing-he.github.io/yihuan-workbench/',
    cleartext: true
  },
  webDir: 'www',
  plugins: {
    // 允许 WebView 唤起外部 App scheme（B站/抖音/小红书/喜马拉雅）
    CapacitorHttp: { enabled: false }
  }
};

export default config;
