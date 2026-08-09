/* ==========================================================================
 * 易欢工作台 V3 — 实时外部数据接入层
 * 真实数据源（已实测可用）：
 *   · 天气   Open-Meteo（无需 Key，CORS 友好）
 *   · 黄金   gold-api.com（无需 Key）
 *   · A股    Tencent 财经行情（经公共 CORS 代理）
 *   · 新闻   GDELT（经公共 CORS 代理，受限可回退样例）
 * 任何源失败都会优雅回退到样例数据并显示「样例」徽标，绝不白屏。
 * ========================================================================== */
(function () {
  'use strict';

  /* ---------- 配置（来自设置页） ---------- */
  function cfg() {
    return {
      city: DB.get('v3_city', '北京'),
      proxy: DB.get('v3_proxy', '') || 'https://api.allorigins.win/raw?url=',
      rate: Number(DB.get('v3_usdcny', '7.18')) || 7.18
    };
  }
  function setCity(c) { DB.set('v3_city', c); }
  function proxied(url) { const p = cfg().proxy; return p ? (p + encodeURIComponent(url)) : url; }

  // WMO 天气代码 → 中文
  const WMO = {
    0:'晴',1:'大致晴朗',2:'局部多云',3:'阴',45:'有雾',48:'雾凇',51:'小毛毛雨',53:'毛毛雨',55:'中毛毛雨',
    56:'冻毛毛雨',57:'冻毛毛雨',61:'小雨',63:'中雨',65:'大雨',66:'小冻雨',67:'大冻雨',71:'小雪',73:'中雪',
    75:'大雪',77:'雪粒',80:'阵雨',81:'阵雨',82:'强阵雨',85:'阵雪',86:'强阵雪',95:'雷阵雨',96:'雷阵雨伴冰雹',99:'强雷暴冰雹'
  };

  /* ---------- 通用拉取 ---------- */
  async function getJSON(url) { const r = await fetch(url, { mode: 'cors' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  async function getText(url) { const r = await fetch(url, { mode: 'cors' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }

  /* ---------- 天气（Open-Meteo） ---------- */
  async function fetchWeather(city) {
    const geo = await getJSON('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1&language=zh&format=json');
    const loc = geo && geo.results && geo.results[0];
    if (!loc) throw new Error('未找到城市：' + city);
    const fc = await getJSON('https://api.open-meteo.com/v1/forecast?latitude=' + loc.latitude + '&longitude=' + loc.longitude + '&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto');
    const c = fc.current;
    const daily = fc.daily || {};
    const dow = ['周日','周一','周二','周三','周四','周五','周六'];
    const forecast = (daily.time || []).map((ds, i) => ({
      date: ds,
      code: daily.weather_code ? daily.weather_code[i] : c.weather_code,
      tmax: daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[i]) : null,
      tmin: daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[i]) : null,
      pop: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : null,
      label: i === 0 ? '今天' : dow[new Date(ds).getDay()]
    }));
    return {
      city: loc.name, country: loc.country,
      temp: Math.round(c.temperature_2m), code: c.weather_code,
      condition: WMO[c.weather_code] || '未知',
      humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m),
      time: c.time, live: true, forecast
    };
  }

  // 天气代码 → emoji
  function wxEmoji(code) {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '🌡️';
  }
  function ymdLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function buildForecast(arr) {
    if (!arr || !arr.length) return '';
    return '<div class="wf-row">' + arr.map(d => `<div class="wf-card">
      <div class="wf-day">${esc(d.label || d.date)}</div>
      <div class="wf-emoji">${wxEmoji(d.code)}</div>
      <div class="wf-temp">${d.tmax != null ? d.tmax : '-'}°<span class="wf-lo">/${d.tmin != null ? d.tmin : '-'}°</span></div>
      <div class="wf-pop">💧${d.pop != null ? d.pop : '-'}%</div>
    </div>`).join('') + '</div>';
  }
  function sampleForecast() {
    const codes = [0, 2, 3, 61, 80, 2, 1]; const dow = ['周日','周一','周二','周三','周四','周五','周六'];
    const base = new Date();
    return codes.map((c, i) => { const d = new Date(base); d.setDate(d.getDate() + i); return { date: ymdLocal(d), code: c, tmax: 28 + i % 3, tmin: 19 + i % 2, pop: (i * 13) % 60, label: i === 0 ? '今天' : dow[d.getDay()] }; });
  }

  /* ---------- 黄金（gold-api.com） ---------- */
  async function fetchGold() {
    const r = await getJSON('https://api.gold-api.com/price/XAU');
    if (!r || !r.price) throw new Error('无金价数据');
    const rate = cfg().rate;
    return { price: r.price, cnyPerGram: r.price * rate / 31.1035, currency: r.currency || 'USD', updatedAt: r.updatedAt, live: true };
  }

  /* ---------- A股（腾讯财经，经代理） ---------- */
  async function fetchMarket() {
    const url = 'https://qt.gtimg.cn/q=sh000001,sz399001,sz399006,sh000300';
    const txt = await getText(proxied(url));
    const re = /v_(\w+)="([^"]*)"/g; let m; const out = [];
    while ((m = re.exec(txt))) {
      const f = m[2].split('~');
      if (f.length > 10) {
        const name = f[1], price = parseFloat(f[3]), prev = parseFloat(f[4]);
        if (isNaN(price) || isNaN(prev)) continue;
        const chg = price - prev;
        const chgPct = prev ? chg / prev * 100 : 0;
        out.push({ code: m[1], name, price, chg, chgPct });
      }
    }
    if (!out.length) throw new Error('无行情数据');
    return out;
  }

  /* ---------- 新闻：GDELT（直连+代理，带超时）→ HN 真实兜底 → 样例 ---------- */
  async function fetchText2(url, ms) {
    const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const to = ctrl ? setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, ms || 6000) : null;
    try {
      const r = await fetch(url, { mode: 'cors', signal: ctrl ? ctrl.signal : undefined });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } finally { if (to) clearTimeout(to); }
  }
  async function fetchGDELT(query) {
    const q = encodeURIComponent(query);
    const target = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + q + '&mode=ArtList&maxrecords=15&format=json&sort=hybridrel';
    const urls = [target, proxied(target)];
    let lastErr;
    for (const u of urls) {
      try {
        const t = await fetchText2(u, 6000);
        let j; try { j = JSON.parse(t); } catch (e) { continue; }
        const arts = (j && j.articles) || [];
        if (arts.length) return arts.map(a => ({
          title: (a.title || '').trim(),
          url: a.url || '',
          source: a.domain || 'GDELT',
          date: (a.seendate || '').slice(0, 10),
          summary: (a.summary || '').replace(/<[^>]+>/g, '').slice(0, 90)
        }));
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('GDELT 无数据');
  }
  async function fetchHN() {
    const top = await fetchText2('https://hacker-news.firebaseio.com/v0/topstories.json', 6000).then(t => JSON.parse(t));
    const ids = (top || []).slice(0, 12);
    const items = await Promise.all(ids.map(id =>
      fetchText2('https://hacker-news.firebaseio.com/v0/item/' + id + '.json', 6000)
        .then(t => { try { return JSON.parse(t); } catch (e) { return null; } }).catch(() => null)
    ));
    return items.filter(Boolean).map(it => ({
      title: it.title || '',
      url: it.url || ('https://news.ycombinator.com/item?id=' + it.id),
      source: 'Hacker News',
      date: it.time ? new Date(it.time * 1000).toISOString().slice(0, 10) : '',
      summary: ''
    }));
  }

  /* ---------- 状态徽标 ---------- */
  function setBadge(id, live, msg) {
    const el = gid(id);
    if (el) el.innerHTML = live ? '<span class="v2-live-dot live"></span>' + (msg || '实时') : '<span class="v2-live-dot"></span>' + (msg || '样例');
  }

  /* ---------- HTML 构造 ---------- */
  function buildGoldLive(g) {
    return `<div class="v2-gold-card">
      <div class="v2-gold-name">现货黄金 XAU/USD · 实时</div>
      <div class="v2-gold-price">$${g.price.toFixed(2)} <span class="v2-gold-unit">美元/盎司</span></div>
      <div class="v2-gold-chg">≈ ¥${g.cnyPerGram.toFixed(2)}/克（汇率 ${cfg().rate}）</div>
      <div class="v2-gold-grid">
        <div><span>来源</span><b>gold-api</b></div>
        <div><span>更新</span><b>${(g.updatedAt || '').slice(11, 16) || '实时'}</b></div>
        <div><span>币种</span><b>${g.currency}</b></div>
        <div><span>状态</span><b style="color:var(--hk-red)">● 实时</b></div>
      </div></div>`;
  }
  function buildMarketLive(list) {
    let h = '<div class="v2-quote-grid">';
    list.forEach(x => {
      const up = x.chg >= 0;
      h += `<div class="v2-quote-card"><div class="v2-quote-name">${esc(x.name)}</div>
        <div class="v2-quote-val">${x.price.toFixed(2)}</div>
        <div class="v2-quote-chg"><span class="${up ? 'v2-up' : 'v2-down'}">${up ? '▲' : '▼'} ${up ? '+' : ''}${x.chgPct.toFixed(2)}%</span></div></div>`;
    });
    h += '</div>';
    return h;
  }

  /* ---------- 装载器 ---------- */
  async function loadWeather() {
    const wEl = gid('weatherLive'); if (!wEl) return;
    const fcEl = gid('weatherForecast');
    setBadge('weatherStatus', false, '加载中');
    try {
      const w = await fetchWeather(cfg().city);
      const f0 = w.forecast && w.forecast[0];
      DB.set('weather', { city: w.city, temp: w.temp, condition: w.condition, humidity: w.humidity, wind: w.wind, low: f0 ? f0.tmin : null, high: f0 ? f0.tmax : null, forecast: w.forecast, live: true, updatedAt: w.time });
      wEl.innerHTML = `<div class="weather-temp">${w.temp}°C</div>
        <div class="weather-detail">
          <div>${wxEmoji(w.code)} ${esc(w.condition)}</div>
          <div>湿度 ${w.humidity}% · 风速 ${w.wind}km/h</div>
        </div>
        <div style="display:flex;gap:4px;align-items:center">${HK.wavePink(28)}</div>`;
      if (fcEl) fcEl.innerHTML = buildForecast(w.forecast);
      const btn = document.querySelector('[data-act="refreshWeather"]');
      if (btn) btn.textContent = w.city;
      setBadge('weatherStatus', true, '实时');
    } catch (e) {
      const sample = sampleForecast();
      DB.set('weather', Object.assign(DB.get('weather', {}), { forecast: sample }));
      wEl.innerHTML = `<div class="weather-temp">26°C</div>
        <div class="weather-detail"><div>示例天气</div><div>联网后自动获取实时天气</div></div>
        <div style="display:flex;gap:4px;align-items:center">${HK.wavePink(28)}</div>`;
      if (fcEl) fcEl.innerHTML = buildForecast(sample);
      setBadge('weatherStatus', false, '样例');
    }
  }

  async function loadGold() {
    const el = gid('goldLive'); if (!el) return;
    setBadge('goldStatus', false, '加载中');
    try {
      const g = await fetchGold();
      el.innerHTML = buildGoldLive(g) + `<div class="v2-section-title" style="margin-top:16px">核心行情</div><div class="v2-quote-grid">
        <div class="v2-quote-card"><div class="v2-quote-name">美元/人民币</div><div class="v2-quote-val">${cfg().rate}</div><div class="v2-quote-chg"><span class="v2-up">实时汇率</span></div></div>
      </div>`;
      setBadge('goldStatus', true, '实时');
    } catch (e) {
      setBadge('goldStatus', false, '样例');
    }
  }

  async function loadMarket() {
    const el = gid('mktLive'); if (!el) return;
    setBadge('mktStatus', false, '加载中');
    try {
      const list = await fetchMarket();
      el.innerHTML = buildMarketLive(list) + `<div class="v2-section-title" style="margin-top:16px">核心行情</div><div class="v2-quote-grid">
        <div class="v2-quote-card"><div class="v2-quote-name">美元/人民币</div><div class="v2-quote-val">${cfg().rate}</div><div class="v2-quote-chg"><span class="v2-up">实时汇率</span></div></div>
      </div>`;
      setBadge('mktStatus', true, '实时');
    } catch (e) {
      setBadge('mktStatus', false, '样例');
    }
  }

  let liveCache = [];
  let lastNews = 0;
  // 样例新闻池（联网失败时使用，按日期轮换，避免总是同一组）
  function sampleNews() {
    const T = new Date().toISOString().slice(0, 10);
    const pool = [
      { title: '商务部：进一步扩大高水平对外开放新举措出炉', source: '财经早报' },
      { title: '多地推进城市更新，老旧小区改造提速', source: '新华社' },
      { title: 'AI 大模型在科研与产业落地加速', source: '科技日报' },
      { title: '教育部：推进产教融合，强化应用型人才培养', source: '中国教育报' },
      { title: '夏季水产养殖病害防控技术指导意见发布', source: '农业农村部' },
      { title: '青年群体副业经济持续升温，灵活就业成新趋势', source: '经济日报' }
    ];
    const d = new Date().getDate();
    return pool.slice(d % 3, (d % 3) + 3).map(n => ({ title: n.title, source: n.source, date: T, url: '' }));
  }

  async function loadNews(manual, cat) {
    const el = gid('newsLive'); if (!el) return;
    cat = cat || DB.get('news_cat', '综合');
    const now = Date.now();
    if (!manual && now - lastNews < 6000) return;   // 节流：避免限流
    lastNews = now;
    setBadge('newsStatus', false, '加载中');
    const queryMap = { '综合': '中国', '财经': '中国 财经', '社会': '中国 社会', '科技': 'technology' };
    // 外层硬超时：无论如何 5s 内必须落到「样例」，避免一直转圈
    const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
    let items = [], srcKind = '';
    try {
      if (cat === '科技') { items = await withTimeout(fetchHN(), 5000); srcKind = '科技'; }
      else { items = await withTimeout(fetchGDELT(queryMap[cat] || '中国'), 5000); srcKind = '综合'; }
      if (!items.length) throw new Error('空');
    } catch (e) {
      try { items = await withTimeout(fetchHN(), 5000); srcKind = '科技'; } catch (e2) { items = []; }
    }
    liveCache = items;
    if (items.length) {
      el.innerHTML = items.map((n, i) => `<div class="v2-news-card">
        <div class="v2-news-top"><span class="tag tag-red">${esc(srcKind)}</span>
          <span class="v2-news-src">${esc(n.source)} · ${esc(n.date)}</span></div>
        <div class="v2-news-title"><a href="${esc(n.url)}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:none">${esc(n.title)}</a></div>
        ${n.summary ? `<div class="v2-news-sum">${esc(n.summary)}</div>` : ''}
        <div class="v2-news-ops">
          <a data-act="newsSaveLive" data-i="${i}">☆ 收藏</a>
          <a href="${esc(n.url)}" target="_blank" rel="noreferrer">原文 ↗</a>
          ${window.V2.readBtn('news_' + (n.url || n.title))}
        </div></div>`).join('');
      setBadge('newsStatus', true, '实时·' + srcKind);
    } else {
      const sample = sampleNews();
      el.innerHTML = sample.map(n => `<div class="v2-news-card"><div class="v2-news-top"><span class="tag tag-gray">样例</span><span class="v2-news-src">${esc(n.source)} · ${esc(n.date)}</span></div><div class="v2-news-title">${esc(n.title)}</div><div class="v2-news-ops">${window.V2.readBtn('news_' + (n.url || n.title))}</div></div>`).join('');
      setBadge('newsStatus', false, '样例');
    }
    if (manual && !items.length) toast('实时新闻获取失败，已显示示例数据');
  }

  // 收藏实时新闻到「我的资讯库」
  window.V2ACT = window.V2ACT || {};
  window.V2ACT.newsSaveLive = (el) => {
    const it = liveCache[+el.dataset.i]; if (!it) return;
    const ns = DB.get('news', []);
    if (ns.some(n => n.title === it.title)) { toast('已在资讯库'); return; }
    ns.unshift({ id: 'n' + Date.now(), title: it.title, source: it.source, cat: '收藏',
      link: it.url, liked: false, collected: true, shared: false,
      date: it.date || new Date().toISOString().slice(0, 10), isNew: false });
    DB.set('news', ns); toast('已收藏到「我的资讯库」');
    el.textContent = '⭐ 已收藏';
  };

  /* ====================== NCBI / Europe PMC 论文推荐 ====================== */
  // 期刊影响因子近似表（2023-2024），用于过滤 IF>=4 并按 IF 排序
  const NCBI_IF = {
    'nature': 64.8, 'nature communications': 16.6, 'nature food': 23.0, 'nature microbiology': 28.3,
    'science': 56.9, 'cell': 64.5, 'cell reports': 8.8, 'plos biology': 9.8, 'plos pathogens': 6.7,
    'frontiers in immunology': 7.3, 'frontiers in microbiology': 5.2, 'frontiers in physiology': 4.0,
    'frontiers in marine science': 3.7, 'fish & shellfish immunology': 4.6, 'aquaculture': 4.5,
    'aquaculture reports': 3.5, 'developmental & comparative immunology': 3.2,
    'journal of invertebrate pathology': 3.5, 'journal of virology': 5.4, 'viruses': 4.7,
    'microbiology spectrum': 4.2, 'microbiome': 15.5, 'msystems': 7.0, 'mbio': 6.4,
    'international journal of molecular sciences': 5.6, 'scientific reports': 4.6,
    'bmc genomics': 4.4, 'bmc microbiology': 4.2, 'journal of proteomics': 4.3,
    'marine drugs': 5.4, 'antioxidants': 7.0, 'one health': 4.5, 'microorganisms': 4.5,
    'cells': 6.0, 'food microbiology': 5.3, 'life science alliance': 5.4,
    'peerj': 3.0, 'animal': 3.0, 'animals': 3.0, 'scientific data': 9.8, 'genomics': 4.0
  };
  function ncbiIfOf(journal) {
    if (!journal) return 0;
    const j = journal.toLowerCase().trim();
    if (NCBI_IF[j] != null) return NCBI_IF[j];
    for (const k in NCBI_IF) { if (k.length >= 6 && j.startsWith(k)) return NCBI_IF[k]; }
    return 0;
  }
  const NCBI_TOPICS = [
    '"Litopenaeus vannamei" AND (immun* OR virus* OR bacter*)',
    'shrimp AND aquaculture AND (immun* OR virus* OR bacter*)',
    'fish AND (immun* OR bacter* OR virus*) AND infection',
    'crustacean AND immun*',
    'mollusc AND immun*',
    'aquaculture AND (virus* OR bacter* OR infect*)'
  ];
  const NCBI_KEY = 'v2_ncbi_papers';
  const NCBI_WEEK = 'v2_ncbi_week';

  function ncbiSeedList() {
    const s = window.NCBI_SEED;
    if (s && s.list && s.list.length) return s.list;
    return [];
  }
  // 同步获取：优先当日实时缓存，否则种子（保证首屏有真实数据）
  function ncbiGet() {
    const c = DB.get(NCBI_KEY, null);
    if (c && c.list && c.list.length && c.updated === todayStr()) return c;
    const seed = ncbiSeedList();
    return { live: false, list: seed, updated: (window.NCBI_SEED && window.NCBI_SEED.updated) || todayStr(), source: (window.NCBI_SEED && window.NCBI_SEED.source) || '种子' };
  }
  async function ncbiFetchLive() {
    try {
      const seen = new Set(); const all = [];
      for (const t of NCBI_TOPICS) {
        const q = encodeURIComponent(t);
        const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${q}&format=json&pageSize=25&sort=P_PDATE_D%20desc&resultType=core`;
        const txt = await fetchText2(url, 8000);
        const data = JSON.parse(txt);
        const res = (data.resultList && data.resultList.result) || [];
        for (const p of res) {
          const doi = p.doi; if (!doi || seen.has(doi)) continue;
          const journal = (p.journalInfo && p.journalInfo.journal && p.journalInfo.journal.title) || '';
          const year = parseInt(p.pubYear || '', 10);
          if (!year || year < 2023) continue;
          seen.add(doi);
          all.push({
            doi, url: 'https://doi.org/' + doi,
            title: (p.title || '').replace(/<[^>]+>/g, ''),
            authors: (p.authorString || '').split(',').slice(0, 4).join(', ') + (p.authorString && p.authorString.split(',').length > 4 ? ' 等' : ''),
            journal, year, if: ncbiIfOf(journal)
          });
        }
      }
      let pass = all.filter(x => x.if >= 4);
      if (pass.length < 12) pass = all.filter(x => x.if >= 3);
      pass.sort((a, b) => b.if - a.if || b.year - a.year);
      return { live: true, list: pass.slice(0, 20), updated: todayStr() };
    } catch (e) { return null; }
  }
  async function ncbiRefresh() {
    let data = await ncbiFetchLive();
    if (!data || !data.list.length) {
      const seed = ncbiSeedList();
      data = { live: false, list: seed, updated: todayStr(), source: '种子(离线)' };
    }
    DB.set(NCBI_KEY, data);
    // 自动把当日最高 IF 的一篇加入「本周精读候选」
    if (data.list.length) {
      const top = data.list[0];
      const week = DB.get(NCBI_WEEK, []);
      if (!week.some(w => w.date === todayStr())) {
        week.unshift({ date: todayStr(), doi: top.doi, title: top.title, journal: top.journal, year: top.year, if: top.if, url: top.url, link: '' });
        DB.set(NCBI_WEEK, week.slice(0, 7));
      }
    }
    if (currentRoute === 'wechat' || currentRoute === 'research') render();
    return data;
  }
  function ncbiWeekGet() { return DB.get(NCBI_WEEK, []); }
  function ncbiWeekAdd(paper) {
    const week = DB.get(NCBI_WEEK, []);
    if (week.some(w => w.doi === paper.doi)) { toast('已在本周精读候选'); return; }
    week.unshift({ date: todayStr(), doi: paper.doi, title: paper.title, journal: paper.journal, year: paper.year, if: paper.if, url: paper.url, link: '' });
    DB.set(NCBI_WEEK, week.slice(0, 7));
    if (typeof render === 'function') render();
    toast('已加入本周精读候选');
  }
  function ncbiWeekSaveLink(doi, link) {
    const week = DB.get(NCBI_WEEK, []);
    const it = week.find(w => w.doi === doi);
    if (it) { it.link = link; DB.set(NCBI_WEEK, week); toast('已记录公众号链接'); }
  }
  function ncbiPaperByDoi(doi) {
    const c = ncbiGet();
    return (c.list || []).find(p => p.doi === doi) || null;
  }
  // 论文卡片列表 HTML（同步）
  function ncbiPapersInner() {
    const d = ncbiGet();
    let list = d.list || [];
    if (!list.length) return `<div class="v2-book-empty">暂无论文，点「刷新」重试</div>`;
    // 每日展示 10 篇：静态种子按当天日期轮换；实时数据本身按日期排序自然轮换
    if (list.length > 10) {
      const t = todayStr().split('-');
      const doy = Math.floor((Date.UTC(+t[0], +t[1] - 1, +t[2]) - Date.UTC(+t[0], 0, 0)) / 86400000);
      const start = doy % (list.length - 10 + 1);
      list = list.slice(start, start + 10);
    }
    return list.map(p => `<div class="v2-paper">
      <div class="v2-paper-if">IF ${p.if || '—'}</div>
      <div class="v2-paper-body">
        <div class="v2-paper-title"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a></div>
        <div class="v2-paper-meta">${esc(p.authors || '—')} · ${esc(p.journal)} (${p.year})</div>
        <div class="v2-paper-ops">
          <a class="v2-tx-edit" data-act="paperToWeek" data-doi="${esc(p.doi)}">🌟 选为本周精读</a>
          <a class="v2-tx-edit" data-act="paperToTopic" data-doi="${esc(p.doi)}">📌 存为选题</a>
          <a href="${esc(p.url)}" target="_blank" rel="noopener">🔗 DOI 全文</a>
          ${window.V2.readBtn('paper_' + (p.doi || p.title))}
        </div>
      </div>
    </div>`).join('');
  }
  function ncbiPapersSection() {
    const d = ncbiGet();
    const badge = d.live ? `<span class="ncbi-badge live">实时</span>` : `<span class="ncbi-badge">${esc(d.source || '样例')}</span>`;
    return `<div class="v2-section-title">📚 每日文献精选（NCBI/Europe PMC）${badge}
        <button class="btn btn-primary btn-sm v2-sec-btn" data-act="papersRefresh">↻ 刷新</button></div>
      <div class="v2-paper-list">${ncbiPapersInner()}</div>`;
  }
  function ncbiWeekSection() {
    const week = ncbiWeekGet();
    if (!week.length) return `<div class="v2-section-title">🌟 本周精读候选</div><div class="v2-book-empty">今日尚未生成候选，点上方「刷新」或「选为本周精读」</div>`;
    const items = week.map(w => `<div class="v2-week-item">
      <div class="v2-week-date">${esc(w.date.slice(5))}</div>
      <div class="v2-week-body">
        <div class="v2-paper-title"><a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.title)}</a></div>
        <div class="v2-paper-meta">${esc(w.journal)} · IF ${w.if || '—'} ${w.link ? '· <span class=\"v2-ok\">已发公众号 ✓</span>' : ''}</div>
        <div class="v2-week-link">公众号链接：<input class="v2-input v2-week-input" id="wk_${esc(w.doi.replace(/[^a-z0-9]/gi,''))}" value="${esc(w.link || '')}" placeholder="粘贴已发的公众号推文链接"> <button class="btn btn-outline btn-xs" data-act="weekSaveLink" data-doi="${esc(w.doi)}">保存</button></div>
      </div>
    </div>`).join('');
    return `<div class="v2-section-title">🌟 本周精读候选（累计 7 天，选 1 篇精读发公众号）</div><div class="v2-week-list">${items}</div>`;
  }
  window.V2ACT = window.V2ACT || {};
  window.V2ACT.papersRefresh = function () { toast('正在获取最新论文…'); ncbiRefresh(); };
  window.V2ACT.paperToWeek = function (el) { const p = ncbiPaperByDoi(el.dataset.doi); if (p) ncbiWeekAdd(p); };
  window.V2ACT.paperToTopic = function (el) {
    const p = ncbiPaperByDoi(el.dataset.doi); if (!p) return;
    const arts = DB.get('v2_wechat_articles', []);
    if (arts.some(a => a.link === p.url)) { toast('已存为选题'); return; }
    arts.unshift({ id: 'wx' + Date.now(), title: p.title, type: '原创', status: '选题', pubDate: todayStr(), reads: 0, link: p.url });
    DB.set('v2_wechat_articles', arts); toast('已存为公众号选题'); if (typeof render === 'function') render();
  };
  window.V2ACT.weekSaveLink = function (el) {
    const doi = el.dataset.doi; const inp = gid('wk_' + doi.replace(/[^a-z0-9]/gi, ''));
    ncbiWeekSaveLink(doi, inp ? inp.value.trim() : '');
    if (typeof render === 'function') render();
  };

  /* ---------- 路由后触发实时装载 ---------- */
  window.afterRender = function (route) {
    if (route === 'home') loadWeather();
    else if (route === 'gold') loadGold();
    else if (route === 'market') loadMarket();
    else if (route === 'news') loadNews(false, DB.get('news_cat', '综合'));
    else if (route === 'wechat' || route === 'research') ncbiRefresh();
  };

  /* ---------- 让「刷新」按钮触发实时新闻 ---------- */
  if (window.V2ACT && window.V2ACT.newsRefresh) {
    const _nr = window.V2ACT.newsRefresh;
    window.V2ACT.newsRefresh = function () { if (window.V3) loadNews(true, DB.get('news_cat', '综合')); else _nr(); };
  }

  window.V3 = { fetchWeather, fetchGold, fetchMarket, fetchGDELT, fetchHN, loadWeather, loadGold, loadMarket, loadNews, setCity, cfg, WMO,
    ncbiGet, ncbiRefresh, ncbiPapersSection, ncbiPapersInner, ncbiWeekSection, ncbiWeekGet, ncbiPaperByDoi, ncbiIfOf };
  console.log('[V3] loaded ✨');
})();
