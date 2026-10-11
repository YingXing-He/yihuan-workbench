// 易欢工作台 · 服务端 AI 代理（Supabase Edge Function）
//
// 作用：让前端安全调用大模型（DeepSeek）。密钥 DEEPSEEK_API_KEY 只存在 Supabase
//       Secrets 里，绝不下发到浏览器；同时由 Supabase 处理 CORS，绕过浏览器直连被拦的问题。
//
// 部署（无需装 CLI，全程网页操作）：
//   1) 打开 Supabase 后台 → 你的项目 → Edge Functions → New Function
//   2) 名称填：ai-proxy（必须这名字，前端按此调用）
//   3) 把本文件内容整段粘进编辑器 → Deploy
//   4) 再到 Settings → Edge Functions → Secrets → 新增：
//      Name = DEEPSEEK_API_KEY，Value = 你的 DeepSeek API Key
//
// 前端调用：supabase.functions.invoke('ai-proxy', { body: JSON.stringify({ messages }) })

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

Deno.serve(async (req: Request) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { messages, opts } = await req.json();
    const key = Deno.env.get("DEEPSEEK_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "服务端未配置 DEEPSEEK_API_KEY（请在 Supabase Secrets 添加）" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const model = (opts && opts.model) || "deepseek-chat";
    const temperature = (opts && typeof opts.temp === "number") ? opts.temp : 0.7;

    const resp = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({ model, messages, temperature, stream: false }),
    });
    const j = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: (j.error && j.error.message) || ("DeepSeek 错误 " + resp.status) }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e && e.message) || e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
