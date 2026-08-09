/* ==========================================================================
 * 易欢工作台 V2 — 模块组 C：黄金财经 / 市场复盘 / 饮食 / 运动 / 护肤 / 复盘
 * ========================================================================== */
(function () {
  'use strict';
  const V = window.V2;
  const { v2, v2set, gId, tStr, money, fmtDate, lastNDates, cssBar, cssPie, openForm, ensureDailyTask, toggleV2Task, taskDone, taskDoneRaw, ICONS, esc, gid, toast } = V;
  const today = todayStr();

  // 涨红跌绿（中国习惯：涨=红，跌=绿）
  function upDown(v) {
    const up = v >= 0;
    return `<span class="${up ? 'v2-up' : 'v2-down'}">${up ? '▲' : '▼'} ${up ? '+' : ''}${v}</span>`;
  }

  // 通用 SVG 折线图（data: [{label, value}]）
  function svgLine(data, opt) {
    opt = opt || {};
    if (!data || data.length < 2) return '<div class="empty"><div class="empty-text">数据不足</div></div>';
    const W = 320, H = 140, padL = 8, padR = 8, padT = 16, padB = 26;
    const vals = data.map(d => d.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = (max - min) || 1;
    const n = data.length;
    const x = i => padL + (W - padL - padR) * (n === 1 ? 0.5 : i / (n - 1));
    const y = v => padT + (H - padT - padB) * (1 - (v - min) / range);
    const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`);
    const up = vals[n - 1] >= vals[0];
    const color = up ? '#E60012' : '#2BA471';
    const area = `M${x(0).toFixed(1)},${(H - padB).toFixed(1)} L${pts.join(' L')} L${x(n-1).toFixed(1)},${(H - padB).toFixed(1)} Z`;
    let dots = '', labels = '';
    data.forEach((d, i) => {
      dots += `<circle cx="${x(i).toFixed(1)}" cy="${y(d.value).toFixed(1)}" r="3" fill="#fff" stroke="${color}" stroke-width="2"/>`;
      if (i % Math.ceil(n / 4) === 0 || i === n - 1) labels += `<text x="${x(i).toFixed(1)}" y="${H - 8}" font-size="9" fill="#999" text-anchor="middle">${esc(d.label)}</text>`;
    });
    const lastY = y(vals[n-1]).toFixed(1);
    return `<div class="v2-line-chart"><svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="none">
      <path d="${area}" fill="${color}" opacity="0.08"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}${labels}
      <text x="${x(n-1).toFixed(1)}" y="${(lastY - 6)}" font-size="10" fill="${color}" text-anchor="end">${(opt.unit ? '' : '') + vals[n-1]}${opt.unit || ''}</text>
    </svg></div>`;
  }

  /* ===================== 黄金财经 ===================== */
  function renderGold() {
    const tab = v2('gold_tab', 'today');
    const g = v2('gold', {});
    const todayD = g.today || {};
    const chg = todayD.change || 0;
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">黄金财经<span class="help-badge" data-help="gold"></span></div>
        <div class="page-sub">金价 · 指数 · 核心行情 <span id="goldStatus" class="v2-live-badge">…</span></div></div>
      <div class="switch-tabs">
        <div class="tab-btn${tab==='today'?' active':''}" data-act="goldTab" data-tab="today">今日</div>
        <div class="tab-btn${tab==='history'?' active':''}" data-act="goldTab" data-tab="history">历史</div>
        <div class="tab-btn${tab==='market'?' active':''}" data-act="goldTab" data-tab="market">市场复盘</div></div>
      <div class="v2-tab-body">`;
    if (tab === 'today') {
      h += `<div id="goldLive"><div class="v2-gold-card">
        <div class="v2-gold-name">${esc(todayD.name || '伦敦金现')}</div>
        <div class="v2-gold-price">${money(todayD.price || 0)} <span class="v2-gold-unit">美元/盎司</span></div>
        <div class="v2-gold-chg">${upDown((todayD.changePct||0)+'%')} ${upDown('¥'+(todayD.cny||0)+'/克')}</div>
        <div class="v2-gold-grid">
          <div><span>今开</span><b>${todayD.open||'—'}</b></div>
          <div><span>最高</span><b>${todayD.high||'—'}</b></div>
          <div><span>最低</span><b>${todayD.low||'—'}</b></div>
          <div><span>成交量</span><b>${todayD.vol||'—'}</b></div>
        </div></div>`;
      const core = (g.market && g.market.today && g.market.today.core) || [
        { name: '美元人民币', val: 7.18, chg: 0.08 }, { name: 'WTI原油', val: 78.3, chg: -1.2 }, { name: '上证指数', val: 3328.46, chg: 0.62 }
      ];
      h += `<div class="v2-section-title" style="margin-top:16px">核心行情</div><div class="v2-quote-grid">`;
      core.forEach(q => h += `<div class="v2-quote-card"><div class="v2-quote-name">${esc(q.name)}</div>
        <div class="v2-quote-val">${q.val}</div><div class="v2-quote-chg">${upDown((q.chg>=0?'+':'')+q.chg+'%')}</div></div>`);
      h += `</div></div>`;
      const hist = (g.history || []).slice(-7);
      h += `<div class="v2-section-title" style="margin-top:16px">近 7 日金价</div>${hist.length ? svgLine(hist.map(x => ({ label: fmtDate(x.date), value: x.price })), { unit: ' 美元' }) : ''}`;
    } else if (tab === 'market') {
      const m = v2('market', {});
      const todayM = m.today || {};
      const note = v2('market_note', todayM.note || '');
      const indices = todayM.indices || [];
      h += `<div id="mktLive">`;
      if (indices.length) {
        h += `<div class="v2-quote-grid">`;
        indices.forEach(x => h += `<div class="v2-quote-card"><div class="v2-quote-name">${esc(x.name)}</div><div class="v2-quote-val">${x.val}</div><div class="v2-quote-chg">${upDown((x.chg>=0?'+':'')+x.chg+'%')}</div></div>`);
        h += `</div>`;
      } else {
        h += `<div class="v2-tip-card">📡 A股指数将通过 V3 实时拉取；现在先记录你的盘面观察。</div>`;
      }
      const core = todayM.core || [];
      if (core.length) { h += `<div class="v2-section-title" style="margin-top:16px">核心行情</div><div class="v2-quote-grid">`;
        core.forEach(q => h += `<div class="v2-quote-card"><div class="v2-quote-name">${esc(q.name)}</div><div class="v2-quote-val">${q.val}</div><div class="v2-quote-chg">${upDown((q.chg>=0?'+':'')+q.chg+'%')}</div></div>`);
        h += `</div>`; }
      h += `</div>`;
      h += `<div class="v2-section" style="margin-top:16px"><div class="v2-section-title">盘面复盘笔记</div>
        <textarea id="mkt_note" class="v2-input" rows="4" placeholder="记录今日盘面观察、操作反思…">${esc(note)}</textarea>
        <button class="btn btn-primary btn-sm" data-act="mktSaveNote" style="margin-top:8px">保存笔记</button></div>`;
    } else {
      const hist = (g.history || []).slice().reverse();
      h += `<div class="v2-hist-list">`;
      hist.forEach(x => h += `<div class="v2-hist-item"><span>${fmtDate(x.date)}</span><b>${money(x.price)}</b></div>`);
      h += `</div><div class="v2-tip-card">💡 历史数据为样例，V3 将接入交易所实时行情。</div>`;
    }
    h += `</div></div>`;
    return h;
  }
  window.V2VIEWS.gold = renderGold;
  window.V2ACT.goldTab = (el) => { v2set('gold_tab', el.dataset.tab); render(); };

  /* 市场复盘已并入「黄金财经」的「市场复盘」标签（见 renderGold），此处仅保留笔记保存动作 */
  window.V2ACT.mktSaveNote = () => { v2set('market_note', gid('mkt_note').value); toast('笔记已保存'); };

  /* ===================== 理财学习 ===================== */
  // 理财体系课：固定 10 课学习路径，每课含 B站搜索关键词与预计时长（分钟）
  const FIN_COURSE = [
    { id: 'fin01', no: 1, title: '认识你的钱：记账与现金流', min: 10, tags: ['区分固定/浮动支出', '4321分配法', '建立3-6月应急金'], kw: '大学生学理财 记账 现金流 入门' },
    { id: 'fin02', no: 2, title: '为什么要理财：复利与时间价值', min: 12, tags: ['复利公式', '72法则', '越早开始越好'], kw: '复利 时间价值 72法则 理财入门' },
    { id: 'fin03', no: 3, title: '收入分配：4321 法则与应急金', min: 15, tags: ['4321法则', '应急金', '先储蓄后消费'], kw: '收入分配 4321法则 应急金' },
    { id: 'fin04', no: 4, title: '基金入门：货币基金、债券基金、指数基金', min: 20, tags: ['基金分类', '指数基金', '费率'], kw: '基金入门 货币基金 债券基金 指数基金' },
    { id: 'fin05', no: 5, title: '股票入门：股票是什么、如何开户、交易成本', min: 25, tags: ['股票本质', 'A股开户', '交易成本'], kw: '股票入门 开户 交易成本 A股' },
    { id: 'fin06', no: 6, title: '财报基础：看懂三大报表', min: 20, tags: ['资产负债表', '利润表', '现金流量表'], kw: '财报入门 三大报表 资产负债表' },
    { id: 'fin07', no: 7, title: '估值入门：PE / PB / ROE 怎么用', min: 18, tags: ['市盈率PE', '市净率PB', '净资产收益率ROE'], kw: '股票估值 PE PB ROE 入门' },
    { id: 'fin08', no: 8, title: '定投策略：微笑曲线与长期纪律', min: 15, tags: ['定投', '微笑曲线', '长期主义'], kw: '基金定投 微笑曲线 策略' },
    { id: 'fin09', no: 9, title: '资产配置：股债搭配与风险分散', min: 20, tags: ['股债搭配', '风险分散', '再平衡'], kw: '资产配置 股债搭配 风险分散' },
    { id: 'fin10', no: 10, title: '投资心理：避免追涨杀跌与常见骗局', min: 15, tags: ['追涨杀跌', '投资心态', '防骗'], kw: '投资心理 追涨杀跌 理财骗局' }
  ];
  // 根据平均单集长度推算「每周看几集」：短课多看，长课少看
  function finWeeklyGoal() {
    const avg = FIN_COURSE.reduce((s, c) => s + c.min, 0) / FIN_COURSE.length;
    if (avg <= 15) return 5;
    if (avg <= 22) return 3;
    return 2;
  }
  const FIN_TERMS = [
    { id: 'compound', w: '复利', d: '利息产生的利息，时间越长雪球越大。' },
    { id: 'dca', w: '定投', d: '定期定额买入，平摊成本、淡化择时。' },
    { id: 'inflation', w: '通胀', d: '物价上涨，钱的购买力在悄悄下降。' },
    { id: 'indexfund', w: '指数基金', d: '跟踪大盘指数的基金，费用低、省心。' },
    { id: 'pe', w: '市盈率 PE', d: '股价 ÷ 每股收益，估值高低的常用参考。' },
    { id: 'diversify', w: '分散投资', d: '不把鸡蛋放一个篮子，降低单一风险。' },
    { id: 'liquidity', w: '流动性', d: '资产变现的难易程度，急用钱时很关键。' },
    { id: 'riskapp', w: '风险偏好', d: '你能承受多大波动，决定仓位结构。' },
    { id: 'assetalloc', w: '资产配置', d: '按目标分配股 / 债 / 现金比例。' },
    { id: 'nav', w: '净值', d: '基金每份的价值，涨跌看它。' },
    { id: 'fee', w: '手续费', d: '买卖产生的成本，长期下来很可观。' },
    { id: 'oppcost', w: '机会成本', d: '选了 A，就放弃了 B 可能带来的收益。' }
  ];
  function weekKey() {
    const d = new Date(); const day = (d.getDay() + 6) % 7;
    const mon = new Date(d); mon.setDate(d.getDate() - day);
    return mon.getFullYear() + '-' + String(mon.getMonth() + 1).padStart(2, '0') + '-' + String(mon.getDate()).padStart(2, '0');
  }
  function renderFinancelife() {
    const goal = finWeeklyGoal();
    const wk = weekKey();
    const plan = v2('fin_plan', {});
    const weekDone = plan[wk] || 0;
    const doneIds = v2('fin_done', []);
    const progress = Math.min(FIN_COURSE.length, doneIds.length);
    const proficiency = Math.round(progress / FIN_COURSE.length * 100);

    // 当前课程：第一个未完成的课；全部完成则显示最后一课复习
    let idx = FIN_COURSE.findIndex(c => !doneIds.includes(c.id));
    if (idx < 0) idx = FIN_COURSE.length - 1;
    const lesson = FIN_COURSE[idx];
    const todayDone = doneIds.includes(lesson.id);

    // 每日名词
    const termIds = FIN_TERMS.map(t => 'fin_' + t.id);
    const termId = V.dailyPick(termIds, 1, 6)[0] || termIds[0];
    const term = FIN_TERMS.find(t => 'fin_' + t.id === termId);

    let h = `<div class="page">
      <div class="page-head"><div class="page-title">理财学习<span class="help-badge" data-help="financelife"></span></div>
        <div class="page-sub">零基础 ${FIN_COURSE.length} 课 · 系统建立理财认知</div></div>

      <div class="v2-section v2-fin-hero">
        <div class="v2-fin-hero-top">
          <div class="v2-fin-hero-ic">💰</div>
          <div>
            <div class="v2-fin-hero-title">理财基金金融学习</div>
            <div class="v2-fin-hero-sub">零基础 ${FIN_COURSE.length} 课</div>
          </div>
          <div class="v2-fin-hero-prog"><span>起步</span><b>${proficiency}%</b></div>
        </div>
        <div class="v2-fin-stats">
          <div class="v2-fin-stat"><b>${todayDone ? '1/1' : '0/1'}</b><span>今日任务</span></div>
          <div class="v2-fin-stat"><b>${proficiency}%</b><span>完成率</span></div>
          <div class="v2-fin-stat"><b>${progress}/${FIN_COURSE.length}</b><span>已完成</span></div>
        </div>
      </div>

      <div class="v2-section">
        <div class="v2-section-title">✅ 今日任务 ${todayDone ? '(已完成)' : ''}</div>
        <div class="v2-fin-task">
          <div class="v2-fin-task-main">
            <div class="v2-fin-task-title">理财第${lesson.no}课：${esc(lesson.title)}</div>
            <div class="v2-fin-task-meta">来自 理财基金 · 预计 ${lesson.min} 分钟</div>
          </div>
          <button class="btn ${todayDone ? 'btn-outline' : 'btn-primary'} btn-sm" data-act="finLessonDone" data-id="${lesson.id}">${todayDone ? '撤销完成' : '完成本课'}</button>
        </div>
      </div>

      <div class="v2-section"><div class="v2-section-title">📈 学习进度</div>
        <div class="v2-fin-progress-bar"><div style="width:${proficiency}%"></div></div>
        <div class="v2-fin-progress-row"><span>已完成 ${progress}/${FIN_COURSE.length} 课</span><span>${proficiency}%</span></div>
      </div>

      <div class="v2-section"><div class="v2-section-title">📅 本周计划 · 第 ${idx + 1}/${FIN_COURSE.length} 课</div>
        <div class="v2-fin-week">
          <div class="v2-fin-week-top"><b>本周目标</b><span>按单集长短，建议每周看 ${goal} 集 · 本周已完成 ${weekDone}/${goal}</span></div>
          <div class="v2-fin-week-bar"><div style="width:${Math.min(100, Math.round(weekDone / goal * 100))}%"></div></div>
          <div class="v2-fin-week-ops">
            <button class="btn btn-primary btn-sm" data-act="finWeekAdd">+1 集已看</button>
            ${weekDone > 0 ? `<button class="btn btn-outline btn-sm" data-act="finWeekMinus">-1</button>` : ''}
          </div>
        </div>
      </div>

      <div class="v2-section"><div class="v2-section-title">🎬 今日课程 · 第${lesson.no}课 ${esc(lesson.title)}</div>
        <div class="v2-fin-tags">${lesson.tags.map(t => `<span class="v2-fin-tag">${esc(t)}</span>`).join('')}</div>
        <a class="v2-fin-video" href="https://search.bilibili.com/all?keyword=${encodeURIComponent(lesson.kw)}" target="_blank" rel="noopener">
          <div class="v2-fin-video-thumb">▶</div>
          <div class="v2-fin-video-body">
            <div class="v2-fin-video-title">【大学生学理财】${esc(lesson.title)} | 零基础入门</div>
            <div class="v2-fin-video-meta">B站搜索 · 预计 ${lesson.min} 分钟 · 点击跳转</div>
          </div>
        </a>
      </div>

      <div class="v2-section"><div class="v2-section-title">📝 完整课程表（学习顺序固定）</div><div class="v2-fin-courses">`;
    FIN_COURSE.forEach(c => {
      const done = doneIds.includes(c.id);
      h += `<div class="v2-fin-course${done ? ' done' : ''}">
        <div class="v2-fin-course-no">${c.no}</div>
        <div class="v2-fin-course-body">
          <div class="v2-fin-course-title">${esc(c.title)}${done ? ' ✓' : ''}</div>
          <div class="v2-fin-course-desc">预计 ${c.min} 分钟 · ${c.tags.slice(0, 2).map(t => esc(t)).join(' / ')}</div>
        </div>
        <a class="btn btn-outline btn-xs" href="https://search.bilibili.com/all?keyword=${encodeURIComponent(c.kw)}" target="_blank" rel="noopener">B站 ↗</a>
      </div>`;
    });
    h += `</div></div>

      <div class="v2-section"><div class="v2-section-title">🔤 今日理财名词 · ${todayStr()}</div>
        <div class="v2-fin-term">
          <div class="v2-fin-term-word">${esc(term.w)}</div>
          <div class="v2-fin-term-d">${esc(term.d)}</div>
          <div class="v2-fin-term-ops">
            <a class="btn btn-outline btn-sm" href="https://www.douyin.com/search/${encodeURIComponent(term.w)}" target="_blank" rel="noopener">抖音讲解 ↗</a>
            ${V.readBtn(termId)}
          </div></div></div>

      <div class="v2-tip-card" style="font-size:12px">⚠️ 本模块仅为金融知识科普，不构成任何投资建议。投资有风险，入市需谨慎。</div>
    </div>`;
    return h;
  }
  window.V2VIEWS.financelife = renderFinancelife;
  window.V2ACT.finLessonDone = (el) => {
    const id = el.dataset.id;
    const done = v2('fin_done', []);
    const i = done.indexOf(id);
    if (i >= 0) done.splice(i, 1); else done.push(id);
    v2set('fin_done', done);
    render();
  };
  window.V2ACT.finWeekAdd = () => { const plan = v2('fin_plan', {}); const wk = weekKey(); plan[wk] = (plan[wk] || 0) + 1; v2set('fin_plan', plan); render(); };
  window.V2ACT.finWeekMinus = () => { const plan = v2('fin_plan', {}); const wk = weekKey(); plan[wk] = Math.max(0, (plan[wk] || 0) - 1); v2set('fin_plan', plan); render(); };

  /* ===================== 饮食打卡 ===================== */
  let _dietImg = null;
  window.dietImgPreview = (input) => {
    const f = input.files && input.files[0]; if (!f) return;
    if (typeof compressPhoto === 'function') {
      compressPhoto(f, 720, (b64) => {
        _dietImg = b64;
        const p = gid('diet_img_preview');
        if (p) p.innerHTML = '<img src="' + b64 + '" style="max-width:130px;border-radius:8px;margin-top:6px;display:block">';
      });
    } else { toast('当前环境不支持图片压缩'); }
  };
  function renderDiet() {
    const logs = v2('diet', []).filter(l => l.date === today);
    const all = v2('diet', []).slice().reverse();
    const tid = ensureDailyTask('diet', 'main', '今日饮食打卡', '生活任务');
    const done = taskDone(tid);
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">饮食打卡<span class="help-badge" data-help="diet"></span></div>
        <div class="page-sub">记录三餐 · 上传照片 · 健康饮食</div></div>
      <div class="v2-checkin-banner${done?' done':''}">
        <div>${done ? HK.burger(26) : ICONS.diet}<div><b>${done ? '今日已打卡' : '今日还未打卡'}</b><div style="color:var(--text-light);font-size:13px">${logs.length ? '已记录 ' + logs.length + ' 条' : '随手记一下今天吃了啥'}</div></div></div>
        <button class="btn btn-${done?'outline':'primary'}" data-act="dietToggle">${done ? '撤销' : '完成打卡'}</button>
      </div>
      <div class="v2-section"><div class="v2-section-title">快速记录</div>
        <div class="v2-form"><div class="form-group"><label>今天吃了什么</label><textarea id="diet_text" class="v2-input" rows="2" placeholder="例如：早餐燕麦+鸡蛋，午餐食堂两荤一素…"></textarea></div>
        <div class="form-group"><label>上传这顿饭的照片（可选）</label><input id="diet_img" type="file" accept="image/*" class="v2-input" onchange="dietImgPreview(this)"><div id="diet_img_preview"></div></div>
        <button class="btn btn-primary" data-act="dietSave">保存记录</button></div></div>
      <div class="v2-section"><div class="v2-section-title">今日记录</div>`;
    if (!logs.length) h += `<div class="empty"><div class="empty-text">还没有记录</div></div>`;
    logs.forEach(l => h += `<div class="v2-log-item"><div class="v2-diet-row"><span class="v2-log-text">${esc(l.text)}</span><a class="v2-tx-del" data-act="dietDel" data-id="${l.id}">✕</a></div>${l.img ? `<img class="v2-diet-img" src="${l.img}" alt="餐图" onclick="V2Lightbox(this.src)">` : ''}</div>`);
    h += `</div><div class="v2-section"><div class="v2-section-title">历史</div><div class="v2-log-list">`;
    all.slice(0, 10).forEach(l => h += `<div class="v2-log-item"><span class="v2-log-date">${fmtDate(l.date)}</span><span class="v2-log-text">${esc(l.text)}</span></div>`);
    h += `</div></div></div>`;
    return h;
  }
  window.V2VIEWS.diet = renderDiet;
  window.V2ACT.dietToggle = () => { const tid = ensureDailyTask('diet', 'main', '今日饮食打卡', '生活任务'); toggleV2Task(tid); render(); };
  window.V2ACT.dietSave = () => {
    const text = gid('diet_text').value.trim(); if (!text) { toast('写点内容吧'); return; }
    const arr = v2('diet', []); arr.push({ id: gId(), date: today, text, img: _dietImg }); v2set('diet', arr);
    _dietImg = null;
    ensureDailyTask('diet', 'main', '今日饮食打卡', '生活任务'); toast('已记录'); render();
  };
  window.V2ACT.dietDel = (el) => { v2set('diet', v2('diet', []).filter(l => l.id !== el.dataset.id)); toast('已删除'); render(); };

  /* ===================== 运动管理 ===================== */
  function renderSport() {
    const tasks = v2('sport_tasks', []);
    const logs = v2('sport', []).filter(l => l.date === today);
    const all = v2('sport', []).slice().reverse();
    const tid = ensureDailyTask('sport', 'main', '今日运动打卡', '运动健康任务');
    const done = taskDone(tid);
    const weekCount = v2('sport', []).filter(l => l.date.slice(0, 7) === today.slice(0, 7)).length;
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">运动管理<span class="help-badge" data-help="sport"></span></div>
        <div class="page-sub">跟练推荐 · 打卡记录</div></div>
      <div class="overview-grid">
        <div class="overview-card"><div class="overview-value">${weekCount}</div><div class="overview-label">本月运动次</div></div>
        <div class="overview-card"><div class="overview-value">${done ? '✓' : '—'}</div><div class="overview-label">今日完成</div></div>
        <div class="overview-card"><div class="overview-value">${logs.reduce((s,l)=>s+(l.duration||0),0)}</div><div class="overview-label">今日分钟</div></div>
        <div class="overview-card"><div class="overview-value">${tasks.length}</div><div class="overview-label">跟练资源</div></div>
      </div>
      <div class="v2-checkin-banner${done?' done':''}">
        <div>${done ? HK.dumbbell(26) : ICONS.sport}<div><b>${done ? '今日运动已完成' : '今日运动打卡'}</b><div style="color:var(--text-light);font-size:13px">动起来，状态更好</div></div></div>
        <button class="btn btn-${done?'outline':'primary'}" data-act="sportToggle">${done ? '撤销' : '完成打卡'}</button>
      </div>`;

    // 跟练推荐
    h += `<div class="v2-section"><div class="v2-section-title">跟练推荐</div>`;
    tasks.forEach(t => {
      h += `<div class="v2-video-card">
        <div class="v2-video-info"><div class="v2-video-title">${esc(t.title)} <span class="v2-video-cat">${esc(t.cat)}</span></div>
          ${t.video ? videoHTML(t.video) : '<div class="video-fallback"><span>暂无视频，点右侧添加 B站链接</span></div>'}
          <a class="btn btn-outline btn-xs" data-act="sportOpen" data-id="${t.id}">跳转 B 站 ↗</a></div>
      </div>`;
    });
    if (!tasks.length) h += `<div class="empty"><div class="empty-text">暂无跟练资源</div></div>`;
    h += `</div>`;

    // 近 7 日运动时长
    const sportAll = v2('sport', []);
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`); }
    const weekMin = days.map(dt => ({ label: dt.slice(5), value: sportAll.filter(l => l.date === dt).reduce((s, l) => s + (l.duration || 0), 0) }));
    h += `<div class="v2-section"><div class="v2-section-title">近 7 日运动时长（分钟）</div>${svgLine(weekMin, { unit: ' 分', height: 120 })}</div>`;

    // 今日记录
    h += `<div class="v2-section"><div class="v2-section-title" style="display:flex;align-items:center;justify-content:space-between">今日记录
      <button class="btn btn-primary btn-xs" data-act="sportLogAdd">+ 记一笔</button></div>`;
    if (!logs.length) h += `<div class="empty"><div class="empty-text">还没有记录，点「记一笔」</div></div>`;
    logs.forEach(l => h += `<div class="v2-log-item"><span class="v2-log-text">${esc(l.activity)}${l.duration ? (' · ' + l.duration + '分钟') : ''}${l.note ? (' · ' + esc(l.note)) : ''}</span></div>`);
    h += `</div><div class="v2-section"><div class="v2-section-title">历史</div><div class="v2-log-list">`;
    all.slice(0, 10).forEach(l => h += `<div class="v2-log-item"><span class="v2-log-date">${fmtDate(l.date)}</span><span class="v2-log-text">${esc(l.activity)}</span></div>`);
    h += `</div></div></div>`;
    return h;
  }
  window.V2ACT.sportLogAdd = () => openForm('记一笔运动', `<div class="v2-form">
    <div class="form-group"><label>运动项目</label><input id="sl_activity" class="v2-input" placeholder="如：跑步 / 瑜伽 / 力量训练"></div>
    <div class="form-row"><div class="form-group"><label>时长（分钟）</label><input id="sl_dur" class="v2-input" type="number" min="0" value="30"></div>
      <div class="form-group"><label>日期</label><input id="sl_date" class="v2-input" type="date" value="${today}"></div></div>
    <div class="form-group"><label>备注</label><input id="sl_note" class="v2-input" placeholder="心率 / 感受 / 配速等"></div>
    <div class="v2-form-actions"><button class="btn btn-primary" data-act="sportLogSave">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`);
  window.V2ACT.sportLogSave = () => {
    const activity = gid('sl_activity').value.trim();
    if (!activity) { toast('请填写运动项目'); return; }
    const dur = parseInt(gid('sl_dur').value, 10) || 0;
    const date = gid('sl_date').value || today;
    const note = gid('sl_note').value.trim();
    const arr = v2('sport', []);
    arr.push({ id: gId(), date, activity, duration: dur, note });
    v2set('sport', arr);
    if (typeof closeGeneric === 'function') closeGeneric();
    toast('已记录'); render();
  };
  window.V2VIEWS.sport = renderSport;
  window.V2ACT.sportToggle = () => { const tid = ensureDailyTask('sport', 'main', '今日运动打卡', '运动健康任务'); toggleV2Task(tid); render(); };
  window.V2ACT.sportOpen = (el) => { const t = v2('sport_tasks', []).find(x => x.id === el.dataset.id); if (t && t.video) window.open(t.video, '_blank'); else toast('暂未配置视频链接'); };

  /* ===================== 美妆穿搭 ===================== */
  // 改为每日推荐具体视频/图片：护肤、美妆、穿搭各一个视频池，本地自然日轮换
  const SKIN_VIDEOS = [
    { id:'sk1', t:'油痘肌护肤全流程', kw:'油痘肌护肤 全套流程 学生党', tag:'护肤' },
    { id:'sk2', t:'干皮保湿修护指南', kw:'干皮保湿 修护屏障 护肤', tag:'护肤' },
    { id:'sk3', t:'敏感肌精简护肤', kw:'敏感肌 精简护肤 泛红修护', tag:'护肤' },
    { id:'sk4', t:'正确卸妆不伤肤', kw:'正确卸妆 步骤 护肤', tag:'护肤' },
    { id:'sk5', t:'防晒怎么选怎么用', kw:'防晒霜选择 正确用量 学生党', tag:'护肤' },
    { id:'sk6', t:'黑头闭口护理', kw:'黑头闭口 清洁 护肤教程', tag:'护肤' },
    { id:'sk7', t:'眼周护理与黑眼圈', kw:'黑眼圈 眼霜 眼部护理', tag:'护肤' },
    { id:'sk8', t:'学生党平价护肤', kw:'学生党平价护肤 好物推荐', tag:'护肤' }
  ];
  const MAKEUP_VIDEOS = [
    { id:'mk1', t:'新手日常淡妆教程', kw:'新手化妆教程 日常淡妆', tag:'美妆' },
    { id:'mk2', t:'干净底妆手法', kw:'底妆教程 不卡粉 新手', tag:'美妆' },
    { id:'mk3', t:'眼妆：大地色眼影', kw:'大地色眼影教程 新手眼妆', tag:'美妆' },
    { id:'mk4', t:'睫毛夹翘与眼线', kw:'夹睫毛教程 眼线新手', tag:'美妆' },
    { id:'mk5', t:'5分钟通勤妆', kw:'5分钟通勤妆 快速出门', tag:'美妆' },
    { id:'mk6', t:'腮红修容显脸小', kw:'腮红打法 修容教程 新手', tag:'美妆' },
    { id:'mk7', t:'口红涂法与唇妆', kw:'口红涂法 唇妆教程 新手', tag:'美妆' },
    { id:'mk8', t:'上镜妆加重技巧', kw:'上镜妆 拍照妆容 技巧', tag:'美妆' }
  ];
  const OUTFIT_VIDEOS = [
    { id:'of1', t:'小个子显高穿搭公式', kw:'小个子穿搭 显高 公式', tag:'穿搭' },
    { id:'of2', t:'通勤干练穿搭灵感', kw:'通勤穿搭 大学生 实习', tag:'穿搭' },
    { id:'of3', t:'韩系温柔风搭配', kw:'韩系穿搭 温柔风 女大学生', tag:'穿搭' },
    { id:'of4', t:'运动休闲风穿搭', kw:'运动风穿搭 休闲 学生党', tag:'穿搭' },
    { id:'of5', t:'一衣多穿：白衬衫', kw:'白衬衫一衣多穿 搭配', tag:'穿搭' },
    { id:'of6', t:'约会甜美风穿搭', kw:'约会穿搭 甜美风 女大学生', tag:'穿搭' },
    { id:'of7', t:'雨天实用穿搭', kw:'雨天穿搭 实用 女大学生', tag:'穿搭' },
    { id:'of8', t:'换季胶囊衣橱', kw:'胶囊衣橱 换季 基础款搭配', tag:'穿搭' }
  ];
  function renderSkincare() {
    const tab = v2('beauty_tab', 'skin');
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">美妆穿搭<span class="help-badge" data-help="skincare"></span></div>
        <div class="page-sub">护肤 · 美妆 · 穿搭 每日推荐视频</div></div>
      <div class="switch-tabs">
        <div class="tab-btn${tab==='skin'?' active':''}" data-act="beautyTab" data-tab="skin">🧴 护肤</div>
        <div class="tab-btn${tab==='makeup'?' active':''}" data-act="beautyTab" data-tab="makeup">💄 美妆</div>
        <div class="tab-btn${tab==='outfit'?' active':''}" data-act="beautyTab" data-tab="outfit">👗 穿搭</div>
      </div><div class="v2-tab-body">`;

    if (tab === 'skin') {
      const picks = V.dailyPick(SKIN_VIDEOS.map(v => 'skin_' + v.id), 3, 10);
      h += `<div class="v2-ex-head">今日 ${picks.length} 条护肤推荐 · 明日自动更新</div>`;
      picks.forEach(rid => { const v = SKIN_VIDEOS.find(x => 'skin_' + x.id === rid); h += renderBeautyVideoCard(v, rid, ['xhs', 'bili']); });
    } else if (tab === 'makeup') {
      const picks = V.dailyPick(MAKEUP_VIDEOS.map(v => 'mk_' + v.id), 3, 11);
      h += `<div class="v2-ex-head">今日 ${picks.length} 条美妆推荐 · 明日自动更新</div>`;
      picks.forEach(rid => { const v = MAKEUP_VIDEOS.find(x => 'mk_' + x.id === rid); h += renderBeautyVideoCard(v, rid, ['xhs', 'bili']); });
    } else {
      const picks = V.dailyPick(OUTFIT_VIDEOS.map(v => 'ofv_' + v.id), 3, 12);
      h += `<div class="v2-ex-head">今日 ${picks.length} 条穿搭推荐 · 明日自动更新</div>`;
      picks.forEach(rid => { const v = OUTFIT_VIDEOS.find(x => 'ofv_' + x.id === rid); h += renderBeautyVideoCard(v, rid, ['xhs', 'douyin']); });
    }
    h += `</div></div>`;
    return h;
  }
  function renderBeautyVideoCard(v, rid, platforms) {
    const plats = (platforms && platforms.length) ? platforms : ['xhs', 'bili'];
    const platLabel = { xhs: '小红书', douyin: '抖音', bili: 'B站' };
    const links = plats.map(p => `<a class="btn btn-outline btn-xs" href="${V.vidUrl(p, v.kw)}" target="_blank" rel="noopener">${platLabel[p] || p} ↗</a>`).join('');
    return `<div class="v2-video-card v2-beauty-card">
      <div class="v2-video-thumb">▶</div>
      <div class="v2-video-info">
        <div class="v2-video-title">${esc(v.t)} <span class="v2-badge-mini">${esc(v.tag)}</span></div>
        <div class="v2-video-meta">每日推荐 · 在下方平台搜同款视频</div>
        <div class="v2-video-ops">
          ${links}
          ${V.readBtn(rid)}
        </div>
      </div>
    </div>`;
  }
  window.V2VIEWS.skincare = renderSkincare;
  window.V2ACT.beautyTab = (el) => { v2set('beauty_tab', el.dataset.tab); render(); };

  /* ===================== 每日复盘 ===================== */
  function renderReview() {
    // 全板块今日汇总
    const habits = DB.get('habits', []);
    const habitDone = habits.filter(h => taskDoneRaw('v2_habit_' + h.id + '_' + today)).length;
    const dietDone = taskDoneRaw('v2_diet_main_' + today);
    const sportDone = taskDoneRaw('v2_sport_main_' + today);
    const skinAm = taskDoneRaw('v2_skincare_am_' + today);
    const skinPm = taskDoneRaw('v2_skincare_pm_' + today);
    const studySc = v2('study_checkins', []);
    const studyDone = studySc.includes(today);
    const tasksAll = DB.get('tasks', []).filter(t => t.date === today);
    const taskDoneCount = tasksAll.filter(t => t.done).length;
    const reviewToday = v2('review', []).find(r => r.date === today) || {};
    const history = v2('review', []).slice().reverse();
    const moods = ['😊', '😐', '😟', '😴', '🤩'];

    let h = `<div class="page">
      <div class="page-head"><div class="page-title">每日复盘<span class="help-badge" data-help="review"></span></div>
        <div class="page-sub">今日全板块汇总 · 反思与计划</div></div>
      <div class="v2-section"><div class="v2-section-title">今日全板块概览</div>
        <div class="overview-grid">
          <div class="overview-card"><div class="overview-value">${taskDoneCount}/${tasksAll.length}</div><div class="overview-label">打卡中心任务</div></div>
          <div class="overview-card"><div class="overview-value">${habitDone}/${habits.length}</div><div class="overview-label">习惯完成</div></div>
          <div class="overview-card"><div class="overview-value">${studyDone?'✓':'—'}</div><div class="overview-label">学习打卡</div></div>
          <div class="overview-card"><div class="overview-value">${dietDone?'✓':'—'}</div><div class="overview-label">饮食</div></div>
          <div class="overview-card"><div class="overview-value">${sportDone?'✓':'—'}</div><div class="overview-label">运动</div></div>
          <div class="overview-card"><div class="overview-value">${(skinAm?'早':'—')+(skinPm?'晚':'')}</div><div class="overview-label">护肤</div></div>
        </div></div>
      <div class="v2-section"><div class="v2-section-title">今日复盘</div>
        <div class="v2-form">
          <div class="form-group"><label>今日收获</label><textarea id="rv_gain" class="v2-input" rows="2" placeholder="今天学会了什么／做成了什么">${esc(reviewToday.gain||'')}</textarea></div>
          <div class="form-group"><label>不足之处</label><textarea id="rv_bad" class="v2-input" rows="2" placeholder="哪里可以更好">${esc(reviewToday.bad||'')}</textarea></div>
          <div class="form-group"><label>原因分析</label><textarea id="rv_reason" class="v2-input" rows="2" placeholder="为什么做得好／不好">${esc(reviewToday.reason||'')}</textarea></div>
          <div class="form-group"><label>明日计划</label><textarea id="rv_plan" class="v2-input" rows="2" placeholder="明天重点做哪 3 件事">${esc(reviewToday.plan||'')}</textarea></div>
          <div class="form-group"><label>今日评分（1-10）</label>
            <div class="rv-score-row">
              <input id="rv_score" type="range" min="1" max="10" value="${reviewToday.score||5}" class="rv-range" oninput="if(gid('rv_score_val'))gid('rv_score_val').textContent=this.value">
              <span id="rv_score_val" class="rv-score-val">${reviewToday.score||5}</span>
            </div>
          </div>
          <div class="form-group"><label>今日心情</label><div class="mood-options">`;
    moods.forEach(m => h += `<span class="mood-btn${reviewToday.mood===m?' selected':''}" data-act="rvMood" data-mood="${m}">${m}</span>`);
    h += `</div></div>
          <button class="btn btn-primary" data-act="rvSave">保存复盘</button>
        </div></div>`;
    // 趋势图表
    const ch = buildReviewCharts(v2('review', []));
    h += `<div class="v2-section"><div class="v2-section-title">📈 近 7 日评分趋势</div>${ch.week}
      <div class="v2-chart-stats">${ch.weekStats}</div></div>`;
    h += `<div class="v2-section"><div class="v2-section-title">📉 近 30 日评分走势</div>${ch.month}
      <div class="v2-chart-stats">${ch.monthStats}</div></div>`;
    if (ch.moodDist) h += `<div class="v2-section"><div class="v2-section-title">😊 心情分布</div>${ch.moodDist}</div>`;

    // AI 自动分析整个工作台
    const aiDef = window.AI.def();
    h += `<div class="v2-section"><div class="v2-section-title">🤖 AI 自动分析整个工作台</div>`;
    if (!aiDef) {
      h += `<div class="v2-tip-card">未配置 AI 模型，无法自动分析。请到「设置与数据 → 多模型配置」添加 API Key 后使用。</div>`;
    } else {
      const aiNote = v2('review_ai_note', '');
      h += `<div class="v2-tip-card">AI 会读取你今日全板块完成情况（打卡 / 习惯 / 学习 / 饮食 / 运动 / 护肤 / 副业等），给出针对性的调整建议。</div>
        <button class="btn btn-primary btn-sm" data-act="rvAiAnalyze">🤖 生成本日 AI 复盘</button>
        <div id="rvAiBox" class="v2-ai-note" style="margin-top:10px;white-space:pre-wrap;line-height:1.7">${esc(aiNote) || '点击上方按钮，AI 将综合今日数据给出可执行建议。'}</div>`;
    }
    h += `</div>`;

    h += `<div class="v2-section"><div class="v2-section-title">历史复盘</div><div class="v2-log-list">`;
    history.slice(0, 8).forEach(r => h += `<div class="v2-log-item"><span class="v2-log-date">${fmtDate(r.date)} ${r.mood||''}</span><span class="v2-log-text">${esc((r.gain||'')+(r.plan?('｜计划：'+r.plan):''))}</span></div>`);
    h += `</div></div></div>`;
    return h;
  }
  window.V2VIEWS.review = renderReview;
  window.V2ACT.rvAiAnalyze = async () => {
    const box = gid('rvAiBox'); if (box) box.textContent = '🤖 AI 分析中…';
    const habits = DB.get('habits', []);
    const habitDone = habits.filter(h => taskDoneRaw('v2_habit_' + h.id + '_' + today)).length;
    const dietDone = taskDoneRaw('v2_diet_main_' + today);
    const sportDone = taskDoneRaw('v2_sport_main_' + today);
    const studyDone = v2('study_checkins', []).includes(today);
    const tasksAll = DB.get('tasks', []).filter(t => t.date === today);
    const taskDoneCount = tasksAll.filter(t => t.done).length;
    const month = today.slice(0, 7);
    const xianyuIncome = (v2('xianyu_deals', []) || []).filter(d => (d.date || '').slice(0, 7) === month).reduce((s, d) => s + Number(d.amount || 0), 0);
    const summary = `今日（${today}）工作台数据：打卡中心任务 ${taskDoneCount}/${tasksAll.length} 完成；习惯 ${habitDone}/${habits.length}；学习打卡 ${studyDone ? '已完成' : '未完成'}；饮食打卡 ${dietDone ? '已完成' : '未完成'}；运动打卡 ${sportDone ? '已完成' : '未完成'}；闲鱼本月收入 ¥${xianyuIncome}。请作为个人成长教练，指出今日亮点与薄弱项，并给出明天最该做的 3 件具体事项（中文，不超过250字）。`;
    try {
      const txt = await window.AI.call([{ role: 'user', content: summary }], { temp: 0.6 });
      v2set('review_ai_note', txt);
      if (box) box.textContent = txt;
      toast('✅ AI 复盘完成');
    } catch (e) {
      if (box) box.textContent = '分析失败：' + e.message + '（多为浏览器 CORS 拦截，可改用支持 CORS 的代理 Base URL）';
      toast('❌ ' + e.message);
    }
  };
  window.V2ACT.rvMood = (el) => {
    let arr = v2('review', []); let rec = arr.find(r => r.date === today);
    if (!rec) { rec = { date: today }; arr.push(rec); }
    rec.mood = el.dataset.mood; v2set('review', arr); render();
  };
  window.V2ACT.rvSave = () => {
    const sc = gid('rv_score');
    const fields = {
      gain: gid('rv_gain').value.trim(), bad: gid('rv_bad').value.trim(),
      reason: gid('rv_reason').value.trim(), plan: gid('rv_plan').value.trim(),
      score: sc ? (Number(sc.value) || 5) : 5
    };
    let arr = v2('review', []); let rec = arr.find(r => r.date === today);
    if (!rec) { rec = { date: today }; arr.push(rec); }
    Object.assign(rec, fields); v2set('review', arr); toast('复盘已保存 ✓'); render();
  };

  /* ---------- 复盘趋势图表（内联 SVG，无需 canvas） ---------- */
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function buildReviewCharts(all) {
    const map = {}; all.forEach(r => map[r.date] = r);
    const base = new Date();
    // 近 7 日柱状图
    const wDays = []; for (let i = 6; i >= 0; i--) { const d = new Date(base); d.setDate(d.getDate() - i); wDays.push(ymd(d)); }
    const wVals = wDays.map(d => (map[d] && map[d].score != null) ? map[d].score : null);
    const bw = 34, gap = (336 - 28 - 7 * bw) / 6; let bars = '';
    wDays.forEach((d, i) => {
      const v = wVals[i], x = 14 + i * (bw + gap), maxH = 92, bh = v != null ? Math.max(4, Math.round(v / 10 * maxH)) : 0, y = 112 - bh;
      const col = v != null ? 'var(--hk-red)' : 'var(--hk-line)';
      bars += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="${col}"/>`;
      if (v != null) bars += `<text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--hk-text)">${v}</text>`;
      bars += `<text x="${x + bw / 2}" y="130" text-anchor="middle" font-size="10" fill="var(--text-light)">${d.slice(5)}</text>`;
    });
    const weekSVG = `<svg viewBox="0 0 336 142" width="100%" style="display:block">${bars}</svg>`;
    const wValid = wVals.filter(x => x != null);
    const weekStats = `<span class="v2-chip">本周均分 <b>${wValid.length ? (wValid.reduce((a, b) => a + b, 0) / wValid.length).toFixed(1) : '—'}</b></span><span class="v2-chip">已评 <b>${wValid.length}/7</b></span>`;
    // 近 30 日折线图
    const mDays = []; for (let i = 29; i >= 0; i--) { const d = new Date(base); d.setDate(d.getDate() - i); mDays.push(ymd(d)); }
    const mVals = mDays.map(d => (map[d] && map[d].score != null) ? map[d].score : null);
    const pl = 14, pr = 14, pt = 16, pb = 22, iW = 336 - pl - pr, iH = 150 - pt - pb;
    const pts = mDays.map((d, i) => { const v = mVals[i]; return { x: pl + iW * i / (mDays.length - 1), y: v != null ? pt + iH * (1 - v / 10) : null, v }; });
    let segs = '', cur = [];
    const poly = a => `<polyline points="${a.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ')}" fill="none" stroke="var(--hk-red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    pts.forEach(p => { if (p.y != null) cur.push(p); else { if (cur.length) { segs += poly(cur); cur = []; } } });
    if (cur.length) segs += poly(cur);
    let dots = ''; pts.forEach(p => { if (p.y != null) dots += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.6" fill="var(--hk-red)"/>`; });
    const mValid = mVals.filter(x => x != null); const av = mValid.length ? mValid.reduce((a, b) => a + b, 0) / mValid.length : 0;
    const ay = pt + iH * (1 - av / 10);
    const avgLine = mValid.length ? `<line x1="${pl}" y1="${ay.toFixed(1)}" x2="${336 - pr}" y2="${ay.toFixed(1)}" stroke="var(--hk-blue)" stroke-dasharray="4 4" stroke-width="1"/>` : '';
    const monthSVG = `<svg viewBox="0 0 336 150" width="100%" style="display:block">${segs}${avgLine}${dots}<text x="${pl}" y="12" font-size="10" fill="var(--hk-blue)">均值 ${av.toFixed(1)}</text></svg>`;
    const monthStats = `<span class="v2-chip">本月均分 <b>${mValid.length ? av.toFixed(1) : '—'}</b></span><span class="v2-chip">已评 <b>${mValid.length}/30</b></span><span class="v2-chip">最高 <b>${mValid.length ? Math.max.apply(null, mValid) : '—'}</b></span>`;
    // 心情分布
    const moodCount = {}; all.forEach(r => { if (r.mood) moodCount[r.mood] = (moodCount[r.mood] || 0) + 1; });
    const moodKeys = Object.keys(moodCount);
    const moodDist = moodKeys.length ? '<div class="mood-dist">' + moodKeys.map(m => `<span class="mood-pill">${m} <b>${moodCount[m]}</b></span>`).join('') + '</div>' : '';
    return { week: weekSVG, weekStats, month: monthSVG, monthStats, moodDist };
  }

  console.log('[V2] modules C loaded ✨');
})();
