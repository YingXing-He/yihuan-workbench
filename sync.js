/* 易欢工作台 · 多端同步模块
 * 后端可插拔：
 *   - gist     : GitHub Gist 私有仓库。token = 天然设备白名单（只有你持有 token 能读写）。
 *   - openclaw : 你本地部署的 OpenClaw 通用 REST 接口（base/path/token 可配置），
 *                接口形如 PUT/GET <base><path> 收发 {content: "<json 字符串>"}。
 * 数据层复用 DB.exportAll()/importAll()（把 localStorage 全部打包成一份 JSON）。
 */
window.Sync = (function () {
  const CFG_KEY = 'sync_cfg';
  const LAST_KEY = 'sync_last';

  function cfg() {
    return Object.assign(
      { backend: 'gist', token: '', gistId: '', ocBase: '', ocPath: '/sync/yh-workbench.json', ocToken: '', auto: false, supabaseUrl: '', supabaseAnon: '' },
      DB.get(CFG_KEY, {})
    );
  }
  function saveCfg(c) { DB.set(CFG_KEY, c); }
  function lastSync() { return DB.get(LAST_KEY, null); }
  function setLast(t) { DB.set(LAST_KEY, t); }

  async function gistCreate(c, dataStr) {
    const headers = { 'Authorization': 'token ' + c.token, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' };
    const body = JSON.stringify({ description: '易欢工作台同步备份', public: false, files: { 'yh-workbench.json': { content: dataStr } } });
    const r = await fetch('https://api.github.com/gists', { method: 'POST', headers, body });
    if (!r.ok) throw new Error('创建 Gist 失败（' + r.status + '）— token 是否有 gist 权限？');
    const j = await r.json();
    c.gistId = j.id; saveCfg(c);
    return j.id;
  }
  async function gistPush(c, dataStr) {
    if (!c.gistId) { await gistCreate(c, dataStr); return; }
    const headers = { 'Authorization': 'token ' + c.token, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' };
    const body = JSON.stringify({ files: { 'yh-workbench.json': { content: dataStr } } });
    const r = await fetch('https://api.github.com/gists/' + c.gistId, { method: 'PATCH', headers, body });
    if (r.status === 404) { c.gistId = ''; saveCfg(c); await gistCreate(c, dataStr); return; } // gist 被删则重建
    if (!r.ok) throw new Error('更新 Gist 失败（' + r.status + '）');
  }
  async function gistPull(c) {
    const headers = { 'Authorization': 'token ' + c.token, 'Accept': 'application/vnd.github+json' };
    const r = await fetch('https://api.github.com/gists/' + c.gistId, { headers });
    if (!r.ok) throw new Error('读取 Gist 失败（' + r.status + '）');
    const j = await r.json();
    const f = j.files && j.files['yh-workbench.json'];
    return f ? f.content : null;
  }

  async function ocPush(c, dataStr) {
    const base = c.ocBase.replace(/\/+$/, '');
    const url = base + c.ocPath;
    const headers = { 'Content-Type': 'application/json' };
    if (c.ocToken) headers['Authorization'] = 'Bearer ' + c.ocToken;
    const r = await fetch(url, { method: 'PUT', headers, body: JSON.stringify({ content: dataStr }) });
    if (!r.ok) throw new Error('OpenClaw 上传失败（' + r.status + '）');
  }
  async function ocPull(c) {
    const base = c.ocBase.replace(/\/+$/, '');
    const url = base + c.ocPath;
    const headers = {};
    if (c.ocToken) headers['Authorization'] = 'Bearer ' + c.ocToken;
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error('OpenClaw 下载失败（' + r.status + '）');
    const j = await r.json();
    return typeof j.content === 'string' ? j.content : JSON.stringify(j);
  }

  // 同步载荷：导出整包，但剔除「同步配置本身」（里面可能有 GitHub Token，不该被再同步出去）
  function payload() {
    const raw = DB.exportAll();
    try {
      const obj = JSON.parse(raw);
      delete obj['yhwb_sync_cfg'];
      return JSON.stringify(obj);
    } catch (e) { return raw; }
  }

  async function push() {
    const c = cfg();
    if (c.backend === 'gist' && !c.token) throw new Error('请先填 GitHub Token');
    if (c.backend === 'openclaw' && !c.ocBase) throw new Error('请先填 OpenClaw 地址');
    if (c.backend === 'supabase') {
      const dataStr = payload();
      await window.SupaBackend.push(dataStr);
      setLast(Date.now());
      return true;
    }
    const dataStr = payload();
    if (c.backend === 'gist') await gistPush(c, dataStr);
    else await ocPush(c, dataStr);
    setLast(Date.now());
    return true;
  }
  async function pull() {
    const c = cfg();
    if (c.backend === 'gist' && !c.token) throw new Error('请先填 GitHub Token');
    if (c.backend === 'openclaw' && !c.ocBase) throw new Error('请先填 OpenClaw 地址');
    let content;
    if (c.backend === 'supabase') {
      content = await window.SupaBackend.pull();
    } else if (c.backend === 'gist') {
      content = await gistPull(c);
    } else {
      content = await ocPull(c);
    }
    if (!content) throw new Error('云端还没有数据，请先在一台设备上传');
    if (!DB.importAll(content)) throw new Error('云端数据解析失败');
    setLast(Date.now());
    return true;
  }

  return { cfg, saveCfg, lastSync, push, pull };
})();

/* 打开同步面板（点顶部 ☁️ 按钮） */
window.openSyncPanel = function () {
  const c = window.Sync.cfg();
  const last = window.Sync.lastSync();
  const lastTxt = last ? new Date(last).toLocaleString('zh-CN') : '从未同步';
  const html = `
  <div class="sync-panel">
    <div class="sync-warn">🔒 你的数据只存在你自己的浏览器和这个私有同步仓库里。那个只有你持有的 <b>Token / 密码</b> 本身就是「设备白名单」——没有它任何设备都读不到你的数据。</div>

    <div class="settings-row">
      <div class="settings-label">同步后端</div>
      <select id="syncBackend" class="form-control" onchange="renderSyncFields()">
        <option value="supabase" ${c.backend==='supabase'?'selected':''}>Supabase（推荐·真·登录账号）</option>
        <option value="gist" ${c.backend==='gist'?'selected':''}>GitHub Gist（零后端）</option>
        <option value="openclaw" ${c.backend==='openclaw'?'selected':''}>OpenClaw（你本地部署）</option>
      </select>
    </div>

    <div id="syncFieldsGist" style="${c.backend==='gist'?'':'display:none'}">
      <div class="settings-row">
        <div class="settings-label">GitHub Token</div>
        <div class="settings-desc">GitHub → Settings → Developer settings → Personal access tokens，勾选 <code>gist</code> 权限。只存你本地。</div>
        <input id="syncToken" class="form-control" type="password" placeholder="ghp_xxx" value="${c.token||''}">
      </div>
      <div class="settings-row">
        <div class="settings-label">Gist ID（自动）</div>
        <div class="settings-desc">首次上传会自动创建私有 Gist 并记住 ID，无需手填。</div>
        <input id="syncGistId" class="form-control" type="text" placeholder="自动生成" value="${c.gistId||''}" readonly>
      </div>
    </div>

    <div id="syncFieldsSb" style="${c.backend==='supabase'?'':'display:none'}">
      <div class="settings-row">
        <div class="settings-label">Supabase Project URL</div>
        <div class="settings-desc">Supabase 后台 → Project Settings → API → Project URL。</div>
        <input id="syncSbUrl" class="form-control" type="text" placeholder="https://xxxx.supabase.co" value="${c.supabaseUrl||''}">
      </div>
      <div class="settings-row">
        <div class="settings-label">anon public key</div>
        <div class="settings-desc">同一页的 <b>anon public</b>（注意不是 service_role！后者绝不能放前端）。</div>
        <input id="syncSbAnon" class="form-control" type="password" placeholder="eyJhbGci..." value="${c.supabaseAnon||''}">
      </div>
      <div class="sync-sb-account" id="syncSbAccount">
        <div class="settings-desc">填好上面两项并保存后，用邮箱注册 / 登录，即可在多设备间按账号同步。</div>
      </div>
      <div class="v2-form-actions" style="margin-top:8px;flex-wrap:wrap;gap:8px">
        <input id="syncSbEmail" class="form-control" type="email" placeholder="你的邮箱" style="max-width:200px">
        <input id="syncSbPw" class="form-control" type="password" placeholder="密码(≥6位)" style="max-width:150px">
        <button class="btn btn-primary" onclick="sbAuth('register')">注册</button>
        <button class="btn btn-outline" onclick="sbAuth('login')">登录</button>
        <button class="btn btn-outline" onclick="sbAuth('logout')">退出</button>
      </div>
      <div class="settings-desc" style="margin-top:6px">📌 首次注册后若提示去邮箱确认，点邮件里的链接即可；或到 Supabase → Authentication → Providers 关掉「Email Confirm」免确认直接登录。</div>
    </div>

    <div id="syncFieldsOc" style="${c.backend==='openclaw'?'':'display:none'}">
      <div class="settings-row">
        <div class="settings-label">OpenClaw 基地址</div>
        <div class="settings-desc">你本地部署的地址，例如 <code>http://192.168.1.10:8080</code> 或带域名的 HTTPS。</div>
        <input id="syncOcBase" class="form-control" type="text" placeholder="http://..." value="${c.ocBase||''}">
      </div>
      <div class="settings-row">
        <div class="settings-label">同步路径</div>
        <div class="settings-desc">接口路径，默认 <code>/sync/yh-workbench.json</code>。实际以你的 OpenClaw 文档为准。</div>
        <input id="syncOcPath" class="form-control" type="text" value="${c.ocPath||'/sync/yh-workbench.json'}">
      </div>
      <div class="settings-row">
        <div class="settings-label">Token / 密码（可选）</div>
        <input id="syncOcToken" class="form-control" type="password" placeholder="Bearer token" value="${c.ocToken||''}">
      </div>
      <div class="settings-desc">⚠️ OpenClaw 的具体接口形态我还没拿到文档，这里是「通用 REST」预设：PUT 上传 / GET 下载，收发 <code>{content:"&lt;json&gt;"}</code>。等你给我接口说明我会精确对接。</div>
    </div>

    <div class="settings-row">
      <label class="settings-label" style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input id="syncAuto" type="checkbox" ${c.auto?'checked':''}> 自动同步（启动时拉取 + 每 5 分钟上传）
      </label>
    </div>

    <div class="sync-status" id="syncStatus">最后同步：${lastTxt}</div>

    <div class="v2-form-actions">
      <button class="btn btn-primary" onclick="syncDo('pull')">⬇️ 从云端拉取</button>
      <button class="btn btn-outline" onclick="syncDo('push')">⬆️ 上传到云端</button>
      <button class="btn btn-outline" onclick="closeGeneric()">关闭</button>
    </div>
  </div>`;
  const gt = window.gid ? window.gid('genericTitle') : document.getElementById('genericTitle');
  const gb = window.gid ? window.gid('genericBody') : document.getElementById('genericBody');
  const gm = window.gid ? window.gid('genericModal') : document.getElementById('genericModal');
  if (gt) gt.textContent = '☁️ 多端同步';
  if (gb) gb.innerHTML = html;
  if (gm) gm.classList.remove('hidden');
};

window.renderSyncFields = function () {
  const b = document.getElementById('syncBackend').value;
  const g = document.getElementById('syncFieldsGist');
  const o = document.getElementById('syncFieldsOc');
  const s = document.getElementById('syncFieldsSb');
  if (g) g.style.display = b === 'gist' ? '' : 'none';
  if (o) o.style.display = b === 'openclaw' ? '' : 'none';
  if (s) s.style.display = b === 'supabase' ? '' : 'none';
  if (b === 'supabase') sbRefreshAccount();
};

// 从面板 DOM 收集配置并保存（Supabase URL/anon 变更后需重置客户端）
function collectCfg() {
  const c = window.Sync.cfg();
  c.backend = document.getElementById('syncBackend').value;
  if (document.getElementById('syncToken')) c.token = document.getElementById('syncToken').value;
  if (document.getElementById('syncGistId')) c.gistId = document.getElementById('syncGistId').value;
  if (document.getElementById('syncOcBase')) c.ocBase = document.getElementById('syncOcBase').value;
  if (document.getElementById('syncOcPath')) c.ocPath = document.getElementById('syncOcPath').value || '/sync/yh-workbench.json';
  if (document.getElementById('syncOcToken')) c.ocToken = document.getElementById('syncOcToken').value;
  if (document.getElementById('syncSbUrl')) c.supabaseUrl = document.getElementById('syncSbUrl').value.trim();
  if (document.getElementById('syncSbAnon')) c.supabaseAnon = document.getElementById('syncSbAnon').value.trim();
  if (document.getElementById('syncAuto')) c.auto = document.getElementById('syncAuto').checked;
  window.Sync.saveCfg(c);
  if (window.SupaBackend) window.SupaBackend.reset();
  return c;
}

// 刷新 Supabase 登录状态显示
window.sbRefreshAccount = function () {
  const box = document.getElementById('syncSbAccount');
  if (!box) return;
  const c = window.Sync.cfg();
  if (!c.supabaseUrl || !c.supabaseAnon) {
    box.innerHTML = '<div class="settings-desc">先填好上面两项（URL / anon key），刷新一下状态就能登录啦。</div>';
    return;
  }
  box.innerHTML = '<div class="settings-desc">检查登录状态中…</div>';
  window.SupaBackend.getUser().then(u => {
    if (u && u.email) {
      box.innerHTML = '<div class="sync-warn" style="margin:0">✅ 已登录：<b>' + esc(u.email) + '</b>（数据将按此账号隔离同步）</div>';
    } else {
      box.innerHTML = '<div class="settings-desc">尚未登录，填邮箱密码后点「注册」或「登录」。</div>';
    }
  }).catch(e => {
    box.innerHTML = '<div class="settings-desc">读取登录状态失败：' + (e.message || e) + '</div>';
  });
};

// 注册 / 登录 / 退出
window.sbAuth = async function (op) {
  collectCfg();
  const email = (document.getElementById('syncSbEmail') || {}).value || '';
  const pw = (document.getElementById('syncSbPw') || {}).value || '';
  const box = document.getElementById('syncSbAccount');
  if ((op === 'login' || op === 'register') && (!email || !pw)) {
    if (box) box.innerHTML = '<div class="sync-warn" style="margin:0;background:#fff0f0">❌ 请先填邮箱和密码</div>';
    return;
  }
  if (box) box.innerHTML = '<div class="settings-desc">' + (op === 'register' ? '注册中…' : op === 'login' ? '登录中…' : '退出中…') + '</div>';
  try {
    if (op === 'register') await window.SupaBackend.signUp(email, pw);
    else if (op === 'login') await window.SupaBackend.signIn(email, pw);
    else await window.SupaBackend.signOut();
    if (window.toast) window.toast(op === 'logout' ? '已退出登录' : '✅ ' + (op === 'register' ? '注册成功' : '登录成功'));
    sbRefreshAccount();
  } catch (e) {
    if (box) box.innerHTML = '<div class="sync-warn" style="margin:0;background:#fff0f0">❌ ' + (e.message || e) + '</div>';
    if (window.toast) window.toast('操作失败：' + (e.message || e));
  }
};

window.syncDo = async function (op) {
  collectCfg();
  const c = window.Sync.cfg();
  const st = document.getElementById('syncStatus');
  if (st) st.textContent = (op === 'push' ? '⬆️ 上传中…' : '⬇️ 拉取中…');
  try {
    if (op === 'push') {
      await window.Sync.push();
      if (st) st.textContent = '✅ 已上传 · ' + new Date().toLocaleString('zh-CN');
      if (window.toast) window.toast('☁️ 已同步到云端');
    } else {
      await window.Sync.pull();
      if (st) st.textContent = '✅ 已拉取 · ' + new Date().toLocaleString('zh-CN');
      if (typeof render === 'function') render();
      if (window.toast) window.toast('☁️ 已从云端恢复');
    }
  } catch (e) {
    if (st) st.textContent = '❌ ' + (e && e.message ? e.message : e);
    if (window.toast) window.toast('同步失败：' + (e && e.message ? e.message : e));
  }
};

/* 自动同步：启动时拉取 + 周期上传 */
window.initAutoSync = function () {
  const c = window.Sync.cfg();
  if (!c.auto) return;
  // 启动后轻量拉取一次（覆盖本地）
  setTimeout(() => {
    window.Sync.pull().then(() => { if (typeof render === 'function') render(); }).catch(() => {});
  }, 1500);
  // 每 5 分钟上传
  setInterval(() => {
    window.Sync.push().catch(() => {});
  }, 5 * 60 * 1000);
};
