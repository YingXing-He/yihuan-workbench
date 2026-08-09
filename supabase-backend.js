/* 易欢工作台 · Supabase 后端（真·登录账号 + 按账号隔离的云同步）
 * 依赖：index.html 里已通过 CDN 引入 supabase-js（全局变量 supabase）。
 *
 * 接入步骤（只需做一次，几分钟，不用写代码）：
 *   1) 打开 https://supabase.com 用邮箱注册，新建一个项目（免费的）。
 *   2) 项目里点左侧「SQL Editor」，把本文件最底部「建表 + 权限 SQL」整段粘进去执行。
 *   3) 点左侧「Project Settings → API」，复制 Project URL 和 anon public key。
 *   4) 在工作台「☁️ 同步面板」选 Supabase，粘贴 URL/anon key，用邮箱注册并登录即可。
 *
 * 安全说明：anon key 本来就是给浏览器用的（配合下面的 RLS 行级权限，
 * 每个账号只能读自己的那一行）。你的明文数据只存在你浏览器 + 你这个私有表里。
 * 不要把 service_role key（带 superuser 权限）填进来，那个绝不能等于或写进前端。
 */
window.SupaBackend = (function () {
  let client = null;

  // 复用 Sync.cfg() 里存的 supabaseUrl / supabaseAnon
  function getCfg() {
    return (window.Sync && window.Sync.cfg) ? window.Sync.cfg() : {};
  }

  function ensure() {
    if (client) return client;
    const c = getCfg();
    if (!c.supabaseUrl || !c.supabaseAnon) {
      throw new Error('请先在同步面板填好 Supabase URL 和 anon key');
    }
    if (typeof supabase === 'undefined' || !supabase.createClient) {
      throw new Error('Supabase 脚本没加载成功（检查网络 / CDN 是否被拦）');
    }
    client = supabase.createClient(c.supabaseUrl, c.supabaseAnon);
    return client;
  }

  function reset() { client = null; }

  async function signUp(email, pw) {
    const sb = ensure();
    const { data, error } = await sb.auth.signUp({ email, password: pw });
    if (error) throw new Error(error.message);
    // Supabase 默认开启「邮箱确认」，未确认时 user 存在但邮箱未验证
    if (data.user && data.session === null) {
      throw new Error('注册成功，但需先去邮箱点确认链接激活（或到 Supabase 后台关掉 Email Confirm）');
    }
    return data;
  }

  async function signIn(email, pw) {
    const sb = ensure();
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
    if (error) throw new Error(error.message);
    return data;
  }

  async function signOut() {
    const sb = ensure();
    await sb.auth.signOut();
    client = null;
  }

  async function getUser() {
    try {
      const sb = ensure();
      const { data } = await sb.auth.getUser();
      return (data && data.user) ? data.user : null;
    } catch (e) { return null; }
  }

  // 上传：把你浏览器整包数据按登录用户隔离写进 sync_data 表
  async function push(dataStr) {
    const sb = ensure();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('请先登录账号');
    const { error } = await sb.from('sync_data').upsert({
      user_id: user.id,
      data: dataStr,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
    return true;
  }

  // 下载：只取自己那一行的数据
  async function pull() {
    const sb = ensure();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('请先登录账号');
    const { data, error } = await sb.from('sync_data')
      .select('data').eq('user_id', user.id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data && data.data) ? data.data : null;
  }

  return { ensure, reset, signUp, signIn, signOut, getUser, push, pull };
})();

/* =========================================================================
 * 建表 + 权限 SQL（在 Supabase → SQL Editor 执行一次）
 * -------------------------------------------------------------------------
 * create table if not exists public.sync_data (
 *   user_id    uuid primary key references auth.users(id) on delete cascade,
 *   data       text,
 *   updated_at timestamptz default now()
 * );
 *
 * alter table public.sync_data enable row level security;
 *
 * -- 只有本人能读 / 写 / 改自己的那一行
 * create policy "own_read"  on public.sync_data for select using (auth.uid() = user_id);
 * create policy "own_insert" on public.sync_data for insert with check (auth.uid() = user_id);
 * create policy "own_update" on public.sync_data for update using (auth.uid() = user_id);
 * ========================================================================= */
