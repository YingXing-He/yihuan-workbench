/* ==========================================================================
 * 易欢工作台 V2 — 副业运营三件套：闲鱼 / 微信视频号 / 微信公众号
 * 纯本地数据（localStorage），通过 window.V2VIEWS / window.V2ACT 注册
 * ========================================================================== */
(function () {
  'use strict';

  /* ---------- 本地基础工具（独立于 v2-core 作用域） ---------- */
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function gid(id) { return document.getElementById(id); }
  function gId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function money(n) {
    const v = Number(n) || 0;
    return '¥' + v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtDate(d) {
    try { const dt = new Date(d); return (dt.getMonth() + 1) + '月' + dt.getDate() + '日'; }
    catch (e) { return d; }
  }
  function v2(k, def) { return DB.get('v2_' + k, def); }
  function v2set(k, val) { DB.set('v2_' + k, val); }
  function opt(arr, sel) {
    return arr.map(o => `<option value="${esc(o)}"${o === sel ? ' selected' : ''}>${esc(o)}</option>`).join('');
  }
  function statGrid(pairs) {
    return `<div class="v2-quote-grid">` + pairs.map(p =>
      `<div class="v2-quote-card"><div class="v2-quote-name">${esc(p[0])}</div><div class="v2-quote-val">${esc(p[1])}</div></div>`).join('') + `</div>`;
  }
  function sectionTitle(title, btnLabel, act) {
    return `<div class="v2-section"><div class="v2-section-title">${esc(title)} <button class="btn btn-primary btn-sm v2-sec-btn" data-act="${act}">+ ${esc(btnLabel)}</button></div>`;
  }
  function miniBars(items) {
    const max = Math.max(1, ...items.map(i => Math.abs(i.value)));
    let h = '<div class="v2-bar-chart">';
    items.forEach(it => {
      const pct = (Math.abs(it.value) / max) * 100;
      h += `<div class="v2-bar-row"><div class="v2-bar-label">${esc(it.label || '')}</div><div class="v2-bar-track"><div class="v2-bar-fill pos" style="width:${pct.toFixed(1)}%"></div></div><div class="v2-bar-val">${esc(it.display || it.value)}</div></div>`;
    });
    return h + '</div>';
  }
  function listOrEmpty(arr, builder, emptyText) {
    if (!arr.length) return `<div class="v2-book-empty">${esc(emptyText)}</div>`;
    let h = '<div class="v2-log-list">';
    arr.forEach(it => { h += builder(it); });
    return h + '</div>';
  }

  /* ====================== 闲鱼 ====================== */
  let _xyEdit = null;
  const XY_OPS_DEFAULT = [
    '擦亮在售宝贝（提高曝光权重）',
    '回复新咨询（24h 内必回）',
    '发布 1 条动态 / 朋友圈引流',
    '刷同行找爆款与定价灵感',
    '跟进待发货 / 已售订单'
  ];
  const XY_COPY_TPL = [
    { t: '闲置转卖', text: '【商品名】九成新，正常使用的痕迹，便宜出给有缘人～需要的私我！' },
    { t: '数码二手', text: '自用【商品】，功能完好、配件齐全，诚心要可小刀，支持当面验机。' },
    { t: '教材出清', text: '期末整理【科目】课本+笔记，重点划好，助你弯道超车，打包更优惠。' },
    { t: '美妆小样', text: '专柜入会送的小样，未拆封，低价出，支持验货，假一赔十。' },
    { t: '捡漏话术', text: '对比了好几家，你这成色最实在，XX 元包邮我直接拍？' },
    { t: '已售话术', text: '感谢信任～已发货，物流更新会同步给你，收到满意记得好评呀！' }
  ];
  function renderXianyu() {
    const items = v2('xianyu_items', []);
    const deals = v2('xianyu_deals', []);
    const ideas = v2('xianyu_ideas', []);
    const month = todayStr().slice(0, 7);
    const monthIncome = deals.filter(d => (d.date || '').slice(0, 7) === month).reduce((s, d) => s + Number(d.amount || 0), 0);
    const onSale = items.filter(i => i.status === '在售').length;
    const sold = items.filter(i => i.status === '已售').length;

    let h = `<div class="page"><div class="page-head"><div class="page-title">🐟 闲鱼 · 副业闲置</div><div class="page-sub">管理宝贝 · 记录成交 · 沉淀选品灵感</div></div>`;
    h += statGrid([['在售宝贝', onSale], ['本月收入', money(monthIncome)], ['已售出', sold]]);

    // 每日运营清单（跨天自动重置）
    let ops = v2('xianyu_ops', {});
    if (ops.date !== todayStr()) { ops = { date: todayStr(), items: XY_OPS_DEFAULT.map(t => ({ id: gId(), text: t, done: false })) }; v2set('xianyu_ops', ops); }
    const opsDone = (ops.items || []).filter(i => i.done).length;
    h += `<div class="v2-section"><div class="v2-section-title">✅ 每日运营清单 <span class="v2-chip">${opsDone}/${(ops.items||[]).length} 完成</span></div><div class="v2-xy-ops">`;
    (ops.items || []).forEach(i => h += `<label class="v2-xy-op${i.done?' on':''}"><input type="checkbox" ${i.done?'checked':''} data-act="xianyuOpsToggle" data-id="${i.id}"><span>${esc(i.text)}</span></label>`);
    h += `</div></div>`;

    h += `<div class="v2-section"><div class="v2-section-title">📝 文案模板（点击复制）</div><div class="v2-xy-tpl">`;
    XY_COPY_TPL.forEach(t => h += `<div class="v2-xy-tpl-item"><div class="v2-xy-tpl-top"><b>${esc(t.t)}</b><a class="btn btn-outline btn-xs" data-act="xianyuCopy" data-text="${esc(t.text)}">复制</a></div><div class="v2-xy-tpl-text">${esc(t.text)}</div></div>`);
    h += `</div></div>`;

    h += sectionTitle('宝贝列表', '上架宝贝', 'xianyuAddItem');
    h += listOrEmpty(items, it => {
      const stCls = it.status === '已售' ? 'done' : (it.status === '下架' ? 'off' : '');
      return `<div class="v2-log-item">
        <span class="v2-chip">${esc(it.cat || '其他')}</span>
        <span class="v2-log-text"><b>${esc(it.title)}</b> · ${money(it.price || 0)} <span class="v2-chip ${stCls}">${esc(it.status || '在售')}</span></span>
        <span class="v2-log-ops">
          <a class="v2-tx-edit" data-act="xianyuEditItem" data-id="${it.id}" title="编辑">✎</a>
          ${it.status !== '已售' ? `<a class="v2-tx-edit" data-act="xianyuSold" data-id="${it.id}" title="标记已售">✅</a>` : ''}
          <a class="v2-tx-del" data-act="xianyuDelItem" data-id="${it.id}">✕</a>
        </span>
      </div>`;
    }, '还没有宝贝，点「+ 上架宝贝」开始吧');
    h += `</div>`;

    h += sectionTitle('成交记录', '记一笔', 'xianyuAddDeal');
    h += listOrEmpty(deals.slice().reverse(), d =>
      `<div class="v2-log-item"><span class="v2-log-text">${esc(d.title)} · <b>${money(d.amount || 0)}</b></span><span class="v2-log-date">${fmtDate(d.date)}</span><a class="v2-tx-del" data-act="xianyuDelDeal" data-id="${d.id}">✕</a></div>`
    , '还没有成交记录');
    h += `</div>`;

    h += sectionTitle('选品灵感', '灵感', 'xianyuAddIdea');
    h += listOrEmpty(ideas, i =>
      `<div class="v2-log-item"><span class="v2-log-text">${esc(i.text)}</span><span class="v2-log-date">${fmtDate(i.date)}</span><a class="v2-tx-del" data-act="xianyuDelIdea" data-id="${i.id}">✕</a></div>`
    , '记录你想卖的品类 / 货源灵感');
    h += `</div></div>`;
    return h;
  }
  function xianyuForm(it) {
    window.V2.openForm(it ? '编辑宝贝' : '上架宝贝', `
      <div class="v2-form">
        <div class="form-group"><label>标题</label><input id="f_title" class="v2-input" value="${esc(it ? it.title : '')}" placeholder="例如：九成新 Kindle"></div>
        <div class="form-group"><label>分类</label><select id="f_cat" class="v2-input">${opt(['数码', '服饰', '教材', '美妆', '闲置', '其他'], it ? it.cat : '闲置')}</select></div>
        <div class="form-group"><label>价格(元)</label><input id="f_price" type="number" class="v2-input" value="${it ? it.price : ''}" placeholder="0"></div>
        <div class="form-group"><label>状态</label><select id="f_status" class="v2-input">${opt(['在售', '已售', '下架'], it ? it.status : '在售')}</select></div>
        <div class="form-group"><label>描述</label><textarea id="f_desc" class="v2-input" rows="2" placeholder="成色、规格、转手原因…">${esc(it ? it.desc : '')}</textarea></div>
        <div class="v2-form-actions"><button class="btn btn-primary" data-act="xianyuSaveItem">保存</button><button class="btn" onclick="closeGeneric()">取消</button></div>
      </div>`);
  }
  function xianyuAddItem() { _xyEdit = null; xianyuForm(null); }
  function xianyuEditItem(el) { const id = el.dataset.id; _xyEdit = id; const it = v2('xianyu_items', []).find(x => x.id === id); xianyuForm(it); }
  function xianyuSaveItem() {
    const title = gid('f_title').value.trim();
    if (!title) { toast('请填写标题'); return; }
    const item = { title, cat: gid('f_cat').value, price: parseFloat(gid('f_price').value) || 0, status: gid('f_status').value, desc: gid('f_desc').value.trim() };
    const items = v2('xianyu_items', []);
    if (_xyEdit) { const t = items.find(x => x.id === _xyEdit); if (t) Object.assign(t, item); }
    else { item.id = gId(); item.date = todayStr(); items.push(item); }
    v2set('xianyu_items', items); _xyEdit = null; closeGeneric(); if (typeof render === 'function') render(); toast('已保存');
  }
  function xianyuDelItem(el) {
    const id = el.dataset.id;
    if (!confirm('确定删除该宝贝？')) return;
    v2set('xianyu_items', v2('xianyu_items', []).filter(x => x.id !== id));
    if (typeof render === 'function') render();
  }
  function xianyuSold(el) {
    const id = el.dataset.id;
    const items = v2('xianyu_items', []);
    const it = items.find(x => x.id === id);
    if (it) { it.status = '已售'; v2set('xianyu_items', items); if (typeof render === 'function') render(); toast('已标记已售，记得在成交记录里记一笔收入哦'); }
  }
  function xianyuDealForm(d) {
    window.V2.openForm(d ? '编辑成交' : '记录成交', `
      <div class="v2-form">
        <div class="form-group"><label>宝贝/说明</label><input id="f_title" class="v2-input" value="${esc(d ? d.title : '')}" placeholder="例如：Kindle"></div>
        <div class="form-group"><label>金额(元)</label><input id="f_amount" type="number" class="v2-input" value="${d ? d.amount : ''}" placeholder="0"></div>
        <div class="form-group"><label>日期</label><input id="f_date" type="date" class="v2-input" value="${d ? d.date : todayStr()}"></div>
        <div class="v2-form-actions"><button class="btn btn-primary" data-act="xianyuSaveDeal">保存</button><button class="btn" onclick="closeGeneric()">取消</button></div>
      </div>`);
  }
  let _xyDealEdit = null;
  function xianyuAddDeal() { _xyDealEdit = null; xianyuDealForm(null); }
  function xianyuSaveDeal() {
    const title = gid('f_title').value.trim();
    if (!title) { toast('请填写说明'); return; }
    const rec = { title, amount: parseFloat(gid('f_amount').value) || 0, date: gid('f_date').value || todayStr() };
    const deals = v2('xianyu_deals', []);
    if (_xyDealEdit) { const t = deals.find(x => x.id === _xyDealEdit); if (t) Object.assign(t, rec); }
    else { rec.id = gId(); deals.push(rec); }
    v2set('xianyu_deals', deals); _xyDealEdit = null; closeGeneric(); if (typeof render === 'function') render(); toast('已记录');
  }
  function xianyuDelDeal(el) {
    const id = el.dataset.id;
    if (!confirm('删除该成交记录？')) return;
    v2set('xianyu_deals', v2('xianyu_deals', []).filter(x => x.id !== id));
    if (typeof render === 'function') render();
  }
  function xianyuIdeaForm(i) {
    window.V2.openForm(i ? '编辑灵感' : '选品灵感', `
      <div class="v2-form">
        <div class="form-group"><label>灵感内容</label><textarea id="f_text" class="v2-input" rows="3" placeholder="想卖什么品类 / 看到的货源 / 爆款思路…">${esc(i ? i.text : '')}</textarea></div>
        <div class="v2-form-actions"><button class="btn btn-primary" data-act="xianyuSaveIdea">保存</button><button class="btn" onclick="closeGeneric()">取消</button></div>
      </div>`);
  }
  let _xyIdeaEdit = null;
  function xianyuAddIdea() { _xyIdeaEdit = null; xianyuIdeaForm(null); }
  function xianyuSaveIdea() {
    const text = gid('f_text').value.trim();
    if (!text) { toast('请填写内容'); return; }
    const ideas = v2('xianyu_ideas', []);
    if (_xyIdeaEdit) { const t = ideas.find(x => x.id === _xyIdeaEdit); if (t) t.text = text; }
    else { ideas.push({ id: gId(), text, date: todayStr() }); }
    v2set('xianyu_ideas', ideas); _xyIdeaEdit = null; closeGeneric(); if (typeof render === 'function') render(); toast('已保存');
  }
  function xianyuDelIdea(el) {
    const id = el.dataset.id;
    if (!confirm('删除该灵感？')) return;
    v2set('xianyu_ideas', v2('xianyu_ideas', []).filter(x => x.id !== id));
    if (typeof render === 'function') render();
  }
  window.V2ACT.xianyuOpsToggle = (el) => {
    const ops = v2('xianyu_ops', {});
    const it = (ops.items || []).find(x => x.id === el.dataset.id);
    if (it) { it.done = !it.done; v2set('xianyu_ops', ops); if (typeof render === 'function') render(); }
  };
  window.V2ACT.xianyuCopy = (el) => {
    const t = el.dataset.text || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(() => toast('已复制文案，去闲鱼粘贴吧')).catch(() => toast('复制失败，请手动选择文字'));
    } else { toast('当前环境不支持自动复制，请手动选择'); }
  };

  /* ====================== 微信视频号 ====================== */
  let _chEdit = null;
  function renderChannels() {
    const videos = v2('channels_videos', []);
    const stats = v2('channels_stats', []);
    const published = videos.filter(v => v.status === '已发布').length;
    const totalViews = stats.reduce((s, x) => s + Number(x.views || 0), 0);
    const totalFollows = stats.reduce((s, x) => s + Number(x.follows || 0), 0);

    let h = `<div class="page"><div class="page-head"><div class="page-title">📹 微信视频号</div><div class="page-sub">视频规划 · 数据看板 · 选题灵感</div></div>`;
    h += statGrid([['已发布', published], ['累计播放', totalViews], ['累计新增关注', totalFollows]]);

    h += sectionTitle('视频计划', '添加视频', 'chAddVideo');
    h += listOrEmpty(videos, v => {
      return `<div class="v2-log-item">
        <span class="v2-chip">${esc(v.status || '选题')}</span>
        <span class="v2-log-text"><b>${esc(v.topic)}</b>${v.planDate ? ` · 计划 ${esc(v.planDate)}` : ''}${v.link ? ` <a href="${esc(v.link)}" target="_blank" style="font-size:12px">🔗</a>` : ''}</span>
        <span class="v2-log-ops">
          <a class="v2-tx-edit" data-act="chEditVideo" data-id="${v.id}" title="编辑">✎</a>
          <a class="v2-tx-del" data-act="chDelVideo" data-id="${v.id}">✕</a>
        </span>
      </div>`;
    }, '还没有视频计划，点「+ 添加视频」');
    h += `</div>`;

    h += sectionTitle('数据记录', '记数据', 'chAddStat');
    if (stats.length) {
      const last7 = stats.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7).reverse();
      h += `<div class="v2-section-sub">近 7 日播放量</div>` + miniBars(last7.map(s => ({ label: fmtDate(s.date), value: Number(s.views || 0), display: Number(s.views || 0) })));
      h += `<div class="v2-log-list">`;
      stats.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12).forEach(s => {
        h += `<div class="v2-log-item"><span class="v2-log-text">${fmtDate(s.date)} · 播放 ${Number(s.views || 0)} · 赞 ${Number(s.likes || 0)} · 转发 ${Number(s.shares || 0)} · 新增关注 ${Number(s.follows || 0)}</span><a class="v2-tx-del" data-act="chDelStat" data-id="${s.id}">✕</a></div>`;
      });
      h += `</div>`;
    } else {
      h += `<div class="v2-book-empty">还没有数据记录，点「+ 记数据」</div>`;
    }
    h += `</div></div>`;
    return h;
  }
  function chVideoForm(v) {
    window.V2.openForm(v ? '编辑视频' : '添加视频', `
      <div class="v2-form">
        <div class="form-group"><label>选题</label><input id="f_topic" class="v2-input" value="${esc(v ? v.topic : '')}" placeholder="视频主题"></div>
        <div class="form-group"><label>脚本要点</label><textarea id="f_script" class="v2-input" rows="3" placeholder="开头钩子 / 内容结构 / 结尾引导…">${esc(v ? v.script : '')}</textarea></div>
        <div class="form-group"><label>计划发布日</label><input id="f_plan" type="date" class="v2-input" value="${v ? v.planDate : todayStr()}"></div>
        <div class="form-group"><label>状态</label><select id="f_status" class="v2-input">${opt(['选题', '拍摄中', '已发布'], v ? v.status : '选题')}</select></div>
        <div class="form-group"><label>视频链接</label><input id="f_link" class="v2-input" value="${esc(v ? v.link : '')}" placeholder="发布后粘贴视频号链接"></div>
        <div class="v2-form-actions"><button class="btn btn-primary" data-act="chSaveVideo">保存</button><button class="btn" onclick="closeGeneric()">取消</button></div>
      </div>`);
  }
  function chAddVideo() { _chEdit = null; chVideoForm(null); }
  function chEditVideo(el) { _chEdit = el.dataset.id; const v = v2('channels_videos', []).find(x => x.id === _chEdit); chVideoForm(v); }
  function chSaveVideo() {
    const topic = gid('f_topic').value.trim();
    if (!topic) { toast('请填写选题'); return; }
    const rec = { topic, script: gid('f_script').value.trim(), planDate: gid('f_plan').value, status: gid('f_status').value, link: gid('f_link').value.trim() };
    const videos = v2('channels_videos', []);
    if (_chEdit) { const t = videos.find(x => x.id === _chEdit); if (t) Object.assign(t, rec); }
    else { rec.id = gId(); videos.push(rec); }
    v2set('channels_videos', videos); _chEdit = null; closeGeneric(); if (typeof render === 'function') render(); toast('已保存');
  }
  function chDelVideo(el) {
    const id = el.dataset.id;
    if (!confirm('删除该视频计划？')) return;
    v2set('channels_videos', v2('channels_videos', []).filter(x => x.id !== id));
    if (typeof render === 'function') render();
  }
  function chStatForm(s) {
    window.V2.openForm(s ? '编辑数据' : '记录数据', `
      <div class="v2-form">
        <div class="form-group"><label>日期</label><input id="f_date" type="date" class="v2-input" value="${s ? s.date : todayStr()}"></div>
        <div class="form-group"><label>播放量</label><input id="f_views" type="number" class="v2-input" value="${s ? s.views : ''}" placeholder="0"></div>
        <div class="form-group"><label>点赞</label><input id="f_likes" type="number" class="v2-input" value="${s ? s.likes : ''}" placeholder="0"></div>
        <div class="form-group"><label>转发</label><input id="f_shares" type="number" class="v2-input" value="${s ? s.shares : ''}" placeholder="0"></div>
        <div class="form-group"><label>新增关注</label><input id="f_follows" type="number" class="v2-input" value="${s ? s.follows : ''}" placeholder="0"></div>
        <div class="v2-form-actions"><button class="btn btn-primary" data-act="chSaveStat">保存</button><button class="btn" onclick="closeGeneric()">取消</button></div>
      </div>`);
  }
  let _chStatEdit = null;
  function chAddStat() { _chStatEdit = null; chStatForm(null); }
  function chSaveStat() {
    const date = gid('f_date').value || todayStr();
    const rec = {
      date,
      views: parseFloat(gid('f_views').value) || 0,
      likes: parseFloat(gid('f_likes').value) || 0,
      shares: parseFloat(gid('f_shares').value) || 0,
      follows: parseFloat(gid('f_follows').value) || 0
    };
    const stats = v2('channels_stats', []);
    if (_chStatEdit) { const t = stats.find(x => x.id === _chStatEdit); if (t) Object.assign(t, rec); }
    else { rec.id = gId(); stats.push(rec); }
    v2set('channels_stats', stats); _chStatEdit = null; closeGeneric(); if (typeof render === 'function') render(); toast('已记录');
  }
  function chDelStat(el) {
    const id = el.dataset.id;
    if (!confirm('删除该数据记录？')) return;
    v2set('channels_stats', v2('channels_stats', []).filter(x => x.id !== id));
    if (typeof render === 'function') render();
  }

  /* ====================== 微信公众号 ====================== */
  let _wxEdit = null;
  function renderWechat() {
    const articles = v2('wechat_articles', []);
    const stats = v2('wechat_stats', []);
    const published = articles.filter(a => a.status === '已发').length;
    const totalReads = stats.reduce((s, x) => s + Number(x.reads || 0), 0);
    const totalFollows = stats.reduce((s, x) => s + Number(x.newFollowers || 0), 0);

    let h = `<div class="page"><div class="page-head"><div class="page-title">📣 微信公众号</div><div class="page-sub">文章管理 · 数据看板 · 选题库</div></div>`;
    h += statGrid([['已发文', published], ['累计阅读', totalReads], ['累计新增关注', totalFollows]]);

    h += sectionTitle('文章管理', '添加文章', 'wxAddArticle');
    h += listOrEmpty(articles, a => {
      return `<div class="v2-log-item">
        <span class="v2-chip">${esc(a.status || '选题')}</span>
        <span class="v2-log-text"><b>${esc(a.title)}</b>${a.type ? ` · ${esc(a.type)}` : ''}${a.pubDate ? ` · ${esc(a.pubDate)}` : ''}${a.link ? ` <a href="${esc(a.link)}" target="_blank" style="font-size:12px">🔗</a>` : ''}</span>
        <span class="v2-log-ops">
          <a class="v2-tx-edit" data-act="wxEditArticle" data-id="${a.id}" title="编辑">✎</a>
          <a class="v2-tx-del" data-act="wxDelArticle" data-id="${a.id}">✕</a>
        </span>
      </div>`;
    }, '还没有文章，点「+ 添加文章」');
    h += `</div>`;

    h += sectionTitle('数据记录', '记数据', 'wxAddStat');
    h += `<div class="v2-hint">📌 每天把公众号后台的「阅读量 / 在看 / 分享 / 新增关注」填一笔，系统自动生成近 7 日阅读柱状图。点「+ 记数据」即可录入。</div>`;
    if (stats.length) {
      const last7 = stats.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7).reverse();
      h += `<div class="v2-section-sub">近 7 日阅读量</div>` + miniBars(last7.map(s => ({ label: fmtDate(s.date), value: Number(s.reads || 0), display: Number(s.reads || 0) })));
      h += `<div class="v2-log-list">`;
      stats.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12).forEach(s => {
        h += `<div class="v2-log-item"><span class="v2-log-text">${fmtDate(s.date)} · 阅读 ${Number(s.reads || 0)} · 在看 ${Number(s.likes || 0)} · 分享 ${Number(s.shares || 0)} · 新增关注 ${Number(s.newFollowers || 0)}</span><a class="v2-tx-del" data-act="wxDelStat" data-id="${s.id}">✕</a></div>`;
      });
      h += `</div>`;
    } else {
      h += `<div class="v2-book-empty">还没有数据记录，点「+ 记数据」</div>`;
    }

    // 每日文献精选（NCBI/Europe PMC）+ 本周精读候选
    h += `<div class="v2-block">${window.V3 ? V3.ncbiPapersSection() : ''}</div>`;
    h += `<div class="v2-block">${window.V3 ? V3.ncbiWeekSection() : ''}</div>`;

    h += `</div></div>`;
    return h;
  }
  function wxArticleForm(a) {
    window.V2.openForm(a ? '编辑文章' : '添加文章', `
      <div class="v2-form">
        <div class="form-group"><label>标题</label><input id="f_title" class="v2-input" value="${esc(a ? a.title : '')}" placeholder="文章标题"></div>
        <div class="form-group"><label>类型</label><select id="f_type" class="v2-input">${opt(['原创', '转载'], a ? a.type : '原创')}</select></div>
        <div class="form-group"><label>状态</label><select id="f_status" class="v2-input">${opt(['选题', '草稿', '已发'], a ? a.status : '选题')}</select></div>
        <div class="form-group"><label>发布日</label><input id="f_pub" type="date" class="v2-input" value="${a ? a.pubDate : todayStr()}"></div>
        <div class="form-group"><label>阅读量</label><input id="f_reads" type="number" class="v2-input" value="${a ? a.reads : ''}" placeholder="0"></div>
        <div class="form-group"><label>文章链接</label><input id="f_link" class="v2-input" value="${esc(a ? a.link : '')}" placeholder="发布后粘贴链接"></div>
        <div class="v2-form-actions"><button class="btn btn-primary" data-act="wxSaveArticle">保存</button><button class="btn" onclick="closeGeneric()">取消</button></div>
      </div>`);
  }
  function wxAddArticle() { _wxEdit = null; wxArticleForm(null); }
  function wxEditArticle(el) { _wxEdit = el.dataset.id; const a = v2('wechat_articles', []).find(x => x.id === _wxEdit); wxArticleForm(a); }
  function wxSaveArticle() {
    const title = gid('f_title').value.trim();
    if (!title) { toast('请填写标题'); return; }
    const rec = { title, type: gid('f_type').value, status: gid('f_status').value, pubDate: gid('f_pub').value, reads: parseFloat(gid('f_reads').value) || 0, link: gid('f_link').value.trim() };
    const articles = v2('wechat_articles', []);
    if (_wxEdit) { const t = articles.find(x => x.id === _wxEdit); if (t) Object.assign(t, rec); }
    else { rec.id = gId(); articles.push(rec); }
    v2set('wechat_articles', articles); _wxEdit = null; closeGeneric(); if (typeof render === 'function') render(); toast('已保存');
  }
  function wxDelArticle(el) {
    const id = el.dataset.id;
    if (!confirm('删除该文章？')) return;
    v2set('wechat_articles', v2('wechat_articles', []).filter(x => x.id !== id));
    if (typeof render === 'function') render();
  }
  function wxStatForm(s) {
    window.V2.openForm(s ? '编辑数据' : '记录数据', `
      <div class="v2-form">
        <div class="form-group"><label>日期</label><input id="f_date" type="date" class="v2-input" value="${s ? s.date : todayStr()}"></div>
        <div class="form-group"><label>阅读量</label><input id="f_reads" type="number" class="v2-input" value="${s ? s.reads : ''}" placeholder="0"></div>
        <div class="form-group"><label>在看</label><input id="f_likes" type="number" class="v2-input" value="${s ? s.likes : ''}" placeholder="0"></div>
        <div class="form-group"><label>分享</label><input id="f_shares" type="number" class="v2-input" value="${s ? s.shares : ''}" placeholder="0"></div>
        <div class="form-group"><label>新增关注</label><input id="f_new" type="number" class="v2-input" value="${s ? s.newFollowers : ''}" placeholder="0"></div>
        <div class="v2-form-actions"><button class="btn btn-primary" data-act="wxSaveStat">保存</button><button class="btn" onclick="closeGeneric()">取消</button></div>
      </div>`);
  }
  let _wxStatEdit = null;
  function wxAddStat() { _wxStatEdit = null; wxStatForm(null); }
  function wxSaveStat() {
    const date = gid('f_date').value || todayStr();
    const rec = {
      date,
      reads: parseFloat(gid('f_reads').value) || 0,
      likes: parseFloat(gid('f_likes').value) || 0,
      shares: parseFloat(gid('f_shares').value) || 0,
      newFollowers: parseFloat(gid('f_new').value) || 0
    };
    const stats = v2('wechat_stats', []);
    if (_wxStatEdit) { const t = stats.find(x => x.id === _wxStatEdit); if (t) Object.assign(t, rec); }
    else { rec.id = gId(); stats.push(rec); }
    v2set('wechat_stats', stats); _wxStatEdit = null; closeGeneric(); if (typeof render === 'function') render(); toast('已记录');
  }
  function wxDelStat(el) {
    const id = el.dataset.id;
    if (!confirm('删除该数据记录？')) return;
    v2set('wechat_stats', v2('wechat_stats', []).filter(x => x.id !== id));
    if (typeof render === 'function') render();
  }

  /* ---------- 注册 ---------- */
  window.V2VIEWS = window.V2VIEWS || {};
  window.V2ACT = window.V2ACT || {};
  window.V2VIEWS.xianyu = renderXianyu;
  window.V2VIEWS.channels = renderChannels;
  window.V2VIEWS.wechat = renderWechat;
  Object.assign(window.V2ACT, {
    xianyuAddItem, xianyuEditItem, xianyuSaveItem, xianyuDelItem, xianyuSold,
    xianyuAddDeal, xianyuSaveDeal, xianyuDelDeal, xianyuAddIdea, xianyuSaveIdea, xianyuDelIdea,
    chAddVideo, chEditVideo, chSaveVideo, chDelVideo, chAddStat, chSaveStat, chDelStat,
    wxAddArticle, wxEditArticle, wxSaveArticle, wxDelArticle, wxAddStat, wxSaveStat, wxDelStat
  });
})();
