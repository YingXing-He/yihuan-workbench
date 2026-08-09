/* ==========================================================================
 * 易欢工作台 V2-D — 全局搜索 + AI 帮手
 *  · 搜索：跨所有模块检索本地内容，分组展示，点击直达对应模块
 *  · AI 帮手：基于本地数据生成每日简报 + 智能建议 + 关键词问答（无需 Key）
 * ========================================================================== */
(function () {
  'use strict';

  const ICON_SEARCH = '<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="#E60012" stroke-width="1.8" stroke-linecap="round"><circle cx="9.5" cy="9.5" r="6"/><line x1="14" y1="14" x2="20" y2="20"/></svg>';
  const ICON_AI = '<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="#E60012" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3l1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6z"/><path d="M17.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>';

  function getStore(key) { try { const r = DB.get(key, null); return Array.isArray(r) ? r : []; } catch (e) { return []; } }
  function todayStr() { return new Date().toISOString().slice(0, 10); }

  /* ---------------- 可搜索数据源 ---------------- */
  const SEARCH_MAP = [
    ['tasks', '打卡任务', 'checkin', n => n.title || '', n => (n.cat || '') + (n.done ? ' · 已完成' : ' · 待办')],
    ['ielts_words', '雅思单词', 'ielts_words', n => n.word || '', n => n.meaning || ''],
    ['ideas', '自媒体选题', 'selfmedia', n => n.title || '', n => (n.content || '').slice(0, 40)],
    ['finance_tx', '账单', 'finance', n => (n.note || n.cat || ''), n => ((n.type === 'in' ? '收入' : '支出') + ' ¥' + (n.amount || ''))],
    ['books', '读书', 'books', n => n.title || '', n => n.author || ''],
    ['habits', '习惯', 'habit', n => n.name || '', () => '习惯养成'],
    ['notes', '备忘录', 'memo', n => (n.content || '').slice(0, 50), n => n.tag || ''],
    ['research_records', '科研记录', 'research', n => n.title || '', n => n.note || ''],
    ['research_papers', '文献', 'research', n => n.title || '', n => n.note || ''],
    ['podcasts', '播客', 'podcast', n => n.title || '', n => n.show || ''],
    ['ai_courses', 'AI教程', 'ai', n => n.title || '', n => n.cat || ''],
    ['express_skills', '话术技巧', 'express', n => n.title || '', n => (n.content || '').slice(0, 40)],
    ['news', '新闻', 'news', n => n.title || '', n => n.source || '']
  ];

  function collectSearchable() {
    const out = [];
    SEARCH_MAP.forEach(([key, name, route, gt, gs]) => {
      getStore(key).forEach(it => {
        const title = gt(it); if (!title) return;
        out.push({ source: name, route, title, sub: gs(it) || '' });
      });
    });
    return out;
  }

  function searchResultsHTML(q) {
    q = (q || '').trim().toLowerCase();
    const all = collectSearchable();
    const list = q ? all.filter(it => (it.title + ' ' + it.sub).toLowerCase().includes(q)) : all;
    if (!list.length) return '<div class="empty"><div class="empty-text">' + (q ? '没有匹配「' + esc(q) + '」的内容' : '输入关键词开始搜索') + '</div></div>';
    const groups = {};
    list.forEach(it => { (groups[it.source] = groups[it.source] || []).push(it); });
    let h = '<div class="v2-search-count">找到 ' + list.length + ' 条结果</div>';
    Object.keys(groups).forEach(src => {
      h += '<div class="v2-search-group"><div class="v2-search-group-title">' + esc(src) + '（' + groups[src].length + '）</div>';
      groups[src].forEach(it => {
        h += '<div class="v2-search-item" data-act="searchJump" data-route="' + esc(it.route) + '">' +
          '<div class="v2-search-title">' + esc(it.title) + '</div>' +
          (it.sub ? '<div class="v2-search-sub">' + esc(it.sub) + '</div>' : '') + '</div>';
      });
      h += '</div>';
    });
    return h;
  }

  function renderSearch() {
    const all = collectSearchable();
    const modules = new Set(all.map(a => a.source)).size;
    return `<div class="page">
      <div class="page-head"><div class="page-title">搜索<span class="help-badge" data-help="search"></span></div>
        <div class="page-sub">跨所有模块检索你的内容</div></div>
      <div class="v2-search-box">
        <span class="v2-search-ic">${ICON_SEARCH}</span>
        <input id="searchInput" class="v2-search-input" placeholder="搜索任务 / 单词 / 选题 / 账单 / 读书 / 习惯…" autocomplete="off">
      </div>
      <div class="v2-search-stats">共收录 ${all.length} 条内容，覆盖 ${modules} 个模块</div>
      <div id="searchResults">${searchResultsHTML('')}</div>
    </div>`;
  }

  /* ---------------- AI 帮手 ---------------- */
  function computeBrief() {
    const weather = DB.get('weather', {}) || {};
    const tasks = getStore('tasks');
    const t = todayStr();
    const todayTasks = tasks.filter(x => (x.date || '') === t);
    const doneTasks = todayTasks.filter(x => x.done).length;
    const habits = getStore('habits');
    const hlog = (DB.get('habit_log', {}) || {})[t] || [];
    const words = getStore('ielts_words');
    const books = getStore('books');
    const spend = getStore('finance_tx').filter(r => r.type === 'out' && (r.date || '').slice(0, 7) === t.slice(0, 7))
      .reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const checkins = getStore('checkins');
    return { weather, todayTasks: todayTasks.length, doneTasks, habits: habits.length, habitDone: hlog.length, words: words.length, books: books.length, spend, checkins: checkins.length };
  }

  function renderAIHelp() {
    const b = computeBrief();
    const lines = [];
    lines.push('🌤 今天' + (b.weather.city ? b.weather.city + ' ' : '') + '天气' + (b.weather.condition || '未知') + (b.weather.live ? '（实时）' : '') + '。');
    if (b.todayTasks) lines.push('📋 今日任务 ' + b.doneTasks + '/' + b.todayTasks + ' 已完成' + (b.doneTasks === b.todayTasks ? '，全部搞定，棒！' : '，还有 ' + (b.todayTasks - b.doneTasks) + ' 项待处理。'));
    else lines.push('📋 今天还没添加任务，去打卡中心加几项吧。');
    if (b.habits) lines.push('🔄 你设置了 ' + b.habits + ' 个习惯，今日已完成 ' + b.habitDone + ' 个。');
    if (b.words) lines.push('📚 雅思词库共 ' + b.words + ' 个单词。');
    if (b.books) lines.push('📕 读书清单 ' + b.books + ' 本。');
    if (b.spend) lines.push('💰 本月已支出 ¥' + b.spend.toFixed(2) + '。');

    const tips = [];
    if (b.todayTasks && b.doneTasks < b.todayTasks) tips.push('优先处理剩余 ' + (b.todayTasks - b.doneTasks) + ' 项任务，完成一项划掉一项更有成就感。');
    if (b.words) tips.push('每天背 20 个新词 + 复习旧词，雅思口语会肉眼可见地进步。');
    if (b.books) tips.push('今天读 10 页书，积少成多。');
    if (!b.habits) tips.push('设置 1-2 个微习惯（如喝水、拉伸），坚持 21 天形成节奏。');
    if (!tips.length) tips.push('今天状态不错，继续保持记录，让数据为你说话。');

    return `<div class="page">
      <div class="page-head"><div class="page-title">AI 帮手<span class="help-badge" data-help="aihelp"></span></div>
        <div class="page-sub">基于你的本地数据智能分析</div></div>
      <div class="v2-ai-block">
        <div class="v2-ai-block-title">📌 今日简报</div>
        <div class="v2-ai-brief">${lines.map(l => '<p>' + esc(l) + '</p>').join('')}</div>
      </div>
      <div class="v2-ai-block">
        <div class="v2-ai-block-title">💡 智能建议</div>
        <ul class="v2-ai-tips">${tips.map(t => '<li>' + esc(t) + '</li>').join('')}</ul>
      </div>
      <div class="v2-ai-block">
        <div class="v2-ai-block-title">💬 问我（基于你的数据）</div>
        <div class="v2-ai-ask">
          <input id="aiInput" class="v2-search-input" placeholder="例如：今天天气？我还有多少任务？这个月花了多少？" autocomplete="off">
          <button class="btn btn-primary" data-act="aiAsk">问</button>
        </div>
        <div id="aiAnswer" class="v2-ai-answer"></div>
      </div>
      <div class="v2-tip-card">当前为<b>本地智能模式</b>（无需联网 / Key）。在「设置 → 外部数据」填入你的 LLM Key 后，AI 帮手可升级为真正对话式助手。</div>
    </div>`;
  }

  function answerAI(q) {
    const el = gid('aiAnswer'); if (!el) return;
    q = (q || '').trim();
    if (!q) { el.innerHTML = '<div class="v2-ai-answer-text">说点什么吧～</div>'; return; }
    const b = computeBrief();
    let ans;
    if (/(天气|气温|温度)/.test(q)) ans = (b.weather.city ? b.weather.city + ' ' : '') + '当前 ' + (b.weather.temp || '?') + '°C，' + (b.weather.condition || '未知') + (b.weather.live ? '（实时数据）' : '');
    else if (/(任务|待办|打卡)/.test(q)) ans = '今天共 ' + b.todayTasks + ' 项任务，已完成 ' + b.doneTasks + ' 项，还剩 ' + Math.max(0, b.todayTasks - b.doneTasks) + ' 项。';
    else if (/(雅思|单词|词汇)/.test(q)) ans = '你的雅思词库有 ' + b.words + ' 个单词。';
    else if (/(钱|花|支|账|收支|预算)/.test(q)) ans = '本月已支出 ¥' + (b.spend || 0).toFixed(2) + '。';
    else if (/(习惯)/.test(q)) ans = '你设置了 ' + b.habits + ' 个习惯，今日完成 ' + b.habitDone + ' 个。';
    else if (/(读书|书|阅读)/.test(q)) ans = '读书清单有 ' + b.books + ' 本。';
    else if (/(运动|健身)/.test(q)) ans = '运动管理里有跟练视频，今天动一动吧！';
    else ans = '我是基于你本地数据的智能助手 👩‍💻 可以问我：今天天气、还有多少任务、这个月花了多少钱、雅思单词量等。接入大模型 Key 后我能真正对话。';
    el.innerHTML = '<div class="v2-ai-answer-text">' + esc(ans) + '</div>';
  }

  /* ---------------- 注册 ---------------- */
  window.V2VIEWS = window.V2VIEWS || {};
  window.V2VIEWS.search = renderSearch;
  window.V2VIEWS.aihelp = renderAIHelp;

  if (window.V2_ROUTES) window.V2_ROUTES.push('search', 'aihelp');
  if (window.V2_TITLES) { window.V2_TITLES.search = '搜索'; window.V2_TITLES.aihelp = 'AI 帮手'; }
  if (window.NAV_CONFIG) window.NAV_CONFIG.push(
    { key: 'search', label: '搜索', icon: ICON_SEARCH, group: 'more' },
    { key: 'aihelp', label: 'AI 帮手', icon: ICON_AI, group: 'more' }
  );

  window.V2ACT.searchJump = (el) => { if (typeof navigate === 'function') navigate(el.dataset.route); };
  window.V2ACT.aiAsk = () => { const inp = gid('aiInput'); if (inp) answerAI(inp.value); };

  if (typeof HELP_TEXT !== 'undefined') {
    HELP_TEXT.search = { title: '🔍 搜索帮助', body: '<div class="guide-content"><p>跨全部模块检索你记录过的内容：任务、单词、选题、账单、读书、习惯、备忘录、科研、播客、AI 教程、话术、新闻等。</p><p>输入关键词即时过滤，点击结果可直达对应模块。</p></div>' };
    HELP_TEXT.aihelp = { title: '🤖 AI 帮手帮助', body: '<div class="guide-content"><p>基于你本地数据的智能助手：自动汇总今日简报、给出可执行建议，并能回答关于天气 / 任务 / 花费 / 单词量等问题。</p><p>当前为本地智能模式；在「设置 → 外部数据」填入 LLM Key 后可升级为对话式大模型。</p></div>' };
  }

  // 实时搜索输入监听（全局仅挂一次）
  if (!window.__wbSearchBound) {
    window.__wbSearchBound = true;
    document.addEventListener('input', e => {
      if (e.target && e.target.id === 'searchInput') {
        const r = gid('searchResults'); if (r) r.innerHTML = searchResultsHTML(e.target.value);
      }
    });
    document.addEventListener('keydown', e => {
      if (e.target && e.target.id === 'aiInput' && e.key === 'Enter') answerAI(e.target.value);
    });
  }

  // 重建侧边栏以纳入新入口
  if (typeof buildSidebar === 'function') buildSidebar();
  if (typeof updateNavActive === 'function') updateNavActive();

  console.log('[V2-D] search & aihelp loaded ✨');
})();
