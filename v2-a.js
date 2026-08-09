/* ==========================================================================
 * 易欢工作台 V2 — 模块组 A：学习管理 / 习惯养成 / 小账本
 * ========================================================================== */
(function () {
  'use strict';
  const V = window.V2;
  const { v2, v2set, gId, tStr, money, fmtDate, lastNDates, cssBar, cssPie, openForm, ensureDailyTask, toggleV2Task, taskDone, ICONS, esc, gid, toast } = V;
  const today = todayStr();

  /* ---------- 通用：当月日历（当前月，今日高亮，已打卡显示蝴蝶结） ---------- */
  function v2Calendar(checkedDates) {
    const set = new Set(checkedDates || []);
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const wk = ['日', '一', '二', '三', '四', '五', '六'];
    let h = '<div class="v2-cal"><div class="v2-cal-head">' + y + '年' + (m + 1) + '月</div><div class="v2-cal-grid">';
    wk.forEach(w => h += `<div class="v2-cal-w">${w}</div>`);
    for (let i = 0; i < first; i++) h += '<div class="v2-cal-cell other"></div>';
    for (let d = 1; d <= days; d++) {
      const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = ds === today;
      const ck = set.has(ds);
      h += `<div class="v2-cal-cell${isToday ? ' today' : ''}${ck ? ' checked' : ''}">${d}${ck ? '<span class="v2-cal-bow">' + HK.classicSit(12) + '</span>' : ''}</div>`;
    }
    h += '</div></div>';
    return h;
  }

  /* ======================================================================
   * 学习管理
   * ====================================================================== */
  function daysUntil(dateStr) {
    if (!dateStr) return 999;
    const d = new Date(dateStr); if (isNaN(d)) return 999;
    const t = new Date(today);
    d.setHours(0, 0, 0, 0); t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / 86400000);
  }

  function renderStudy() {
    let goals = v2('study_goals', []);
    let sc = v2('study_checkins', null); if (!sc) { sc = [today]; v2set('study_checkins', sc); }
    const checked = sc.includes(today);
    const doing = goals.filter(g => g.status === '进行中').length;

    // 学校课程
    let courses = v2('school_courses', []);
    const dueSoon = courses.filter(c => !c.done && daysUntil(c.deadline) <= 1 && daysUntil(c.deadline) >= 0);

    // 考研每日推荐视频
    const kv = (BILI_VIDEOS && BILI_VIDEOS.kaoyan) ? BILI_VIDEOS.kaoyan : [];
    const doy = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const picks = [];
    for (let i = 0; i < 5 && kv.length; i++) picks.push(kv[(doy + i) % kv.length]);
    const ky = v2('kaoyan_target', { school: '', major: '', subjects: '' });

    const overview = [
      { label: '今日专注', value: '2.5 h', icon: ICONS.study },
      { label: '本周完成任务', value: '12', icon: ICONS.checkin },
      { label: '进行中目标', value: doing + '', icon: ICONS.habit },
      { label: '临近截止', value: dueSoon.length + '', icon: ICONS.review }
    ];
    const catCount = {};
    goals.forEach(g => { catCount[g.cat] = (catCount[g.cat] || 0) + 1; });
    const pieData = Object.keys(catCount).map(k => ({ label: k, value: catCount[k] }));

    let h = `<div class="page">
      <div class="page-head"><div class="page-title">学习管理<span class="help-badge" data-help="study"></span></div>
        <div class="page-sub">目标可视化 · 学校课程 · 考研备考</div></div>
      <div class="overview-grid">`;
    overview.forEach(o => h += `<div class="overview-card"><div class="ov-icon">${o.icon}</div><div class="overview-value">${o.value}</div><div class="overview-label">${o.label}</div></div>`);
    h += `</div>`;

    // 学校课程
    h += `<div class="v2-section"><div class="v2-section-title">🏫 学校课程 <button class="btn btn-primary btn-sm" data-act="schoolAdd" style="float:right">+ 添加作业</button></div>`;
    if (dueSoon.length) h += `<div class="v2-tip-card" style="background:#ffe9ec;color:#c0392b">⏰ 明天前要交：${dueSoon.map(c => esc(c.subject)).join('、')}，记得提前一天完成！</div>`;
    if (courses.length === 0) h += `<div class="empty"><div class="empty-text">还没添加学校作业，点右上角添加（可设截止日期）</div></div>`;
    courses.slice().sort((a, b) => (a.deadline || '').localeCompare(b.deadline || '')).forEach(c => {
      const du = daysUntil(c.deadline);
      const duTxt = du < 0 ? '已过期' : (du === 0 ? '今天截止' : (du === 1 ? '明天截止' : du + ' 天后'));
      h += `<div class="v2-goal-card${c.done ? ' done' : ''}">
        <div class="v2-goal-top"><span class="badge badge-red">${esc(c.subject)}</span>
          <span class="v2-goal-status">${duTxt}</span>
          <span class="v2-goal-ops"><a data-act="schoolToggle" data-id="${c.id}">${c.done ? '已完成' : '标记完成'}</a><a data-act="schoolDel" data-id="${c.id}">删除</a></span></div>
        <div class="v2-goal-title">${esc(c.hw || '(无说明)')}</div>
        ${c.deadline ? `<div class="v2-goal-meta">截止：${esc(c.deadline)}</div>` : ''}
      </div>`;
    });
    h += `</div>`;

    // 考研
    h += `<div class="v2-section"><div class="v2-section-title">🎓 考研备考 <button class="btn btn-primary btn-sm" data-act="kaoyanEdit" style="float:right">设置目标</button></div>`;
    h += `<div class="card-subtitle" style="margin-bottom:8px">目标院校：<b>${esc(ky.school || '未设置')}</b> · 目标专业：<b>${esc(ky.major || '未设置')}</b>${ky.subjects ? (' · 科目：' + esc(ky.subjects)) : ''}</div>`;
    h += `<div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">📺 今日备考视频推荐（每日更新 5 个）：</div>`;
    if (picks.length) {
      h += `<div>`;
      picks.forEach(p => {
        h += `<div class="v2-vocab-row"><div class="v2-vocab-body">
          <div class="v2-vocab-word" style="font-size:13.5px">${esc(p.title)}</div>
          <div class="v2-vocab-mean">${esc(p.desc || '')}</div>
          <a href="https://www.bilibili.com/video/${esc(p.bvid)}" target="_blank" rel="noreferrer" style="color:var(--hk-red,#E60012);font-size:12px;font-weight:600">▶ 在 B 站观看</a>
        </div></div>`;
      });
      h += `</div>`;
    } else {
      h += `<div class="empty"><div class="empty-text">暂无视频推荐</div></div>`;
    }
    h += `</div>`;

    // 学习目标
    h += `<div class="v2-section"><div class="v2-section-title">学习目标 <button class="btn btn-primary btn-sm" data-act="studyAdd" style="float:right">+ 新建目标</button></div>`;
    if (goals.length === 0) h += `<div class="empty"><div class="empty-text">还没有目标，点右上角新建一个吧</div></div>`;
    goals.forEach(g => {
      const pct = Math.min(100, Math.round(g.progress / g.target * 100));
      h += `<div class="v2-goal-card">
        <div class="v2-goal-top"><span class="badge badge-red">${esc(g.cat)}</span>
          <span class="v2-goal-status">${esc(g.status)}</span>
          <span class="v2-goal-ops"><a data-act="studyEdit" data-id="${g.id}">编辑</a><a data-act="studyDel" data-id="${g.id}">删除</a></span></div>
        <div class="v2-goal-title">${esc(g.title)}</div>
        <div class="progress-bar-wrap"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="v2-goal-meta">${g.progress} / ${g.target} ${esc(g.unit)} · ${pct}%</div>
      </div>`;
    });
    h += `</div>`;

    // 专注打卡
    h += `<div class="v2-section"><div class="v2-section-title">专注打卡
      <button class="btn btn-${checked ? 'outline' : 'primary'} btn-sm" data-act="studyCheckin" style="float:right">${checked ? '今日已打卡 ✓' : '今日打卡'}</button></div>
      ${v2Calendar(sc)}</div>`;

    // 统计
    h += `<div class="v2-section"><div class="v2-section-title">统计复盘 · 目标分类分布</div>${pieData.length ? cssPie(pieData) : '<div class="empty"><div class="empty-text">暂无数据</div></div>'}</div>`;
    h += `</div>`;
    return h;
  }
  window.V2VIEWS.study = renderStudy;

  function studyForm(g) {
    g = g || { title: '', cat: '语言学习', target: '', unit: '个', status: '进行中', progress: 0 };
    return `<div class="v2-form">
      <div class="form-group"><label>目标名称</label><input id="sf_title" class="v2-input" value="${esc(g.title)}" placeholder="例如：雅思词汇 8000 计划"></div>
      <div class="form-row">
        <div class="form-group"><label>分类</label><input id="sf_cat" class="v2-input" value="${esc(g.cat)}" placeholder="语言学习/专业学习…"></div>
        <div class="form-group"><label>单位</label><input id="sf_unit" class="v2-input" value="${esc(g.unit)}" placeholder="词/本/节"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>目标总量</label><input id="sf_target" class="v2-input" type="number" value="${esc(g.target)}"></div>
        <div class="form-group"><label>已完成</label><input id="sf_progress" class="v2-input" type="number" value="${esc(g.progress)}"></div>
      </div>
      <div class="form-group"><label>状态</label>
        <select id="sf_status" class="v2-input"><option ${g.status==='进行中'?'selected':''}>进行中</option><option ${g.status==='已完成'?'selected':''}>已完成</option><option ${g.status==='已暂停'?'selected':''}>已暂停</option></select></div>
      <div class="v2-form-actions"><button class="btn btn-primary" data-act="studySave" data-id="${g.id || ''}">保存</button>
        <button class="btn btn-outline" onclick="closeGeneric()">取消</button></div>
    </div>`;
  }

  window.V2ACT.studyAdd = () => openForm('新建学习目标', studyForm());
  window.V2ACT.studyEdit = (el) => {
    const g = v2('study_goals', []).find(x => x.id === el.dataset.id);
    if (g) openForm('编辑目标', studyForm(g));
  };
  window.V2ACT.studyDel = (el) => {
    if (!confirm('确定删除该目标？')) return;
    v2set('study_goals', v2('study_goals', []).filter(x => x.id !== el.dataset.id));
    toast('已删除'); render();
  };
  window.V2ACT.studySave = (el) => {
    const id = el.dataset.id;
    const title = gid('sf_title').value.trim();
    if (!title) { toast('请填写目标名称'); return; }
    const obj = {
      title, cat: gid('sf_cat').value.trim() || '其他',
      target: Number(gid('sf_target').value) || 0, unit: gid('sf_unit').value.trim() || '个',
      progress: Number(gid('sf_progress').value) || 0, status: gid('sf_status').value
    };
    let goals = v2('study_goals', []);
    if (id) { const i = goals.findIndex(x => x.id === id); if (i >= 0) goals[i] = Object.assign(goals[i], obj); }
    else { obj.id = gId(); goals.push(obj); }
    v2set('study_goals', goals);
    if (typeof closeGeneric === 'function') closeGeneric();
    toast('已保存'); render();
  };
  window.V2ACT.studyCheckin = () => {
    let sc = v2('study_checkins', []);
    if (!sc.includes(today)) { sc.push(today); v2set('study_checkins', sc); toast('专注打卡 +1 🎀'); }
    else { toast('今天已经打过卡啦'); }
    render();
  };
  window.V2ACT.v2Quick = (el) => { if (typeof navigate === 'function') navigate(el.dataset.mod); };

  // 学校课程：手动添加作业 + 截止日期
  window.V2ACT.schoolAdd = () => openForm('添加学校作业', `<div class="v2-form">
    <div class="form-group"><label>课程 / 科目</label><input id="sk_subject" class="v2-input" placeholder="例如：高等数学"></div>
    <div class="form-group"><label>作业说明</label><input id="sk_hw" class="v2-input" placeholder="例如：完成第 3 章习题"></div>
    <div class="form-group"><label>截止日期</label><input id="sk_deadline" class="v2-input" type="date"></div>
    <div class="v2-form-actions"><button class="btn btn-primary" data-act="schoolSave">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`);
  window.V2ACT.schoolSave = () => {
    const subject = gid('sk_subject').value.trim();
    if (!subject) { toast('请填写课程 / 科目'); return; }
    const courses = v2('school_courses', []);
    courses.push({ id: gId(), subject, hw: gid('sk_hw').value.trim(), deadline: gid('sk_deadline').value || '', done: false });
    v2set('school_courses', courses);
    if (typeof closeGeneric === 'function') closeGeneric();
    toast('已添加，记得提前一天完成 📌'); render();
  };
  window.V2ACT.schoolDel = (el) => {
    v2set('school_courses', v2('school_courses', []).filter(c => c.id !== el.dataset.id));
    toast('已删除'); render();
  };
  window.V2ACT.schoolToggle = (el) => {
    const courses = v2('school_courses', []);
    const c = courses.find(x => x.id === el.dataset.id);
    if (c) { c.done = !c.done; v2set('school_courses', courses); render(); }
  };

  // 考研目标设置
  window.V2ACT.kaoyanEdit = () => {
    const ky = v2('kaoyan_target', { school: '', major: '', subjects: '' });
    openForm('设置考研目标', `<div class="v2-form">
      <div class="form-group"><label>目标院校</label><input id="ky_school" class="v2-input" value="${esc(ky.school)}" placeholder="例如：中国海洋大学"></div>
      <div class="form-group"><label>目标专业</label><input id="ky_major" class="v2-input" value="${esc(ky.major)}" placeholder="例如：水产养殖"></div>
      <div class="form-group"><label>考试科目</label><input id="ky_subjects" class="v2-input" value="${esc(ky.subjects)}" placeholder="例如：政治 / 英语二 / 数学 / 专业课"></div>
      <div class="v2-form-actions"><button class="btn btn-primary" data-act="kaoyanSave">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`);
  };
  window.V2ACT.kaoyanSave = () => {
    v2set('kaoyan_target', { school: gid('ky_school').value.trim(), major: gid('ky_major').value.trim(), subjects: gid('ky_subjects').value.trim() });
    if (typeof closeGeneric === 'function') closeGeneric();
    toast('考研目标已保存'); render();
  };

  /* ======================================================================
   * 习惯养成（与打卡中心双向同步）
   * ====================================================================== */
  function habitCat(name) {
    if (name.indexOf('运动') >= 0) return '运动健康任务';
    if (name.indexOf('护肤') >= 0 || name.indexOf('喝水') >= 0 || name.indexOf('睡') >= 0) return '生活任务';
    return '生活任务';
  }
  function habitStreak(habitId) {
    const tasks = DB.get('tasks', []);
    const prefix = 'v2_habit_' + habitId + '_';
    const doneDates = tasks.filter(t => String(t.id).indexOf(prefix) === 0 && t.done).map(t => String(t.id).slice(prefix.length)).sort();
    if (doneDates.length === 0) return 0;
    let streak = 0;
    const d = new Date();
    for (let i = 0; ; i++) {
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (doneDates.includes(ds)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    return streak;
  }
  function renderHabit() {
    let habits = DB.get('habits', []);
    // 当月已打卡日期（任一习惯完成）
    const tasks = DB.get('tasks', []);
    const calSet = new Set();
    tasks.filter(t => String(t.id).indexOf('v2_habit_') === 0 && t.done).forEach(t => calSet.add(String(t.id).slice(String(t.id).lastIndexOf('_') + 1)));
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">习惯养成<span class="help-badge" data-help="habit"></span></div>
        <div class="page-sub">每日勾选 · 自动同步打卡中心</div></div>
      <div class="v2-section"><div class="v2-section-title">我的习惯 <button class="btn btn-primary btn-sm" data-act="habitAdd" style="float:right">+ 新建习惯</button></div>`;
    if (habits.length === 0) h += `<div class="empty"><div class="empty-text">还没有习惯，先建一个吧</div></div>`;
    habits.forEach(hb => {
      const tid = ensureDailyTask('habit', hb.id, '习惯：' + hb.name, habitCat(hb.name));
      const done = taskDone(tid);
      const streak = habitStreak(hb.id);
      h += `<div class="v2-habit-card${done ? ' done' : ''}">
        <div class="v2-habit-check" data-act="habitToggle" data-id="${hb.id}">${done ? HK.classicSit(20) : ''}</div>
        <div class="v2-habit-info">
          <div class="v2-habit-name">${esc(hb.name)}</div>
          <div class="v2-habit-meta">${esc(hb.freq || '每日')}${hb.remind ? ' · 提醒 ' + esc(hb.remind) : ''} · 连续 ${streak} 天</div>
        </div>
        <div class="v2-habit-ops"><a data-act="habitEdit" data-id="${hb.id}">编辑</a><a data-act="habitDel" data-id="${hb.id}">删除</a></div>
      </div>`;
    });
    h += `</div>`;
    const monthDone = [...calSet].filter(d => d.slice(0, 7) === today.slice(0, 7)).length;
    const rate = Math.min(100, Math.round(monthDone / Math.max(1, new Date().getDate()) * 100));
    h += `<div class="v2-section"><div class="v2-section-title">本月统计</div>
      <div class="overview-grid">
        <div class="overview-card"><div class="overview-value">${monthDone}</div><div class="overview-label">本月打卡天</div></div>
        <div class="overview-card"><div class="overview-value">${rate}%</div><div class="overview-label">日均完成率</div></div>
        <div class="overview-card"><div class="overview-value">${habits.length}</div><div class="overview-label">习惯总数</div></div>
        <div class="overview-card"><div class="overview-value">${habits.filter(h=>taskDone(ensureDailyTask('habit',h.id,h.name,habitCat(h.name)))).length}</div><div class="overview-label">今日完成</div></div>
      </div></div>`;
    // 月历式打卡热力图（某月，方框变小，像月历排布，颜色深浅=当天完成的习惯数）
    const calKey = v2('habit_cal_month', '') || today.slice(0, 7);
    const cmParts = calKey.split('-'); const cy = +cmParts[0], cm = +cmParts[1];
    const firstDow = new Date(cy, cm - 1, 1).getDay();
    const daysInM = new Date(cy, cm, 0).getDate();
    const ymd3 = (y, m, d) => y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    let cal = '<div class="hk-cal-grid">';
    ['日', '一', '二', '三', '四', '五', '六'].forEach(w => cal += `<div class="hk-cal-wd">${w}</div>`);
    for (let i = 0; i < firstDow; i++) cal += '<div class="hk-cal-cell empty"></div>';
    for (let d = 1; d <= daysInM; d++) {
      const ds = ymd3(cy, cm, d);
      const cnt = tasks.filter(t => String(t.id).indexOf('v2_habit_') === 0 && t.done && String(t.id).endsWith('_' + ds)).length;
      const lvl = cnt === 0 ? 0 : Math.min(4, cnt);
      const isToday = ds === today;
      cal += `<div class="hk-cal-cell lv${lvl}${isToday ? ' today' : ''}" title="${ds}：${cnt} 个习惯完成">${d}</div>`;
    }
    cal += '</div>';
    const prevKey = cm === 1 ? (cy - 1) + '-12' : cy + '-' + String(cm - 1).padStart(2, '0');
    const nextKey = cm === 12 ? (cy + 1) + '-01' : cy + '-' + String(cm + 1).padStart(2, '0');
    let calDone = 0;
    for (let d = 1; d <= daysInM; d++) { const ds = ymd3(cy, cm, d); if (tasks.some(t => String(t.id).indexOf('v2_habit_') === 0 && t.done && String(t.id).endsWith('_' + ds))) calDone++; }
    h += `<div class="v2-section"><div class="v2-section-title">🔥 打卡月历热力图 · ${cy}年${cm}月
        <span class="hk-cal-nav"><a data-act="habitCalPrev" data-k="${prevKey}" title="上个月">‹</a><a data-act="habitCalNext" data-k="${nextKey}" title="下个月">›</a></span></div>
      ${cal}
      <div class="hk-heat-legend"><span>少</span>${[0,1,2,3,4].map(l => `<i class="hk-cal-cell lv${l}"></i>`).join('')}<span>多</span><span class="hk-heat-done">本月 ${calDone} 天打卡</span></div>
    </div>`;
    h += `</div>`;
    return h;
  }
  window.V2VIEWS.habit = renderHabit;

  function habitForm(hb) {
    hb = hb || { name: '', freq: '每日', remind: '' };
    return `<div class="v2-form">
      <div class="form-group"><label>习惯名称</label><input id="hf_name" class="v2-input" value="${esc(hb.name)}" placeholder="例如：早起打卡"></div>
      <div class="form-row">
        <div class="form-group"><label>频率</label><select id="hf_freq" class="v2-input"><option ${hb.freq==='每日'?'selected':''}>每日</option><option ${hb.freq==='工作日'?'selected':''}>工作日</option><option ${hb.freq==='每周'?'selected':''}>每周</option></select></div>
        <div class="form-group"><label>提醒时间</label><input id="hf_remind" class="v2-input" type="time" value="${esc(hb.remind)}"></div>
      </div>
      <div class="v2-form-actions"><button class="btn btn-primary" data-act="habitSave" data-id="${hb.id || ''}">保存</button>
        <button class="btn btn-outline" onclick="closeGeneric()">取消</button></div>
    </div>`;
  }
  window.V2ACT.habitAdd = () => openForm('新建习惯', habitForm());
  window.V2ACT.habitEdit = (el) => { const hb = DB.get('habits', []).find(x => x.id === el.dataset.id); if (hb) openForm('编辑习惯', habitForm(hb)); };
  window.V2ACT.habitDel = (el) => {
    if (!confirm('确定删除该习惯？')) return;
    DB.set('habits', DB.get('habits', []).filter(x => x.id !== el.dataset.id));
    toast('已删除'); render();
  };
  window.V2ACT.habitSave = (el) => {
    const id = el.dataset.id;
    const name = gid('hf_name').value.trim();
    if (!name) { toast('请填写习惯名称'); return; }
    const obj = { name, freq: gid('hf_freq').value, remind: gid('hf_remind').value };
    let habits = DB.get('habits', []);
    if (id) { const i = habits.findIndex(x => x.id === id); if (i >= 0) habits[i] = Object.assign(habits[i], obj); }
    else { obj.id = gId(); obj.order = habits.length + 1; habits.push(obj); }
    DB.set('habits', habits);
    if (typeof closeGeneric === 'function') closeGeneric();
    toast('已保存'); render();
  };
  window.V2ACT.habitCalPrev = (el) => { v2set('habit_cal_month', el.dataset.k); render(); };
  window.V2ACT.habitCalNext = (el) => { v2set('habit_cal_month', el.dataset.k); render(); };
  window.V2ACT.habitToggle = (el) => {
    const tid = ensureDailyTask('habit', el.dataset.id, '习惯：' + (DB.get('habits', []).find(x => x.id === el.dataset.id) || {}).name, habitCat((DB.get('habits', []).find(x => x.id === el.dataset.id) || {}).name || ''));
    toggleV2Task(tid); render();
  };

  /* ======================================================================
   * 小账本
   * ====================================================================== */
  const FIN_CATS_IN = ['兼职收入', '奖学金', '生活费', '红包', '其他收入'];
  const FIN_CATS_OUT = ['餐饮', '学习', '交通', '娱乐', '购物', '护肤', '运动', '其他支出'];
  function finMonthTx() {
    const tx = v2('finance_tx', []);
    return tx.filter(t => t.date.slice(0, 7) === today.slice(0, 7));
  }
  function renderFinance() {
    const tx = finMonthTx();
    const income = tx.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
    const expense = tx.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
    const budgets = v2('finance_budgets', []);
    const spentByCat = {};
    tx.filter(t => t.type === 'out').forEach(t => spentByCat[t.cat] = (spentByCat[t.cat] || 0) + t.amount);
    const budgetLeft = budgets.reduce((s, b) => s + (b.limit - (spentByCat[b.cat] || 0)), 0);
    const goals = v2('finance_goals', []);

    let h = `<div class="page">
      <div class="page-head"><div class="page-title">小账本<span class="help-badge" data-help="finance"></span></div>
        <div class="page-sub">${today.slice(0, 7)} 本月收支</div></div>
      <div class="overview-grid">
        <div class="overview-card"><div class="ov-icon">${ICONS.finance}</div><div class="overview-value" style="color:#E60012">${money(income)}</div><div class="overview-label">本月收入</div></div>
        <div class="overview-card"><div class="overview-value" style="color:#4A90A4">${money(expense)}</div><div class="overview-label">本月支出</div></div>
        <div class="overview-card"><div class="overview-value">${money(income - expense)}</div><div class="overview-label">结余</div></div>
        <div class="overview-card"><div class="overview-value">${money(budgetLeft)}</div><div class="overview-label">预算剩余</div></div>
      </div>`;

    // 快速记一笔
    const catOpts = FIN_CATS_OUT.concat(FIN_CATS_IN).map(c => `<option>${c}</option>`).join('');
    h += `<div class="v2-section"><div class="v2-section-title">快速记一笔</div>
      <div class="v2-fin-form">
        <div class="v2-type-toggle">
          <span class="v2-type on" data-act="finTypeToggle" data-type="out" id="finTypeOut">支出</span>
          <span class="v2-type" data-act="finTypeToggle" data-type="in" id="finTypeIn">收入</span>
        </div>
        <div class="form-row">
          <div class="form-group"><label>金额</label><input id="fin_amount" class="v2-input" type="number" placeholder="0.00"></div>
          <div class="form-group"><label>分类</label><select id="fin_cat" class="v2-input">${catOpts}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>支付方式</label><select id="fin_method" class="v2-input"><option>微信</option><option>支付宝</option><option>校园卡</option><option>现金</option><option>银行卡</option></select></div>
          <div class="form-group"><label>日期</label><input id="fin_date" class="v2-input" type="date" value="${today}"></div>
        </div>
        <div class="form-group"><label>备注</label><input id="fin_note" class="v2-input" placeholder="可填用途/来源"></div>
        <button class="btn btn-primary" data-act="finAddTx">保存这笔账</button>
      </div></div>`;

    // 账单截图识别占位
    h += `<div class="v2-section"><div class="v2-ocr-card">
      <div class="v2-ocr-icon">${ICONS.finance}</div>
      <div><div class="v2-ocr-title">账单截图智能识别</div><div class="v2-ocr-desc">上传微信/支付宝账单截图，自动识别金额与分类（V3 接入）</div></div>
      <button class="btn btn-outline btn-sm" disabled>敬请期待</button></div></div>`;

    // 月度收支统计
    const byCat = {};
    tx.filter(t => t.type === 'out').forEach(t => byCat[t.cat] = (byCat[t.cat] || 0) + t.amount);
    const barData = Object.keys(byCat).map(k => ({ label: k, value: byCat[k], display: money(byCat[k]) }));
    barData.sort((a, b) => b.value - a.value);
    h += `<div class="v2-section"><div class="v2-section-title">分类支出统计</div>${barData.length ? cssBar(barData) : '<div class="empty"><div class="empty-text">本月还没有支出记录</div></div>'}</div>`;

    // 月度收支趋势（近6个月）
    const months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')); }
    const monthStat = months.map(m => {
      const mtx = tx.filter(t => (t.date || '').slice(0, 7) === m);
      const inc = mtx.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
      const out = mtx.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
      return { m, inc, out, net: inc - out };
    });
    const maxV = Math.max(1, ...monthStat.map(s => Math.max(s.inc, s.out)));
    let trend = `<div class="v2-section"><div class="v2-section-title">月度收支趋势（近6个月）</div><div class="v2-month-trend">`;
    monthStat.forEach(s => {
      const incPct = (s.inc / maxV * 100).toFixed(0);
      const outPct = (s.out / maxV * 100).toFixed(0);
      trend += `<div class="v2-month-col">
        <div class="v2-month-bars">
          <div class="v2-month-bar inc" style="height:${incPct}%"><span class="v2-month-val">${s.inc ? money(s.inc).slice(1) : ''}</span></div>
          <div class="v2-month-bar out" style="height:${outPct}%"><span class="v2-month-val">${s.out ? money(s.out).slice(1) : ''}</span></div>
        </div>
        <div class="v2-month-label">${s.m.slice(2)}</div>
        <div class="v2-month-net ${s.net >= 0 ? 'pos' : 'neg'}">${s.net >= 0 ? '+' : '-'}${money(Math.abs(s.net)).slice(1)}</div>
      </div>`;
    });
    trend += `</div><div class="v2-month-legend"><span><i class="dot inc"></i>收入</span><span><i class="dot out"></i>支出</span><span><i class="dot net"></i>结余</span></div></div>`;
    h += trend;

    // 明细
    const recent = v2('finance_tx', []).slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
    h += `<div class="v2-section"><div class="v2-section-title">近期明细</div><div class="v2-tx-list">`;
    if (recent.length === 0) h += `<div class="empty"><div class="empty-text">暂无记录</div></div>`;
    recent.forEach(t => {
      h += `<div class="v2-tx-item">
        <div class="v2-tx-cat"><span class="badge ${t.type === 'in' ? 'badge-red' : 'badge-gray'}">${esc(t.cat)}</span></div>
        <div class="v2-tx-info"><div class="v2-tx-note">${esc(t.note || (t.type === 'in' ? '收入' : '支出'))}</div><div class="v2-tx-meta">${fmtDate(t.date)} · ${esc(t.method)}</div></div>
        <div class="v2-tx-amt ${t.type === 'in' ? 'in' : 'out'}">${t.type === 'in' ? '+' : '-'}${money(t.amount).slice(1)}</div>
        <a class="v2-tx-del" data-act="finDelTx" data-id="${t.id}">✕</a></div>`;
    });
    h += `</div></div>`;

    // 存钱目标
    h += `<div class="v2-section"><div class="v2-section-title">存钱目标 <button class="btn btn-primary btn-sm" data-act="finAddGoal" style="float:right">+ 新目标</button></div>`;
    if (goals.length === 0) h += `<div class="empty"><div class="empty-text">定个小目标，攒钱更有动力</div></div>`;
    goals.forEach(g => {
      const pct = Math.min(100, Math.round(g.current / g.target * 100));
      h += `<div class="v2-goal-card"><div class="v2-goal-top"><span class="v2-goal-title">${esc(g.title)}</span></div>
        <div class="progress-bar-wrap"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="v2-goal-meta">${money(g.current)} / ${money(g.target)} · ${pct}%</div></div>`;
    });
    h += `</div>`;

    // 理财小知识
    h += `<div class="v2-section"><div class="v2-tip-card">💡 <b>理财小知识：</b>先储蓄后消费——每月收入到账先转固定比例到储蓄账户，剩余再用于开销，更容易攒下钱。</div></div>`;
    h += `</div>`;
    return h;
  }
  window.V2VIEWS.finance = renderFinance;

  window.V2ACT.finAddTx = () => {
    const type = gid('finTypeOut').classList.contains('on') ? 'out' : 'in';
    const amount = Number(gid('fin_amount').value);
    if (!amount || amount <= 0) { toast('请输入有效金额'); return; }
    const tx = v2('finance_tx', []);
    tx.push({ id: gId(), date: gid('fin_date').value || today, type, cat: gid('fin_cat').value, method: gid('fin_method').value, amount, note: gid('fin_note').value.trim() });
    v2set('finance_tx', tx);
    toast('记账成功 ✓'); render();
  };
  window.V2ACT.finDelTx = (el) => {
    v2set('finance_tx', v2('finance_tx', []).filter(t => t.id !== el.dataset.id));
    toast('已删除'); render();
  };
  window.V2ACT.finAddGoal = () => openForm('新建存钱目标', `<div class="v2-form">
    <div class="form-group"><label>目标名称</label><input id="fg_title" class="v2-input" placeholder="例如：攒一台 iPad"></div>
    <div class="form-row">
      <div class="form-group"><label>目标金额</label><input id="fg_target" class="v2-input" type="number" placeholder="4000"></div>
      <div class="form-group"><label>已攒</label><input id="fg_current" class="v2-input" type="number" placeholder="0"></div>
    </div>
    <div class="v2-form-actions"><button class="btn btn-primary" data-act="finSaveGoal">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`);
  window.V2ACT.finSaveGoal = () => {
    const title = gid('fg_title').value.trim();
    if (!title) { toast('请填写目标名称'); return; }
    const goals = v2('finance_goals', []);
    goals.push({ id: gId(), title, target: Number(gid('fg_target').value) || 0, current: Number(gid('fg_current').value) || 0 });
    v2set('finance_goals', goals);
    if (typeof closeGeneric === 'function') closeGeneric();
    toast('已保存'); render();
  };
  // 收支类型切换
  window.V2ACT.finType = (el) => {
    const type = el.dataset.type;
    gid('finTypeOut').classList.toggle('on', type === 'out');
    gid('finTypeIn').classList.toggle('on', type === 'in');
  };
  // 绑定类型切换点击（finance 页面内）
  // 在渲染后通过事件委托处理（data-act="finType"），这里补一个委托入口：
  window.V2ACT.finTypeToggle = (el) => {
    const type = el.dataset.type;
    const out = gid('finTypeOut'), inn = gid('finTypeIn');
    if (out) out.classList.toggle('on', type === 'out');
    if (inn) inn.classList.toggle('on', type === 'in');
  };

  console.log('[V2] modules A loaded ✨');
})();
