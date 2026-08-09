/* ==========================================================================
 * 易欢工作台 V2 — 模块组 B：科研 / 读书 / 播客 / 新闻 / AI学习 / 表达能力
 * ========================================================================== */
(function () {
  'use strict';
  const V = window.V2;
  const { v2, v2set, gId, tStr, money, fmtDate, lastNDates, cssBar, cssPie, openForm, ensureDailyTask, toggleV2Task, taskDone, ICONS, esc, gid, toast } = V;
  const today = todayStr();

  // 中文朗读（复用 Web Speech API）
  function speakZh(txt) {
    if (!('speechSynthesis' in window)) { toast('当前浏览器不支持朗读'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'zh-CN'; u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  // 图片压缩（避免 localStorage 爆掉）：缩放 + JPEG
  function compressImg(file, maxW, cb) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) return cb(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        try {
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          cb(c.toDataURL('image/jpeg', 0.62));
        } catch (err) { cb(null); }
      };
      img.onerror = () => cb(null);
      img.src = e.target.result;
    };
    reader.onerror = () => cb(null);
    reader.readAsDataURL(file);
  }

  // 读取文件输入，把已有照片与新上传照片合并
  function readPhotos(inputId, existing, done) {
    const input = gid(inputId);
    const files = input && input.files ? Array.from(input.files) : [];
    const out = (existing || []).slice();
    if (!files.length) return done(out);
    let pending = files.length;
    files.forEach(f => compressImg(f, 720, d => {
      if (d) out.push(d);
      if (--pending === 0) done(out.slice(0, 6));
    }));
  }

  // 图片灯箱
  window.V2Lightbox = function (src) {
    let box = gid('v2Lightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'v2Lightbox';
      box.className = 'v2-lightbox';
      box.onclick = () => box.remove();
      document.body.appendChild(box);
    }
    box.innerHTML = `<img src="${src}" class="v2-lightbox-img"><div class="v2-lightbox-tip">点击任意处关闭</div>`;
  };

  /* ===================== 科研助手 ===================== */
  const RESEARCH_METHODS_SEED = [
    { name: 'PCR 扩增', desc: '设计引物，95℃ 变性、55℃ 退火、72℃ 延伸约 30 循环，验证目的片段。' },
    { name: '酶活测定', desc: '以底物反应体系测 OD 变化，计算单位时间产物生成量。' },
    { name: '细菌培养与计数', desc: 'LB 培养基 37℃ 摇床，平板涂布梯度稀释后计数 CFU。' },
    { name: 'Western blot', desc: '蛋白电泳转膜，一抗二抗孵育显影，检测目标蛋白表达。' },
    { name: '组织切片与染色', desc: '固定包埋切片，H&E 或特殊染色观察组织形态。' },
    { name: 'RNA 提取与 qPCR', desc: 'Trizol 法提取 RNA，反转录后定量 PCR 分析基因表达。' }
  ];
  function ensureResearchMethods() {
    if (v2('research_methods_seeded')) return;
    if (!v2('research_methods', []).length) v2set('research_methods', RESEARCH_METHODS_SEED.map(m => ({ id: gId(), name: m.name, desc: m.desc })));
    v2set('research_methods_seeded', true);
  }
  // 方法库视频池（每日轮换推荐，B站搜教程，可后台播放）
  const RESEARCH_METHOD_VIDEOS = [
    { t: 'PCR 扩增实验全流程', kw: 'PCR 扩增 实验 教程 实操', tag: 'PCR' },
    { t: '酶活测定方法详解', kw: '酶活 测定 方法 实验', tag: '酶活' },
    { t: '细菌分离培养与平板计数', kw: '细菌 培养 平板 计数 CFU 教程', tag: '培养' },
    { t: 'Western blot 完整步骤', kw: 'Western blot 实验 步骤 教程', tag: 'WB' },
    { t: '组织切片与 H&E 染色', kw: '组织切片 H&E 染色 教程', tag: '切片' },
    { t: 'RNA 提取与 qPCR 定量', kw: 'RNA 提取 qPCR 实时荧光定量 教程', tag: 'qPCR' },
    { t: '细胞转染与瞬时表达', kw: '细胞 转染 瞬时表达 实验 教程', tag: '转染' },
    { t: 'ELISA 酶联免疫测定', kw: 'ELISA 酶联免疫 测定 教程', tag: 'ELISA' }
  ];
  function renderResearch() {
    ensureResearchMethods();
    const tab = v2('research_tab', 'records');
    const tabs = [['records', '实验记录'], ['methods', '方法库'], ['papers', '文献推荐'], ['draw', '绘图技巧']];
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">科研助手<span class="help-badge" data-help="research"></span></div>
        <div class="page-sub">实验·方法·文献·绘图 一站管理</div></div>
      <div class="switch-tabs">`;
    tabs.forEach(t => h += `<div class="tab-btn${tab === t[0] ? ' active' : ''}" data-act="resTab" data-tab="${t[0]}">${t[1]}</div>`);
    h += `</div><div class="v2-tab-body">`;

    if (tab === 'records') {
      const recs = v2('research_records', []);
      h += `<button class="btn btn-primary btn-sm" data-act="resAdd" data-kind="records" style="margin-bottom:12px">+ 新增实验记录</button>`;
      if (!recs.length) h += `<div class="empty"><div class="empty-text">还没有实验记录</div></div>`;
      recs.slice().reverse().forEach(r => {
        h += `<div class="v2-rec-card">
          <div class="v2-rec-top"><span class="badge ${r.status==='已完成'?'badge-green':'badge-red'}">${esc(r.status)}</span><span class="v2-rec-date">${fmtDate(r.date)}</span>
            <span class="v2-habit-ops"><a data-act="resEdit" data-kind="records" data-id="${r.id}">编辑</a><a data-act="resDel" data-kind="records" data-id="${r.id}">删除</a></span></div>
          <div class="v2-rec-title">${esc(r.title)}</div>
          <div class="v2-rec-row"><b>方法：</b>${esc(r.method)}</div>
          <div class="v2-rec-row"><b>结果：</b>${esc(r.result)}</div>
          ${(r.photos && r.photos.length) ? `<div class="v2-rec-photos">${r.photos.map(p => `<img src="${p}" class="v2-rec-photo" onclick="V2Lightbox(this.src)" alt="实验照片">`).join('')}</div>` : ''}
        </div>`;
      });
    } else if (tab === 'methods') {
      const mPicks = V.dailyPick(RESEARCH_METHOD_VIDEOS.map((v, i) => 'm_' + i), 1, 4);
      h += `<div class="v2-section-title">🎬 方法库视频（每日推荐 1 个 · 可后台播放）</div><div class="v2-ai-grid">`;
      mPicks.forEach(rid => { const v = RESEARCH_METHOD_VIDEOS[+rid.split('_')[1]]; h += `<div class="v2-ai-card">
        <div class="v2-ai-cover">${ICONS.research}</div>
        <div class="v2-ai-top"><span class="badge badge-red">${esc(v.tag)}</span>${V.readBtn(rid)}</div>
        <div class="v2-ai-title">${esc(v.t)}</div>
        <div class="v2-ai-pick-ops">${V.mediaLink('bili', v.kw, 'B站')}${V.mediaLink('douyin', v.kw, '抖音')}</div></div>`; });
      h += `</div><div class="v2-tip-card">💡 每天跟着一个方法视频动手练，标记「已看」后次日自动换下一个；没标记的可能再次推荐。把练过的记到「实验记录」里。</div>`;
    } else if (tab === 'papers') {
      h += `<div class="v2-tip-card">📡 每日 10 篇来自 NCBI / Europe PMC 的前沿论文（水产·对虾·免疫·病毒细菌感染方向，IF≥4，真实 DOI 可点击下载）。最高 IF 的一篇已自动进入「微信公众号 → 本周精读候选」。点「🌟 选为本周精读」可手动加入。</div>`;
      h += window.V3 ? V3.ncbiPapersSection() : `<div class="empty"><div class="empty-text">文献模块加载中…</div></div>`;
    } else {
      const drawVids = [
        { t: 'Origin 科研绘图入门', kw: 'Origin 科研绘图 教程', tag: 'Origin' },
        { t: 'Python matplotlib 科研图表美化', kw: 'matplotlib 科研绘图 美化 教程', tag: 'Python' },
        { t: 'R ggplot2 数据可视化', kw: 'ggplot2 科研绘图 教程', tag: 'R' },
        { t: 'GraphPad Prism 基础', kw: 'GraphPad Prism 教程 科研', tag: 'Prism' },
        { t: 'AI 辅助科研绘图', kw: 'AI 科研绘图 工具 教程', tag: 'AI' },
        { t: '论文图表配色与排版', kw: '科研论文 图表 配色 排版', tag: '排版' },
        { t: '矢量图导出与分辨率', kw: '论文 矢量图 导出 300dpi 教程', tag: '导出' }
      ];
      const picks = V.dailyPick(drawVids.map((v, i) => 'draw_' + i), 1, 5);
      h += `<div class="v2-section-title">🎬 绘图技巧视频（每日推荐 1 个 · 可后台播放）</div><div class="v2-ai-grid">`;
      picks.forEach(rid => { const v = drawVids[+rid.split('_')[1]]; h += `<div class="v2-ai-card">
        <div class="v2-ai-cover">${ICONS.research}</div>
        <div class="v2-ai-top"><span class="badge badge-red">${esc(v.tag)}</span>${V.readBtn(rid)}</div>
        <div class="v2-ai-title">${esc(v.t)}</div>
        <div class="v2-ai-pick-ops">${V.mediaLink('bili', v.kw, 'B站')}${V.mediaLink('douyin', v.kw, '抖音')}</div></div>`; });
      h += `</div><div class="v2-tip-card">💡 绘图前先定好期刊的尺寸与字体要求，避免返工。点「B站 ↗」后台播放，回来勾选已看。</div>`;
    }
    h += `</div></div>`;
    return h;
  }
  window.V2VIEWS.research = renderResearch;

  function resForm(kind, obj) {
    obj = obj || {};
    if (kind === 'records') return `<div class="v2-form">
      <div class="form-group"><label>实验标题</label><input id="rf_title" class="v2-input" value="${esc(obj.title||'')}"></div>
      <div class="form-row"><div class="form-group"><label>方法</label><input id="rf_method" class="v2-input" value="${esc(obj.method||'')}"></div>
        <div class="form-group"><label>日期</label><input id="rf_date" class="v2-input" type="date" value="${esc(obj.date||today)}"></div></div>
      <div class="form-group"><label>结果</label><textarea id="rf_result" class="v2-input" rows="2">${esc(obj.result||'')}</textarea></div>
      <div class="form-group"><label>实验照片（可多张，自动压缩存储）</label>
        <input type="file" id="rf_photos" class="v2-input" accept="image/*" multiple>
        ${(obj.photos && obj.photos.length) ? `<div class="v2-photo-preview">${obj.photos.map(p => `<img src="${p}" class="v2-photo-thumb" onclick="V2Lightbox(this.src)" alt="照片">`).join('')}</div><div style="margin-top:6px"><a data-act="resClearPhotos" data-id="${esc(obj.id||'')}">清空已有照片</a></div>` : ''}
      </div>
      <div class="form-group"><label>状态</label><select id="rf_status" class="v2-input"><option ${obj.status==='已完成'?'selected':''}>已完成</option><option ${obj.status==='进行中'?'selected':''}>进行中</option></select></div>
      <div class="v2-form-actions"><button class="btn btn-primary" data-act="resSave" data-kind="records" data-id="${obj.id||''}">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`;
    if (kind === 'methods') return `<div class="v2-form">
      <div class="form-group"><label>方法名称</label><input id="rf_name" class="v2-input" value="${esc(obj.name||'')}"></div>
      <div class="form-group"><label>说明</label><textarea id="rf_desc" class="v2-input" rows="3">${esc(obj.desc||'')}</textarea></div>
      <div class="v2-form-actions"><button class="btn btn-primary" data-act="resSave" data-kind="methods" data-id="${obj.id||''}">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`;
    return `<div class="v2-form">
      <div class="form-group"><label>文献标题</label><input id="rf_title" class="v2-input" value="${esc(obj.title||'')}"></div>
      <div class="form-row"><div class="form-group"><label>来源期刊</label><input id="rf_source" class="v2-input" value="${esc(obj.source||'')}"></div>
        <div class="form-group"><label>链接</label><input id="rf_link" class="v2-input" value="${esc(obj.link||'')}"></div></div>
      <div class="form-group"><label>笔记</label><textarea id="rf_note" class="v2-input" rows="2">${esc(obj.note||'')}</textarea></div>
      <div class="v2-form-actions"><button class="btn btn-primary" data-act="resSave" data-kind="papers" data-id="${obj.id||''}">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`;
  }
  window.V2ACT.resTab = (el) => { v2set('research_tab', el.dataset.tab); render(); };
  window.V2ACT.resAdd = (el) => openForm('新增' + ({records:'实验记录',methods:'方法',papers:'文献'}[el.dataset.kind]), resForm(el.dataset.kind));
  window.V2ACT.resEdit = (el) => {
    const map = { records: 'research_records', methods: 'research_methods', papers: 'research_papers' };
    const obj = v2(map[el.dataset.kind], []).find(x => x.id === el.dataset.id);
    if (obj) openForm('编辑', resForm(el.dataset.kind, obj));
  };
  window.V2ACT.resDel = (el) => {
    if (!confirm('确定删除？')) return;
    const map = { records: 'research_records', methods: 'research_methods', papers: 'research_papers' };
    v2set(map[el.dataset.kind], v2(map[el.dataset.kind], []).filter(x => x.id !== el.dataset.id));
    toast('已删除'); render();
  };
  window.V2ACT.resFav = (el) => {
    const ps = v2('research_papers', []); const i = ps.findIndex(x => x.id === el.dataset.id);
    if (i >= 0) { ps[i].fav = !ps[i].fav; v2set('research_papers', ps); render(); }
  };
  window.V2ACT.resSave = (el) => {
    const kind = el.dataset.kind, id = el.dataset.id;
    const map = { records: 'research_records', methods: 'research_methods', papers: 'research_papers' };
    let arr = v2(map[kind], []);
    if (kind === 'records') {
      const title = gid('rf_title').value.trim();
      if (!title) { toast('请填写实验标题'); return; }
      const basePhotos = id ? ((arr.find(x => x.id === id) || {}).photos || []) : [];
      readPhotos('rf_photos', basePhotos, (photos) => {
        const obj = { title, method: gid('rf_method').value.trim(), date: gid('rf_date').value, result: gid('rf_result').value.trim(), status: gid('rf_status').value, photos: photos.slice(0, 6) };
        if (id) { const i = arr.findIndex(x => x.id === id); if (i >= 0) arr[i] = Object.assign(arr[i], obj); }
        else { obj.id = gId(); arr.push(obj); }
        v2set(map[kind], arr);
        if (typeof closeGeneric === 'function') closeGeneric();
        toast('已保存'); render();
      });
      return;
    }
    let obj;
    if (kind === 'methods') obj = { name: gid('rf_name').value.trim(), desc: gid('rf_desc').value.trim() };
    else obj = { title: gid('rf_title').value.trim(), source: gid('rf_source').value.trim(), link: gid('rf_link').value.trim(), note: gid('rf_note').value.trim(), fav: false };
    if (!obj.title && !obj.name) { toast('请填写必填项'); return; }
    if (id) { const i = arr.findIndex(x => x.id === id); if (i >= 0) arr[i] = Object.assign(arr[i], obj); }
    else { obj.id = gId(); arr.push(obj); }
    v2set(map[kind], arr);
    if (typeof closeGeneric === 'function') closeGeneric();
    toast('已保存'); render();
  };
  window.V2ACT.resClearPhotos = (el) => {
    const rec = v2('research_records', []).find(x => x.id === el.dataset.id);
    if (rec) { rec.photos = []; openForm('编辑', resForm('records', rec)); }
  };

  /* ===================== 读书推荐 ===================== */
  // 正经书单（不再掺杂雅思教材），每条有稳定 id 用于「已读」勾选与收藏
  const BOOK_RECS = [
    { id: 'atomic', title: '原子习惯', author: 'James Clear', cat: '成长', why: '用微小习惯撬动改变，复利效应改变人生', isbn: '9787535795542' },
    { id: 'rich', title: '穷爸爸富爸爸', author: 'Robert Kiyosaki', cat: '理财', why: '建立资产与现金流思维，跳出老鼠赛跑', isbn: '9787805643805' },
    { id: 'cognitive', title: '认知觉醒', author: '周岭', cat: '成长', why: '搞清自我成长的底层逻辑与元认知', isbn: '9787111639781' },
    { id: 'sapiens', title: '人类简史', author: 'Yuval Noah Harari', cat: '通识', why: '从认知革命到科学革命，拓宽视野', isbn: '9787508647357' },
    { id: 'thinking', title: '思考，快与慢', author: 'Daniel Kahneman', cat: '思维', why: '理解决策背后的两套系统', isbn: '9787508634159' },
    { id: 'influence', title: '影响力', author: 'Robert Cialdini', cat: '心理', why: '理解说服与影响力的六大原理', isbn: '9787300122257' },
    { id: 'nonviolent', title: '非暴力沟通', author: 'Marshall Rosenberg', cat: '沟通', why: '把话说进心里，化解冲突', isbn: '9787508066700' },
    { id: 'deepwork', title: '深度工作', author: 'Cal Newport', cat: '效率', why: '在分心时代保持专注力与产出', isbn: '9787508663098' },
    { id: 'story', title: '故事', author: 'Robert McKee', cat: '写作', why: '讲好一个故事的底层结构', isbn: '9787208087811' },
    { id: 'milkcoke', title: '牛奶可乐经济学', author: 'Robert Frank', cat: '经济', why: '用生活案例轻松理解经济学', isbn: '9787300073755' },
    { id: 'jobs', title: '史蒂夫·乔布斯传', author: 'Walter Isaacson', cat: '传记', why: '看创新者如何思考与取舍', isbn: '9787508630069' },
    { id: '1984', title: '一九八四', author: 'George Orwell', cat: '文学', why: '警惕权力与信息操控', isbn: '9787544708238' },
    { id: 'courage', title: '被讨厌的勇气', author: '岸见一郎', cat: '心理', why: '阿德勒心理学教你自在生活', isbn: '9787111495482' },
    { id: 'behave', title: '行为', author: 'Robert Sapolsky', cat: '生物', why: '从生物学看人类行为根源', isbn: '9787559630386' },
    { id: 'educated', title: '你当像鸟飞往你的山', author: 'Tara Westover', cat: '传记', why: '教育如何重塑一个人', isbn: '9787521704432' },
    { id: 'life3', title: '生命3.0', author: 'Max Tegmark', cat: 'AI', why: '理解人工智能与人类的未来', isbn: '9787535790134' }
  ];
  function bookRecFav(id) { const s = v2('book_rec_fav', {}); return !!s[id]; }
  function bookRecFavToggle(id) { const s = v2('book_rec_fav', {}); s[id] = !s[id]; v2set('book_rec_fav', s); }
  function renderBooks() {
    const books = v2('books', []);
    const logs = v2('book_logs', []).slice().reverse();
    const todayLog = logs.find(l => l.date === today);
    const cols = [['want', '想读'], ['reading', '在读'], ['done', '已读']];
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">读书推荐<span class="help-badge" data-help="books"></span></div>
        <div class="page-sub">正经书单 · 读书打卡 · 三点收获</div></div>
      <button class="btn btn-primary btn-sm" data-act="bookAdd" style="margin-bottom:12px">+ 添加书籍</button>
      <div class="v2-section"><div class="v2-section-title">📚 每日推荐书单 <span class="tag tag-red">每日更新 · 可听可读</span></div>`;
    const poolIds = BOOK_RECS.map(b => 'book_' + b.id);
    const picked = V.dailyPick(poolIds, 6, 1).map(id => BOOK_RECS.find(b => 'book_' + b.id === id));
    picked.forEach(b => {
      const douban = 'https://search.douban.com/book/subject_search?search_text=' + encodeURIComponent(b.title);
      const weread = 'https://weread.qq.com/search?keyword=' + encodeURIComponent(b.title);
      const rid = 'book_' + b.id;
      const coverImg = b.isbn ? `<img class="v2-book-cover" src="https://covers.openlibrary.org/b/isbn/${esc(b.isbn)}-M.jpg" alt="${esc(b.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="v2-book-cover-fb" style="display:none">${esc(b.title.slice(0,1))}</div>` : `<div class="v2-book-cover-fb">${esc(b.title.slice(0,1))}</div>`;
      h += `<div class="v2-book-rec-card">
        <div class="v2-book-rec-cover">${coverImg}</div>
        <div class="v2-book-rec-body">
          <div class="v2-book-rec-top"><div class="v2-book-rec-title">${esc(b.title)}</div>
            <span class="v2-habit-ops"><a data-act="bookRecFav" data-id="${b.id}">${bookRecFav(b.id) ? '★已收藏' : '☆收藏'}</a><a data-act="bookAddRec" data-id="${b.id}">＋书单</a></span></div>
          <div class="v2-book-rec-meta">${esc(b.author)} · <span class="tag tag-blue">${esc(b.cat)}</span></div>
          <div class="v2-book-rec-why">${esc(b.why)}</div>
          <div class="v2-book-rec-links">
            <a href="${douban}" target="_blank" rel="noopener" class="v2-book-rec-link">豆瓣 ↗</a>
            <a href="${weread}" target="_blank" rel="noopener" class="v2-book-rec-link">微信读书 ↗</a>
            ${V.readBtn(rid)}
          </div>
        </div>
      </div>`;
    });
    h += `</div>`;
    h += `<div class="v2-book-cols">`;
    cols.forEach(c => {
      h += `<div class="v2-book-col"><div class="v2-book-col-h">${c[1]} <span class="badge badge-gray">${books.filter(b => b.status === c[0]).length}</span></div>`;
      books.filter(b => b.status === c[0]).forEach(b => {
        h += `<div class="v2-book-card">
          <div class="v2-book-title">${esc(b.title)}</div>
          <div class="v2-book-author">${esc(b.author || '佚名')}</div>
          <div class="v2-book-tags"><span class="tag tag-blue">${esc(b.cat || '')}</span></div>
          <div class="v2-book-note">${esc(b.note || '')}</div>
          <div class="v2-book-ops">
            ${b.text ? `<a data-act="bookRead" data-id="${b.id}">📖 阅读</a>` : ''}
            <select class="v2-mini-sel" data-act="bookMove" data-id="${b.id}">
              <option value="want" ${b.status==='want'?'selected':''}>想读</option>
              <option value="reading" ${b.status==='reading'?'selected':''}>在读</option>
              <option value="done" ${b.status==='done'?'selected':''}>已读</option>
            </select>
            <a data-act="bookDel" data-id="${b.id}">删除</a></div></div>`;
      });
      if (!books.filter(b => b.status === c[0]).length) h += `<div class="v2-book-empty">暂无</div>`;
      h += `</div>`;
    });
    h += `</div>`;

    h += `<div class="v2-section"><div class="v2-section-title">读书打卡 · 今日三点收获</div>`;
    h += `<div class="v2-form"><div class="form-group"><label>日期</label><input id="bk_date" class="v2-input" type="date" value="${today}"></div>
      <div class="form-group"><label>今天的 3 点收获</label><textarea id="bk_gain" class="v2-input" rows="3" placeholder="1.&#10;2.&#10;3.">${esc(todayLog ? todayLog.gain : '')}</textarea></div>
      <button class="btn btn-primary" data-act="bookLog">保存打卡</button></div>`;
    if (logs.length) {
      h += `<div class="v2-log-list">`;
      logs.slice(0, 5).forEach(l => h += `<div class="v2-log-item"><span class="v2-log-date">${fmtDate(l.date)}</span><span class="v2-log-text">${esc(l.gain)}</span></div>`);
      h += `</div>`;
    }
    h += `</div></div>`;
    return h;
  }
  window.V2VIEWS.books = renderBooks;
  window.V2ACT.bookAdd = () => openForm('添加书籍', `<div class="v2-form">
    <div class="form-group"><label>书名</label><input id="bk_title" class="v2-input"></div>
    <div class="form-row"><div class="form-group"><label>作者</label><input id="bk_author" class="v2-input"></div>
      <div class="form-group"><label>分类</label><input id="bk_cat" class="v2-input" placeholder="心理/经济…"></div></div>
    <div class="form-group"><label>状态</label><select id="bk_status" class="v2-input"><option value="want">想读</option><option value="reading" selected>在读</option><option value="done">已读</option></select></div>
    <div class="form-group"><label>电子书正文（粘贴或下方上传 .txt/.md，保存后可点「阅读」真正阅读）</label><textarea id="bk_text" class="v2-input" rows="4" placeholder="把书里的内容粘贴到这里…"></textarea></div>
    <div class="form-group"><label>上传电子书文件</label><input id="bk_file" type="file" accept=".txt,.md,text/plain" class="v2-input" onchange="bookFileToText(this)"></div>
    <div class="form-group"><label>笔记</label><textarea id="bk_note" class="v2-input" rows="2"></textarea></div>
    <div class="v2-form-actions"><button class="btn btn-primary" data-act="bookSave">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`);
  window.bookFileToText = (input) => {
    const f = input.files && input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { const t = gid('bk_text'); if (t) t.value = r.result; toast('已读取文件文本'); };
    r.readAsText(f);
  };
  window.V2ACT.bookSave = () => {
    const title = gid('bk_title').value.trim(); if (!title) { toast('请填写书名'); return; }
    const books = v2('books', []); books.push({ id: gId(), title, author: gid('bk_author').value.trim(), cat: gid('bk_cat').value.trim(), status: gid('bk_status').value, note: gid('bk_note').value.trim(), text: gid('bk_text').value.trim() });
    v2set('books', books); if (typeof closeGeneric === 'function') closeGeneric(); toast('已添加'); render();
  };
  window.V2ACT.bookRecFav = (el) => { bookRecFavToggle(el.dataset.id); render(); };
  window.V2ACT.bookAddRec = (el) => {
    const b = BOOK_RECS.find(x => x.id === el.dataset.id); if (!b) return;
    const books = v2('books', []);
    if (books.some(x => x.title === b.title)) { toast('书单里已有《' + b.title + '》'); return; }
    books.push({ id: gId(), title: b.title, author: b.author, cat: b.cat, status: 'want', note: '', text: '' });
    v2set('books', books); toast('已加入书单《' + b.title + '》'); render();
  };
  window.V2ACT.bookMove = (el) => {
    const books = v2('books', []); const b = books.find(x => x.id === el.dataset.id);
    if (b) { b.status = el.value; v2set('books', books); toast('已更新状态'); render(); }
  };
  window.V2ACT.bookDel = (el) => { if (!confirm('删除该书？')) return; v2set('books', v2('books', []).filter(x => x.id !== el.dataset.id)); toast('已删除'); render(); };
  window.V2ACT.bookLog = () => {
    const gain = gid('bk_gain').value.trim(); const date = gid('bk_date').value || today;
    if (!gain) { toast('写点收获吧'); return; }
    let logs = v2('book_logs', []); const i = logs.findIndex(l => l.date === date);
    if (i >= 0) logs[i].gain = gain; else logs.push({ id: gId(), date, gain });
    v2set('book_logs', logs); toast('打卡成功 ✓'); render();
  };
  window.V2ACT.bookRead = (el) => {
    const b = v2('books', []).find(x => x.id === el.dataset.id);
    if (!b || !b.text) { toast('该书暂无正文，先在编辑中粘贴/上传'); return; }
    showGeneric('📖 ' + b.title, `<div style="max-height:58vh;overflow:auto;line-height:1.9;font-size:14px;white-space:pre-wrap;padding:4px;color:var(--text-primary)">${esc(b.text)}</div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary btn-sm" data-act="bookReadDone" data-id="${b.id}" data-len="${b.text.length}">标记今日已读（+${b.text.length}字）</button></div>`);
  };
  window.V2ACT.bookReadDone = (el) => {
    const b = v2('books', []).find(x => x.id === el.dataset.id); if (!b) return;
    const len = parseInt(el.dataset.len || '0', 10);
    let logs = v2('book_logs', []); const i = logs.findIndex(l => l.date === today);
    const gain = '阅读《' + b.title + '》' + len + '字';
    if (i >= 0) logs[i].gain = (logs[i].gain ? logs[i].gain + '；' : '') + gain; else logs.push({ id: gId(), date: today, gain });
    v2set('book_logs', logs); if (typeof closeGeneric === 'function') closeGeneric(); toast('已记录阅读 ✓'); render();
  };

  /* ===================== 播客精选 ===================== */
  // 每日播客推荐池（优先唤起喜马拉雅 App，失败 fallback 到网页搜索）
  const PODCAST_RECS = [
    { title: '英语播客精听合集（磨耳朵）', kw: '英语播客 精听', desc: '适合雅思听力与口语，地道发音素材' },
    { title: '雅思口语高频话题陪练', kw: '雅思口语 播客', desc: 'Part1-3 话题实战演练' },
    { title: '商业财经洞察播客', kw: '商业财经 播客', desc: '理解经济与搞钱逻辑' },
    { title: '个人成长与自律', kw: '个人成长 播客', desc: '习惯、效率与认知升级' },
    { title: '科技前沿聊播客', kw: '科技 播客', desc: 'AI 与前沿科技解读' },
    { title: '水产与农业科普', kw: '水产养殖 科普', desc: '专业相关的行业动态' }
  ];
  function openPodcastLink(title, link) {
    if (!link) { toast('该单集暂无链接'); return; }
    if (link.includes('ximalaya.com') && typeof window.tryOpenApp === 'function') {
      window.tryOpenApp('ximalaya://search?keyword=' + encodeURIComponent(title || ''), link);
    } else {
      window.open(link, '_blank');
    }
  }
  function renderPodcast() {
    const ps = v2('podcasts', []);
    const collected = ps.filter(p => p.collected).length;
    const todayLog = ps.find(p => p.date === today && p.gain);
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">播客精选<span class="help-badge" data-help="podcast"></span></div>
        <div class="page-sub">单集收藏 · 边听边记 · 每日收获</div></div>
      <div class="overview-grid">
        <div class="overview-card"><div class="overview-value">${ps.length}</div><div class="overview-label">单集总数</div></div>
        <div class="overview-card"><div class="overview-value">${collected}</div><div class="overview-label">已收藏</div></div>
        <div class="overview-card"><div class="overview-value">${ps.filter(p=>p.gain).length}</div><div class="overview-label">已记收获</div></div>
        <div class="overview-card"><div class="overview-value">${todayLog ? '✓' : '—'}</div><div class="overview-label">今日收获</div></div>
      </div>
      <div class="v2-section"><div class="v2-section-title">🎧 今日播客推荐 <span class="tag tag-red">每日更新</span></div>`;
    const podPoolIds = PODCAST_RECS.map((p, i) => 'pod_' + i);
    const podPicked = V.dailyPick(podPoolIds, 3, 2).map(id => PODCAST_RECS[Number(id.split('_')[1])]);
    podPicked.forEach((p) => {
      const url = 'https://www.ximalaya.com/search?q=' + encodeURIComponent(p.kw);
      const scheme = 'ximalaya://search?keyword=' + encodeURIComponent(p.kw);
      const rid = 'pod_' + PODCAST_RECS.indexOf(p);
      h += `<div class="v2-vocab-row"><div class="v2-vocab-body">
        <div class="v2-vocab-word" style="font-size:14px">${esc(p.title)}</div>
        <div class="v2-vocab-mean">${esc(p.desc)}</div>
        <a href="#" onclick="window.tryOpenApp('${scheme}', '${url}'); return false;" class="v2-listen-btn">▶ 用喜马拉雅 App 收听</a>
        ${V.readBtn(rid)}
      </div></div>`;
    });
    h += `</div>
      <div class="v2-tip-card">💡 点「收听」优先唤起你手机里的喜马拉雅 App；如果手机没装，会自动打开网页版搜索。</div>
      <button class="btn btn-primary btn-sm" data-act="podAdd" style="margin:12px 0">+ 添加单集</button>
      <div class="v2-pod-list">`;
    ps.slice().reverse().forEach(p => {
      h += `<div class="v2-pod-card">
        <div class="v2-pod-top"><div><div class="v2-pod-title">${esc(p.title)}</div>
          <div class="v2-pod-meta">${esc(p.show)} · ${esc(p.host || '')} · ${fmtDate(p.date)}</div></div>
          <a class="v2-pod-fav" data-act="podFav" data-id="${p.id}">${p.collected ? '★' : '☆'}</a></div>
        <div class="v2-pod-row"><label>我的收获</label><textarea class="v2-input v2-input-sm" data-act="podGain" data-id="${p.id}" rows="2" placeholder="听到的一句话/一个观点…">${esc(p.gain || '')}</textarea></div>
        <div class="v2-pod-ops">${p.link ? `<a href="#" data-act="podOpen" data-id="${p.id}" class="v2-pod-listen">▶ 收听</a>` : `<span class="v2-pod-nolink">暂无链接</span>`}<a data-act="podDel" data-id="${p.id}">删除</a></div>
      </div>`;
    });
    if (!ps.length) h += `<div class="empty"><div class="empty-text">还没有收藏的单集</div></div>`;
    h += `</div></div>`;
    return h;
  }
  window.V2VIEWS.podcast = renderPodcast;
  window.V2ACT.podAdd = () => openForm('添加单集', `<div class="v2-form">
    <div class="form-group"><label>单集标题</label><input id="pd_title" class="v2-input"></div>
    <div class="form-row"><div class="form-group"><label>节目</label><input id="pd_show" class="v2-input"></div><div class="form-group"><label>主播</label><input id="pd_host" class="v2-input"></div></div>
    <div class="form-group"><label>链接</label><input id="pd_link" class="v2-input" placeholder="收听地址，不填则默认用标题搜索喜马拉雅"></div>
    <div class="v2-form-actions"><button class="btn btn-primary" data-act="podSave">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`);
  window.V2ACT.podSave = () => {
    const title = gid('pd_title').value.trim(); if (!title) { toast('请填写标题'); return; }
    let link = gid('pd_link').value.trim();
    if (!link) link = 'https://www.ximalaya.com/search?q=' + encodeURIComponent(title);
    const ps = v2('podcasts', []); ps.push({ id: gId(), title, show: gid('pd_show').value.trim(), host: gid('pd_host').value.trim(), link, collected: false, date: today, gain: '' });
    v2set('podcasts', ps); if (typeof closeGeneric === 'function') closeGeneric(); toast('已添加'); render();
  };
  window.V2ACT.podFav = (el) => { const ps = v2('podcasts', []); const i = ps.findIndex(x => x.id === el.dataset.id); if (i >= 0) { ps[i].collected = !ps[i].collected; v2set('podcasts', ps); render(); } };
  window.V2ACT.podGain = (el) => { const ps = v2('podcasts', []); const i = ps.findIndex(x => x.id === el.dataset.id); if (i >= 0) { ps[i].gain = el.value; v2set('podcasts', ps); } };
  window.V2ACT.podOpen = (el) => { const p = v2('podcasts', []).find(x => x.id === el.dataset.id); openPodcastLink(p && p.title, p && p.link); };
  window.V2ACT.podDel = (el) => { if (!confirm('删除该单集？')) return; v2set('podcasts', v2('podcasts', []).filter(x => x.id !== el.dataset.id)); toast('已删除'); render(); };

  /* ===================== 新闻资讯 ===================== */
  function renderNews() {
    const sources = v2('news_sources', []);
    const cat = v2('news_cat', '综合');
    const cats = ['综合', '财经', '科技', '社会'];
    const mine = v2('news', []).filter(n => n.collected || n.liked);
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">新闻资讯<span class="help-badge" data-help="news"></span></div>
        <div class="page-sub">实时聚合要闻 <span id="newsStatus" class="v2-live-badge">…</span></div></div>
      <div class="v2-guide-card"><div class="v2-guide-icon">${ICONS.news}</div>
        <div><b>为你实时聚合要闻</b><br><span style="color:var(--text-light)">点「收藏」可沉淀重要信息到「我的资讯库」。</span></div>
        <button class="btn btn-outline btn-sm" data-act="newsRefresh">刷新</button></div>
      <div class="v2-cat-chips">`;
    cats.forEach(c => h += `<span class="v2-chip${cat === c ? ' on' : ''}" data-act="newsCat" data-cat="${c}">${c}</span>`);
    h += `</div><div class="v2-news-list" id="newsLive"><div class="empty"><div class="empty-text">正在加载实时新闻…</div></div></div>`;
    h += `<div class="v2-section"><div class="v2-section-title">我的资讯库（${mine.length}）</div>`;
    if (mine.length) {
      h += `<div class="v2-news-list">`;
      mine.forEach(n => {
        h += `<div class="v2-news-card"><div class="v2-news-top"><span class="tag tag-red">${esc(n.cat)}</span><span class="v2-news-src">${esc(n.source)} · ${fmtDate(n.date)}</span></div>
          <div class="v2-news-title">${esc(n.title)}</div>
          <div class="v2-news-ops">${n.link ? `<a href="${esc(n.link)}" target="_blank" rel="noreferrer">原文 ↗</a>` : ''}${V.readBtn('newsmy_' + n.id)}<a data-act="newsDelMine" data-id="${n.id}">删除</a></div></div>`;
      });
      h += `</div>`;
    } else h += `<div class="empty"><div class="empty-text">收藏的新闻会在这里沉淀</div></div>`;
    h += `</div>`;
    h += `<div class="v2-section"><div class="v2-section-title">信息源推荐</div><div class="v2-src-list">`;
    sources.forEach(s => h += `<div class="v2-src-item"><b>${esc(s.name)}</b><span>${esc(s.desc)}</span></div>`);
    h += `</div></div></div>`;
    return h;
  }
  window.V2VIEWS.news = renderNews;
  window.V2ACT.newsCat = (el) => { v2set('news_cat', el.dataset.cat); render(); if (window.V3) window.V3.loadNews(true, el.dataset.cat); };
  window.V2ACT.newsDelMine = (el) => { if (!confirm('删除该收藏？')) return; v2set('news', v2('news', []).filter(n => n.id !== el.dataset.id)); toast('已删除'); render(); };
  window.V2ACT.newsRefresh = () => {
    if (window.V3) { window.V3.loadNews(true, v2('news_cat', '综合')); return; }
    const ns = v2('news', []); ns.unshift({ id: gId(), title: '商务部：进一步扩大高水平对外开放新举措出炉', source: '财经早报', cat: '收藏', link: '', liked: false, collected: true, shared: false, date: today, isNew: true });
    v2set('news', ns); toast('已刷新，1 条新推送'); render();
  };

  /* ===================== AI学习 ===================== */
  // 理论组成（每日轮换，优先未读）
  const AI_THEORY = [
    { id: 'ml', t: '机器学习入门', d: '监督 / 无监督 / 强化学习三大范式，以及它们分别解决什么问题。', kw: '机器学习 入门 小白' },
    { id: 'dl', t: '深度学习与神经网络', d: '从感知机到多层网络，理解「层数越深，表达越强」。', kw: '深度学习 神经网络 入门' },
    { id: 'trans', t: 'Transformer 架构', d: '注意力机制如何取代 RNN，成为大模型基石。', kw: 'Transformer 注意力机制 讲解' },
    { id: 'pt', t: '预训练与微调', d: '大模型「先广泛学、再针对性练」的两阶段范式。', kw: '预训练 微调 大模型' },
    { id: 'prompt', t: '提示词工程', d: '怎么跟模型对话最有效：角色、任务、约束、示例。', kw: '提示词工程 技巧 教程' },
    { id: 'rag', t: '检索增强 RAG', d: '让模型先查资料再回答，缓解幻觉、接私有知识。', kw: 'RAG 检索增强生成 实战' },
    { id: 'agent', t: '智能体 Agent', d: '让 AI 自己规划→调用工具→执行闭环任务。', kw: 'AI智能体 搭建 教程' },
    { id: 'multi', t: '多模态', d: '图文音视频统一理解与生成，跨界内容生产关键。', kw: '多模态 大模型 入门' },
    { id: 'diff', t: '扩散模型', d: 'AI 绘画背后的数学：从噪声逐步「雕刻」出图像。', kw: '扩散模型 原理 讲解' },
    { id: 'rl', t: '强化学习', d: '从奖励信号中学习策略，AlphaGo 的核心思想。', kw: '强化学习 入门' },
    { id: 'quant', t: '模型量化与部署', d: '把大模型压缩到能跑在本地 / 手机上。', kw: '模型量化 本地部署 教程' },
    { id: 'vecdb', t: '向量数据库', d: '给 AI 装一个「语义记忆」，支撑检索与去重。', kw: '向量数据库 入门' }
  ];
  // 应用实战（每日轮换，优先未读）
  const AI_APP = [
    { id: 'paint', t: 'AI 绘画', d: 'Midjourney / Stable Diffusion 出图流程与提示词套路。', kw: 'AI绘画 实战 教程' },
    { id: 'copy', t: 'AI 写文案', d: '自媒体标题、脚本、种草文的批量生成与润色。', kw: 'AI 写文案 教程' },
    { id: 'cut', t: 'AI 剪辑', d: '自动字幕、粗剪与成片，大幅压缩视频生产时间。', kw: 'AI 视频剪辑 教程' },
    { id: 'digital', t: 'AI 数字人', d: '口播视频批量生成，一个人就是一支团队。', kw: '数字人 带货 教程' },
    { id: 'code', t: 'AI 编程助手', d: 'Cursor / Copilot 提效，从补全到自主改代码。', kw: 'AI 编程 Cursor 教程' },
    { id: 'ppt', t: 'AI 做 PPT', d: '一句话生成演示大纲与排版，汇报不再熬夜。', kw: 'AI 做PPT 教程' },
    { id: 'kf', t: 'AI 客服 / 私域', d: '自动回复与分流，把重复咨询交给机器人。', kw: 'AI 客服 搭建' },
    { id: 'research', t: 'AI 投研', d: '用模型读财报、提炼要点，辅助理财决策。', kw: 'AI 投资研究 教程' },
    { id: 'flow', t: '智能体工作流', d: '把重复任务串成自动化流水线，省下时间做副业。', kw: '智能体 工作流 自动化' },
    { id: 'trans', t: 'AI 翻译校对', d: '多语言内容生产、双语字幕与本地化。', kw: 'AI 翻译 校对' },
    { id: 'voice', t: 'AI 语音克隆', d: '配音与有声书量产，统一你的声音 IP。', kw: 'AI 语音克隆 教程' },
    { id: 'kb', t: '个人知识库', d: '用 AI 搭第二大脑，资料随问随答。', kw: '个人知识库 AI 搭建' }
  ];
  function renderAI() {
    const cat = v2('ai_cat', '全部');
    const courses = v2('ai_courses', []);
    const cats = ['全部'].concat([...new Set(courses.map(c => c.cat))]);
    const list = cat === '全部' ? courses : courses.filter(c => c.cat === cat);
    // 每日理论 / 应用各 3 条（按本地自然日轮换）
    const theoryPicked = V.dailyPick(AI_THEORY.map(x => 'ai_th_' + x.id), 3, 3).map(id => AI_THEORY.find(x => 'ai_th_' + x.id === id));
    const appPicked = V.dailyPick(AI_APP.map(x => 'ai_ap_' + x.id), 3, 4).map(id => AI_APP.find(x => 'ai_ap_' + x.id === id));
    // 今日推荐视频（按日期确定性轮换）
    const aiDailyPool = [
      { t: '零基础学 AI 绘画', kw: 'AI绘画 零基础入门', tag: '多模态' },
      { t: '大模型到底怎么用', kw: '大模型 使用技巧', tag: '提示词' },
      { t: '10 分钟搭一个智能体', kw: 'AI智能体 搭建教程', tag: '智能体' },
      { t: '用 AI 做自媒体内容', kw: 'AI 自媒体 内容创作', tag: '实战' },
      { t: 'RAG 从原理到上手', kw: 'RAG 检索增强生成 实战', tag: '检索增强' },
      { t: 'Python 自动化办公', kw: 'Python 自动化办公 教程', tag: '效率' },
      { t: '数字人带货新玩法', kw: '数字人 带货 教程', tag: '实战' }
    ];
    const aiVideos = (window.Daily && window.Daily.get('ai_videos', null)) || [];
    const aiDay = Math.floor(Date.now() / 86400000);
    const aiRec = aiVideos.length ? aiVideos[aiDay % aiVideos.length] : (aiDailyPool[aiDay % aiDailyPool.length]);
    const aiRecUrl = aiRec.bvid ? ('https://www.bilibili.com/video/' + aiRec.bvid) : ('https://search.bilibili.com/all?keyword=' + encodeURIComponent(aiRec.kw));
    let h = `<div class="page">
      <div class="page-head"><div class="page-title">AI学习<span class="help-badge" data-help="ai"></span></div>
        <div class="page-sub">系统化教程 · 每日精进 · 已学追踪</div></div>
      <div class="v2-section"><div class="v2-section-title">🚀 AI 前沿动态
        <button class="btn btn-outline btn-sm" data-act="aiFrontier" style="float:right">用 AI 生成今日摘要</button></div>
        <div id="aiFrontierBox" class="v2-tip-card v2-frontier">${esc(v2('ai_frontier', '点右侧按钮，用你在「设置 → AI 模型」里配置的模型，把最新 AI 资讯浓缩成一份千字速览（需先配置至少一个模型，支持多个）。'))}</div>
      </div>
      <div class="v2-ai-cols">
        <div class="v2-ai-col"><div class="v2-section-title">🧠 AI 整体组成（理论）</div><div class="v2-ai-pick-list">`;
    theoryPicked.forEach(x => { const rid = 'ai_th_' + x.id; h += `<div class="v2-ai-pick">
        <div class="v2-ai-pick-body"><div class="v2-ai-pick-title">${esc(x.t)}</div><div class="v2-ai-pick-desc">${esc(x.d)}</div></div>
        <div class="v2-ai-pick-ops"><a class="btn btn-outline btn-xs" href="https://search.bilibili.com/all?keyword=${encodeURIComponent(x.kw)}" target="_blank" rel="noopener">B站 ↗</a>${V.readBtn(rid)}</div></div>`; });
    h += `</div></div>
        <div class="v2-ai-col"><div class="v2-section-title">🛠️ AI 应用实战</div><div class="v2-ai-pick-list">`;
    appPicked.forEach(x => { const rid = 'ai_ap_' + x.id; h += `<div class="v2-ai-pick">
        <div class="v2-ai-pick-body"><div class="v2-ai-pick-title">${esc(x.t)}</div><div class="v2-ai-pick-desc">${esc(x.d)}</div></div>
        <div class="v2-ai-pick-ops"><a class="btn btn-outline btn-xs" href="https://search.bilibili.com/all?keyword=${encodeURIComponent(x.kw)}" target="_blank" rel="noopener">B站 ↗</a>${V.readBtn(rid)}</div></div>`; });
    h += `</div></div>
      </div>
      <div class="v2-ai-daily">
        <div class="v2-ai-daily-tag">📺 今日推荐视频 · ${todayStr()}</div>
        <div class="v2-ai-daily-body">
          <div class="v2-ai-daily-info"><div class="v2-ai-daily-title">${esc(aiRec.t)}</div><div class="v2-ai-daily-sub">分类：${esc(aiRec.tag)} · 点击直达 B站 视频合集</div></div>
          <a class="btn btn-primary btn-sm" href="${aiRecUrl}" target="_blank" rel="noopener">看视频 ↗</a>
        </div>
      </div>
      <div class="v2-cat-scroll">`;
    cats.forEach(c => h += `<span class="v2-chip${cat === c ? ' on' : ''}" data-act="aiCat" data-cat="${c}">${c}</span>`);
    h += `</div><div class="v2-ai-grid">`;
    list.forEach(c => {
      h += `<div class="v2-ai-card">
        <div class="v2-ai-cover">${ICONS.ai}</div>
        <div class="v2-ai-top"><span class="badge badge-red">${esc(c.level)}</span>
          <a class="v2-ai-learned" data-act="aiLearned" data-id="${c.id}">${c.learned ? '✓ 已学' : '标记已学'}</a></div>
        <div class="v2-ai-title">${esc(c.title)}</div>
        <div class="v2-ai-meta">${esc(c.cat)} · 来源：${esc(c.source || '—')}</div>
        ${c.link ? `<a class="v2-ai-link" data-act="aiOpen" data-id="${c.id}">前往学习 ↗</a>` : ''}
      </div>`;
    });
    if (!list.length) h += `<div class="empty"><div class="empty-text">该分类暂无教程</div></div>`;
    h += `</div></div>`;
    return h;
  }
  window.V2VIEWS.ai = renderAI;
  window.V2ACT.aiCat = (el) => { v2set('ai_cat', el.dataset.cat); render(); };
  window.V2ACT.aiLearned = (el) => { const cs = v2('ai_courses', []); const i = cs.findIndex(x => x.id === el.dataset.id); if (i >= 0) { cs[i].learned = !cs[i].learned; v2set('ai_courses', cs); render(); } };
  window.V2ACT.aiOpen = (el) => { const c = v2('ai_courses', []).find(x => x.id === el.dataset.id); if (c && c.link) window.open(c.link, '_blank'); else toast('暂未配置链接'); };
  window.V2ACT.aiFrontier = async () => {
    const box = gid('aiFrontierBox');
    if (box) box.textContent = '正在生成…（首次可能需数秒）';
    try {
      const p = window.AI.def();
      if (!p) { if (box) box.textContent = '尚未配置 AI 模型，请先到「设置 → AI 模型」添加（支持多个），再回来生成摘要。'; return; }
      const news = v2('news', []).filter(n => /AI|大模型|智能|算力|芯片|机器人/.test(n.title)).slice(0, 12).map(n => n.title).join('\n');
      const sys = '你是 AI 行业分析师。把下面资讯整理成约 800 字中文速览，分「今天发生了什么 / 为什么重要 / 普通人能做什么（尤其副业者）」三段。只输出正文，不要标题。';
      const user = '资讯列表：\n' + (news || '（本地暂无相关新闻，请基于你已知的近期 AI 进展，撰写一份通用速览）');
      const txt = await window.AI.call([{ role: 'system', content: sys }, { role: 'user', content: user }], { temp: 0.6 });
      v2set('ai_frontier', txt); if (box) box.textContent = txt; toast('已生成今日摘要');
    } catch (e) { if (box) box.textContent = '生成失败：' + e.message + '（请检查 API 配置 / Base 地址 / 网络，或稍后重试）'; }
  };

  /* ===================== 表达能力 ===================== */
  // 话术技巧种子库：参考用户截图结构——分类 Tab + 方法名 + 方法讲解 + 场景话术
  // 每日从池中轮换 10 条，未读可重复推荐；每条配「话术标签」「方法讲解」「场景话术」「已读勾选」
  const EXPRESS_SEED = [
    { cat: '日常表达', tag: '拒绝话术', title: '三明治拒绝法', method: '先肯定对方需求，再温和说明难处，最后给替代方案或祝福。拒绝的是事，不是人。', scene: '「谢谢你想到我（肯定），不过这周我排满了实在分不出身（难处），下次有合适的我第一时间来支持（祝福）。」' },
    { cat: '日常表达', tag: '拒绝话术', title: '用「暂时」替代生硬的「不」', method: '「暂时不行」比「不行」留有余地，也显得你是被状态而非态度挡住，关系更软。', scene: '同事临时甩活：「这个我暂时接不过来，等我把手头这份交了再看看？」' },
    { cat: '日常表达', tag: '感谢话术', title: '感谢要具体到行为', method: '说出对方做了什么、对你产生了什么影响，比一句「谢谢」更有温度、更让人愿意继续帮你。', scene: '「昨天你帮我改那页 PPT，客户那边一次就过了，真的帮了大忙，谢啦！」' },
    { cat: '日常表达', tag: '破冰话术', title: '用环境/共同点破冰', method: '开放式问题或聊当下共同场景，把话题自然抛给对方，避免查户口式提问。', scene: '「你也是来听这场分享的吧？刚才讲的那块方法论，你之前用过吗？」' },
    { cat: '日常表达', tag: '异议话术', title: '先接后转表达不同意见', method: '先认同对方合理部分，再用「我理解你的角度，不过换个角度看…」过渡，避免对立感。', scene: '「你说得对，成本确实要控。不过从长期看，这笔投入能省后面返工，反而更划算。」' },
    { cat: '日常表达', tag: '求助话术', title: '请求帮助不卑不亢', method: '说明背景 + 具体需求 + 你的感谢或回报，降低对方心理负担，也让他觉得被尊重。', scene: '「我在赶一个明天要交的报告，能不能借你那本统计书用一下？用完马上还，谢谢你！」' },
    { cat: '日常表达', tag: '安慰话术', title: '先共情再给建议', method: '情绪低落时，少给解决方案，多用「我在听」「这确实挺难受的」接住情绪。', scene: '「听你这么说真的挺不容易的，我陪你坐会儿，想说就说，不想说也没关系。」' },
    { cat: '日常表达', tag: '赞美话术', title: '把赞美落到具体观察', method: '把「你好棒」换成具体事件 + 你的感受，让赞美可信又有记忆点。', scene: '「你今天处理那个突发状况特别稳，换我估计就慌了，学到了。」' },
    { cat: '日常表达', tag: '求助话术', title: '借东西时给明确归还时间', method: '借东西最怕没下文。开口时直接说什么时候还、怎么还，对方更放心。', scene: '「能借你的卷发棒用一下吗？我周六用完就带给你，或者你方便的时候我来拿。」' },
    { cat: '职场表达', tag: '汇报话术', title: '结论先行 10 秒讲清楚', method: 'BLUF（Bottom Line Up Front）：先说结果/建议，再补数据和过程，让领导 10 秒抓住核心。', scene: '「这个月转化率涨了 12%，主要靠新话术。下一步我建议复制到 B 组，预计再提 5%。」' },
    { cat: '职场表达', tag: '说服话术', title: '用投入—产出—风险说服', method: '请求资源或预算时，量化收益、降低决策者顾虑，用数字说话。', scene: '「加这一个工具，前期投入约 2 千，但每月能省 10 个人工时，两个月回本。」' },
    { cat: '职场表达', tag: '接受批评', title: '接受批评不 defensive', method: '先接纳事实、复述要点表示听懂，再说明改进动作，不急着辩解。', scene: '「你说得对，这版确实漏了风险页。我下午补上，下次出稿前先过一遍清单。」' },
    { cat: '职场表达', tag: '向上管理', title: '把需求翻译成业务语言', method: '向上管理提需求时，把「我想要的」翻译成「对目标有帮助的」，用业务语言谈。', scene: '「为了把交付质量稳住，我希望每周能有两个不受打扰的专注半天，预计能少出 30% 的返工。」' },
    { cat: '职场表达', tag: '会议话术', title: '会议控场三件套', method: '开场定「目标—议程—时间盒」，冷场时点最相关的人，跑题时温柔拉回。', scene: '「今天目标定两件事，各 15 分钟。刚才聊到第三点，我们先记下来，回到第二点。」' },
    { cat: '职场表达', tag: '邮件话术', title: '邮件正文三段式', method: '主题一句话结论；正文用「背景—需求—时间」；重要信息加粗，降低阅读成本。', scene: '「【请确认】周五上线方案：背景是活动提前，需你今天 18 点前确认排期，否则顺延。」' },
    { cat: '职场表达', tag: '谈薪话术', title: '报价给区间不给死价', method: '先展示价值与市场对标，再给区间，留博弈空间；用「基于…所以」逻辑支撑。', scene: '「参考同岗位市场区间和我的产出，期望在 X–Y。这个区间也能覆盖我接下来负责的三个项目。」' },
    { cat: '职场表达', tag: '协作话术', title: '找到对方的利益点推事', method: '跨部门协作时，把任务包装成「一起达成某个共同目标」，而不是单纯求人。', scene: '「你们的曝光能借这次活动涨一波，我这边出内容，咱们搭个便车互相带。」' },
    { cat: '职场表达', tag: '拒绝话术', title: '职场拒绝给替代人选', method: '拒绝时给另一个能帮忙的人或方向，显得你不是推诿，而是在解决问题。', scene: '「这块我不太熟，怕耽误你进度。你问问运营组的小王，她刚做过类似项目。」' },
    { cat: '职场表达', tag: '反馈话术', title: '反馈用 SBI 模型', method: 'Situation（情境）+ Behavior（行为）+ Impact（影响），具体不伤人。', scene: '「刚才开会时（S），你打断客户三次（B），我感觉客户有点没讲完，可能影响信任感（I）。」' },
    { cat: '日常表达', tag: '分享话术', title: '分享好消息先铺垫', method: '先低调铺垫再公布，避免显得炫耀；顺带感谢相关的人，拉近距离。', scene: '「悄悄说，我面试过了！多亏你上次帮我模拟，太感谢啦～」' }
  ];
  function ensureExpressSeed() {
    let cur = v2('express_skills', null);
    const fresh = EXPRESS_SEED.map((s, i) => Object.assign({ id: 'ex' + (i + 1) }, s));
    if (!cur) {
      v2set('express_skills', fresh);
      return;
    }
    // 结构升级：旧版用 content 字段，新版用 method + tag；保留收藏/已读状态
    if (cur.length && cur[0].content !== undefined && cur[0].method === undefined) {
      const oldMap = {};
      cur.forEach(o => { oldMap[o.id] = o; });
      v2set('express_skills', fresh.map(n => {
        const o = oldMap[n.id];
        return o ? Object.assign({}, n, { fav: o.fav, collected: o.collected }) : n;
      }));
    }
  }
  function renderExpress() {
    ensureExpressSeed();
    const tab = v2('express_tab', 'daily');
    const skillsAll = v2('express_skills', []);
    const filter = v2('express_filter', '全部');
    const kw = (v2('express_search', '') || '').trim().toLowerCase();
    const cats = ['全部'].concat([...new Set(skillsAll.map(s => s.cat))]);

    // 每日从全池轮换 10 条；本地自然日，明日自动换
    const perDay = 10;
    const pickedIds = V.dailyPick(skillsAll.map(s => s.id), perDay, 1);
    let list = pickedIds.map(id => skillsAll.find(s => s.id === id)).filter(Boolean);

    // Tab 筛选
    if (filter !== '全部') list = list.filter(s => s.cat === filter);
    // 搜索（在今日推荐里搜；如果没匹配，提示换关键词）
    if (kw) list = list.filter(s => (s.tag + s.title + s.method + s.scene).toLowerCase().includes(kw));

    let h = `<div class="page">
      <div class="page-head"><div class="page-title">表达能力<span class="help-badge" data-help="express"></span></div>
        <div class="page-sub">每日更新 ${perDay} 条沟通技巧 · 提升说话方式</div></div>
      <div class="switch-tabs">
        <div class="tab-btn${tab==='daily'?' active':''}" data-act="exTab" data-tab="daily">${ICONS ? '' : ''}每日推荐</div>
        <div class="tab-btn${tab==='all'?' active':''}" data-act="exTab" data-tab="all">全部话术</div></div>
      <div class="v2-tab-body">`;

    if (tab === 'daily') {
      h += `<div class="v2-cat-chips">`;
      cats.forEach(c => h += `<span class="v2-chip${filter===c?' on':''}" data-act="exFilter" data-cat="${c}">${c}</span>`);
      h += `</div>`;
      h += `<div class="v2-search-box" style="margin:8px 0 12px">
        <input id="exSearchInput" class="v2-search-input" placeholder="搜索话术 / 场景（如 拒绝、汇报、安慰）" value="${esc(v2('express_search',''))}" autocomplete="off"></div>`;
      h += `<div class="v2-ex-head">今日 ${Math.min(perDay, list.length)} 条 · 明日自动更新 · 共 ${skillsAll.length} 条</div>`;
      h += `<div class="v2-skill-list">`;
      if (!list.length) h += `<div class="v2-book-empty">没有匹配的话术，换个关键词或分类试试</div>`;
      list.forEach(s => {
        h += `<div class="v2-skill-card">
          <div class="v2-skill-top">
            <span class="v2-ex-tag">${esc(s.tag)}</span>
            <span class="v2-habit-ops"><a data-act="exFav" data-id="${s.id}">${s.fav?'★':'☆'}</a></span>
          </div>
          <div class="v2-skill-title">${esc(s.title)}</div>
          <div class="v2-skill-content"><b>方法讲解：</b>${esc(s.method)}</div>
          ${s.scene ? `<div class="v2-skill-scene"><b>场景话术：</b>${esc(s.scene)}</div>` : ''}
          <div class="v2-skill-ops">
            <a data-act="exSpeak" data-id="${s.id}">🔊 朗读</a>
            <a data-act="exCopy" data-id="${s.id}">📋 复制</a>
            ${V.readBtn(s.id)}
          </div>
        </div>`;
      });
      h += `</div>`;
    } else {
      const allList = kw ? skillsAll.filter(s => (s.tag + s.title + s.method + s.scene).toLowerCase().includes(kw)) : skillsAll;
      h += `<div class="v2-search-box" style="margin:8px 0 12px">
        <input id="exSearchInput" class="v2-search-input" placeholder="搜索全部话术…" value="${esc(v2('express_search',''))}" autocomplete="off"></div>`;
      h += `<div class="v2-skill-list">`;
      allList.forEach(s => {
        h += `<div class="v2-skill-card">
          <div class="v2-skill-top"><span class="v2-ex-tag">${esc(s.tag)}</span><span class="tag tag-blue">${esc(s.cat)}</span></div>
          <div class="v2-skill-title">${esc(s.title)}</div>
          <div class="v2-skill-content"><b>方法讲解：</b>${esc(s.method)}</div>
          ${s.scene ? `<div class="v2-skill-scene"><b>场景话术：</b>${esc(s.scene)}</div>` : ''}
          <div class="v2-skill-ops"><a data-act="exSpeak" data-id="${s.id}">🔊 朗读</a><a data-act="exCopy" data-id="${s.id}">📋 复制</a>${V.readBtn(s.id)}</div>
        </div>`;
      });
      h += `</div>`;
    }
    h += `</div></div>`;
    return h;
  }
  window.V2VIEWS.express = renderExpress;
  window.V2ACT.exTab = (el) => { v2set('express_tab', el.dataset.tab); render(); };
  window.V2ACT.exFilter = (el) => { v2set('express_filter', el.dataset.cat); render(); };
  window.V2ACT.exFav = (el) => { const s = v2('express_skills', []); const i = s.findIndex(x => x.id === el.dataset.id); if (i>=0){s[i].fav=!s[i].fav;v2set('express_skills',s);render();} };
  window.V2ACT.exColl = (el) => { const s = v2('express_skills', []); const i = s.findIndex(x => x.id === el.dataset.id); if (i>=0){s[i].collected=!s[i].collected;v2set('express_skills',s);render();} };
  window.V2ACT.exCopy = (el) => { const s = v2('express_skills', []).find(x => x.id === el.dataset.id); if (s) { navigator.clipboard && navigator.clipboard.writeText(s.method + (s.scene ? '\n\n场景话术：' + s.scene : '')); toast('已复制'); } };
  window.V2ACT.exSpeak = (el) => { const s = v2('express_skills', []).find(x => x.id === el.dataset.id); if (s) speakZh((s.method || '') + (s.scene ? '。场景话术：' + s.scene : '')); };
  window.V2ACT.exRead = (el) => { const p = v2('express_practice', []).find(x => x.id === el.dataset.id); if (p) speakZh(p.content); };
  window.V2ACT.exDone = (el) => { const ps = v2('express_practice', []); const i = ps.findIndex(x => x.id === el.dataset.id); if (i>=0){ps[i].done=!ps[i].done; ps[i].durationSec=(ps[i].durationSec||0)+60; v2set('express_practice',ps); render();} };

  // 表达能力搜索：输入即时过滤卡片（不整页重渲染，保留输入焦点）
  if (!window.__wbExSearchBound) {
    window.__wbExSearchBound = true;
    document.addEventListener('input', e => {
      if (e.target && e.target.id === 'exSearchInput') {
        const kw = e.target.value; v2set('express_search', kw);
        const k = kw.trim().toLowerCase();
        document.querySelectorAll('.v2-skill-card').forEach(card => {
          card.style.display = (!k || card.textContent.toLowerCase().includes(k)) ? '' : 'none';
        });
      }
    });
  }

  console.log('[V2] modules B loaded ✨');
})();
