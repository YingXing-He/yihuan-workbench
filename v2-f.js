/* ==========================================================================
 * 易欢工作台 V2 — 时间流：甘特图式时间轴 + 灵感随手记 + 时间统计
 * 纯本地数据（localStorage），通过 window.V2VIEWS / window.V2ACT 注册
 * ========================================================================== */
(function () {
  'use strict';

  /* ---------- 本地基础工具（自包含，独立于 v2-core 作用域） ---------- */
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
  function v2(k, def) { return DB.get('v2_' + k, def); }
  function v2set(k, val) { DB.set('v2_' + k, val); }
  function nowMin() { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
  function toMin(t) { if (!t) return null; const m = ('' + t).split(':'); return (+m[0]) * 60 + (+m[1] || 0); }
  function minToHM(min) { min = Math.max(0, Math.min(1439, min)); const h = Math.floor(min / 60), m = min % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
  function fmtDur(min) {
    min = Math.max(0, Math.round(min));
    if (min < 60) return min + ' 分';
    const h = Math.floor(min / 60), m = min % 60;
    return h + ' 小时' + (m ? ' ' + m + ' 分' : '');
  }
  function shiftDate(s, delta) {
    const d = new Date(s + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ---------- 分类与配色 ---------- */
  const CATS = ['学习', '雅思', '副业', '运动', '饮食', '护肤', '娱乐', '睡觉', '社交', '其他'];
  const CAT_COLOR = {
    '学习': '#4A90A4', '雅思': '#E60012', '副业': '#FF9DB0', '运动': '#2BB673', '饮食': '#FFB300',
    '护肤': '#FF8FB1', '娱乐': '#9B6DFF', '睡觉': '#7C8AA0', '社交': '#FF7043', '其他': '#B0BEC5'
  };
  function catColor(c) { return CAT_COLOR[c] || '#B0BEC5'; }

  /* ---------- 状态 ---------- */
  let _tlDate = todayStr();
  let _tlEdit = null;

  /* ====================== 渲染 ====================== */
  function renderTimeline() {
    const date = _tlDate;
    const all = v2('timeline_events', []);
    const evs = all.filter(e => e.date === date).sort((a, b) => toMin(a.start) - toMin(b.start));
    const ideas = v2('timeline_ideas', []).filter(i => i.date === date)
      .sort((a, b) => String(a.created || '').localeCompare(String(b.created || '')));

    // 统计
    const isToday = date === todayStr();
    let totalMin = 0;
    const byCat = {};
    evs.forEach(e => {
      const sM = toMin(e.start) || 0;
      const eM = e.end ? (toMin(e.end)) : (isToday ? Math.max(sM, nowMin()) : sM);
      const dur = Math.max(0, eM - sM);
      totalMin += dur;
      byCat[e.cat] = (byCat[e.cat] || 0) + dur;
    });

    let h = `<div class="page"><div class="page-head"><div class="page-title">⏳ 时间流</div><div class="page-sub">把一天的时间在眼前铺开 · 夺回时间掌控权</div></div>`;

    // 顶部统计卡
    h += `<div class="v2-quote-grid">
      <div class="v2-quote-card"><div class="v2-quote-name">已记录时长</div><div class="v2-quote-val">${fmtDur(totalMin)}</div></div>
      <div class="v2-quote-card"><div class="v2-quote-name">事件数</div><div class="v2-quote-val">${evs.length}</div></div>
      <div class="v2-quote-card"><div class="v2-quote-name">灵感</div><div class="v2-quote-val">${ideas.length}</div></div>
    </div>`;

    // 日期切换条
    h += `<div class="tl-datebar">
      <button class="btn btn-outline btn-sm" data-act="tlPrevDay">‹ 前一天</button>
      <input type="date" id="tlDate" class="v2-input tl-date-input" value="${date}" onchange="window.TL.onDate(this.value)">
      <button class="btn btn-outline btn-sm" data-act="tlNextDay">后一天 ›</button>
      <button class="btn btn-sm" data-act="tlToday">今天</button>
      <button class="btn btn-primary btn-sm" data-act="tlAddEvent" style="margin-left:auto">+ 记一笔时间</button>
    </div>`;

    // 甘特图时间轴
    h += `<div class="tl-board">`;
    h += `<div class="tl-ruler">`;
    for (let hh = 0; hh <= 24; hh += 3) {
      h += `<span class="tl-tick" style="left:${(hh / 24 * 100)}%">${String(hh).padStart(2, '0')}:00</span>`;
    }
    h += `</div>`;
    h += `<div class="tl-lane" style="height:${Math.max(evs.length, 1) * 46 + 8}px">`;
    for (let hh = 0; hh <= 24; hh += 3) {
      h += `<div class="tl-grid" style="left:${(hh / 24 * 100)}%"></div>`;
    }
    if (isToday) {
      const nm = nowMin();
      h += `<div class="tl-now" style="left:${(nm / 1440 * 100)}%"><span class="tl-now-label">现在 ${minToHM(nm)}</span></div>`;
    }
    if (evs.length === 0) {
      h += `<div class="tl-empty">这一天还没记录，点「+ 记一笔时间」开始～</div>`;
    } else {
      evs.forEach((e, i) => {
        const sM = toMin(e.start) || 0;
        let eM = e.end ? toMin(e.end) : (isToday ? nowMin() : sM);
        if (eM < sM) eM = sM;
        const left = sM / 1440 * 100;
        const width = Math.max(2.5, (eM - sM) / 1440 * 100);
        const col = catColor(e.cat);
        const ongoing = !e.end;
        h += `<div class="tl-bar" style="top:${i * 46 + 4}px;left:${left}%;width:${width}%;background:${col}">
          <div class="tl-bar-inner">
            <span class="tl-bar-title">${esc(e.title)}</span>
            <span class="tl-bar-time">${minToHM(sM)}${ongoing ? ' ~ 进行中' : ' ~ ' + minToHM(eM)}</span>
          </div>
          <span class="tl-bar-ops">
            <a data-act="tlEditEvent" data-id="${e.id}" title="编辑">✎</a>
            <a data-act="tlDelEvent" data-id="${e.id}" title="删除">✕</a>
          </span>
        </div>`;
      });
    }
    h += `</div></div>`;

    // 时间去向统计
    const pieItems = Object.keys(byCat).map(c => ({ label: c, value: byCat[c] })).filter(x => x.value > 0);
    if (pieItems.length) {
      h += `<div class="v2-section"><div class="v2-section-title">🍩 时间去向（共 ${fmtDur(totalMin)}）</div>`;
      h += `<div class="tl-pie-row">`;
      h += window.V2.cssPie(pieItems);
      h += `<div class="tl-cat-legend">`;
      pieItems.slice().sort((a, b) => b.value - a.value).forEach(it => {
        h += `<div class="tl-leg"><i style="background:${catColor(it.label)}"></i>${esc(it.label)} <b>${fmtDur(it.value)}</b></div>`;
      });
      h += `</div></div></div>`;
    }

    // 灵感随手记
    h += `<div class="v2-section"><div class="v2-section-title">💡 灵感随手记 <span class="v2-chip">${ideas.length}</span></div>`;
    h += `<div class="tl-idea-input">
      <input id="tlIdea" class="v2-input" placeholder="一闪而过的想法…回车或点添加" onkeydown="if(event.key==='Enter'){window.TL.addIdea()}">
      <button class="btn btn-primary btn-sm" data-act="tlAddIdea">添加</button>
    </div>`;
    if (ideas.length) {
      h += `<div class="v2-log-list">`;
      ideas.forEach(it => {
        h += `<div class="v2-log-item"><span class="v2-chip">${esc(it.time || '')}</span><span class="v2-log-text">${esc(it.text)}</span><a class="v2-tx-del" data-act="tlDelIdea" data-id="${it.id}">✕</a></div>`;
      });
      h += `</div>`;
    } else {
      h += `<div class="v2-book-empty">还没有灵感，记下今天冒出的好点子～</div>`;
    }
    h += `</div></div>`;
    return h;
  }

  /* ====================== 表单 ====================== */
  function eventForm(e) {
    window.V2.openForm(e ? '编辑时间记录' : '记一笔时间', `
      <div class="v2-form">
        <div class="form-group"><label>活动</label><input id="f_title" class="v2-input" value="${esc(e ? e.title : '')}" placeholder="例如：雅思听力作业 / 跑步 / 刷剧"></div>
        <div class="form-group"><label>分类</label><select id="f_cat" class="v2-input">${CATS.map(c => `<option value="${esc(c)}"${e && e.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
        <div class="form-group"><label>日期</label><input id="f_date" type="date" class="v2-input" value="${e ? e.date : _tlDate}"></div>
        <div class="form-group"><label>开始</label><input id="f_start" type="time" class="v2-input" value="${e ? e.start : '09:00'}"></div>
        <div class="form-group"><label>结束（留空 = 进行中）</label><input id="f_end" type="time" class="v2-input" value="${e ? e.end : ''}"></div>
        <div class="form-group"><label>备注</label><textarea id="f_note" class="v2-input" rows="2" placeholder="记录心得 / 链接 / 想法…">${esc(e ? e.note : '')}</textarea></div>
        <div class="v2-form-actions"><button class="btn btn-primary" data-act="tlSaveEvent">保存</button><button class="btn" onclick="closeGeneric()">取消</button></div>
      </div>`);
  }
  function tlSaveEvent() {
    const title = gid('f_title').value.trim();
    if (!title) { toast('请填写活动'); return; }
    const start = gid('f_start').value;
    const end = gid('f_end').value;
    if (start && end && toMin(end) < toMin(start)) { toast('结束时间不能早于开始时间'); return; }
    const rec = {
      title,
      cat: gid('f_cat').value,
      date: gid('f_date').value || _tlDate,
      start,
      end,
      note: gid('f_note').value.trim()
    };
    const all = v2('timeline_events', []);
    if (_tlEdit) { const t = all.find(x => x.id === _tlEdit); if (t) Object.assign(t, rec); }
    else { rec.id = gId(); all.push(rec); }
    v2set('timeline_events', all);
    _tlEdit = null;
    _tlDate = rec.date;
    closeGeneric();
    if (typeof render === 'function') render();
    toast('已记录到时间流');
  }

  /* ====================== 动作 ====================== */
  function tlAddEvent() { _tlEdit = null; eventForm(null); }
  function tlEditEvent(el) {
    const id = el.dataset.id; _tlEdit = id;
    const e = v2('timeline_events', []).find(x => x.id === id);
    eventForm(e);
  }
  function tlDelEvent(el) {
    if (!confirm('删除该时间记录？')) return;
    v2set('timeline_events', v2('timeline_events', []).filter(x => x.id !== el.dataset.id));
    if (typeof render === 'function') render();
  }
  function tlPrevDay() { _tlDate = shiftDate(_tlDate, -1); if (typeof render === 'function') render(); }
  function tlNextDay() { _tlDate = shiftDate(_tlDate, 1); if (typeof render === 'function') render(); }
  function tlToday() { _tlDate = todayStr(); if (typeof render === 'function') render(); }
  function tlDelIdea(el) {
    v2set('timeline_ideas', v2('timeline_ideas', []).filter(x => x.id !== el.dataset.id));
    if (typeof render === 'function') render();
  }

  // 暴露给内联 onchange / onkeydown
  window.TL = {
    onDate(v) { if (v) { _tlDate = v; if (typeof render === 'function') render(); } },
    addIdea() {
      const inp = gid('tlIdea');
      const t = (inp && inp.value || '').trim();
      if (!t) { toast('写点什么吧～'); return; }
      const n = new Date();
      const ideas = v2('timeline_ideas', []);
      ideas.push({ id: gId(), text: t, date: _tlDate, time: minToHM(n.getHours() * 60 + n.getMinutes()), created: Date.now() });
      v2set('timeline_ideas', ideas);
      if (typeof render === 'function') render();
    }
  };

  /* ---------- 帮助文案 ---------- */
  if (typeof HELP_TEXT !== 'undefined') {
    Object.assign(HELP_TEXT, {
      timeline: {
        title: '⏳ 时间流帮助',
        body: `<div class="guide-content"><p>甘特图式时间轴：把一天的时间在眼前铺开，看清每段时间花在哪。<b>点「+ 记一笔时间」</b>记录活动（选分类、起止时间），<b>结束时间留空即标记为「进行中」</b>，轴上会画一条「现在」竖线实时定位你正身处哪段时间。底部「灵感随手记」捕捉一闪而过的想法。按分类统计时间去向，帮你夺回时间掌控权。用左上的日期切换可回看任意一天。</p></div>`
      }
    });
  }

  /* ---------- 注册 ---------- */
  window.V2VIEWS = window.V2VIEWS || {};
  window.V2ACT = window.V2ACT || {};
  window.V2VIEWS.timeline = renderTimeline;
  Object.assign(window.V2ACT, {
    tlAddEvent, tlEditEvent, tlDelEvent,
    tlPrevDay, tlNextDay, tlToday, tlDelIdea, tlSaveEvent,
    tlAddIdea: () => window.TL.addIdea()
  });

  console.log('[V2] timeline loaded ⏳');
})();
