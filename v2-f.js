/* ============================================================
   今日运势（娱乐参考）
   基于用户提供的生辰八字做趣味日运推演，非真实占卜。
   干支日历算法以 2000-01-01 = 戊午日 校准。
   ============================================================ */
(function () {
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const GAN_WX = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
  const ZHI_WX = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
  // 用户命盘（由用户本人提供）
  const BIRTH = {
    pillars: ['乙酉', '甲申', '壬辰', '丙午'],
    dayMaster: '壬',
    gender: '阴女',
    pan: '土五局',
    mingGong: '廉贞破军（在卯宫）',
    xiYong: '火、木、土'
  };

  // 儒略日（格林尼治正午），用于推算日干支
  function jd(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  // 返回 0~59 的六十甲子序号（甲子=0）。常数 49 以 2000-01-01=戊午日 校准。
  function gzIdx(y, m, d) {
    const J = jd(y, m, d) + 0.5;
    return (((Math.floor(J) + 49) % 60) + 60) % 60;
  }
  function dayGanZhi(y, m, d) {
    const i = gzIdx(y, m, d);
    return { gan: GAN[i % 10], zhi: ZHI[i % 12], idx: i };
  }

  // 稳定字符串哈希 → [0,1)
  function hash01(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 1000) / 1000;
  }

  // 十二建除
  const JZ = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];
  const YJ = {
    '建': ['宜：出行 · 祈福 · 求嗣 · 嫁娶', '忌：动土 · 开仓'],
    '除': ['宜：解除 · 疗病 · 出行 · 扫除', '忌：求官 · 上任'],
    '满': ['宜：祭祀 · 祈福 · 嫁娶 · 移徙', '忌：动土 · 安葬'],
    '平': ['宜：修造 · 嫁娶 · 移徙 · 安床', '忌：祈福 · 求嗣'],
    '定': ['宜：祭祀 · 嫁娶 · 造屋 · 纳财', '忌：词讼 · 出行'],
    '执': ['宜：造屋 · 修造 · 收购 · 捕猎', '忌：开市 · 移徙 · 嫁娶'],
    '破': ['宜：破屋 · 坏垣 · 求医 · 治病', '忌：嫁娶 · 签约 · 出行（大耗日）'],
    '危': ['宜：安床 · 祭祀 · 祈福', '忌：出行 · 登高 · 乘船'],
    '成': ['宜：嫁娶 · 开业 · 入学 · 动土（吉）', '忌：词讼 · 争讼'],
    '收': ['宜：纳财 · 收购 · 嫁娶 · 入仓', '忌：放债 · 开市'],
    '开': ['宜：开业 · 求财 · 治病 · 嫁娶', '忌：安葬 · 出师'],
    '闭': ['宜：筑堤 · 安葬 · 埋穴', '忌：开业 · 出行']
  };
  // 日干贵人时（日贵）
  const GUIREN = {
    甲: ['丑', '未'], 乙: ['子', '申'], 丙: ['亥', '酉'], 丁: ['亥', '酉'],
    戊: ['丑', '未'], 己: ['子', '申'], 庚: ['丑', '未'], 辛: ['午', '寅'],
    壬: ['巳', '卯'], 癸: ['巳', '卯']
  };

  function stars(n) {
    let s = '';
    for (let i = 0; i < 5; i++) s += `<span class="v2-star ${i < n ? 'on' : ''}">★</span>`;
    return s;
  }

  function renderFortune() {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    const gz = dayGanZhi(y, m, d);
    const todayGz = gz.gan + gz.zhi;
    const tgElem = GAN_WX[gz.gan];
    const dm = BIRTH.dayMaster;            // 壬
    // 日主壬水偏强（得月令申金生扶、辰为水库），喜用神为「火、木、土」来平衡（泄/耗/克），
    // 金、水为生扶日主之忌神。故当日天干属火木土 → 基础运势高，属金水 → 低。
    const REL = { 木: 5, 火: 5, 土: 5, 金: 3, 水: 3 };
    const base = REL[tgElem] || 4;
    const dims = [
      ['综合', 'overall'], ['事业学业', 'career'], ['财运', 'wealth'],
      ['感情', 'love'], ['健康', 'health']
    ];
    const scoreOf = (dim) => {
      const r = hash01('fortune|' + todayGz + '|' + dm + '|' + dim);
      return Math.max(2, Math.min(5, base + Math.floor(r * 3) - 1));
    };

    // 十二建除（月支≈公历月，娱乐近似）
    const monthZhiIdx = m % 12;
    const jzIdx = ((gz.zhi ? ZHI.indexOf(gz.zhi) : 0) - monthZhiIdx + 12) % 12;
    const jz = JZ[jzIdx];
    const yj = YJ[jz];

    // 贵人时
    const gre = GUIREN[gz.gan] || [];

    // 幸运色 / 方位 / 数字（壬水日主偏强，喜用神火、木、土）
    const LUCK_COLOR = {
      火: ['红', '橙', '粉'],
      木: ['绿', '青', '森绿'],
      土: ['黄', '棕', '米色']
    };
    const luckColors = (LUCK_COLOR['火'] || []).concat(LUCK_COLOR['木'] || [], LUCK_COLOR['土'] || []);
    const lc1 = luckColors[Math.floor(hash01('c1' + todayGz) * luckColors.length)];
    const lc2 = luckColors[Math.floor(hash01('c2' + todayGz) * luckColors.length)];
    const luckDirs = ['南（火）', '东（木）', '西南·中（土）'];
    const luckDir = luckDirs[Math.floor(hash01('dir' + todayGz) * luckDirs.length)];
    const LUCK_NUM = [2, 7, 3, 8, 5]; // 河图数理：火2/7、木3/8、土5
    const ln1 = LUCK_NUM[Math.floor(hash01('n1' + todayGz) * LUCK_NUM.length)];
    let ln2 = LUCK_NUM[Math.floor(hash01('n2' + todayGz) * LUCK_NUM.length)];
    if (ln2 === ln1) ln2 = LUCK_NUM[(LUCK_NUM.indexOf(ln1) + 1) % LUCK_NUM.length];

    // 个性化今日提示（火木土为喜神→顺势而为；金水为忌神→保守留意）
    const REL_TXT = {
      木: '食伤泄秀（喜神）——表达与创意在线，特别适合做内容、输出想法，也适合学一门新技能；注意别透支精力。',
      火: '财星透出（喜神）——容易碰到进财或变现机会，但也别冲动消费，钱花在刀刃上。',
      土: '官杀有制（喜神）——执行力与自律在线，适合攻克要事、推进计划，把压力变动力。',
      金: '印星偏旺（忌神）——信息/资源虽多，但别被「靠谱感」麻痹，重要决定多核实，少依赖他人判断。',
      水: '比劫争财（忌神）——合作易分利、花钱易冲动，今天尽量别做大额支出或与人争利。'
    };
    const tipRel = REL_TXT[tgElem] || '';
    const tipFixed = '你命宫廉贞破军在卯，本是敢闯敢变的开创格局；配上壬水日主的灵活变通，今天很适合主动出击、试一件新东西——动起来比纠结更有利。';

    let h = `<div class="page">
      <div class="page-head"><div class="page-title">🔮 今日运势<span class="help-badge" data-help="fortune"></span></div>
        <div class="page-sub">${todayStr()} · ${esc(todayGz)}日</div></div>
      <div class="v2-tip-card v2-fortune-warn">⚠️ 本页为<strong>娱乐参考</strong>，基于你提供的生辰八字做趣味日运推演，非真实占卜，不构成任何决策建议。</div>`;

    // 命盘摘要
    h += `<div class="v2-fortune-birth">
      <div class="v2-fb-title">📜 你的命盘</div>
      <div class="v2-fb-pillars">${BIRTH.pillars.map((p, i) => `<span class="v2-pillar"><b>${p}</b><i>${['年', '月', '日', '时'][i]}柱</i></span>`).join('')}</div>
      <div class="v2-fb-rows">
        <span>日主 <b>${dm}水</b></span><span>${esc(BIRTH.gender)} · ${esc(BIRTH.pan)}</span>
        <span>命宫 <b>${esc(BIRTH.mingGong)}</b></span><span>喜用 <b>${esc(BIRTH.xiYong)}</b></span>
      </div></div>`;

    // 五维运势
    h += `<div class="v2-section"><div class="v2-section-title">🌟 今日运势（${esc(todayGz)}日 · 日主${dm}水）</div><div class="v2-fortune-grid">`;
    dims.forEach(([label, key]) => {
      const s = scoreOf(key);
      h += `<div class="v2-fortune-dim"><div class="v2-fd-label">${label}</div><div class="v2-fd-stars">${stars(s)}</div><div class="v2-fd-num">${s}.0</div></div>`;
    });
    h += `</div></div>`;

    // 幸运 + 宜忌 + 吉时
    h += `<div class="v2-fortune-cols">
      <div class="v2-card-lite"><div class="v2-cl-title">🍀 幸运</div>
        <div class="v2-cl-row">幸运色：<b>${esc(lc1)} · ${esc(lc2)}</b></div>
        <div class="v2-cl-row">幸运方位：<b>${esc(luckDir)}</b></div>
        <div class="v2-cl-row">幸运数字：<b>${ln1} · ${ln2}</b></div></div>
      <div class="v2-card-lite"><div class="v2-cl-title">📅 十二建除 · ${esc(jz)}日</div>
        <div class="v2-cl-row v2-ok">${esc(yj[0])}</div>
        <div class="v2-cl-row v2-no">${esc(yj[1])}</div></div>
      <div class="v2-card-lite"><div class="v2-cl-title">⏰ 贵人时</div>
        <div class="v2-cl-row">${gre.length ? gre.map(g => `<b>${esc(g)}时</b>`).join(' · ') : '—'}</div>
        <div class="v2-cl-row" style="color:var(--text-light);font-size:12px">日干${esc(gz.gan)}的贵人到时</div></div>
    </div>`;

    // 今日提示
    h += `<div class="v2-section"><div class="v2-section-title">💡 今日提示</div>
      <div class="v2-tip-line">${esc(tipRel)}</div>
      <div class="v2-tip-line">${esc(tipFixed)}</div></div>`;

    h += `</div>`;
    return h;
  }

  window.V2VIEWS = window.V2VIEWS || {};
  window.V2VIEWS.fortune = renderFortune;
})();
