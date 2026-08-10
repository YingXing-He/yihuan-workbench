/* ==========================================================================
 * 易欢工作台 V2 — 核心接入层
 * 零侵入：不改动 app.js 业务，仅重写 NAV_CONFIG、劫持 render/handleAction/updateTopBar
 * 所有 V2 模块逻辑通过 window.V2VIEWS（路由→渲染函数）与 window.V2ACT（动作→处理函数）注册
 * ========================================================================== */
(function () {
  'use strict';

  /* ---------- Hello Kitty 红线条导航图标（22x22 线稿） ---------- */
  const R = '#E60012';
  const ICONS = {
    home: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 11 4l8 6.5"/><path d="M5 9.5V18h12V9.5"/><path d="M9.2 18v-4h3.6v4"/></svg>`,
    checkin: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7.5"/><path d="M7.5 11l2.4 2.4L14.6 8.6"/></svg>`,
    ielts: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h11a2 2 0 0 1 2 2V17a2 2 0 0 0-2-2H4z"/><path d="M4 5.5a2 2 0 0 0-2 2V17a2 2 0 0 1 2-2"/><path d="M8.5 9h6M8.5 12h6"/></svg>`,
    selfmedia: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="8" height="17" rx="2"/><path d="M10.5 18.2h1"/><path d="M11 8l-2 2.6V13l2-1 2 1V10.6z" fill="${R}"/></svg>`,
    xianyu: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11c3-4 8-4 11 0-3 4-8 4-11 0z"/><path d="M14 11h4l3-3v6l-3-3"/><circle cx="8" cy="9.5" r="0.8" fill="${R}"/></svg>`,
    channels: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="13" height="12" rx="2.5"/><path d="M9 9.5l3 1.5-3 1.5z" fill="${R}"/><path d="M17 9l3-1.5v7L17 13"/></svg>`,
    wechat: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h11a2.5 2.5 0 0 1 2.5 2.5V13a2.5 2.5 0 0 1-2.5 2.5H9l-3.5 3v-3.5H4A2.5 2.5 0 0 1 1.5 13V7.5A2.5 2.5 0 0 1 4 5z"/><circle cx="7" cy="9.5" r="0.7" fill="${R}"/><circle cx="11" cy="9.5" r="0.7" fill="${R}"/></svg>`,
    study: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7.5"/><circle cx="11" cy="11" r="3.6"/><circle cx="11" cy="11" r="0.6" fill="${R}"/></svg>`,
    research: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-3.5 6.5a2 2 0 0 0 1.8 3h5.4a2 2 0 0 0 1.8-3L15 9V3"/><path d="M8.5 14h7"/></svg>`,
    podcast: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="2.8" width="5" height="9" rx="2.5"/><path d="M6.5 11a4.5 4.5 0 0 0 9 0"/><path d="M11 15.5V19M8 19h6"/></svg>`,
    news: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="15" height="14" rx="2"/><path d="M6.5 8h7M6.5 11h9M6.5 14h9"/><path d="M8.5 4v0"/></svg>`,
    books: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6C9 4.5 6.5 4.5 4.5 5.2V17c2-.7 4.5-.7 6.5.3M11 6c2-1.5 4.5-1.5 6.5-.8V17c-2 .7-4.5.7-6.5.3M11 6v11.3"/></svg>`,
    express: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h14v9H8l-3.5 3z"/><path d="M8 9.5h6M8 12h4"/></svg>`,
    ai: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="7" width="10" height="8" rx="2"/><path d="M9 4.5v2.5M13 4.5v2.5M9 15.5v2M13 15.5v2M4 10.5h2M16 10.5h2"/><circle cx="9" cy="11" r="0.8" fill="${R}"/><circle cx="13" cy="11" r="0.8" fill="${R}"/></svg>`,
    finance: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="6" width="15" height="11" rx="2"/><path d="M3.5 9.5h15"/><path d="M15.5 13h2"/></svg>`,
    gold: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="11" cy="8" rx="6" ry="2.6"/><path d="M5 8v6c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V8"/><path d="M8 13.5l3-1 3 1"/></svg>`,
    market: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18h14"/><rect x="5" y="11" width="3" height="5"/><rect x="10" y="7" width="3" height="9"/><rect x="15" y="9" width="3" height="7"/></svg>`,
    financelife: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20V9"/><path d="M7 11c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M5 13c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M8.5 20h7"/><path d="M11 9V5.5M9 5.5h4"/></svg>`,
    diet: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h14a7 7 0 0 1-14 0z"/><path d="M11 10v7M8 17h6"/></svg>`,
    sport: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="14.5" cy="5.5" r="2"/><path d="M13 8l-4 3 2 3-1 4M13 8l3 1 3 2M9 11l-3 1-2 3"/></svg>`,
    skincare: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-4.5 5-9 5-9z"/><path d="M12 12l1.5 1.5"/></svg>`,
    habit: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11a6.5 6.5 0 0 1 11-4.6M17 11a6.5 6.5 0 0 1-11 4.6"/><path d="M16 4.5v2.4h-2.4M6 17.5v-2.4h2.4"/></svg>`,
    review: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h9l3 3V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"/><path d="M8 9h6M8 12h6M8 15h3"/></svg>`,
    memo: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="3" width="13" height="16" rx="2"/><path d="M8 7h6M8 10h6M8 13h4"/></svg>`,
    settings: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="2.6"/><path d="M11 3v2.4M11 16.6V19M19 11h-2.4M5.4 11H3M16.5 5.5l-1.7 1.7M7.2 14.8l-1.7 1.7M16.5 16.5l-1.7-1.7M7.2 7.2 5.5 5.5"/></svg>`,
    fortune: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="6.5"/><path d="M11 6.5V3M8.4 4.6 6.3 2.5M13.6 4.6l2.1-2.1M4 13H1M21 13h-3"/><path d="M8.4 13.5l1.6 1.6 3.2-3.4" stroke-width="1.4"/></svg>`,
    timeline: `<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="${R}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h16"/><circle cx="7" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M11 4v3M11 15v3"/></svg>`
  };

  /* ---------- 重写导航配置（文档顺序，全部真实模块） ---------- */
  NAV_CONFIG = [
    { key: 'home', label: '首页', icon: ICONS.home, group: 'main' },
    { key: 'checkin', label: '打卡中心', icon: ICONS.checkin, group: 'main', dot: true },
    {
      key: '_ielts', label: '雅思学习', icon: ICONS.ielts, group: 'main',
      expandable: true,
      children: [
        { key: 'ielts_words', label: '单词', icon: ICONS.ielts },
        { key: 'ielts_listening', label: '听力', icon: ICONS.ielts },
        { key: 'ielts_speaking', label: '口语', icon: ICONS.ielts },
        { key: 'ielts_reading', label: '阅读', icon: ICONS.ielts },
        { key: 'ielts_writing', label: '写作', icon: ICONS.ielts },
        { key: 'ielts_exam', label: '真题', icon: ICONS.ielts }
      ]
    },
    { key: 'selfmedia', label: '自媒体运营', icon: ICONS.selfmedia, group: 'main' },
    { key: 'xianyu', label: '闲鱼', icon: ICONS.xianyu, group: 'more' },
    { key: 'channels', label: '微信视频号', icon: ICONS.channels, group: 'more' },
    { key: 'wechat', label: '微信公众号', icon: ICONS.wechat, group: 'more' },
    { key: 'study', label: '学习管理', icon: ICONS.study, group: 'more' },
    { key: 'research', label: '科研助手', icon: ICONS.research, group: 'more' },
    { key: 'podcast', label: '播客精选', icon: ICONS.podcast, group: 'more' },
    { key: 'news', label: '新闻资讯', icon: ICONS.news, group: 'more' },
    { key: 'books', label: '读书推荐', icon: ICONS.books, group: 'more' },
    { key: 'express', label: '表达能力', icon: ICONS.express, group: 'more' },
    { key: 'ai', label: 'AI学习', icon: ICONS.ai, group: 'more' },
    { key: 'finance', label: '小账本', icon: ICONS.finance, group: 'more' },
    { key: 'gold', label: '黄金财经', icon: ICONS.gold, group: 'more' },
    { key: 'financelife', label: '理财学习', icon: ICONS.financelife, group: 'more' },
    { key: 'diet', label: '饮食打卡', icon: ICONS.diet, group: 'more' },
    { key: 'sport', label: '运动管理', icon: ICONS.sport, group: 'more' },
    { key: 'skincare', label: '美妆穿搭', icon: ICONS.skincare, group: 'more' },
    { key: 'habit', label: '习惯养成', icon: ICONS.habit, group: 'more' },
    { key: 'review', label: '每日复盘', icon: ICONS.review, group: 'more' },
    { key: 'timeline', label: '时间流', icon: ICONS.timeline, group: 'more' },
    { key: 'fortune', label: '今日运势', icon: ICONS.fortune, group: 'more' },
    { key: 'memo', label: '备忘录', icon: ICONS.memo, group: 'more' },
    { key: 'settings', label: '设置与数据', icon: ICONS.settings, group: 'end' }
  ];

  /* ---------- 视图 / 动作注册表（各模块文件填充） ---------- */
  window.V2VIEWS = window.V2VIEWS || {};
  window.V2ACT = window.V2ACT || {};

  const V2_ROUTES = ['study','research','podcast','news','books','express','ai','finance','gold','financelife','diet','sport','skincare','habit','review','timeline','fortune','xianyu','channels','wechat'];
  const V2_TITLES = {
    study:'学习管理', research:'科研助手', podcast:'播客精选', news:'新闻资讯', books:'读书推荐',
    express:'表达能力', ai:'AI学习', finance:'小账本', gold:'黄金财经', financelife:'理财学习',
    diet:'饮食打卡', sport:'运动管理', skincare:'美妆穿搭', habit:'习惯养成', review:'每日复盘',
    fortune:'今日运势', xianyu:'闲鱼', channels:'微信视频号', wechat:'微信公众号',
    timeline:'时间流'
  };
  // 暴露到 window，便于后续脚本（如 v2-d 搜索/AI帮手）扩展路由
  window.V2_ROUTES = V2_ROUTES;
  window.V2_TITLES = V2_TITLES;

  /* ---------- 数据层（全部挂在 yhwb_v2_ 前缀下） ---------- */
  function v2(k, def) { return DB.get('v2_' + k, def); }
  function v2set(k, val) { DB.set('v2_' + k, val); }
  function gId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function tStr() { return todayStr(); }
  function money(n) {
    const v = Number(n) || 0;
    return '¥' + v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtDate(d) {
    try { const dt = new Date(d); return (dt.getMonth() + 1) + '月' + dt.getDate() + '日'; }
    catch (e) { return d; }
  }
  // 近 7 天 / 30 天 日期字符串数组
  function lastNDates(n) {
    const arr = [];
    const base = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(base); d.setDate(base.getDate() - i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  }

  /* ---------- 通用：每日推荐「已读」勾选状态（跨模块复用） ---------- */
  // id 形如 book_xxx / pod_2 / ai_theory_1 / paper_<doi>，存进 v2_read_set，勾选后优先推未读，不足则复推
  function readSet() { return DB.get('v2_read_set', {}) || {}; }
  function readIs(id) { return !!readSet()[id]; }
  function readToggle(id) { const s = readSet(); s[id] = !s[id]; DB.set('v2_read_set', s); }
  // 从 poolIds 中优先挑未读的 n 个；未读不足则用已读补充（实现「没勾选的优先推荐，勾了的复推」）
  function readPick(poolIds, n) {
    const unread = poolIds.filter(id => !readIs(id));
    const read = poolIds.filter(id => readIs(id));
    let out = unread.slice(0, n);
    if (out.length < n) out = out.concat(read.slice(0, n - out.length));
    return out;
  }
  // 渲染一个「已读」小按钮
  function readBtn(id) {
    const on = readIs(id);
    return `<button class="v2-read-btn${on?' on':''}" title="${on?'已读':'标记已读'}" data-act="readToggle" data-id="${esc(id)}">${on?'✓':'○'}</button>`;
  }

  // 本地自然日序号（基于本地零点，与 todayStr()/签到同一时区边界，避免 UTC 08:00 跳变）
  function dayIndexLocal() {
    const n = new Date();
    return Math.floor(new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime() / 86400000);
  }
  // 真正的「每日轮换」：按本地自然日确定性偏移切片，每天换一批；seedShift 用于让不同模块错开窗口
  function dailyPick(poolIds, n, seedShift) {
    const len = poolIds.length;
    if (!len) return [];
    const shift = (((dayIndexLocal() + (seedShift || 0)) % len) + len) % len;
    const rotated = poolIds.slice(shift).concat(poolIds.slice(0, shift));
    return rotated.slice(0, Math.min(n, len));
  }
  // 统一视频源：手机尝试唤起原生 App（带关键词进搜索结果），电脑进官网
  function vidUrl(platform, kw) { return mediaLink(platform, kw); }
  function mediaLink(platform, kw, label) {
    const safe = (kw || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const p = { douyin: '抖音', xhs: '小红书', bili: 'B站', ximalaya: '喜马拉雅' }[platform] || platform;
    return `<a href="#" onclick="window.openMedia('${platform}','${safe}');return false;" class="btn btn-outline btn-xs">${label || p} ↗</a>`;
  }

  /* ---------- 通用：CSS 条形图 ---------- */
  function cssBar(items, opt) {
    opt = opt || {};
    const max = Math.max(1, ...items.map(i => Math.abs(i.value)));
    let h = '<div class="v2-bar-chart">';
    items.forEach(it => {
      const pct = (Math.abs(it.value) / max) * 100;
      const cls = it.value < 0 ? 'neg' : 'pos';
      h += `<div class="v2-bar-row">
        <div class="v2-bar-label">${esc(it.label || '')}</div>
        <div class="v2-bar-track"><div class="v2-bar-fill ${cls}" style="width:${pct.toFixed(1)}%"></div></div>
        <div class="v2-bar-val ${cls}">${esc(it.display || it.value)}</div>
      </div>`;
    });
    h += '</div>';
    return h;
  }
  /* ---------- 通用：CSS 饼图（环形） ---------- */
  function cssPie(items) {
    const total = items.reduce((s, i) => s + Math.abs(i.value), 0) || 1;
    let acc = 0;
    const segs = items.map((it, idx) => {
      const start = acc / total * 360;
      acc += Math.abs(it.value);
      const end = acc / total * 360;
      const color = ['#E60012','#4A90A4','#FFD100','#FFCCD8','#FF9DB0','#8FD3C7'][idx % 6];
      return `<div class="v2-pie-seg" style="--a:${start}deg;--b:${end}deg;background:conic-gradient(${color} ${start}deg ${end}deg, transparent ${end}deg)"></div>`;
    }).join('');
    const legend = items.map((it, idx) => {
      const color = ['#E60012','#4A90A4','#FFD100','#FFCCD8','#FF9DB0','#8FD3C7'][idx % 6];
      const pct = (Math.abs(it.value) / total * 100).toFixed(0);
      return `<span class="v2-legend"><i style="background:${color}"></i>${esc(it.label)} ${pct}%</span>`;
    }).join('');
    return `<div class="v2-pie-wrap"><div class="v2-pie">${segs}<div class="v2-pie-hole"></div></div><div class="v2-legend-box">${legend}</div></div>`;
  }

  /* ---------- 通用：表单弹窗（复用 V1 通用弹窗） ---------- */
  function openForm(title, bodyHtml) {
    if (typeof showGeneric === 'function') { showGeneric(title, bodyHtml); }
    else { gid('genericTitle').textContent = title; gid('genericBody').innerHTML = bodyHtml; gid('genericModal').classList.remove('hidden'); }
    // 注：主点击监听已挂在 document，弹窗在 #app 之外也能被捕获，无需单独挂监听。
  }

  /* ---------- 补充 V2 模块帮助文案（复用 V1 HELP_TEXT 对象） ---------- */
  function addHelp() {
    if (typeof HELP_TEXT === 'undefined') return;
    Object.assign(HELP_TEXT, {
      study: { title: '📚 学习管理帮助', body: `<div class="guide-content"><p>聚合学习目标、学校课程与考研备考。🏫 学校课程可手动添加作业并设置截止日期，临近截止（含明天）会高亮提醒；🎓 考研备考可设置目标院校 / 专业 / 科目，并每日推荐 5 个备考教学视频。专注打卡会计入当月日历，统计区展示目标分类分布。</p></div>` },
      habit: { title: '🔄 习惯养成帮助', body: `<div class="guide-content"><p>每日勾选习惯即完成打卡，并<strong>自动同步到「打卡中心」</strong>。可新建 / 编辑 / 删除习惯，查看连续天数与本月完成率。</p></div>` },
      finance: { title: '💰 小账本帮助', body: `<div class="guide-content"><p>记录每日收支，自动统计本月收入 / 支出 / 结余 / 预算剩余。支持分类支出条形图、近期明细与存钱目标进度。账单截图识别将在 V3 接入。</p></div>` },
      research: { title: '🔬 科研助手帮助', body: `<div class="guide-content"><p>管理实验记录、方法库、文献推荐与绘图技巧。四个标签切换，支持新增 / 编辑 / 删除与文献收藏。</p></div>` },
      books: { title: '📕 读书推荐帮助', body: `<div class="guide-content"><p>书单按「想读 / 在读 / 已读」三栏管理，可拖动下拉切换状态。读书打卡记录每日三点收获。</p></div>` },
      podcast: { title: '🎙️ 播客精选帮助', body: `<div class="guide-content"><p>收藏喜欢的单集，边听边记收获，支持跳转收听。可查看收藏数与已记收获统计。</p></div>` },
      news: { title: '📰 新闻资讯帮助', body: `<div class="guide-content"><p>聚合财经 / 科技 / 社会要闻。可按分类筛选，点赞 / 收藏 / 分享沉淀重要信息，刷新可获取新推送。实时数据将于 V3 接入。</p></div>` },
      ai: { title: '🤖 AI学习帮助', body: `<div class="guide-content"><p>系统化 AI 教程，按分类横向筛选，卡片网格展示封面 / 难度 / 来源，可标记「已学」追踪进度。</p></div>` },
      express: { title: '🗣️ 表达能力帮助', body: `<div class="guide-content"><p>话术技巧可按场景筛选、收藏、朗读与复制；跟读跟练提供朗读与完成标记，累计练习时长。</p></div>` },
      gold: { title: '📈 黄金财经帮助', body: `<div class="guide-content"><p>展示实时金价（涨红跌绿）、核心行情与近 7 日走势，并可查看历史。实时行情将于 V3 接入。</p></div>` },
      market: { title: '📊 市场复盘帮助', body: `<div class="guide-content"><p>展示 A 股指数、核心行情与盘面复盘笔记，可切换今日 / 历史。实时数据将于 V3 接入。</p></div>` },
      diet: { title: '🍱 饮食打卡帮助', body: `<div class="guide-content"><p>随手记录今日饮食，完成打卡同步到「打卡中心」。支持历史查看与删除。</p></div>` },
      sport: { title: '🏃 运动管理帮助', body: `<div class="guide-content"><p>提供跟练推荐（跳转 B 站），记录运动打卡与历史。今日完成同步到「打卡中心」。</p></div>` },
      skincare: { title: '🧴 美妆穿搭帮助', body: `<div class="guide-content"><p>三个标签：🧴 护肤（早间 / 晚间步骤 + 皮肤状态，完成打卡同步打卡中心）、💄 美妆（每日妆容步骤 + 小贴士，可看 B站 手法）、👗 穿搭（每日灵感 + 穿搭记录）。</p></div>` },
      review: { title: '📝 每日复盘帮助', body: `<div class="guide-content"><p>汇总今日全板块完成情况，记录收获 / 不足 / 原因 / 明日计划与心情，沉淀每日成长。</p></div>` },
      xianyu: { title: '🐟 闲鱼帮助', body: `<div class="guide-content"><p>副业闲置交易管理：管理在售 / 已售 / 下架宝贝，记录每笔成交收益，沉淀选品灵感。顶部统计在售数、本月收入与已售数，帮你盯紧副业现金流。</p></div>` },
      channels: { title: '📹 微信视频号帮助', body: `<div class="guide-content"><p>视频号运营看板：规划视频选题 / 脚本 / 发布状态，手动记录播放、点赞、转发、新增关注等数据并形成近 7 日走势，沉淀选题灵感。</p></div>` },
      wechat: { title: '📣 微信公众号帮助', body: `<div class="guide-content"><p>公众号运营台：管理文章选题 / 草稿 / 已发状态与阅读量，记录阅读、在看、分享、新增关注等数据并形成走势，沉淀选题库。</p></div>` }
    });
  }

  /* ---------- 打卡中心同步：每日任务（单一数据源 = tasks） ---------- */
  function ensureDailyTask(mod, ref, text, cat) {
    const today = tStr();
    const id = 'v2_' + mod + '_' + ref + '_' + today;
    const tasks = DB.get('tasks', []);
    if (!tasks.find(t => t.id === id)) {
      tasks.push({ id, text, cat, mod, ref, done: false, date: today, v2: true });
      DB.set('tasks', tasks);
    }
    return id;
  }
  function toggleV2Task(id) {
    if (typeof toggleTask === 'function') { toggleTask(id); return; }
    const tasks = DB.get('tasks', []);
    const t = tasks.find(x => x.id === id);
    if (t) { t.done = !t.done; DB.set('tasks', tasks); }
  }
  function taskDone(id) {
    const t = DB.get('tasks', []).find(x => x.id === id);
    return !!(t && t.done);
  }
  // 只读检查：不创建任务（用于复盘概览，避免提前在打卡中心生成任务）
  function taskDoneRaw(id) {
    const t = DB.get('tasks', []).find(x => x.id === id);
    return !!(t && t.done);
  }

  /* ---------- 默认数据种子 ---------- */
  function seed(key, val) { if (!DB.get('v2_' + key, null)) v2set(key, val); }

  function ensureV2Data() {
    // 学习管理
    seed('study_goals', [
      { id: gId(), title: '雅思词汇 8000 计划', cat: '语言学习', target: 8000, unit: '词', progress: 3260, status: '进行中' },
      { id: gId(), title: '专业课核心书目 12 本', cat: '专业学习', target: 12, unit: '本', progress: 4, status: '进行中' },
      { id: gId(), title: 'Python 数据分析实战', cat: '技能提升', target: 30, unit: '节', progress: 18, status: '进行中' },
      { id: gId(), title: '每周文献精读 3 篇', cat: '科研积累', target: 52, unit: '篇', progress: 21, status: '进行中' }
    ]);
    // 科研
    seed('research_records', [
      { id: gId(), title: '水产养殖水体溶氧日变化观测', method: '定点采样 + 传感器', result: '午后溶氧峰值 8.2mg/L', date: '2026-07-20', status: '已完成' },
      { id: gId(), title: '饲料投喂频次对成活率影响', method: '分组对照', result: '3 次/日组成活率提升 6%', date: '2026-07-28', status: '进行中' }
    ]);
    seed('research_methods', [
      { id: gId(), name: '单因素方差分析', desc: '比较三组以上均值差异，SPSS / R 均可实现' },
      { id: gId(), name: '相关性分析', desc: 'Pearson / Spearman，看变量间线性关联' },
      { id: gId(), name: '文献计量', desc: '用 CiteSpace 做关键词共现与突现分析' }
    ]);
    seed('research_papers', [
      { id: gId(), title: '循环水养殖系统(RAS)能效综述', source: 'Aquacultural Engineering', link: '', note: '重点看能耗与产量权衡', fav: true },
      { id: gId(), title: '微藻在养殖废水处理中的应用', source: 'Journal of Cleaner Production', link: '', note: '可做本科毕设方向', fav: false }
    ]);
    // 播客（链接优先唤起喜马拉雅 App，失败 fallback 到网页搜索）
    seed('podcasts', [
      { id: gId(), title: '怎样把科研讲给普通人听', show: '博物志', host: '科普电台', link: 'https://www.ximalaya.com/search?q=' + encodeURIComponent('博物志'), collected: true, date: '2026-07-30', note: '表达技巧可迁移到自媒体', gain: '' },
      { id: gId(), title: '大学生副业避坑指南', show: '搞钱女孩', host: '财经访谈', link: 'https://www.ximalaya.com/search?q=' + encodeURIComponent('搞钱女孩'), collected: false, date: '2026-07-25', note: '', gain: '' },
      { id: gId(), title: '水产养殖里的那些黑科技', show: '硬核水产', host: '行业对谈', link: 'https://www.ximalaya.com/search?q=' + encodeURIComponent('水产养殖'), collected: false, date: '2026-07-20', note: '', gain: '' }
    ]);
    // 新闻
    seed('news', [
      { id: gId(), title: '央行重申稳健货币政策，适时降准降息', source: '财经早报', cat: '财经', link: '', liked: false, collected: false, shared: false, date: '2026-08-04', isNew: true },
      { id: gId(), title: '暑期文旅消费火热，县域游同比增长 32%', source: '新华社', cat: '社会', link: '', liked: true, collected: false, shared: false, date: '2026-08-04', isNew: true },
      { id: gId(), title: 'AI 大模型进入端侧，手机本地推理成趋势', source: '科技前线', cat: '科技', link: '', liked: false, collected: true, shared: false, date: '2026-08-03', isNew: false }
    ]);
    seed('news_sources', [
      { id: gId(), name: '财经早报', desc: '每日 8 点推送宏观与 markets 快讯' },
      { id: gId(), name: '新华社', desc: '权威时政与社会新闻' },
      { id: gId(), name: '科技前线', desc: 'AI / 芯片 / 互联网动态' }
    ]);
    // 读书
    seed('books', [
      { id: gId(), title: '被讨厌的勇气', author: '岸见一郎', status: 'reading', cat: '心理', note: '课题分离很实用' },
      { id: gId(), title: '置身事内', author: '兰小欢', status: 'want', cat: '经济', note: '理解中国政府与经济发展' },
      { id: gId(), title: '人类简史', author: '尤瓦尔', status: 'done', cat: '历史', note: '认知革命部分最佳' },
      { id: gId(), title: '雅思词汇真经', author: '刘洪波', status: 'reading', cat: '雅思', note: '按场景分类记忆，可上传正文做每日背诵' },
      { id: gId(), title: '顾家北手把手教你雅思写作', author: '顾家北', status: 'want', cat: '雅思', note: '写作提分宝典，可上传正文拆解每日句型' },
      { id: gId(), title: '剑桥雅思真题 19', author: 'Cambridge', status: 'want', cat: '雅思', note: '模考必备' }
    ]);
    seed('book_logs', [
      { id: gId(), bookId: '', date: '2026-08-03', gain: '今天读到「目的与手段」，意识到很多时候把手段当成了目的。' }
    ]);
    // 表达
    seed('express_skills', [
      { id: gId(), title: 'PREP 结构化表达', cat: '日常沟通', content: '观点(Point)→理由(Reason)→案例(Example)→重申(Point)，30 秒说清一件事。', fav: true, collected: false },
      { id: gId(), title: 'STAR 面试叙述', cat: '职场表达', content: '情境(Situation)→任务(Task)→行动(Action)→结果(Result)，讲经历不流水账。', fav: false, collected: true },
      { id: gId(), title: '三秒破冰开场', cat: '社交破冰', content: '观察+赞美+提问：「你刚才说的XX很有意思，是怎么想到的？」', fav: false, collected: false }
    ]);
    seed('express_practice', [
      { id: gId(), type: '央视播音', content: '八百标兵奔北坡，北坡炮兵并排跑。', durationSec: 0, done: false },
      { id: gId(), type: '日常绕口令', content: '红鲤鱼与绿鲤鱼与驴。', durationSec: 0, done: false }
    ]);
    // AI 学习
    seed('ai_courses', [
      { id: gId(), title: '提示词工程从入门到精通', cat: '提示词', level: '入门', source: '吴恩达', learned: true, link: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('提示词工程教程') },
      { id: gId(), title: '用 LangChain 搭建智能体', cat: '智能体', level: '进阶', source: 'DeepLearning.AI', learned: false, link: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('LangChain 智能体开发') },
      { id: gId(), title: 'Diffusion 图像生成原理', cat: '多模态', level: '进阶', source: 'HuggingFace', learned: false, link: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('Diffusion 图像生成原理') },
      { id: gId(), title: '向量数据库与 RAG', cat: '检索增强', level: '进阶', source: '官方文档', learned: true, link: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('向量数据库 RAG 实战') }
    ]);
    // 小账本
    seed('finance_tx', [
      { id: gId(), date: '2026-08-01', type: 'in', cat: '兼职收入', method: '微信', amount: 1200, note: '自媒体稿费' },
      { id: gId(), date: '2026-08-02', type: 'out', cat: '餐饮', method: '支付宝', amount: 38.5, note: '午饭+奶茶' },
      { id: gId(), date: '2026-08-03', type: 'out', cat: '学习', method: '微信', amount: 199, note: '雅思网课' },
      { id: gId(), date: '2026-08-04', type: 'out', cat: '交通', method: '校园卡', amount: 12, note: '地铁' }
    ]);
    seed('finance_budgets', [
      { cat: '餐饮', limit: 1200 }, { cat: '学习', limit: 500 }, { cat: '娱乐', limit: 300 }
    ]);
    seed('finance_goals', [
      { id: gId(), title: '攒一台 iPad', target: 4000, current: 1680 }
    ]);
    // 黄金 / 市场（v3 接入实时，先放样例）
    seed('gold', {
      today: { date: '2026-08-04', name: '伦敦金现', price: 2386.4, change: 12.8, changePct: 0.54, cny: 558.2, high: 2395.1, low: 2371.0, open: 2373.6, vol: '12.4万手' },
      history: [
        { date: '2026-07-29', price: 2358.1 }, { date: '2026-07-30', price: 2361.5 },
        { date: '2026-07-31', price: 2366.8 }, { date: '2026-08-01', price: 2369.2 },
        { date: '2026-08-02', price: 2374.0 }, { date: '2026-08-03', price: 2373.6 },
        { date: '2026-08-04', price: 2386.4 }
      ]
    });
    seed('market', {
      today: { date: '2026-08-04', indices: [
        { name: '上证指数', val: 3328.46, chg: 0.62 }, { name: '深证成指', val: 10512.3, chg: -0.31 },
        { name: '创业板指', val: 2145.88, chg: 1.04 }, { name: '沪深300', val: 3892.1, chg: 0.45 }
      ], core: [
        { name: '现货黄金', val: 2386.4, chg: 0.54 }, { name: 'WTI原油', val: 78.3, chg: -1.2 },
        { name: '美元人民币', val: 7.18, chg: 0.08 }, { name: '比特币', val: 64200, chg: 2.3 }
      ], note: '今日盘面：指数分化，成长板块强于权重；黄金延续反弹。' },
      history: [
        { date: '2026-08-01', sh: 3305.2, chg: 0.31 }, { date: '2026-08-02', sh: 3309.8, chg: 0.14 },
        { date: '2026-08-03', sh: 3308.1, chg: -0.05 }, { date: '2026-08-04', sh: 3328.46, chg: 0.62 }
      ]
    });
    // 饮食 / 运动 / 护肤 / 复盘 日志
    seed('diet', []);
    seed('sport', []);
    seed('sport_tasks', [
      { id: gId(), title: '宿舍无器械全身燃脂 15 分钟', cat: '燃脂', video: 'https://www.bilibili.com/video/BV1GJ411x7h7' },
      { id: gId(), title: '新手瑜伽舒缓拉伸 20 分钟', cat: '拉伸', video: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      { id: gId(), title: '腹肌核心训练 10 分钟', cat: '力量', video: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('腹肌核心训练 10分钟') },
      { id: gId(), title: '跳绳有氧跟练 30 分钟', cat: '有氧', video: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('跳绳 有氧 跟练') },
      { id: gId(), title: '睡前助眠拉伸 12 分钟', cat: '放松', video: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent('睡前 拉伸 助眠') }
    ]);
    seed('skincare', []);
    seed('review', []);
    // 习惯（复用 V1 已 seed 的 habits，这里只保证有打卡日志键）
    seed('habit_log', {});
    // 自媒体「实时热点选题」：联网抓取的真实快照，联网失败也有兜底
    seed('sm_hot', [
      { title: '把盛夏交给火把节', heat: '1167万' },
      { title: '别不开心送你一片大球球', heat: '1131万' },
      { title: '庆祝中国人民解放军建军99周年', heat: '1121万' },
      { title: '在八一广场共同见证升旗仪式', heat: '1119万' },
      { title: '莫得闲剧好看今日开播', heat: '1058万' },
      { title: '国家电网原董事长辛保安被查', heat: '1051万' },
      { title: '八一建军节之际致敬中国军人', heat: '917万' },
      { title: '江海潮生 张謇是谁', heat: '917万' },
      { title: '人民军队生日快乐', heat: '912万' },
      { title: '八月第一天接好运莲莲', heat: '896万' },
      { title: '原神至冬版本前瞻', heat: '868万' },
      { title: '用一万斤青铜复刻曾侯乙编钟', heat: '847万' },
      { title: 'AI生成的作品算艺术吗', heat: '832万' },
      { title: '完善出境入境限制措施', heat: '809万' },
      { title: '美一F35战机坠毁飞行员弹射逃生', heat: '802万' }
    ]);
    seed('sm_hot_time', '2026-08-07');
    seed('sm_hot_source', '实时热点快照（联网抓取）');
  }

  /* ---------- 渲染 / 动作分发 ---------- */
  function v2Render(route) {
    const r = route.replace(/^_/, '');   // NAV 键带 _ 前缀，V2VIEWS 无前缀，归一化
    const fn = window.V2VIEWS[r];
    if (fn) return fn(route);
    return `<div class="page"><div class="page-head"><div class="page-title">${esc(V2_TITLES[r] || V2_TITLES[route] || route)}</div></div>
      <div class="empty"><div class="empty-text">模块加载中…</div></div></div>`;
  }
  function v2Action(act, el, e) {
    const fn = window.V2ACT[act];
    if (fn) { fn(el, e); return true; }
    return false;
  }
  // 通用「已读」勾选
  window.V2ACT.readToggle = (el) => { readToggle(el.dataset.id); render(); };

  /* ---------- 劫持 V1 全局函数（零侵入接入 V2） ---------- */
  const _render = render;
  render = function () {
    const app = gid('app');
    const r = currentRoute.replace(/^_/, '');
    if (V2_ROUTES.indexOf(r) >= 0) {
      app.innerHTML = v2Render(currentRoute);
      if (typeof bindEvents === 'function') bindEvents();
      if (typeof window.afterRender === 'function') window.afterRender(currentRoute);
      return;
    }
    return _render.apply(this, arguments);
  };
  const _handle = handleAction;
  handleAction = function (act, el, e) {
    if (v2Action(act, el, e)) return;
    return _handle.apply(this, arguments);
  };
  const _topbar = updateTopBar;
  updateTopBar = function () {
    const r = currentRoute.replace(/^_/, '');
    if (V2_TITLES[r]) { gid('pageTitle').textContent = V2_TITLES[r]; return; }
    return _topbar.apply(this, arguments);
  };

  /* ---------- 在导航中插入"更多模块"分隔（核心在上，其余归更多） ---------- */
  function addMoreDivider() {
    const firstMore = NAV_CONFIG.filter(n => n.group === 'more' && !n.expandable).map(n => n.key)[0];
    if (!firstMore) return;
    const nav = gid('sidebarNav');
    if (!nav) return;
    const item = nav.querySelector('[data-nav="' + firstMore + '"]');
    if (item && !nav.querySelector('[data-group-more]')) {
      const div = document.createElement('div');
      div.className = 'nav-group-title';
      div.setAttribute('data-group-more', '');
      div.textContent = '更多模块';
      nav.insertBefore(div, item);
    }
  }

  /* ---------- 启动 ---------- */
  ensureV2Data();
  addHelp();
  if (typeof buildSidebar === 'function') buildSidebar();
  addMoreDivider();
  if (typeof updateNavActive === 'function') updateNavActive();
  // 若当前是 V2 深链路由，待全部 v2 脚本解析完成后再重渲染（避免视图尚未注册）
  if (V2_ROUTES.indexOf(currentRoute.replace(/^_/, '')) >= 0 && typeof render === 'function') {
    setTimeout(() => { if (V2_ROUTES.indexOf(currentRoute.replace(/^_/, '')) >= 0) render(); }, 0);
  }

  // 暴露公共工具给各模块文件（openForm/closeGeneric 也挂到 window 上，方便 v2-*.js 内裸调用）
  window.openForm = openForm;
  window.V2 = {
    v2, v2set, gId, tStr, money, fmtDate, lastNDates,
    cssBar, cssPie, openForm, ensureDailyTask, toggleV2Task, taskDone, taskDoneRaw,
    readIs, readToggle, readPick, readBtn, dailyPick, dayIndexLocal, vidUrl, mediaLink,
    ICONS, V2_ROUTES, V2_TITLES, esc, gid, toast
  };

  console.log('[V2] core loaded ✨');
})();
