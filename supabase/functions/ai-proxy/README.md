# 易欢工作台 · 服务端 AI 代理（Supabase Edge Function）

把工作台从「纯前端」升级为「有后端」的关键一步：让前端安全、合规地调用大模型（DeepSeek）。

## 为什么需要它
之前的「今日 AI 精选 / AI 优化计划」要么显示写死的示例，要么在浏览器里直连大模型被 **CORS** 拦截（"连接失败"）。
Edge Function 运行在 Supabase 的服务器上：
- **密钥不下发前端**：DeepSeek Key 只存在 Supabase Secrets，浏览器永远拿不到。
- **自动处理 CORS**：Supabase 域名已配置跨域，前端用 anon key 调用即可。
- **零自建服务器**：不用买云主机、不用维护进程。

## 部署（全程网页，无需装命令行）
1. 打开 Supabase 后台 → 你的项目 → 左侧 **Edge Functions** → **New Function**。
2. 名称填 **`ai-proxy`**（必须这个名字，前端按此名调用）。
3. 把同目录 `index.ts` 的内容整段粘贴进编辑器 → 点 **Deploy**。
4. 再到 **Settings → Edge Functions → Secrets** → **New secret**：
   - Name：`DEEPSEEK_API_KEY`
   - Value：你的 DeepSeek API Key（deepseek.com 控制台获取）。

## 验证
在前端「设置 → AI 模型」点「测试默认连接」无需配置；
直接到首页点「🌟 今日 AI 精选」右上角 **⚡ 生成**，或在雅思页点「🤖 用 AI 重新规划」，应返回真实内容。

## 成本
Supabase 免费额度含每月 50 万次函数调用，个人自用完全够；DeepSeek 按 token 计费，极便宜。
