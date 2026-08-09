/* ============================================
   易欢工作台 v2 - 完整应用逻辑
   Hello Kitty 红主题 · 5 模块 v1
   ============================================ */

// ===== 常量与配置 =====
const APP_NAME = '易欢工作台';
const APP_VERSION = '2.0.0';
const UPDATE_DATE = '2026-08-05';

// 导航配置（按文档顺序；v2 由 v2.js 重新赋值为完整 20 模块）
var NAV_CONFIG = [
  { key: 'home',        label: '首页',       icon: '🏠',  group: 'main' },
  { key: 'checkin',     label: '打卡中心',   icon: '✅',  group: 'main', dot: true },
  {
    key: '_ielts', label: '雅思学习', icon: '📚', group: 'main',
    expandable: true,
    children: [
      { key: 'ielts_words',    label: '单词',   icon: '📝' },
      { key: 'ielts_listening',label: '听力',   icon: '🎧' },
      { key: 'ielts_speaking', label: '口语',   icon: '🎤' },
      { key: 'ielts_reading',  label: '阅读',   icon: '📖' },
      { key: 'ielts_writing',  label: '写作',   icon: '✍️' },
      { key: 'ielts_exam',     label: '真题',   icon: '📋' },
    ]
  },
  { key: 'selfmedia',   label: '自媒体运营', icon: '📱',  group: 'main' },
  // --- 以下为 v2 占位入口 ---
  { key: '_finance',    label: '小账本',     icon: '💰',  group: 'more' },
  { key: '_study',      label: '学习管理',   icon: '🎯',  group: 'more' },
  { key: '_research',   label: '科研助手',   icon: '🔬',  group: 'more' },
  { key: '_podcast',    label: '播客精选',   icon: '🎙️',  group: 'more' },
  { key: '_news',       label: '新闻资讯',   icon: '📰',  group: 'more' },
  { key: '_books',      label: '读书推荐',   icon: '📕',  group: 'more' },
  { key: '_express',    label: '表达能力',   icon: '🗣️',  group: 'more' },
  { key: '_ai',         label: 'AI学习',     icon: '🤖',  group: 'more' },
  { key: '_gold',       label: '黄金财经',   icon: '📈',  group: 'more' },
  { key: '_market',     label: '市场复盘',   icon: '📊',  group: 'more' },
  { key: '_diet',       label: '饮食打卡',   icon: '🍱',  group: 'more' },
  { key: '_sport',      label: '运动管理',   icon: '🏃',  group: 'more' },
  { key: '_skincare',   label: '美妆穿搭',   icon: '🧴',  group: 'more' },
  { key: '_habit',      label: '习惯养成',   icon: '🔄',  group: 'more' },
  { key: '_review',     label: '每日复盘',   icon: '📝',  group: 'more' },
  { key: 'memo',        label: '备忘录',     icon: '📒',  group: 'more' },
  { key: 'settings',    label: '设置与数据', icon: '⚙️',  group: 'end' },
];

// 模块名称映射
const MOD_NAMES = {
  home: '首页', checkin: '打卡中心', ielts_words: '单词学习',
  ielts_listening: '听力训练', ielts_speaking: '口语练习',
  ielts_reading: '阅读练习', ielts_writing: '写作练习',
  ielts_exam: '真题练习', selfmedia: '自媒体运营',
  memo: '备忘录', settings: '设置与数据'
};

// 打卡任务分类
const TASK_CATS = ['生活任务', '学习任务', '自媒体任务', '运动健康任务', '临时待办'];

// 帮助文档
const HELP_TEXT = {
  home: {
    title: '🏠 首页帮助',
    body: `<div class="guide-content">
<h4>首页是什么？</h4>
<p>首页是你的工作台总览，展示今天最重要的信息。所有数据来自各模块的真实记录，不会重复维护。</p>
<h4>各个区域说明</h4>
<ul>
<li><b>问候区</b>：显示个性化问候语和 Hello Kitty 装饰</li>
<li><b>时钟区</b>：实时显示当前时间、公历日期、星期、农历日期</li>
<li><b>今日金句</b>：每天自动更新一句成长向中文文案 + 英文翻译</li>
<li><b>日历签到</b>：当月月历，点击「签到」按钮完成当日签到，已签到日期显示红色蝴蝶结标记</li>
<li><b>成长汇报</b>：点击刷新按钮自动汇总当日全部模块的完成情况</li>
<li><b>倒计时</b>：显示你添加的重要日期倒计时，点击 + 添加新事项</li>
<li><b>天气</b>：显示当前城市实时天气（已接入 Open-Meteo，点击城市名可切换）</li>
</ul>
<h4>操作提示</h4>
<p>签到后会有轻量庆祝动效；倒计时支持多个事项；天气可在卡片内修改城市。</p>
<h4>出错怎么办</h4>
<p>如果数据显示异常，尝试刷新页面。所有数据存储在浏览器本地，清除浏览器数据会丢失。</p>`
  },
  checkin: {
    title: '✅ 打卡中心帮助',
    body: `<div class="guide-content">
<h4>打卡中心是什么？</h4>
<p>全工作台的任务汇总枢纽。它<strong>自动采集</strong>其他模块（雅思、自媒体、习惯等）的打卡任务到这里，你也可以在这里手动添加。</p>
<h4>核心规则</h4>
<ul>
<li>任务来自真实模块，不维护重复副本</li>
<li>在打卡中心勾选完成 → 对应模块同步更新</li>
<li>在模块里完成任务 → 打卡中心自动标记</li>
<li>每条任务左侧圆形勾选框，完成后红色填充 + 文字划线置灰</li>
</ul>
<h4>操作方法</h4>
<ul>
<li><b>查看任务</b>：按分类浏览（生活/学习/自媒体/运动健康/临时待办）</li>
<li><b>完成任务</b>：点击圆形勾选框</li>
<li><b>添加任务</b>：在分类底部输入框填写，选择分类和重复周期</li>
<li><b>切换日期</b>：可查看历史某天的任务完成情况</li>
</ul>
<h4>撤销操作</h4>
<p>已完成的任务再次点击勾选框即可取消完成。</p>
<h4>出错怎么办</h4>
<p>如果任务没有同步，请检查对应模块是否正确注册了任务。</p>`
  },
  ielts_words: {
    title: '📝 单词学习帮助',
    body: `<div class="guide-content">
<h4>单词页面功能</h4>
<ul>
<li><b>今日背诵</b>：每天 30 个雅思高频词，点击「更新今日」刷新</li>
<li><b>单词列表</b>：每个单词显示音标、词性、释义、常用搭配</li>
<li><b>🔊 发音</b>：点击喇叭图标朗读单词（使用浏览器语音合成）</li>
<li><b>✓ 已掌握</b>：勾选后计入当日学习进度</li>
<li><b>复习乐园</b>：羊了个羊配对消除、记忆翻牌游戏，帮助抗遗忘复习</li>
</ul>
<h4>如何使用</h4>
<p>每天打开 → 看进度条 → 逐个学习单词 → 点击发音听读音 → 勾选已掌握 → 闲暇时玩复习游戏巩固。</p>
<h4>撤销</h4>
<p>已勾选的单词再次点击取消标记。</p>`
  },
  ielts_listening: {
    title: '🎧 听力训练帮助',
    body: `<div class="guide-content">
<h4>听力训练包含三个部分</h4>
<ul>
<li><b>听力作业</b>：汇总打卡中心里「雅思-听力」类任务，支持标记完成 + 拍照上传打卡（无内置音频源，自行准备真题音频）。</li>
<li><b>精听训练</b>：每日推荐 B 站精听视频可逐句跟练；下方「错题本」记录听错 / 漏听的句子与生词，便于复盘。</li>
<li><b>错题复盘</b>：集中收录精听中记录的错题，回顾薄弱点。</li>
</ul>
<h4>提示</h4>
<p>听力真题音频请自行准备或提供 B 站链接，系统可内嵌播放；精听视频每日自动轮换推荐。</p>`
  },
  ielts_speaking: {
    title: '🎤 口语练习帮助',
    body: `<div class="guide-content">
<h4>口语练习四个部分</h4>
<ul>
<li><b>影子跟读</b>：内嵌 B 站视频（填入链接或跳转），延迟 1-2 秒跟读</li>
<li><b>单句跟读</b>：每日 10 句高频句型，点击 🎤 录制自己的发音并回放对比</li>
<li><b>话题素材</b>：Part1 / Part2 / Part3 分类话题库，含参考思路和高分表达</li>
<li><b>学习记录</b>：自动统计跟读时长和完成句数</li>
</ul>
<h4>录音功能</h4>
<p>需要浏览器授权麦克风权限。首次使用会弹出权限请求，请点击「允许」。</p>`
  },
  ielts_reading: {
    title: '📖 阅读练习帮助',
    body: `<div class="guide-content">
<h4>阅读三部分</h4>
<ul>
<li><b>练习模式</b>：「新文章」推送真题 + 选择/判断/填空题目 + 答案定位解析</li>
<li><b>考点词库</b>：高频同义替换词表（动词/形容词/逻辑词），可收藏</li>
<li><b>错题本</b>：收录做错的题目，标注错误原因和原文定位句</li>
</ul>`
  },
  ielts_writing: {
    title: '✍️ 写作练习帮助',
    body: `<div class="guide-content">
<h4>写作两大板块</h4>
<ul>
<li><b>范文库</b>：Task1（图表/地图/流程）和 Task2（大作文）范文，含 Simon 9 分范文和写作真经高分范文，按话题筛选</li>
<li><b>练习</b>：随机抽取真题题目，在输入框中写作文（实时字数统计），完成后查看范文对照</li>
</ul>
<p>底部配有万能句式库和衔接词素材供随时调用。</p>`
  },
  ielts_exam: {
    title: '📋 真题练习帮助',
    body: `<div class="guide-content">
<h4>真题 = 作业流</h4>
<p>真题模块不再内置题库与模考，改为<strong>作业流</strong>：你在计划里添加「整套真题 / 模考」类学习任务（归入「雅思-真题」），这里自动汇总当日与逾期任务。</p>
<ul>
<li><b>当日任务</b>：今天要做的真题，标记完成或拍照上传打卡。</li>
<li><b>待补作业</b>：逾期的真题任务，集中补做。</li>
</ul>
<h4>说明</h4>
<p>真题集请自行准备（纸质 / 电子版），完成后在对应任务拍照留存即可。</p>`
  },
  selfmedia: {
    title: '📱 自媒体运营帮助',
    body: `<div class="guide-content">
<h4>五个子标签</h4>
<ul>
<li><b>选题灵感</b>：每日热点 + 分类标签 + 创作思路 + 收藏/复制/已使用标记 + 灵感速记</li>
<li><b>爆款二创</b>：每天 5 条案例拆解（封面/标题公式/内容结构/爆点分析），每条可「添加至任务」</li>
<li><b>素材库</b>：文案金句/封面参考/BGM 合集，支持标签搜索和模板复制</li>
<li><b>数据复盘</b>：每日数据记录 + 周/月趋势图 + 复盘笔记</li>
<li><b>运营工具</b>：文案生成/封面制作/数据查询/违禁词检测入口</li>
</ul>
<h4>视频嵌入</h4>
<p>在素材库或运营工具中填入 B 站视频链接，系统优先尝试 iframe 内嵌，若被拦截则提供跳转按钮。</p>
<h4>智能功能</h4>
<p class="disabled-note">v1 的选题灵感和爆款分析为示例数据。在「设置→AI配置」中填入 LLM API Key 后，可启用 AI 智能推荐选题和分析爆款。</p>`
  },
  settings: {
    title: '⚙️ 设置与数据帮助',
    body: `<div class="guide-content">
<h4>设置页面包含以下部分</h4>
<ul>
<li><b>使用说明</b>：完整解释工作台各功能、账号、数据保存方式、导出/备份/恢复、迁移、同步方案、服务器架构、数据库、API 接口、费用说明</li>
<li><b>AI 配置</b>：填入 LLM API 的 Base URL、Key 和模型名称，启用 AI 智能功能</li>
<li><b>数据管理</b>：导出 JSON 备份、上传 JSON 恢复、清空所有数据</li>
<li><b>更新日志</b>：每次更新的日期、内容、影响范围、是否需要用户操作</li>
</ul>
<h4>未启用的能力（明确标注）</h4>
<p class="disabled-note">
· 云端多端实时同步（v1 使用浏览器本地存储）<br>
· 天气/金价/股市实时数据（需 API Key，v1 为占位模式）<br>
· 账号登录系统（v1 无需登录）<br>
· 自动抓取抖音/B站平台数据（需平台开放 API 授权）
</p>`
  },
  global: {
    title: '❓ 全局帮助',
    body: `<div class="guide-content">
<h4>欢迎使用易欢工作台！</h4>
<p>这是一个基于 Hello Kitty 主题的个人工作台，帮助你管理日常任务、学习、自媒体运营和生活记录。</p>
<h4>基本操作</h4>
<ul>
<li><b>导航</b>：电脑端使用左侧导航栏，手机端点击左上角 ☰ 按钮展开菜单</li>
<li><b>帮助</b>：每个模块右上角有 ⚪ 帮助按钮（电脑悬浮/手机点击查看说明）</li>
<li><b>数据</b>：所有数据保存在浏览器本地，不同设备/浏览器之间不互通</li>
<li><b>备份</b>：建议定期在「设置→数据管理」中导出 JSON 备份</li>
</ul>
<h4>v1 包含模块</h4>
<p>首页 · 打卡中心 · 雅思学习（6个子板块）· 自媒体运营（5个子标签）· 设置与数据</p>
<h4>视觉主题</h4>
<p>Hello Kitty 经典红 #E60012 + 浅豆沙红导航 #FFE0E6 + 米白页面 #FFF9FA</p>
<h4>技术信息</h4>
<p>纯静态前端应用，无需后端服务器。数据使用 localStorage 存储。响应式设计适配电脑/手机/平板。</p>
<p style="margin-top:12px;color:var(--text-light);font-size:12px;">版本 ${APP_VERSION} · 更新于 ${UPDATE_DATE}</p>`
  },
  financelife: {
    title: '💰 理财学习帮助',
    body: `<div class="guide-content">
<h4>这是什么？</h4>
<p>面向小白的理财启蒙模块，帮你从 0 建立理财认知，不荐股、不喊单。</p>
<h4>三个部分</h4>
<ul>
<li><b>本周学习计划</b>：给自己定个小目标（默认每周看 3 集），点「+1 集已看」记录进度，进度条实时更新，每周一自动重置。</li>
<li><b>入门课程表</b>：6 个主题（基金 / 股票 / 复利 / 资产配置 / 保险 / 风险），点卡片直达 B站 视频合集，跟着系统学。</li>
<li><b>今日理财名词</b>：每天一个基础概念 + 抖音讲解链接，「标记已读」后第二天换下一个，把术语啃下来。</li>
</ul>
<h4>和「黄金财经」的关系</h4>
<p>理财学习负责「学」，黄金财经负责「看行情 + 市场复盘」，两者配合用。</p>`
  },
  ai: {
    title: '🤖 AI学习帮助',
    body: `<div class="guide-content">
<h4>这是什么？</h4>
<p>系统化的 AI 学习入口，兼顾「理论组成」与「应用实战」。</p>
<h4>核心功能</h4>
<ul>
<li><b>AI 前沿动态</b>：点「用 AI 生成今日摘要」，会用你在「设置→AI 模型」里配置的模型，把最新 AI 资讯浓缩成一份速览（需先配置至少一个模型，支持多个）。</li>
<li><b>两栏每日精选</b>：左侧「理论」、右侧「应用」，每天各推 3 条，点「B站 ↗」看视频，点「标记已读」后第二天轮换新内容。</li>
<li><b>今日推荐视频</b>：按日期确定性轮换的一条重点视频。</li>
<li><b>我的课程</b>：在「设置→数据管理」或对应入口添加你自己的学习清单，可标记「已学」。</li>
</ul>`
  },
  gold: {
    title: '🥇 黄金财经帮助',
    body: `<div class="guide-content">
<h4>这是什么？</h4>
<p>看实时行情 + 做市场复盘的一站式面板。</p>
<h4>三个标签</h4>
<ul>
<li><b>今日</b>：伦敦金现价、核心行情（美元/原油/A股）、近 7 日金价折线。</li>
<li><b>历史</b>：金价历史记录列表。</li>
<li><b>市场复盘</b>：A股主要指数（V3 实时拉取）+ 盘面复盘笔记，随手记观察与反思。</li>
</ul>
<h4>数据说明</h4>
<p>金价走 gold-api、指数走腾讯财经代理；失败会回退样例并标注。所有数据为行情参考，不构成投资建议。</p>`
  },
  fortune: {
    title: '🔮 今日运势帮助',
    body: `<div class="guide-content">
<h4>这是什么？</h4>
<p>一个<strong>娱乐向</strong>的每日运势推演，基于你提供的生辰八字（乙酉 甲申 壬辰 丙午，日主壬水，阴女·土五局·命宫廉贞破军在卯）。</p>
<h4>它算什么？</h4>
<ul>
<li><b>今日干支</b>：用公历日期推算当日天干地支（算法以 2000-01-01=戊午日 校准，并已用你的生日验证：2005-09-05 确为壬辰日）。</li>
<li><b>五维运势</b>：综合 / 事业学业 / 财运 / 感情 / 健康，依据当日天干与日主壬水（偏强）的喜用关系（喜神火、木、土 → 高；忌神金、水 → 低）+ 当日种子生成。</li>
<li><b>幸运色 / 方位 / 数字</b>：日主壬水偏强，喜用神为火、木、土，据此推荐（火=红橙粉/南，木=绿青/东，土=黄棕/中西南）。</li>
<li><b>十二建除 · 宜忌</b>：传统建除十二神，给你当天的宜与忌。</li>
<li><b>贵人时</b>：按当日天干取日贵时辰。</li>
</ul>
<h4>重要提醒</h4>
<p>纯属趣味参考，<strong>不是占卜、不算命</strong>，别拿它做人生重大决策。命盘数据仅供本页推演使用。</p>`
  }
};

// 金句词库（365句轮换）
const QUOTES = [
  { zh: '慢慢来，会比较快。', en: 'Slowly, faster.' },
  { zh: '种一棵树最好的时间是十年前，其次是现在。', en: 'The best time to plant a tree was 10 years ago. The second best time is now.' },
  { zh: '你不必等到万事俱备才出发，边走边看也是一种智慧。', en: "You don't need everything ready to start. Figuring it out as you go is wisdom." },
  { zh: '今天的努力，是明天的底气。', en: "Today's effort is tomorrow's confidence." },
  { zh: '不要因为走得太远，而忘记为什么出发。', en: "Don't forget why you started, just because you've come so far." },
  { zh: '每一个不曾起舞的日子，都是对生命的辜负。', en: "Every day not danced is a betrayal of life." },
  { zh: '星光不问赶路人，时光不负有心人。', en: "The stars never ask the traveler; time never betrays the determined." },
  { zh: '所谓光辉岁月，并不是以后，而是无人问津时你对梦想的偏执。', en: "Glory days are not in the future, but your persistence when no one cares." },
  { zh: '生活不是等待风暴过去，而是学会在雨中跳舞。', en: "Life isn't waiting for the storm to pass, it's learning to dance in the rain." },
  { zh: '你的坚持，终将美好。', en: "Your persistence will eventually pay off." },
  { zh: '做最好的自己，剩下的交给时间。', en: "Be your best self, leave the rest to time." },
  { zh: '与其羡慕别人，不如超越自己。', en: "Rather than envy others, surpass yourself." },
  { zh: '每一次跌倒都是为了更好地站起。', en: "Every fall is for a better rise." },
  { zh: '温柔半两，从容一生。', en: "Gentleness in moderation, composure for life." },
  { zh: '愿你眼里有光，心中有爱，脚下有路。', en: "May you have light in your eyes, love in your heart, and a path beneath your feet." },
  { zh: '自律给我自由。', en: "Self-discipline gives me freedom." },
  { zh: '把每一天当作生命的最后一天来过。', en: "Live each day as if it were your last." },
  { zh: '成功不是终点，失败也不是终结。', en: "Success is not final, failure is not fatal." },
  { zh: '保持热爱，奔赴山海。', en: "Keep loving, head towards mountains and seas." },
  { zh: '你现在的努力，是为了以后有更多选择的权利。', en: "Your hard work now is for more choices later." },
];

// 雅思高频词库（示例 60 词，每日取 30）
const IELTS_WORDS = [
  { w:'crust', ph:'/krʌst/', pos:'n.', m:'地壳；外壳', col:'the earth\'s crust 地壳' },
  { w:'mantle', ph:'/ˈmæntl/', pos:'n.', m:'地幔；斗篷，披风 v.覆盖', col:'take up the mantle 继承衣钵' },
  { w:'longitude', ph:'/ˈlɒŋɡɪtjuːd/', pos:'n.', m:'经度（竖的）', col:'a line of longitude 经线' },
  { w:'latitude', ph:'/ˈlætɪtjuːd/', pos:'n.', m:'纬度（横的）', col:'high latitudes 高纬度地区' },
  { w:'horizon', ph:'/həˈraɪzn/', pos:'n.', m:'地平线；[~s]眼界，见识', col:'broaden your horizons 开阔眼界' },
  { w:'altitude', ph:'/ˈæltɪtjuːd/', pos:'n.', m:'高度，海拔', col:'at high altitude 在高海拔' },
  { w:'disaster', ph:'/dɪˈzɑːstə(r)/', pos:'n.', m:'灾难', col:'a disaster film 灾难片' },
  { w:'mishap', ph:'/ˈmɪshæp/', pos:'n.', m:'小灾难', col:'without mishap 平安无恙' },
  { w:'catastrophic', ph:'/ˌkætəˈstrɒfɪk/', pos:'adj.', m:'灾难性的', col:'catastrophic consequences 灾难性后果' },
  { w:'calamity', ph:'/kəˈlæməti/', pos:'n.', m:'灾难，不幸的事', col:'cause a calamity 酿成灾祸' },
  { w:'endanger', ph:'/ɪnˈdeɪndʒə(r)/', pos:'v.', m:'使遭受危险，危及', col:'endangered species 濒危物种' },
  { w:'jeopardise', ph:'/ˈdʒepədaɪz/', pos:'v.', m:'危害，危及', col:'jeopardise a life 危及生命' },
  { w:'destructive', ph:'/dɪˈstrʌktɪv/', pos:'adj.', m:'破坏性的，有害的', col:'destructive earthquake 破坏性地震' },
  { w:'greenhouse', ph:'/ˈɡriːnhaʊs/', pos:'n.', m:'温室，暖房', col:'the greenhouse effect 温室效应' },
  { w:'phenomenon', ph:'/fəˈnɒmɪnən/', pos:'n.', m:'现象', col:'a natural phenomenon 自然现象' },
  { w:'pebble', ph:'/ˈpebl/', pos:'n.', m:'鹅卵石', col:'a pebble beach 鹅卵石滩' },
  { w:'magnet', ph:'/ˈmæɡnət/', pos:'n.', m:'磁铁，吸铁石', col:'a magnet for tourists 游客聚集地' },
  { w:'ore', ph:'/ɔː(r)/', pos:'n.', m:'矿石；矿', col:'iron ore 铁矿石' },
  { w:'mineral', ph:'/ˈmɪnərəl/', pos:'n.', m:'矿物，矿物质', col:'mineral water 矿泉水' },
  { w:'marble', ph:'/ˈmɑːbl/', pos:'n.', m:'大理石', col:'a marble statue 大理石雕像' },
  { w:'quartz', ph:'/kwɔːts/', pos:'n.', m:'石英', col:'a quartz clock 石英钟' },
  { w:'granite', ph:'/ˈɡrænɪt/', pos:'n.', m:'花岗岩', col:'bite on granite 白费力气' },
  { w:'gust', ph:'/ɡʌst/', pos:'n.', m:'一阵狂风', col:'a gust of wind 一阵风' },
  { w:'breeze', ph:'/briːz/', pos:'n.', m:'微风，和风', col:'a gentle breeze 微风' },
  { w:'monsoon', ph:'/mɒnˈsuːn/', pos:'n.', m:'季风；雨季', col:'monsoon season 季风季节' },
  { w:'gale', ph:'/ɡeɪl/', pos:'n.', m:'大风', col:'a strong gale 强风' },
  { w:'hurricane', ph:'/ˈhʌrɪkən/', pos:'n.', m:'飓风；暴风', col:'hurricane warning 飓风警报' },
  { w:'tornado', ph:'/tɔːˈneɪdəʊ/', pos:'n.', m:'龙卷风', col:'a tornado hit 龙卷风袭击' },
  { w:'typhoon', ph:'/taɪˈfuːn/', pos:'n.', m:'台风', col:'a typhoon approaches 台风逼近' },
  { w:'volcano', ph:'/vɒlˈkeɪnəʊ/', pos:'n.', m:'火山', col:'an active volcano 活火山' },
  { w:'erupt', ph:'/ɪˈrʌpt/', pos:'v.', m:'爆发，喷发', col:'erupt into violence 爆发暴力' },
  { w:'magma', ph:'/ˈmæɡmə/', pos:'n.', m:'岩浆', col:'molten magma 熔岩' },
  { w:'smog', ph:'/smɒɡ/', pos:'n.', m:'烟雾，雾霾', col:'heavy smog 浓雾' },
  { w:'fume', ph:'/fjuːm/', pos:'n.', m:'~s 烟，气体 v.冒烟，发怒', col:'toxic fumes 有毒气体' },
  { w:'atmosphere', ph:'/ˈætməsfɪə(r)/', pos:'n.', m:'大气，气氛', col:'a pleasant atmosphere 愉快氛围' },
  { w:'oxygen', ph:'/ˈɒksɪdʒən/', pos:'n.', m:'氧气', col:'lack of oxygen 缺氧' },
  { w:'hydrogen', ph:'/ˈhaɪdrədʒən/', pos:'n.', m:'氢气', col:'hydrogen fuel 氢燃料' },
  { w:'core', ph:'/kɔː(r)/', pos:'n.', m:'中心，核心；地核', col:'the earth\'s core 地核' },
  { w:'photosynthesis', ph:'/ˌfəʊtəʊˈsɪnθəsis/', pos:'n.', m:'光合作用', col:'process of photosynthesis 光合作用' },
  { w:'vegetation', ph:'/ˌvedʒəˈteɪʃn/', pos:'n.', m:'植物，草木', col:'lush vegetation 茂密植被' },
  { w:'fertile', ph:'/ˈfɜːtaɪl/', pos:'adj.', m:'肥沃的，能繁殖的', col:'fertile soil 肥沃土壤' },
  { w:'barren', ph:'/ˈbærən/', pos:'adj.', m:'不育的，贫瘠的', col:'barren land 贫瘠土地' },
  { w:'timber', ph:'/ˈtɪmbə(r)/', pos:'n.', m:'木材，木料', col:'timber industry 木材业' },
  { w:'pollen', ph:'/ˈpɒlən/', pos:'n.', m:'花粉', col:'pollen allergy 花粉过敏' },
  { w:'drought', ph:'/draʊt/', pos:'n.', m:'干旱', col:'severe drought 严重干旱' },
  { w:'decompose', ph:'/ˌdiːkəmˈpəʊz/', pos:'v.', m:'分解；腐烂', col:'decompose matter 分解物质' },
  { w:'mammal', ph:'/ˈmæml/', pos:'n.', m:'哺乳动物', col:'marine mammal 海洋哺乳动物' },
  { w:'reptile', ph:'/ˈreptaɪl/', pos:'n.', m:'爬行动物', col:'cold-blooded reptile 冷血爬行动物' },
  { w:'predator', ph:'/ˈpredətə(r)/', pos:'n.', m:'捕食者', col:'top predator 顶级捕食者' },
  { w:'prey', ph:'/preɪ/', pos:'n.', m:'猎物 v.捕食', col:'prey on 捕食' },
  { w:'migrate', ph:'/maɪˈɡreɪt/', pos:'v.', m:'迁徙；移居', col:'migrate south 向南迁徙' },
  { w:'habitat', ph:'/ˈhæbɪtæt/', pos:'n.', m:'栖息地', col:'natural habitat 自然栖息地' },
  { w:'extinct', ph:'/ɪkˈstɪŋkt/', pos:'adj.', m:'灭绝的', col:'extinct species 灭绝物种' },
  { w:'breed', ph:'/briːd/', pos:'v.', m:'繁殖；饲养', col:'breed cattle 养牛' },
  { w:'orbit', ph:'/ˈɔːbɪt/', pos:'n.', m:'轨道 v.绕轨道运行', col:'in orbit 在轨道上' },
  { w:'gravity', ph:'/ˈɡrævəti/', pos:'n.', m:'重力，地心引力', col:'zero gravity 零重力' },
  { w:'galaxy', ph:'/ˈɡæləksi/', pos:'n.', m:'星系；银河系', col:'the Milky Way galaxy 银河系' },
  { w:'launch', ph:'/lɔːntʃ/', pos:'v.', m:'发射；发起', col:'launch a rocket 发射火箭' },
  { w:'telescope', ph:'/ˈtelɪskəʊp/', pos:'n.', m:'望远镜', col:'a powerful telescope 强力望远镜' },
  { w:'astronaut', ph:'/ˈæstrənɔːt/', pos:'n.', m:'宇航员', col:'a trained astronaut 受训宇航员' },
  { w:'compulsory', ph:'/kəmˈpʌlsəri/', pos:'adj.', m:'义务的，强制的', col:'compulsory education 义务教育' },
  { w:'curriculum', ph:'/kəˈrɪkjələm/', pos:'n.', m:'课程', col:'school curriculum 学校课程' },
  { w:'discipline', ph:'/ˈdɪsəplɪn/', pos:'n.', m:'纪律；学科 v.训导', col:'academic discipline 学科' },
  { w:'enroll', ph:'/ɪnˈrəʊl/', pos:'v.', m:'注册，招收', col:'enroll in a course 选课' },
  { w:'tuition', ph:'/tjuˈɪʃn/', pos:'n.', m:'学费；讲授', col:'tuition fees 学费' },
  { w:'scholar', ph:'/ˈskɒlə(r)/', pos:'n.', m:'学者；奖学金获得者', col:'a renowned scholar 著名学者' },
  { w:'literacy', ph:'/ˈlɪtərəsi/', pos:'n.', m:'读写能力', col:'literacy rate 识字率' },
  { w:'campus', ph:'/ˈkæmpəs/', pos:'n.', m:'校园', col:'on campus 在校园内' },
  { w:'innovate', ph:'/ˈɪnəveɪt/', pos:'v.', m:'创新，革新', col:'innovate in technology 技术创新' },
  { w:'device', ph:'/dɪˈvaɪs/', pos:'n.', m:'装置，设备', col:'electronic device 电子设备' },
  { w:'automate', ph:'/ˈɔːtəmeɪt/', pos:'v.', m:'使自动化', col:'automate production 自动化生产' },
  { w:'digital', ph:'/ˈdɪdʒɪtl/', pos:'adj.', m:'数字的', col:'digital age 数字时代' },
  { w:'apparatus', ph:'/ˌæpəˈreɪtəs/', pos:'n.', m:'器械，设备', col:'lab apparatus 实验器械' },
  { w:'heritage', ph:'/ˈherɪtɪdʒ/', pos:'n.', m:'遗产', col:'cultural heritage 文化遗产' },
  { w:'ancient', ph:'/ˈeɪnʃənt/', pos:'adj.', m:'古代的，古老的', col:'ancient civilization 古代文明' },
  { w:'evolve', ph:'/ɪˈvɒlv/', pos:'v.', m:'进化；发展', col:'evolve into 进化成' },
  { w:'tradition', ph:'/trəˈdɪʃn/', pos:'n.', m:'传统', col:'cultural tradition 文化传统' },
  { w:'dialect', ph:'/ˈdaɪəlekt/', pos:'n.', m:'方言', col:'local dialect 当地方言' },
  { w:'vocabulary', ph:'/vəˈkæbjələri/', pos:'n.', m:'词汇', col:'enlarge vocabulary 扩大词汇量' },
  { w:'bilingual', ph:'/ˌbaɪˈlɪŋɡwəl/', pos:'adj.', m:'双语的', col:'bilingual education 双语教育' },
  { w:'communicate', ph:'/kəˈmjuːnɪkeɪt/', pos:'v.', m:'交流，沟通', col:'communicate with 与…沟通' },
  { w:'recreation', ph:'/ˌrekrɪˈeɪʃn/', pos:'n.', m:'娱乐，消遣', col:'outdoor recreation 户外娱乐' },
  { w:'participate', ph:'/pɑːˈtɪsɪpeɪt/', pos:'v.', m:'参加，参与', col:'participate in 参与' },
  { w:'athlete', ph:'/ˈæθliːt/', pos:'n.', m:'运动员', col:'a professional athlete 职业运动员' },
  { w:'leisure', ph:'/ˈleʒə(r)/', pos:'n.', m:'闲暇', col:'leisure time 闲暇时间' },
  { w:'fashion', ph:'/ˈfæʃn/', pos:'n.', m:'时尚', col:'fashion trend 时尚潮流' },
  { w:'trend', ph:'/trend/', pos:'n.', m:'趋势', col:'current trend 当下趋势' },
  { w:'garment', ph:'/ˈɡɑːmənt/', pos:'n.', m:'服装，衣服', col:'a woollen garment 羊毛服装' },
  { w:'nutrition', ph:'/njuˈtrɪʃn/', pos:'n.', m:'营养', col:'good nutrition 良好营养' },
  { w:'vegetarian', ph:'/ˌvedʒəˈteəriən/', pos:'n.', m:'素食者 adj.素食的', col:'a vegetarian diet 素食' },
  { w:'diet', ph:'/ˈdaɪət/', pos:'n.', m:'日常饮食 v.节食', col:'a balanced diet 均衡饮食' },
  { w:'calorie', ph:'/ˈkæləri/', pos:'n.', m:'卡路里', col:'burn calories 燃烧卡路里' },
  { w:'architecture', ph:'/ˈɑːkɪtektʃə(r)/', pos:'n.', m:'建筑；架构', col:'modern architecture 现代建筑' },
  { w:'construct', ph:'/kənˈstrʌkt/', pos:'v.', m:'建造，构建', col:'construct a building 建楼' },
  { w:'infrastructure', ph:'/ˈɪnfrəstrʌktʃə(r)/', pos:'n.', m:'基础设施', col:'public infrastructure 公共基础设施' },
  { w:'vehicle', ph:'/ˈviːəkl/', pos:'n.', m:'车辆，交通工具', col:'a motor vehicle 机动车' },
  { w:'traffic', ph:'/ˈtræfɪk/', pos:'n.', m:'交通', col:'heavy traffic 拥堵交通' },
  { w:'commute', ph:'/kəˈmjuːt/', pos:'v.', m:'通勤', col:'commute to work 通勤上班' },
  { w:'transport', ph:'/trænˈspɔːt/', pos:'n./v.', m:'运输', col:'public transport 公共交通' },
  { w:'government', ph:'/ˈɡʌvənmənt/', pos:'n.', m:'政府', col:'central government 中央政府' },
  { w:'policy', ph:'/ˈpɒləsi/', pos:'n.', m:'政策', col:'government policy 政府政策' },
  { w:'democracy', ph:'/dɪˈmɒkrəsi/', pos:'n.', m:'民主', col:'a mature democracy 成熟民主' },
  { w:'parliament', ph:'/ˈpɑːləmənt/', pos:'n.', m:'议会', col:'parliament member 议会议员' },
  { w:'receipt', ph:'/rɪˈsiːt/', pos:'n.', m:'收据；收到', col:'a receipt for payment 付款收据' },
  { w:'invoice', ph:'/ˈɪnvɔɪs/', pos:'n.', m:'发票 v.开发票给', col:'issue an invoice 开票' },
  { w:'tax', ph:'/tæks/', pos:'n.', m:'税 v.对…征税', col:'income tax 所得税' },
  { w:'levy', ph:'/ˈlevi/', pos:'n.', m:'税款 v.征收，征(税)', col:'levy a tax on 对…征税' },
  { w:'consume', ph:'/kənˈsjuːm/', pos:'v.', m:'消耗；吃，喝', col:'consume energy 消耗能源' },
  { w:'spend', ph:'/spend/', pos:'v.', m:'花费 n.开支', col:'spend money on 在…上花钱' },
  { w:'cost', ph:'/kɒst/', pos:'v.', m:'需付费 n.费用；代价', col:'at any cost 不惜一切代价' },
  { w:'affluent', ph:'/ˈæfluənt/', pos:'adj.', m:'富裕的，富足的', col:'an affluent society 富裕社会' },
  { w:'enrich', ph:'/ɪnˈrɪtʃ/', pos:'v.', m:'使富有；充实', col:'enrich experience 丰富阅历' },
  { w:'sufficient', ph:'/səˈfɪʃnt/', pos:'adj.', m:'足够的', col:'sufficient evidence 充分证据' },
  { w:'adequate', ph:'/ˈædɪkwət/', pos:'adj.', m:'足够的；合格的', col:'adequate food 足够食物' },
  { w:'military', ph:'/ˈmɪlətri/', pos:'adj.', m:'军事的 n.军队', col:'military service 兵役' },
  { w:'weapon', ph:'/ˈwepən/', pos:'n.', m:'武器', col:'nuclear weapon 核武器' },
  { w:'conflict', ph:'/ˈkɒnflɪkt/', pos:'n.', m:'冲突', col:'armed conflict 武装冲突' },
  { w:'defend', ph:'/dɪˈfend/', pos:'v.', m:'防御，保卫', col:'defend against 防御' },
  { w:'occupation', ph:'/ˌɒkjuˈpeɪʃn/', pos:'n.', m:'职业；占据', col:'a well-paid occupation 高薪职业' },
  { w:'profession', ph:'/prəˈfeʃn/', pos:'n.', m:'职业，专业', col:'medical profession 医疗行业' },
  { w:'colleague', ph:'/ˈkɒliːɡ/', pos:'n.', m:'同事', col:'a trusted colleague 信赖的同事' },
  { w:'volunteer', ph:'/ˌvɒlənˈtɪə(r)/', pos:'n.', m:'志愿者 v.自愿', col:'volunteer work 志愿工作' },
  { w:'behave', ph:'/bɪˈheɪv/', pos:'v.', m:'表现，举止', col:'behave well 表现好' },
  { w:'persuade', ph:'/pəˈsweɪd/', pos:'v.', m:'说服', col:'persuade sb to 说服某人' },
  { w:'neglect', ph:'/nɪˈɡlekt/', pos:'v.', m:'忽视，疏于照顾', col:'neglect duty 玩忽职守' },
  { w:'cooperate', ph:'/kəʊˈɒpəreɪt/', pos:'v.', m:'合作', col:'cooperate with 与…合作' },
  { w:'mental', ph:'/ˈmentl/', pos:'adj.', m:'精神的，心理的', col:'mental health 心理健康' },
  { w:'physical', ph:'/ˈfɪzɪkl/', pos:'adj.', m:'身体的；物理的', col:'physical exercise 体育锻炼' },
  { w:'therapy', ph:'/ˈθerəpi/', pos:'n.', m:'治疗，疗法', col:'physical therapy 物理治疗' },
  { w:'exhausted', ph:'/ɪɡˈzɔːstɪd/', pos:'adj.', m:'筋疲力尽的', col:'feel exhausted 感到疲惫' },

  /* —— 自然·地理 补充 —— */
  { w:'glacier', ph:'/ˈɡlæsiə(r)/', pos:'n.', m:'冰川', col:'a melting glacier 消融的冰川' },
  { w:'earthquake', ph:'/ˈɜːθkweɪk/', pos:'n.', m:'地震', col:'a violent earthquake 强震' },
  { w:'avalanche', ph:'/ˈævəlɑːnʃ/', pos:'n.', m:'雪崩', col:'trigger an avalanche 引发雪崩' },
  { w:'erode', ph:'/ɪˈrəʊd/', pos:'v.', m:'侵蚀，腐蚀', col:'erode the coastline 侵蚀海岸线' },
  { w:'sediment', ph:'/ˈsedɪmənt/', pos:'n.', m:'沉积物', col:'river sediment 河流沉积物' },
  { w:'terrain', ph:'/təˈreɪn/', pos:'n.', m:'地形，地势', col:'rugged terrain 崎岖地形' },
  { w:'ecosystem', ph:'/ˈiːkəʊsɪstəm/', pos:'n.', m:'生态系统', col:'protect the ecosystem 保护生态' },
  { w:'biodiversity', ph:'/ˌbaɪəʊdaɪˈvɜːsəti/', pos:'n.', m:'生物多样性', col:'loss of biodiversity 生物多样性丧失' },
  { w:'organism', ph:'/ˈɔːɡənɪzəm/', pos:'n.', m:'生物，有机体', col:'a living organism 生物有机体' },
  { w:'microbe', ph:'/ˈmaɪkrəʊb/', pos:'n.', m:'微生物', col:'harmful microbes 有害微生物' },
  { w:'germinate', ph:'/ˈdʒɜːmɪneɪt/', pos:'v.', m:'发芽，萌芽', col:'seeds germinate 种子发芽' },
  { w:'foliage', ph:'/ˈfəʊliɪdʒ/', pos:'n.', m:'枝叶，叶子', col:'dense foliage 茂密枝叶' },
  { w:'marine', ph:'/məˈriːn/', pos:'adj.', m:'海洋的', col:'marine life 海洋生物' },
  { w:'terrestrial', ph:'/təˈrestriəl/', pos:'adj.', m:'陆地的', col:'terrestrial animals 陆地动物' },
  { w:'fauna', ph:'/ˈfɔːnə/', pos:'n.', m:'动物群', col:'the local fauna 当地动物群' },
  { w:'wildlife', ph:'/ˈwaɪldlaɪf/', pos:'n.', m:'野生动植物', col:'protect wildlife 保护野生动物' },
  { w:'domesticate', ph:'/dəˈmestɪkeɪt/', pos:'v.', m:'驯化，饲养', col:'domesticate animals 驯养动物' },

  /* —— 太空 补充 —— */
  { w:'spacecraft', ph:'/ˈspeɪskrɑːft/', pos:'n.', m:'宇宙飞船', col:'manned spacecraft 载人飞船' },
  { w:'satellite', ph:'/ˈsætəlaɪt/', pos:'n.', m:'卫星', col:'launch a satellite 发射卫星' },
  { w:'cosmos', ph:'/ˈkɒzmɒs/', pos:'n.', m:'宇宙', col:'explore the cosmos 探索宇宙' },
  { w:'probe', ph:'/prəʊb/', pos:'n.', m:'探测器 v.探查', col:'a space probe 太空探测器' },

  /* —— 教育 补充 —— */
  { w:'seminar', ph:'/ˈsemɪnɑː(r)/', pos:'n.', m:'研讨会，专题讨论', col:'a weekly seminar 每周研讨' },
  { w:'tutorial', ph:'/tjuˈtɔːriəl/', pos:'n.', m:'辅导课', col:'attend a tutorial 上辅导课' },
  { w:'assignment', ph:'/əˈsaɪnmənt/', pos:'n.', m:'作业，任务', col:'hand in an assignment 交作业' },
  { w:'dissertation', ph:'/ˌdɪsəˈteɪʃn/', pos:'n.', m:'学位论文', col:'write a dissertation 写论文' },
  { w:'lecturer', ph:'/ˈlektʃərə(r)/', pos:'n.', m:'讲师', col:'a visiting lecturer 客座讲师' },
  { w:'preschool', ph:'/ˈpriːskuːl/', pos:'adj./n.', m:'学前（的）', col:'preschool education 学前教育' },

  /* —— 科技 补充 —— */
  { w:'algorithm', ph:'/ˈælɡərɪðəm/', pos:'n.', m:'算法', col:'a complex algorithm 复杂算法' },
  { w:'artificial', ph:'/ˌɑːtɪˈfɪʃl/', pos:'adj.', m:'人工的，人造的', col:'artificial intelligence 人工智能' },
  { w:'simulate', ph:'/ˈsɪmjuleɪt/', pos:'v.', m:'模拟，仿真', col:'simulate a process 模拟过程' },
  { w:'database', ph:'/ˈdeɪtəbeɪs/', pos:'n.', m:'数据库', col:'build a database 建数据库' },
  { w:'bandwidth', ph:'/ˈbændwɪdθ/', pos:'n.', m:'带宽', col:'limited bandwidth 有限带宽' },

  /* —— 文化 补充 —— */
  { w:'ritual', ph:'/ˈrɪtʃuəl/', pos:'n.', m:'仪式，惯例', col:'a religious ritual 宗教仪式' },
  { w:'folklore', ph:'/ˈfəʊklɔː(r)/', pos:'n.', m:'民间传说', col:'local folklore 当地传说' },
  { w:'ethnicity', ph:'/eθˈnɪsəti/', pos:'n.', m:'种族，民族', col:'people of different ethnicity 不同民族' },
  { w:'indigenous', ph:'/ɪnˈdɪdʒənəs/', pos:'adj.', m:'本土的，土著的', col:'indigenous culture 本土文化' },
  { w:'monument', ph:'/ˈmɒnjumənt/', pos:'n.', m:'纪念碑，遗迹', col:'a historic monument 历史遗迹' },

  /* —— 语言 补充 —— */
  { w:'fluent', ph:'/ˈfluːənt/', pos:'adj.', m:'流利的', col:'speak fluent English 英语流利' },
  { w:'articulate', ph:'/ɑːˈtɪkjuleɪt/', pos:'v./adj.', m:'清晰表达；表达力强的', col:'articulate your ideas 表达想法' },
  { w:'slang', ph:'/slæŋ/', pos:'n.', m:'俚语', col:'street slang 街头俚语' },
  { w:'syntax', ph:'/ˈsɪntæks/', pos:'n.', m:'句法', col:'English syntax 英语句法' },
  { w:'translate', ph:'/trænsˈleɪt/', pos:'v.', m:'翻译', col:'translate into Chinese 译成中文' },

  /* —— 娱乐·艺术 补充 —— */
  { w:'melody', ph:'/ˈmelədi/', pos:'n.', m:'旋律', col:'a catchy melody 朗朗上口的旋律' },
  { w:'sculpture', ph:'/ˈskʌlptʃə(r)/', pos:'n.', m:'雕塑', col:'a marble sculpture 大理石雕塑' },
  { w:'ballet', ph:'/ˈbæleɪ/', pos:'n.', m:'芭蕾', col:'a ballet performance 芭蕾演出' },
  { w:'comedy', ph:'/ˈkɒmədi/', pos:'n.', m:'喜剧', col:'a stand-up comedy 单口喜剧' },

  /* —— 饮食 补充 —— */
  { w:'protein', ph:'/ˈprəʊtiːn/', pos:'n.', m:'蛋白质', col:'high in protein 高蛋白' },
  { w:'carbohydrate', ph:'/ˌkɑːbəʊˈhaɪdreɪt/', pos:'n.', m:'碳水化合物', col:'cut carbohydrates 减少碳水' },
  { w:'organic', ph:'/ɔːˈɡænɪk/', pos:'adj.', m:'有机的', col:'organic food 有机食品' },
  { w:'appetite', ph:'/ˈæpɪtaɪt/', pos:'n.', m:'胃口，食欲', col:'lose your appetite 没胃口' },

  /* —— 建筑 补充 —— */
  { w:'scaffold', ph:'/ˈskæfəʊld/', pos:'n.', m:'脚手架', col:'put up a scaffold 搭脚手架' },
  { w:'concrete', ph:'/ˈkɒŋkriːt/', pos:'n./adj.', m:'混凝土（的）', col:'a concrete building 混凝土建筑' },
  { w:'facade', ph:'/fəˈsɑːd/', pos:'n.', m:'建筑正面；表象', col:'the building facade 建筑正面' },
  { w:'residential', ph:'/ˌrezɪˈdenʃl/', pos:'adj.', m:'住宅的', col:'residential area 住宅区' },

  /* —— 交通 补充 —— */
  { w:'pedestrian', ph:'/pəˈdestriən/', pos:'n./adj.', m:'行人；步行的', col:'a pedestrian street 步行街' },
  { w:'lane', ph:'/leɪn/', pos:'n.', m:'车道；小巷', col:'a bus lane 公交专用道' },
  { w:'aviation', ph:'/ˌeɪviˈeɪʃn/', pos:'n.', m:'航空', col:'civil aviation 民航' },

  /* —— 政府·法律 补充 —— */
  { w:'legislation', ph:'/ˌledʒɪsˈleɪʃn/', pos:'n.', m:'立法，法律', col:'pass legislation 通过立法' },
  { w:'constitution', ph:'/ˌkɒnstɪˈtjuːʃn/', pos:'n.', m:'宪法；构成', col:'amend the constitution 修宪' },
  { w:'sanction', ph:'/ˈsæŋkʃn/', pos:'n./v.', m:'制裁；批准', col:'impose sanctions 实施制裁' },
  { w:'regime', ph:'/reɪˈʒiːm/', pos:'n.', m:'政权，政体', col:'a democratic regime 民主政体' },

  /* —— 社会 补充 —— */
  { w:'hierarchy', ph:'/ˈhaɪərɑːki/', pos:'n.', m:'等级制度', col:'a social hierarchy 社会等级' },
  { w:'inequality', ph:'/ˌɪnɪˈkwɒləti/', pos:'n.', m:'不平等', col:'income inequality 收入不平等' },
  { w:'poverty', ph:'/ˈpɒvəti/', pos:'n.', m:'贫困', col:'alleviate poverty 缓解贫困' },
  { w:'welfare', ph:'/ˈwelfeə(r)/', pos:'n.', m:'福利', col:'social welfare 社会福利' },
  { w:'refugee', ph:'/ˌrefjuˈdʒiː/', pos:'n.', m:'难民', col:'a war refugee 战争难民' },

  /* —— 职业 补充 —— */
  { w:'recruit', ph:'/rɪˈkruːt/', pos:'v./n.', m:'招聘；新成员', col:'recruit new staff 招聘新人' },
  { w:'resume', ph:'/ˈrezjumeɪ/', pos:'n.', m:'简历', col:'polish your resume 润色简历' },
  { w:'intern', ph:'/ˈɪntɜːn/', pos:'n./v.', m:'实习生；实习', col:'summer intern 暑期实习生' },
  { w:'freelance', ph:'/ˈfriːlɑːns/', pos:'adj./n.', m:'自由职业的', col:'work freelance 自由职业' },

  /* —— 行为·身心 补充 —— */
  { w:'tolerate', ph:'/ˈtɒləreɪt/', pos:'v.', m:'容忍，忍受', col:'tolerate the noise 忍受噪音' },
  { w:'motivate', ph:'/ˈməʊtɪveɪt/', pos:'v.', m:'激励，激发', col:'motivate students 激励学生' },
  { w:'dominate', ph:'/ˈdɒmɪneɪt/', pos:'v.', m:'支配，主导', col:'dominate the market 主导市场' },
  { w:'reconcile', ph:'/ˈrekənsaɪl/', pos:'v.', m:'和解；调和', col:'reconcile differences 调和分歧' },
  { w:'fatigue', ph:'/fəˈtiːɡ/', pos:'n.', m:'疲劳', col:'mental fatigue 精神疲劳' },
  { w:'insomnia', ph:'/ɪnˈsɒmniə/', pos:'n.', m:'失眠', col:'suffer from insomnia 失眠' },
  { w:'anxious', ph:'/ˈæŋkʃəs/', pos:'adj.', m:'焦虑的，渴望的', col:'feel anxious about 对…焦虑' },
  { w:'immune', ph:'/ɪˈmjuːn/', pos:'adj.', m:'免疫的；豁免的', col:'immune system 免疫系统' },
];

// 雅思口语话题示例
const SPEAKING_TOPICS = [
  { type:'Part1', title:'描述你的家乡', points:['介绍地理位置','谈论特色美食或风景','表达个人情感'], expr:'I come from..., which is famous for...', highScore:'使用具体细节+个人感受，避免泛泛而谈',
    words:['hometown','coastal','cuisine','scenery','specialty','vibrant','humid'],
    phrases:['be known for...','be situated in...','what I like most is...'],
    sentences:['My hometown is a small coastal city known for its fresh seafood.','What I cherish most is the laid-back lifestyle there.'] },
  { type:'Part1', title:'谈论你喜欢的电影', points:['电影类型+片名','剧情简述+喜欢原因','推荐理由'], expr:'One of my favorite movies is... because...', highScore:'使用形容词升级：fantastic → breathtaking/mind-blowing',
    words:['genre','plot','soundtrack','director','touching','thought-provoking'],
    phrases:['a film that sticks with me','what appeals to me is...','leave a deep impression'],
    sentences:['The plot is gripping from start to finish.','It is a thought-provoking drama that explores family bonds.'] },
  { type:'Part2', title:'描述一次难忘的旅行', points:['时间地点人物','旅行中的具体事件','感受和收获'], expr:'I\'d like to talk about a trip I took to...', highScore:'注意时态一致性，多用过去时+现在完成时回顾',
    words:['itinerary','breathtaking','souvenir','off the beaten track','unforgettable','broaden one\'s horizons'],
    phrases:['what made it memorable was...','I was amazed by...','looking back, I...'],
    sentences:['The scenery was absolutely breathtaking.','It was a journey that broadened my horizons.'] },
  { type:'Part2', title:'描述一个对你影响深远的人', points:['这个人是谁','他/她如何影响了你','这种影响体现在哪里'], expr:'The person who has influenced me most is...', highScore:'使用定语从句和非谓语动词提升句式复杂度',
    words:['mentor','role model','perseverance','inspirational','outlook','shape'],
    phrases:['He/She taught me that...','what I learned from him/her...','shape my attitude towards...'],
    sentences:['She shaped my outlook on life with her perseverance.','His words still guide me whenever I doubt myself.'] },
  { type:'Part3', title:'科技对教育的影响', points:['正反两方面讨论','举例说明','未来展望'], expr:'Technology has revolutionized education in many ways...', highScore:'使用对比连接词：however/on the other hand/whereas',
    words:['revolutionize','accessibility','distraction','personalized learning','digital divide','engagement'],
    phrases:['on the flip side...','a double-edged sword','strike a balance between...'],
    sentences:['Online platforms have greatly improved access to education.','Over-reliance on screens, however, can be a distraction.'] },
  { type:'Part3', title:'城市化带来的问题', points:['问题列举','原因分析','解决建议'], expr:'Urbanization has brought about a host of issues...', highScore:'使用名词化表达提升正式度：the rapid expansion of cities',
    words:['urban sprawl','congestion','infrastructure','affordability','sustainability','overcrowded'],
    phrases:['a viable solution would be...','give rise to...','urgent measures are needed'],
    sentences:['Traffic congestion has become a daily headache.','Sustainable urban planning is urgently needed.'] },
];

// 口语场景对话（单句跟读 → 场景模式）
const SPEAKING_SCENES = [
  { title:'在咖啡馆点单', setting:'你走进一家咖啡馆，店员迎接你。练习如何自然点单与应答。',
    lines:[ {role:'Barista', text:'Hi there! What can I get for you today?'}, {role:'You', text:'Could I have a medium latte, please? And is the Wi-Fi free here?'}, {role:'Barista', text:'Sure, that comes to 28 yuan. Wi-Fi is free — the password is on the counter.'}, {role:'You', text:'Great, thanks. I will find a seat by the window.'} ],
    prompt:'试着用自己的话复述你的点单，并加一句关于位置的补充（如 by the window / near the door）。' },
  { title:'约朋友周末出游', setting:'你打电话约朋友周末去郊外骑行。练习提出邀请与确认细节。',
    lines:[ {role:'Friend', text:'Hey! Are you free this Saturday? We could do something fun.'}, {role:'You', text:'I was just thinking about a bike ride in the countryside. Want to join me?'}, {role:'Friend', text:'Sounds perfect! What time shall we meet, and where?'}, {role:'You', text:'How about 9 a.m. at the east gate of the park? We can rent bikes there.'} ],
    prompt:'练习用 "How about...?" 提出时间地点，并把 "rent bikes" 换成你自己的活动。' },
  { title:'课堂向老师提问', setting:'课后你没听懂一个概念，向老师请教。练习礼貌提问与确认。',
    lines:[ {role:'Teacher', text:'Did everyone understand the last part of the lecture?'}, {role:'You', text:'Excuse me, I am a bit confused about the term "ecosystem". Could you explain it again?'}, {role:'Teacher', text:'Of course. An ecosystem is all the living things and their environment interacting together.'}, {role:'You', text:'Thank you, that makes sense now. So humans are part of it too, right?'} ],
    prompt:'用 "Could you explain... again?" 礼貌请求重复，并补一句确认理解的问句。' },
];

// 写作范文示例
const WRITING_ESSAYS = [
  { type:'Task2', topic:'环境类', title:'全球变暖的原因与对策', source:'Simon 9分范文', structure:'引言→主体段1(原因)→主体段2(对策)→结论', phrases:'It is undeniable that... / A pressing issue that demands immediate attention', body:"It is undeniable that global warming has become a pressing issue that demands immediate attention. The primary cause is the excessive emission of greenhouse gases from burning fossil fuels in industry and transport. Deforestation further reduces the planet's capacity to absorb carbon dioxide. To tackle this, governments should impose stricter regulations on emissions and invest heavily in renewable energy such as solar and wind. Individuals can also contribute by adopting public transport and reducing waste. Only through joint efforts can we mitigate the crisis." },
  { type:'Task2', topic:'教育类', title:'大学教育的目的', source:'写作真经高分范文', structure:'让步→主论点→论证→例证→总结', phrases:'serve a dual purpose / equip students with / foster critical thinking', body:"Some argue that universities should equip students with practical skills for the workplace, while others believe their true function is to pursue knowledge for its own sake. In my view, a university should serve a dual purpose. On the one hand, it must foster critical thinking and a love of learning that last a lifetime; on the other hand, it should provide the professional training needed in a competitive economy. A balanced approach better prepares graduates for both personal fulfilment and societal contribution." },
  { type:'Task2', topic:'科技类', title:'人工智能对就业的影响', source:'模拟范文', structure:'现象引入→利弊分析→个人观点→建议措施', phrases:'a double-edged sword / render obsolete / create new opportunities', body:"Artificial intelligence is a double-edged sword for employment. While it may render certain routine jobs obsolete, it also creates new opportunities in fields such as data science and AI maintenance. The key lies in education: workers must be retrained to collaborate with machines rather than compete against them. Governments and companies should fund reskilling programmes so that the benefits of automation are widely shared instead of deepening inequality." },
  { type:'Task1', topic:'图表类', title:'线图：碳排放趋势', source:'Simon 图表范文', structure:'概述→详细描述(分组比较)→总结', phrases:'experienced a dramatic increase / peaked at / showed a downward trend', body:"The line graph illustrates changes in carbon emissions from 2000 to 2020. Overall, emissions experienced a dramatic increase, peaking at 38 billion tonnes in 2015. After that, a downward trend emerged as renewable energy adoption grew. Country A consistently emitted more than Country B, though the gap narrowed after 2012. In conclusion, although total emissions rose for most of the period, recent policies appear to have reversed the trend." },
  { type:'Task1', topic:'地图类', title:'村庄变迁地图', source:'写作真经', structure:'概述→过去描述→现在描述→主要变化总结', phrases:'underwent significant transformation / gave way to / was converted into', body:"The maps show a village before and after its transformation. The most significant change is that farmland gave way to residential blocks, and the small pond was converted into a public park. A new road now connects the village to the city, replacing the old winding path. While the school remained, a shopping centre was added near the centre. Overall, the village underwent significant transformation from a rural settlement into a more urbanised community." },
];

// 万能句式库
const USEFUL_PHRASES = [
  { cat:'开头', phrases:['It is widely argued that...', 'There is no denying that...', 'In contemporary society,...'] },
  { cat:'转折', phrases:['However, it should be noted that...', 'Conversely,...', 'On the other hand,...'] },
  { cat:'递进', phrases:['Furthermore,...', 'Moreover,...', 'What is more concerning is that...'] },
  { cat:'结论', phrases:['In conclusion,...', 'To sum up,...', 'Taking all factors into consideration,...'] },
  { cat:'举例', phrases:['A case in point is...', 'For instance,...', 'This can be illustrated by...'] },
];

// 爆款二创示例
const VIRAL_EXAMPLES = [
  { formula:'数字+痛点+解决方案', title:'3个副业让我月入过万，上班族必看', structure:'Hook(数字冲击)→痛点共鸣→方法拆解→行动号召', hotspot:'搞钱干货', analysis:'开头用具体数字抓住注意力，中间用"我也曾..."拉近距离，结尾引导互动' },
  { formula:'反差+情绪+反转', title:'从0到10万粉，我只做对了这一件事', structure:'低谷描述→转折点→方法论→结果验证', hotspot:'知识科普', analysis:'反差制造好奇心，情绪引发共鸣，反转给出价值感' },
  { formula:'场景+细节+共鸣', title:'独居女生的100元改造出租屋，邻居都惊了', structure:'Before/After对比→步骤详解→花费清单→效果展示', hotspot:'生活日常', analysis:'视觉冲击力强，步骤可复用性强，评论区容易引发"求链接"互动' },
  { formula:'盘点+排序+悬念', title:'试了5款防晒，第3个直接封神！', structure:'引入痛点→逐一测评→排名揭晓→购买建议', hotspot:'美妆穿搭', analysis:'盘点类内容完播率高，排名制造悬念，"封神"等网络热词增加传播性' },
  { formula:'挑战+过程+结果', title:'挑战30天只花500元活下去，最后一天我哭了', structure:'规则设定→每日记录→困难与突破→最终结果+感悟', hotspot:'AI工具', analysis:'挑战类内容自带叙事张力，真实感强，容易引发追更和模仿' },
];

// ===== 数据层 =====
const DB = {
  _prefix: 'yhwb_',

  _key(k) { return this._prefix + k; },

  get(k, def=null) {
    try { const v = localStorage.getItem(this._key(k)); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },

  set(k, v) { localStorage.setItem(this._key(k), JSON.stringify(v)); },

  remove(k) { localStorage.removeItem(this._key(k)); },

  // 初始化默认数据
  init() {
    if (!this.get('_init')) {
      this.set('tasks', this._sampleTasks());
      this.set('words_mastered', {});
      this.set('checkins', []);
      this.set('countdowns', [{ id:1, title:'我的生日', lunar:{ly:2005,lm:8,ld:2}, repeat:true, desc:'农历八月初二 · 每年重复' }]);
      this.set('weather', { city:'上海', temp:28, low:33, high:35, condition:'晴', rain:15, tip:'今天阳光充足，适合户外活动哦～记得涂防晒！' });
      this.set('ideas', this._sampleIdeas());
      this.set('virals', VIRAL_EXAMPLES);
      this.set('materials', this._sampleMaterials());
      this.set('notes', []);
      this.set('habits', this._sampleHabits());
      this.set('reviews', []);
      this.set('word_game_scores', { match:0, memory:0, snake:0, flashcard:0 });
      this.set('ai_config', { baseUrl:'', apiKey:'', model:'' });
      this.set('_init', true);
    }
    // 迁移：旧生日条目（固定阳历 2005-08-02）转为农历八月初二
    const _cds = this.get('countdowns', null);
    if (_cds && _cds.some(c => c.date === '2005-08-02')) {
      this.set('countdowns', _cds.map(c => c.date === '2005-08-02'
        ? { id:c.id, title:'我的生日', lunar:{ly:2005,lm:8,ld:2}, repeat:true, desc:'农历八月初二 · 每年重复' }
        : c));
    }
    this.set('quote_index', 0);
  },

  _sampleTasks() {
    const today = new Date().toISOString().slice(0,10);
    return [
      { id:1, text:'背诵30个雅思单词', cat:'学习任务', mod:'ielts_words', done:false, date:today },
      { id:2, text:'完成1篇雅思阅读', cat:'学习任务', mod:'ielts_reading', done:false, date:today },
      { id:3, text:'发布1条自媒体内容', cat:'自媒体任务', mod:'selfmedia', done:false, date:today },
      { id:4, text:'喝水8杯', cat:'生活任务', mod:'habit', done:false, date:today },
      { id:5, text:'运动30分钟', cat:'运动健康任务', mod:'habit', done:false, date:today },
      { id:6, text:'写今日复盘', cat:'临时待办', mod:'review', done:false, date:today },
    ];
  },

  _sampleIdeas() {
    return [
      { id:1, title:'大学生副业实操｜我用AI做自媒体月入3000+', thought:'分享从0到1的过程，重点讲AI工具怎么用', category:'搞钱干货', tags:['副业','AI'], status:'灵感', fav:false, createdAt:new Date().toISOString().slice(0,10) },
      { id:2, title:'宿舍低成本改造｜200块让室友羡慕哭', thought:'前后对比视频，附购物清单', category:'生活日常', tags:['宿舍','改造'], status:'灵感', fav:false, createdAt:new Date().toISOString().slice(0,10) },
      { id:3, title:'雅思7分经验贴｜我踩过的坑你别踩', thought:'分听说读写四科讲，每科给具体资料和方法', category:'知识科普', tags:['雅思','备考'], status:'灵感', fav:true, createdAt:new Date().toISOString().slice(0,10) },
    ];
  },

  _sampleMaterials() {
    return [
      { id:1, type:'文案金句', content:'不是你不够好，是你还没遇到对的赛道', tags:['励志','文案'], fav:true },
      { id:2, type:'封面参考', content:'大字标题+渐变背景+emoji点缀', tags:['封面','模板'], fav:false },
      { id:3, type:'BGM合集', content:'热门BGM：Summer / Vibing / Way Back Home', tags:['BGM','音乐'], fav:true },
    ];
  },

  _sampleHabits() {
    return [
      { id:1, name:'早起打卡', freq:'daily', remind:'07:00', order:1 },
      { id:2, name:'每日喝水', freq:'daily', remind:'', order:2 },
      { id:3, name:'早睡', freq:'daily', remind:'23:00', order:3 },
      { id:4, name:'护肤', freq:'daily', remind:'', order:4 },
      { id:5, name:'阅读', freq:'daily', remind:'', order:5 },
      { id:6, name:'运动', freq:'daily', remind:'', order:6 },
    ];
  },

  // 导出全部数据
  exportAll() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(this._prefix)) {
        data[k] = localStorage.getItem(k);
      }
    }
    return JSON.stringify(data, null, 2);
  },

  // 导入数据
  importAll(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      Object.keys(data).forEach(k => { localStorage.setItem(k, data[k]); });
      return true;
    } catch(e) { return false; }
  },

  // 清空全部数据
  clearAll() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).startsWith(this._prefix)) keys.push(localStorage.key(i));
    }
    keys.forEach(k => localStorage.removeItem(k));
  }
};

// ===== 工具函数 =====
function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function gid(id) { return document.getElementById(id); }

function toast(msg, dur=2200) {
  const t = gid('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), dur);
}

function genId() { return Date.now() + Math.random().toString(36).slice(2, 8); }

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 根据任务文本自动判断分类与所属模块
function classifyTask(text) {
  const t = text.toLowerCase();
  if (/阅读|reading|真经|剑雅.*阅读|郭佳荣/.test(t)) return { cat:'学习任务', mod:'ielts_reading' };
  if (/听力|listening|9988|黑眼睛|何琼|雅思王|精听/.test(t)) return { cat:'学习任务', mod:'ielts_listening' };
  if (/口语|speaking|杨帅|900句|影子跟读|part1|part2|part3|雅思哥.*口语/.test(t)) return { cat:'学习任务', mod:'ielts_speaking' };
  if (/写作|writing|顾家北|杜仕名|小作文|大作文|写作短语|雅思哥.*作文/.test(t)) return { cat:'学习任务', mod:'ielts_writing' };
  if (/单词|词汇|墨墨|538|考点词|背单词/.test(t)) return { cat:'学习任务', mod:'ielts_words' };
  if (/剑雅真题|模拟考试|模考|整套/.test(t)) return { cat:'学习任务', mod:'ielts_exam' };
  return { cat:'学习任务', mod:'ielts_exam' };
}

// 压缩图片/照片为 base64（用于任务打卡）
function compressPhoto(file, maxSize, cb) {
  const reader = new FileReader();
  reader.onload = function() {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      cb(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// 从 JSON 加载雅思每日学习任务（仅导入今天及未来 90 天内未完成的任务，避免爆 localStorage）
let IELTS_DAILY_TASKS = null;
async function loadIeltsDailyTasks() {
  if (IELTS_DAILY_TASKS) return IELTS_DAILY_TASKS;
  try {
    const res = await fetch('./data/ielts_daily_tasks.json', { cache: 'no-store' });
    if (!res.ok) return null;
    IELTS_DAILY_TASKS = await res.json();
    return IELTS_DAILY_TASKS;
  } catch (e) { return null; }
}

let READING_538 = null;
async function loadReading538() {
  if (READING_538) return READING_538;
  try {
    const res = await fetch('./data/reading_538.json', { cache: 'no-store' });
    if (!res.ok) return null;
    READING_538 = await res.json();
    return READING_538;
  } catch (e) { return null; }
}

let BILI_VIDEOS = null;
async function loadBiliVideos() {
  if (BILI_VIDEOS) return BILI_VIDEOS;
  try {
    const res = await fetch('./data/bili_videos.json', { cache: 'no-store' });
    if (!res.ok) return null;
    BILI_VIDEOS = await res.json();
    return BILI_VIDEOS;
  } catch (e) { return null; }
}

async function syncIeltsTasks() {
  const data = await loadIeltsDailyTasks();
  if (!data || !data.plan) return;
  const today = todayStr();
  const tasks = DB.get('tasks', []);
  const existingIds = new Set(tasks.map(t => t.id));
  let added = 0;
  data.plan.forEach(day => {
    // 只导入今天、未来 90 天内以及过去 7 天的任务（最近可补）
    const diff = Math.round((new Date(day.date) - new Date(today)) / 86400000);
    if (diff < -7 || diff > 90) return;
    day.tasks.forEach((t, idx) => {
      const id = `ielts_${day.date}_${idx}`;
      if (existingIds.has(id)) return;
      const cls = classifyTask(t.text);
      tasks.push({
        id, text: t.text.replace(/\n/g, ' | '),
        cat: cls.cat, mod: cls.mod,
        done: false, date: day.date,
        source: 'ielts_plan'
      });
      added++;
    });
  });
  if (added > 0) {
    DB.set('tasks', tasks);
    console.log('[IELTS] 已同步', added, '条学习任务');
  }
}

// 农历近似转换（简化版，仅用于显示）
function getLunarDateStr(d) {
  // 简化实现：返回固定农历文本（完整 lunar 库较大，此处用近似）
  const lunarInfo = [
    '正月初一','正月十五','二月初二','二月十四','三月初三','三月廿八',
    '四月初五','四月二十','五月初五','五月廿八','六月初一','六月十八',
    '七月初七','七月十五','八月十五','九月初九','九月廿八','十月初一',
    '十月十五','冬月初一','冬月初八','腊月初八','腊月二十','除夕'
  ];
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000);
  const idx = dayOfYear % lunarInfo.length;
  return `农历${lunarInfo[idx]}`;
}

// 获取今日金句
function getTodayQuote() {
  const idx = DB.get('quote_index', 0);
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  const qIdx = (dayOfYear + idx) % QUOTES.length;
  return QUOTES[qIdx];
}

// 单词发音（移动端优先用有道 TTS 音频，桌面回退浏览器语音合成）
let _speakAudio = null;
function speakWord(word) {
  word = (word || '').trim();
  if (!word) return;
  try {
    if (!_speakAudio) { _speakAudio = new Audio(); _speakAudio.preload = 'auto'; }
    _speakAudio.src = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(word) + '&type=2';
    const p = _speakAudio.play();
    if (p && p.catch) p.catch(() => fallbackSpeak(word));
    return;
  } catch (e) {
    fallbackSpeak(word);
  }
}
function fallbackSpeak(word) {
  if ('speechSynthesis' in window) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US'; u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch (e) { toast('当前环境无法播放发音'); }
  } else {
    toast('当前环境无法播放发音');
  }
}

// ===== 路由系统 =====
let currentRoute = 'home';
let currentSubRoute = '';

function navigate(route, subRoute='') {
  currentRoute = route;
  currentSubRoute = subRoute;
  window.location.hash = subRoute ? `${route}/${subRoute}` : route;
  render();
  updateNavActive();
  updateTopBar();
  closeDrawer();
}

function parseHash() {
  const h = window.location.hash.slice(1);
  if (!h) return { route:'home', sub:'' };
  const parts = h.split('/');
  return { route: parts[0], sub: parts.slice(1).join('/') };
}

// ===== 渲染引擎 =====
function render() {
  const app = gid('app');
  switch(currentRoute) {
    case 'home': app.innerHTML = renderHome(); break;
    case 'checkin': app.innerHTML = renderCheckin(); break;
    case '_ielts':
    case 'ielts_words':
    case 'ielts_listening':
    case 'ielts_speaking':
    case 'ielts_reading':
    case 'ielts_writing':
    case 'ielts_exam':
    case 'ielts_plan':
      app.innerHTML = renderIELTS(currentRoute === '_ielts' ? 'ielts_words' : currentRoute); break;
    case 'selfmedia': app.innerHTML = renderSelfmedia(); break;
    case 'memo': app.innerHTML = renderMemo(); break;
    case 'settings': app.innerHTML = renderSettings(); break;
    default: app.innerHTML = renderComingSoon(currentRoute); break;
  }
  bindEvents();
  if (window.afterRender) window.afterRender(currentRoute);
  if (currentRoute === 'home' && typeof window.loadDailyHome === 'function') {
    setTimeout(window.loadDailyHome, 60);
  }
}

// ===== 首页渲染 =====
function renderHome() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const wd = ['日','一','二','三','四','五','六'][now.getDay()];
  const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
  const lunar = getLunarDateStr(now);
  const quote = getTodayQuote();
  const checkins = DB.get('checkins',[]);
  const today = todayStr();
  const checkedToday = checkins.includes(today);
  const consecutive = calcConsecutive(checkins);
  const signInfo = lastSigninInfo(checkins);
  const consecutiveLabel = signInfo.checkedToday
    ? `连续签到 ${consecutive} 天`
    : (consecutive > 0 ? `昨日连签 ${consecutive} 天` : '尚未连续签到');

  const countdowns = DB.get('countdowns',[]);
  const weather = DB.get('weather',{});
  const tasks = DB.get('tasks',[]).filter(t=>t.date===today);
  const doneCount = tasks.filter(t=>t.done).length;

  let reportHtml = '';
  if (doneCount > 0 || tasks.length === 0) {
    reportHtml = generateReport(today);
  } else {
    reportHtml = '<span style="color:var(--text-light)">点击刷新按钮生成今日汇报</span>';
  }

  return `<div class="page">
    <!-- 问候区 Hero -->
    <div class="greeting-section greeting-hero">
      <div class="greeting-hero-inner">
        <div class="greeting-decor greeting-decor-left">
          <span class="gh-deco-heart">💗</span>
          <span class="gh-deco-star">✨</span>
        </div>
        <div class="greeting-center">
          <h2>Hi，小易欢~</h2>
          <p>今天还没成为富婆吗？</p>
        </div>
        <div class="greeting-decor greeting-decor-right">
          ${HK.pic('homecover', 120)}
        </div>
      </div>
    </div>

    <!-- 时钟区 -->
    <div class="clock-section">
      <div class="clock-time" id="clockTime">${hh}:${mm}</div>
      <div class="clock-date">${dateStr} 星期${wd} | ${lunar}</div>
    </div>

    <!-- 三丽鸥合照横幅 -->
    <div class="sanrio-banner-wrap">
      <div class="sanrio-wave sanrio-wave-left">★━━━━━</div>
      ${HK.pic('sanrio_banner', 420)}
      <div class="sanrio-wave sanrio-wave-right">━━━━━★</div>
    </div>

    <!-- 今日金句 -->
    <div class="card quote-card">
      <div class="card-title-row">
        <span class="card-title">今日金句 · 每日共勉<span class="help-badge" data-help="home"></span></span>
      </div>
      <div class="quote-zh">${quote.zh}</div>
      <div class="quote-en">${quote.en}</div>
      <div class="quote-decor">${HK.flower(26)}</div>
    </div>

    <!-- 日历签到 -->
    <div class="card">
      <div class="calendar-header">
        <span class="card-title">每日签到<span class="help-badge" data-help="home"></span></span>
        <span class="cal-head-right">${HK.classicSit(30)}<span class="card-badge">${consecutiveLabel}</span></span>
      </div>
      ${renderCalendar(checkins)}
      <div class="cal-actions">
        <button class="btn btn-primary btn-sm" data-act="doCheckin" ${checkedToday?'disabled style="opacity:0.5"':''}>
          ${checkedToday ? '✓ 已签到' : HK.bow(14) + ' 签到'}
        </button>
        <span class="cal-hint">${signInfo.checkedToday
          ? '今天已签到 ✓'
          : (signInfo.last
              ? `上次签到 ${signInfo.last}${signInfo.gap>0 ? ' · 已中断 ' + signInfo.gap + ' 天' : ''} · 今天还没签`
              : '还没有签到记录，点「签到」开始吧')}</span>
      </div>
    </div>

    <!-- 成长汇报 -->
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">今日成长汇报 <span class="hk-deco">${HK.bows(20)}</span><span class="help-badge" data-help="home"></span></span>
        <button class="btn-icon" data-act="refreshReport" title="刷新生成">↻</button>
      </div>
      <div class="report-text" id="reportArea">${reportHtml}</div>
    </div>

    <!-- 倒计时 -->
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">倒计时<span class="help-badge" data-help="home"></span></span>
        <button class="btn btn-primary btn-xs" data-act="addCountdown">+ 添加</button>
      </div>
      <div id="countdownList">
        ${countdowns.map(c => {
          const days = calcDaysLeft(c);
          const solar = c._solar ? `（阳历 ${c._solar}）` : '';
          return `<div class="countdown-item">
            <div class="countdown-icon">${HK.face(24)}</div>
            <div class="countdown-info">
              <div class="countdown-label">距离 ${esc(c.title)} ${esc(c.desc||'')}${solar}</div>
            </div>
            <div class="countdown-days">${days} 天</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- 天气 -->
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">今日天气 <span class="hk-deco">${HK.bear(20)}</span><span class="help-badge" data-help="home"></span></span>
        <span id="weatherStatus" class="v2-live-badge">…</span>
        <button class="btn btn-outline btn-xs" data-act="refreshWeather" title="点击切换城市">${esc(weather.city||'北京')}</button>
      </div>
      <div class="weather-main" id="weatherLive">
        <div class="weather-temp">${weather.temp!=null?weather.temp:'--'}°C</div>
        <div class="weather-detail">
          <div>${esc(weather.condition||'加载中…')}</div>
          ${weather.low!=null?`<div>${weather.low}°C / ${weather.high}°C</div>`:''}
          ${weather.humidity!=null?`<div>湿度 ${weather.humidity}% · 风速 ${weather.wind}km/h</div>`:''}
        </div>
        <div style="display:flex;gap:4px;align-items:center">${HK.wavePink(28)}</div>
      </div>
      <div id="weatherForecast" class="weather-forecast"></div>
    </div>

    <!-- 今日 AI 精选（每日自动更新） -->
    <div class="card" id="dailyCard">
      <div class="card-title-row">
        <span class="card-title">🌟 今日 AI 精选 <span class="v2-live-badge" id="dailyBadge">加载中…</span></span>
        <span class="hk-deco">${HK.heart(18)}</span>
      </div>
      <div id="dailyContent"><span style="color:var(--text-light)">正在生成今日精选…</span></div>
    </div>
  </div>`;
}

// 每日自动更新（每日精选）种子数据：未配置同步 / 无网络时回退展示
const DAILY_SEED = {
  plan: '今天建议：① 雅思听力精听 1 篇 + 单词翻卡 30 个；② 完成学校课程 1 项作业；③ 晚间复盘 10 分钟。',
  hot: [
    { title: '示例：AI 绘画工具又更新了', url: 'https://www.douyin.com/' },
    { title: '示例：大学生副业避坑指南', url: 'https://www.douyin.com/' },
    { title: '示例：本周热议的理财话题', url: 'https://www.douyin.com/' }
  ],
  podcasts: [
    { title: '示例：商业就是这样', note: '用接地气的方式讲商业逻辑' },
    { title: '示例：得意忘形', note: '关于成长与自我认知的谈话' }
  ],
  books: [
    { title: '示例：《被讨厌的勇气》', author: '岸见一郎', note: '阿德勒心理学入门' },
    { title: '示例：《纳瓦尔宝典》', author: '埃里克·乔根森', note: '财富与幸福的方法论' },
    { title: '示例：《认知觉醒》', author: '周岭', note: '自我改变底层逻辑' },
    { title: '示例：《搞定》', author: '戴维·艾伦', note: '时间管理 GTD' }
  ],
  ai_videos: [
    { title: '示例：10 分钟搞懂 Transformer', url: 'https://www.bilibili.com/' },
    { title: '示例：雅思口语 7 分模板', url: 'https://www.bilibili.com/' }
  ]
};

function renderDailyInner(c) {
  let h = '';
  if (c.plan) {
    h += `<div class="daily-block"><div class="daily-h">📌 今日 AI 计划</div><div class="daily-plan">${esc(c.plan)}</div></div>`;
  }
  if (c.ai_news && c.ai_news.length) {
    h += `<div class="daily-block"><div class="daily-h">📰 AI / 科技前沿（真实新闻）</div>` +
      c.ai_news.map(x => `<a class="daily-link" href="${esc(x.url || '#')}" target="_blank" rel="noopener">${esc(x.title)}</a>${x.summary ? `<span class="daily-sub">${esc(x.summary)}</span>` : ''}`).join('') + `</div>`;
  }
  if (c.hot && c.hot.length) {
    h += `<div class="daily-block"><div class="daily-h">🔥 实时热点（点击跳转平台搜索）</div>` +
      c.hot.map(x => `<a class="daily-link" href="${esc(x.url || '#')}" target="_blank" rel="noopener">${esc(x.title)}</a>${x.heat ? `<span class="daily-sub">${esc(x.heat)}</span>` : ''}`).join('') + `</div>`;
  }
  if (c.bili && c.bili.length) {
    const tagOrder = { 'AI前沿': 1, '财经': 2, '认知': 3, '人文': 4, '时政': 5, '雅思': 6 };
    const sortedBili = [...c.bili].sort((a, b) => (tagOrder[a.tag] || 9) - (tagOrder[b.tag] || 9));
    h += `<div class="daily-block"><div class="daily-h">📺 B站推荐（真实视频）</div>` +
      sortedBili.map(x => `<a class="daily-link" href="${esc(x.url || '#')}" target="_blank" rel="noopener">${esc(x.title)}</a>${x.tag ? `<span class="daily-sub">${esc(x.tag)}</span>` : ''}`).join('') + `</div>`;
  }
  if (c.podcasts && c.podcasts.length) {
    h += `<div class="daily-block"><div class="daily-h">🎧 播客推荐</div>` +
      c.podcasts.map(x => `<div class="daily-item"><b>${esc(x.title)}</b>${x.note ? `<span>${esc(x.note)}</span>` : ''}${x.url ? `<a class="daily-link" href="${esc(x.url)}" target="_blank" rel="noopener">▶ 收听</a>` : ''}</div>`).join('') + `</div>`;
  }
  if (c.books && c.books.length) {
    h += `<div class="daily-block"><div class="daily-h">📚 读书推荐</div>` +
      c.books.map(x => `<div class="daily-item"><b>${esc(x.title)}</b>${x.author ? ` · ${esc(x.author)}` : ''}${x.note ? `<span>${esc(x.note)}</span>` : ''}${x.url ? `<a class="daily-link" href="${esc(x.url)}" target="_blank" rel="noopener">🔍 查书</a>` : ''}</div>`).join('') + `</div>`;
  }
  if (c.ai_videos && c.ai_videos.length) {
    h += `<div class="daily-block"><div class="daily-h">🤖 AI 学习视频</div>` +
      c.ai_videos.map(x => `<a class="daily-link" href="${esc(x.url || '#')}" target="_blank" rel="noopener">${esc(x.title)}</a>`).join('') + `</div>`;
  }
  return h;
}

// 首页「今日 AI 精选」加载：从 Supabase daily_content 读当天/昨天内容，回退种子
window.loadDailyHome = async function () {
  const box = document.getElementById('dailyContent');
  const badge = document.getElementById('dailyBadge');
  if (!box) return;
  const today = todayStr();
  let content = null;
  try {
    if (window.SupaBackend) {
      content = await window.SupaBackend.readDaily(today);
      if (!content) {
        const d = new Date(); d.setDate(d.getDate() - 1);
        const p = n => ('' + n).padStart(2, '0');
        const ys = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
        content = await window.SupaBackend.readDaily(ys);
      }
    }
  } catch (e) { content = null; }

  if (!content) {
    content = DAILY_SEED;
    if (badge) { badge.textContent = '样例'; badge.style.background = 'rgba(255,255,255,.6)'; badge.style.color = ''; }
  } else {
    if (badge) { badge.textContent = '实时 · ' + (content.generated_at ? content.generated_at.slice(0, 10) : today); badge.style.background = 'var(--accent)'; badge.style.color = '#fff'; }
    // 把真实数据缓存到 localStorage，供「自媒体/B站/播客/读书」等模块读取
    window.DAILY = content;
    if (content.hot && content.hot.length) {
      DB.set('v2_sm_hot', content.hot);
      DB.set('v2_sm_hot_time', content.generated_at || today);
      DB.set('v2_sm_hot_source', '每日真实热点');
      DB.set('v2_sm_hot_real', '1');
    }
    if (content.bili && content.bili.length) DB.set('daily_bili', content.bili);
    if (content.podcasts) DB.set('daily_podcasts', content.podcasts);
    if (content.books) DB.set('daily_books', content.books);
    if (content.ai_news) DB.set('daily_ai_news', content.ai_news);
  }
  box.innerHTML = renderDailyInner(content);
};

// 日历渲染
function renderCalendar(checkins) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m+1, 0);
  const startDow = first.getDay(); // 0=Sun
  const daysInMonth = last.getDate();
  const prevLast = new Date(y, m, 0).getDate();
  const today = now.getDate();

  const heads = ['日','一','二','三','四','五','六'];
  let html = '<div class="calendar-grid">';
  heads.forEach(h => html += `<div class="cal-head">${h}</div>`);

  // 上月补位
  for (let i = startDow - 1; i >= 0; i--) {
    html += `<div class="cal-cell other-month">${prevLast - i}</div>`;
  }
  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = d === today;
    const isChecked = checkins.includes(dateStr);
    let cls = 'cal-cell';
    if (isToday) cls += ' today';
    let bow = '';
    if (isChecked) bow = `<span class="cal-bow">${HK.classicSit(16)}</span>`;
    html += `<div class="${cls}">${d}${bow}</div>`;
  }
  // 下月补位
  const totalCells = startDow + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-cell other-month">${i}</div>`;
  }
  html += '</div>';
  return html;
}

// 计算连续签到天数（today 未签到时从昨天起算，避免显示吓人的 0）
function calcConsecutive(checkins) {
  if (!checkins.length) return 0;
  const set = new Set(checkins);
  const today = todayStr();
  const start = set.has(today) ? 0 : 1; // 今天还没签 → 从昨天起算展示「昨日连签」
  let count = 0;
  const base = new Date();
  for (let i = start; i < 366; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    const ds = `${y}-${m}-${day}`;
    if (set.has(ds)) count++;
    else break;
  }
  return count;
}

// 上次签到与中断天数（用于首页提示，明确「记录的是哪天」）
function lastSigninInfo(checkins) {
  if (!checkins.length) return { last: null, gap: 0, checkedToday: false };
  const set = new Set(checkins);
  const today = todayStr();
  const sorted = [...checkins].sort();           // 升序
  const last = sorted[sorted.length - 1];
  const checkedToday = set.has(today);
  let gap = 0;
  if (!checkedToday && last < today) {
    const a = new Date(last + 'T00:00:00');
    const b = new Date(today + 'T00:00:00');
    gap = Math.round((b - a) / 86400000) - 1;    // 中间隔了几天（不含两端）
    if (gap < 0) gap = 0;
  }
  return { last, gap, checkedToday };
}

// 计算倒计时剩余天数（支持农历 birthday）
function calcDaysLeft(c) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let target;
  if (c.lunar && window.LunarUtil) {
    // 农历生日：每年同一农历月日，找下一个阳历对应日
    const ly = c.lunar.ly, lm = c.lunar.lm, ld = c.lunar.ld;
    let year = now.getFullYear();
    let cand = window.LunarUtil.lunarToSolar(year, lm, ld);
    cand.setHours(0, 0, 0, 0);
    if (cand < now) { year += 1; cand = window.LunarUtil.lunarToSolar(year, lm, ld); cand.setHours(0, 0, 0, 0); }
    target = cand;
    c._solar = `${cand.getFullYear()}-${String(cand.getMonth()+1).padStart(2,'0')}-${String(cand.getDate()).padStart(2,'0')}`;
  } else {
    target = new Date(c.date);
    // repeat：今年已过则顺延到明年（循环直到未来）
    while (target < now) target.setFullYear(target.getFullYear() + 1);
  }
  return Math.ceil((target - now) / 86400000);
}

// 生成成长汇报
function generateReport(date) {
  const tasks = DB.get('tasks',[]).filter(t => t.date === date);
  const done = tasks.filter(t => t.done);
  const total = tasks.length;
  const checkins = DB.get('checkins',[]);
  const checked = checkins.includes(date);

  let lines = [`今日完成 ${done.length}/${total} 项任务`];
  if (done.length > 0) {
    lines.push('已完成：');
    done.forEach(t => { lines.push(`  · ${t.text}`); });
  }
  const pending = tasks.filter(t => !t.done);
  if (pending.length > 0) {
    lines.push('⏳ 待完成：');
    pending.forEach(t => { lines.push(`  · ${t.text}`); });
  }
  if (checked) lines.push('今日已签到！');
  else lines.push('今日尚未签到');

  const wordsMastered = Object.keys(DB.get('words_mastered',{})).length;
  if (wordsMastered > 0) lines.push(`📝 累计掌握 ${wordsMastered} 个雅思单词`);

  lines.push('\n💪 加油，小易欢！每一步都在靠近目标～');

  return lines.join('\n');
}

// ===== 打卡中心渲染 =====
function renderCheckin() {
  const today = todayStr();
  // 获取所有任务（来自各模块 + 手动添加）
  let tasks = DB.get('tasks',[]).filter(t => t.date === today);

  // 概览
  const total = tasks.length;
  const done = tasks.filter(t=>t.done).length;
  const pct = total > 0 ? Math.round(done/total*100) : 0;

  // 按分类分组
  const byCat = {};
  TASK_CATS.forEach(c => byCat[c] = []);
  tasks.forEach(t => { (byCat[t.cat] = byCat[t.cat] || []).push(t); });

  let catsHtml = '';
  TASK_CATS.forEach(cat => {
    const list = byCat[cat] || [];
    const cDone = list.filter(t=>t.done).length;
    catsHtml += `
    <div class="task-category">
      <div class="cat-header">
        <span class="cat-title">${HK.flower(14)} ${esc(cat)}</span>
        <span class="cat-progress">${cDone}/${list.length}</span>
      </div>
      ${list.map(t => `
        <div class="task-item" data-id="${t.id}" data-mod="${esc(t.mod||'')}">
          <div class="task-checkbox ${t.done?'checked':''}" data-act="toggleTask" data-id="${t.id}">${t.done?'✓':''}</div>
          <div class="task-body">
            <div class="task-text ${t.done?'done':''}">${esc(t.text)}</div>
            ${t.photo ? `<div class="task-photo"><img src="${esc(t.photo)}" alt="打卡照片" loading="lazy" onclick="showPhotoPreview('${esc(t.photo)}')"></div>` : ''}
            <div class="task-actions">
              ${t.mod?`<span class="task-tag" data-act="gotoMod" data-mod="${esc(t.mod)}">${MOD_NAMES[t.mod]||t.mod}</span>`:''}
              <label class="task-photo-btn" title="拍照/上传打卡">
                📷
                <input type="file" accept="image/*" style="display:none" onchange="uploadTaskPhoto(this,'${esc(t.id)}')">
              </label>
            </div>
          </div>
        </div>`).join('')}
      <div class="task-add-row">
        <input placeholder="添加${cat}..." data-cat="${esc(cat)}" data-act="addTaskInput">
        <button class="btn btn-primary btn-sm" data-act="addTask" data-cat="${esc(cat)}">+ 添加</button>
      </div>
    </div>`;
  });

  return `<div class="page">
    <div class="page-head">
      <div>
        <div class="page-title">✅ 打卡中心<span class="help-badge" data-help="checkin"></span></div>
        <div class="page-sub">全工作台任务汇总 · 双向实时同步</div>
      </div>
    </div>

    <!-- 今日概览 -->
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">今日完成概览</span>
        <button class="btn btn-outline btn-xs" data-act="goToday">今天 ↺</button>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-pct">${pct}%</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--text-secondary)">
        <span>${today}</span>
        <span>已完成 ${done}/${total} 项</span>
      </div>
    </div>

    <!-- 任务列表 -->
    ${catsHtml}
  </div>`;
}

// ===== 雅思学习渲染 =====
function renderIELTS(subRoute) {
  const tabs = [
    { key:'ielts_words', label:'📝 单词' },
    { key:'ielts_listening', label:'🎧 听力' },
    { key:'ielts_speaking', label:'🎤 口语' },
    { key:'ielts_reading', label:'📖 阅读' },
    { key:'ielts_writing', label:'✍️ 写作' },
    { key:'ielts_exam', label:'📋 真题' },
    { key:'ielts_plan', label:'🤖 作业规划' },
  ];

  let content = '';
  switch(subRoute) {
    case 'ielts_words': content = renderWordsPage(); break;
    case 'ielts_listening': content = renderListeningPage(); break;
    case 'ielts_speaking': content = renderSpeakingPage(); break;
    case 'ielts_reading': content = renderReadingPage(); break;
    case 'ielts_writing': content = renderWritingPage(); break;
    case 'ielts_exam': content = renderExamPage(); break;
    case 'ielts_plan': content = renderIeltsPlan(); break;
    default: content = renderWordsPage(); subRoute='ielts_words';
  }

  return `<div class="page">
    <div class="page-head">
      <div>
        <div class="page-title">📚 雅思学习<span class="help-badge" data-help="${subRoute}"></span></div>
        <div class="page-sub">数据自动同步打卡中心与首页成长汇报</div>
      </div>
    </div>
    <div class="tab-bar">
      ${tabs.map(t => `<button class="tab-btn ${t.key===subRoute?'active':''}" data-act="ieltsTab" data-tab="${t.key}">${t.label}</button>`).join('')}
    </div>
    ${content}
  </div>`;
}

// ===== 雅思作业 AI 规划 =====
function ieltsOrgName(id) { const o = (DB.get('ielts_orgs', []) || []).find(x => x.id === id); return o ? o.name : '未分配'; }
function genIeltsPlan() {
  const hw = DB.get('ielts_hw', []) || [];
  const old = DB.get('ielts_plan', null);
  // 跨天：前一天未完成的作业累加「连续未推进」天数；完成的清零
  if (old && old.date !== todayStr()) {
    old.items.forEach(it => {
      const h = hw.find(x => x.id === it.hwId); if (!h) return;
      if (!it.done) h.miss = (h.miss || 0) + 1; else h.miss = 0;
    });
  }
  const items = [];
  hw.forEach(h => {
    const remaining = Math.max(0, (h.total || 0) - (h.done || 0));
    if (remaining <= 0) return;
    const perWeek = h.perWeek || 3;
    let daily = Math.max(1, Math.ceil(perWeek / 7));
    if (daily > remaining) daily = remaining;
    items.push({ hwId: h.id, label: `${ieltsOrgName(h.orgId)}·${h.title}（${h.type || '作业'}）`, amount: daily, done: false });
  });
  // 排序：截止近的优先；同样截止则落后比例大的优先
  items.sort((a, b) => {
    const ha = hw.find(x => x.id === a.hwId), hb = hw.find(x => x.id === b.hwId);
    const da = ha.deadline || '9999', db = hb.deadline || '9999';
    if (da !== db) return da < db ? -1 : 1;
    const ra = (ha.total - ha.done) / (ha.perWeek || 3), rb = (hb.total - hb.done) / (hb.perWeek || 3);
    return rb - ra;
  });
  const plan = { date: todayStr(), items };
  DB.set('ielts_hw', hw);
  DB.set('ielts_plan', plan);
  return plan;
}
function getIeltsPlan() { let plan = DB.get('ielts_plan', null); if (!plan || plan.date !== todayStr()) plan = genIeltsPlan(); return plan; }

function renderIeltsPlan() {
  const orgs = DB.get('ielts_orgs', []) || [];
  const hw = DB.get('ielts_hw', []) || [];
  const plan = getIeltsPlan();
  const warns = hw.filter(h => (h.miss || 0) >= 1);
  const scold = hw.filter(h => (h.miss || 0) >= 3);
  let h = `<div class="page"><div class="page-head"><div class="page-title">🤖 雅思作业规划<span class="help-badge" data-help="ielts_plan"></span></div>
    <div class="page-sub">录入两个机构的作业与进度，AI 帮你拆解每日任务</div></div>`;

  // 机构
  h += `<div class="v2-section"><div class="v2-section-title">🏫 培训机构 <button class="btn btn-primary btn-sm" style="float:right" data-act="ieltsOrgAdd">+ 添加机构</button></div>`;
  h += orgs.length ? `<div class="v2-org-row">` + orgs.map(o => `<span class="v2-chip">${esc(o.name)} <a data-act="ieltsOrgDel" data-id="${o.id}" style="margin-left:6px;color:var(--hk-red)">✕</a></span>`).join('') + `</div>` : `<div class="v2-book-empty">还没添加机构，先加两个（如：机构A / 机构B）</div>`;
  h += `</div>`;

  // 作业
  h += `<div class="v2-section"><div class="v2-section-title">📚 我的作业（带进度） <button class="btn btn-primary btn-sm" style="float:right" data-act="ieltsHwAdd">+ 添加作业</button></div>`;
  if (!hw.length) h += `<div class="v2-book-empty">还没有作业，点「+ 添加作业」录入（选机构、写总量与已完成、设每周频率与截止日）</div>`;
  hw.forEach(hh => {
    const pct = Math.min(100, Math.round((hh.done || 0) / (hh.total || 1) * 100));
    const miss = hh.miss || 0;
    h += `<div class="v2-hw-card">
      <div class="v2-hw-top"><b>${esc(hh.title)}</b><span class="v2-chip">${esc(ieltsOrgName(hh.orgId))}</span><span class="v2-chip">${esc(hh.type || '作业')}</span>
        <span class="v2-habit-ops"><a data-act="ieltsHwEdit" data-id="${hh.id}">编辑</a><a data-act="ieltsHwDel" data-id="${hh.id}">删除</a></span></div>
      <div class="v2-hw-bar"><div class="v2-hw-fill" style="width:${pct}%"></div></div>
      <div class="v2-hw-meta">已完成 ${hh.done || 0}/${hh.total || 0} · 每周 ${hh.perWeek || 3} 次${hh.deadline ? (' · 截止 ' + esc(hh.deadline)) : ''}${miss ? (' · <span style="color:var(--hk-red);font-weight:600">连续 ' + miss + ' 天未推进</span>') : ''}</div>
    </div>`;
  });
  h += `</div>`;

  // 督促 / 迈巴赫警告
  if (scold.length) {
    h += `<div class="v2-warn-box scold">🚗 <b>还想着开迈巴赫呢？</b><br>以下作业连续 ${scold.map(s => s.miss).join('、')} 天没完成：${scold.map(s => esc(s.title)).join('、')}。赶紧补上，不然迈巴赫永远是别人的！</div>`;
  } else if (warns.length) {
    h += `<div class="v2-warn-box">⚠️ <b>督促</b>：你有 ${warns.length} 项作业昨天没推进（${warns.map(s => esc(s.title)).join('、')}），今天计划已自动加量，别再拖了！</div>`;
  }

  // 今日计划
  h += `<div class="v2-section"><div class="v2-section-title">📅 今日学习计划 · ${todayStr()}</div>`;
  if (!plan.items.length) h += `<div class="v2-book-empty">🎉 今天所有作业都推进完啦，可以放松一下或自己加练！</div>`;
  plan.items.forEach((it, idx) => {
    h += `<label class="v2-plan-item${it.done ? ' done' : ''}"><input type="checkbox" ${it.done ? 'checked' : ''} data-act="ieltsPlanDone" data-hwid="${it.hwId}" data-amount="${it.amount}" data-idx="${idx}"><span>${esc(it.label)} · 推进 ${it.amount} 个</span></label>`;
  });
  h += `</div>`;

  // AI 优化
  h += `<div class="v2-section"><div class="v2-section-title">🤖 让 AI 优化今日计划 <button class="btn btn-outline btn-sm" style="float:right" data-act="ieltsAiPlan">用 AI 重新规划</button></div>
    <div id="ieltsAiBox" class="v2-tip-card">${esc(DB.get('ielts_plan_ai', '在「设置 → AI 模型」配置好模型后，点右上角让 AI 结合你的全部作业进度、截止日与薄弱项，重新排布今天的任务量与时长。'))}</div></div>`;

  h += `</div>`;
  return h;
}
function ieltsHwForm(h) {
  h = h || {};
  const orgs = DB.get('ielts_orgs', []) || [];
  const orgOpts = orgs.map(o => `<option value="${o.id}"${h.orgId === o.id ? ' selected' : ''}>${esc(o.name)}</option>`).join('');
  const types = ['听力', '阅读', '写作', '口语', '词汇', '语法'];
  const typeOpts = types.map(t => `<option${h.type === t ? ' selected' : ''}>${t}</option>`).join('');
  return `<div class="v2-form">
    <div class="form-group"><label>所属机构</label><select id="ih_org" class="v2-input">${orgOpts || '<option value="">（先去添加机构）</option>'}</select></div>
    <div class="form-group"><label>作业名称</label><input id="ih_title" class="v2-input" value="${esc(h.title || '')}" placeholder="如：听力 Section 1 精听"></div>
    <div class="form-row"><div class="form-group"><label>类型</label><select id="ih_type" class="v2-input">${typeOpts}</select></div>
      <div class="form-group"><label>每周频率</label><input id="ih_per" type="number" class="v2-input" value="${h.perWeek || 3}"></div></div>
    <div class="form-row"><div class="form-group"><label>总任务量</label><input id="ih_total" type="number" class="v2-input" value="${h.total || 30}"></div>
      <div class="form-group"><label>已完成</label><input id="ih_done" type="number" class="v2-input" value="${h.done || 0}"></div></div>
    <div class="form-group"><label>截止日期</label><input id="ih_dead" type="date" class="v2-input" value="${esc(h.deadline || '')}"></div>
    <div class="v2-form-actions"><button class="btn btn-primary" data-act="ieltsHwSave">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`;
}
// app.js 在 v2-core 之前加载，V2ACT 此时尚未创建，先确保对象存在（v2-core 同样用 || {} 保留）
window.V2ACT = window.V2ACT || {};
window.V2ACT.ieltsOrgAdd = () => {
  window.V2.openForm('添加培训机构', `<div class="v2-form"><div class="form-group"><label>机构名称</label><input id="io_name" class="v2-input" placeholder="如：新东方雅思 / 学为贵"></div>
    <div class="v2-form-actions"><button class="btn btn-primary" data-act="ieltsOrgSave">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div></div>`);
};
window.V2ACT.ieltsOrgSave = () => {
  const name = gid('io_name').value.trim(); if (!name) { toast('请填写机构名'); return; }
  const orgs = DB.get('ielts_orgs', []) || []; orgs.push({ id: window.V2.gId(), name }); DB.set('ielts_orgs', orgs);
  if (typeof closeGeneric === 'function') closeGeneric(); toast('已添加'); render();
};
window.V2ACT.ieltsOrgDel = (el) => { if (!confirm('删除该机构？')) return; DB.set('ielts_orgs', (DB.get('ielts_orgs', []) || []).filter(o => o.id !== el.dataset.id)); toast('已删除'); render(); };
window.V2ACT.ieltsHwAdd = () => {
  const orgs = DB.get('ielts_orgs', []) || [];
  if (!orgs.length) { toast('请先添加机构'); return; }
  window._ieltsHwEditId = null; window.V2.openForm('添加作业', ieltsHwForm(null));
};
window.V2ACT.ieltsHwEdit = (el) => {
  const h = (DB.get('ielts_hw', []) || []).find(x => x.id === el.dataset.id); if (!h) return;
  window._ieltsHwEditId = h.id; window.V2.openForm('编辑作业', ieltsHwForm(h));
};
window.V2ACT.ieltsHwSave = () => {
  const title = gid('ih_title').value.trim(); if (!title) { toast('请填写作业名'); return; }
  const hw = DB.get('ielts_hw', []) || [];
  const obj = { orgId: gid('ih_org').value, title, type: gid('ih_type').value, perWeek: parseInt(gid('ih_per').value, 10) || 3, total: parseInt(gid('ih_total').value, 10) || 0, done: parseInt(gid('ih_done').value, 10) || 0, deadline: gid('ih_dead').value || '' };
  if (window._ieltsHwEditId) { const i = hw.findIndex(x => x.id === window._ieltsHwEditId); if (i >= 0) hw[i] = Object.assign(hw[i], obj); }
  else { obj.id = window.V2.gId(); obj.miss = 0; hw.push(obj); }
  DB.set('ielts_hw', hw); window._ieltsHwEditId = null;
  if (typeof closeGeneric === 'function') closeGeneric(); toast('已保存'); render();
};
window.V2ACT.ieltsHwDel = (el) => { if (!confirm('删除该作业？')) return; DB.set('ielts_hw', (DB.get('ielts_hw', []) || []).filter(x => x.id !== el.dataset.id)); toast('已删除'); render(); };
window.V2ACT.ieltsPlanDone = (el) => {
  const hwId = el.dataset.hwid, amount = parseInt(el.dataset.amount, 10) || 0, idx = parseInt(el.dataset.idx, 10) || 0;
  const hwArr = DB.get('ielts_hw', []) || []; const hw = hwArr.find(x => x.id === hwId); if (!hw) return;
  const plan = DB.get('ielts_plan', null); if (!plan) return;
  const it = plan.items[idx]; if (!it) return;
  if (!it.done) { it.done = true; hw.done = Math.min(hw.total || 0, (hw.done || 0) + amount); hw.miss = 0; }
  else { it.done = false; hw.done = Math.max(0, (hw.done || 0) - amount); }
  DB.set('ielts_hw', hwArr); DB.set('ielts_plan', plan); render();
};
window.V2ACT.ieltsAiPlan = async (el) => {
  const box = gid('ieltsAiBox'); if (box) box.innerHTML = '⏳ AI 正在分析你的全部作业…';
  if (!window.AI || !window.AI.call || !window.AI.providers || !window.AI.providers().length) {
    if (box) box.innerHTML = '⚠️ 你还没有在「设置 → AI 模型」里配置任何模型。先去添加一个（支持多个），再让 AI 帮你规划。';
    toast('请先配置 AI 模型'); return;
  }
  const hw = DB.get('ielts_hw', []) || [];
  const summary = hw.map(h => `${ieltsOrgName(h.orgId)}·${h.title}（${h.type}）：进度 ${h.done || 0}/${h.total || 0}，每周${h.perWeek || 3}次${h.deadline ? ('，截止' + h.deadline) : ''}，连续未推进${h.miss || 0}天`).join('\n');
  const todayPlan = (DB.get('ielts_plan', null) || { items: [] }).items.map(it => `- ${it.label} 推进${it.amount}`).join('\n') || '（无）';
  const prompt = `你是易欢的雅思学习教练。她有两个机构的雅思作业，进度不同。\n当前作业：\n${summary}\n\n已有今日基础计划：\n${todayPlan}\n\n请基于截止日紧迫度、各作业落后程度，重新为她排布今天的雅思学习任务（含每项建议时长/数量），并在结尾用一句狠话督促她（她的目标开迈巴赫）。语气像一个严格但关心她的教练。不超过300字。`;
  try {
    const text = await window.AI.call([{ role: 'user', content: prompt }]);
    DB.set('ielts_plan_ai', text);
    if (box) box.innerHTML = '<div style="white-space:pre-wrap;line-height:1.7">' + esc(text) + '</div>';
  } catch (e) { if (box) box.innerHTML = '⚠️ AI 调用失败：' + esc(e && e.message ? e.message : e) + '。请检查模型配置与网络。'; }
};

// --- 单词自测抽认卡 ---
function renderTestCard() {
  const s = DB.get('ielts_test', null);
  if (!s) { DB.set('ielts_test_mode','off'); return renderWordsPage(); }
  // 结果页
  if (s.idx >= s.queue.length) {
    const unknownList = s.unknown.map(w => {
      const def = IELTS_WORDS.find(x => x.w === w);
      return def ? `<li><b>${def.w}</b> <span style="color:var(--text-secondary)">${def.ph}</span> — ${esc(def.m)}</li>` : `<li>${esc(w)}</li>`;
    }).join('');
    return `<div class="card">
      <div class="card-title">自测结果</div>
      <div style="text-align:center;padding:10px 0">
        <div style="font-size:34px;font-weight:800;color:var(--red)">${s.known.length} / ${s.queue.length}</div>
        <div style="color:var(--text-secondary);margin-top:4px">认识 ${s.known.length} 个 · 不认识 ${s.unknown.length} 个</div>
      </div>
      ${s.unknown.length ? `<div class="card-subtitle">待巩固单词（已移出「已掌握」）</div><ul class="test-unknown-list">${unknownList}</ul>` : `<p style="color:var(--green);text-align:center;margin-top:8px">全部认识，太棒了！</p>`}
      <div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn btn-primary" data-act="startTest">再来一次</button>
        <button class="btn btn-outline" data-act="testExit">返回单词表</button>
      </div>
    </div>`;
  }
  // 当前卡片
  const w = s.queue[s.idx];
  const def = IELTS_WORDS.find(x => x.w === w) || { w, ph:'', pos:'', m:'', col:'' };
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span class="card-title">自测模式</span>
      <span style="font-size:12px;color:var(--text-secondary)">${s.idx+1} / ${s.queue.length}</span>
    </div>
    <div class="ielts-flashcard ${s.revealed?'revealed':''}" data-act="testReveal">
      <div class="fc-word">${def.w}</div>
      <div class="fc-phonetic">${def.ph} <span class="fc-pos">${def.pos}</span></div>
      ${s.revealed ? `<div class="fc-meaning">${esc(def.m)}</div><div class="fc-col">${esc(def.col)}</div>` : `<div class="fc-hint">点击卡片显示释义</div>`}
    </div>
    ${s.revealed ? `<div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn btn-primary" data-act="testKnown">认识</button>
        <button class="btn btn-outline" data-act="testUnknown">不认识</button>
      </div>` : `<div style="text-align:center;margin-top:14px"><button class="btn btn-outline" data-act="testReveal">显示释义</button></div>`}
    <div style="text-align:center;margin-top:10px"><button class="btn btn-xs btn-outline" data-act="testExit">退出自测</button></div>
  </div>`;
}

// --- 单词页面 ---
function renderWordsPage() {
  if (DB.get('ielts_test_mode') === 'on') return renderTestCard();
  const mastered = DB.get('words_mastered',{});
  const today = todayStr();
  const dayKey = `day_${today}`;
  let todayWords = DB.get(dayKey);
  if (!todayWords) {
    // 取30个词
    const shuffled = [...IELTS_WORDS].sort(() => Math.random()-0.5);
    todayWords = shuffled.slice(0,30).map((w,i) => ({ ...w, uid: `${today}_${i}` }));
    DB.set(dayKey, todayWords);
  }

  const doneToday = todayWords.filter(w => mastered[w.w]).length;
  const totalMastered = Object.keys(mastered).length;
  const totalWords = IELTS_WORDS.length;
  const pct = totalWords > 0 ? Math.round(totalMastered/totalWords*100) : 0;

  const listHtml = todayWords.map(w => {
    const isDone = !!mastered[w.w];
    return `<div class="word-item" data-word="${esc(w.w)}">
      <div class="word-check ${isDone?'checked':''}" data-act="masterWord" data-w="${esc(w.w)}">${isDone?'✓':''}</div>
      <div class="word-body">
        <div><span class="word-main">${w.w}</span><span class="word-phonetic">${w.ph}</span><span class="word-pos">${w.pos}</span></div>
        <div class="word-meaning">${esc(w.m)}</div>
        <div class="word-collocation">${esc(w.col)}</div>
      </div>
      <div class="word-speak" data-act="speakWord" data-w="${esc(w.w)}">🔊</div>
    </div>`;
  }).join('');

  const scores = DB.get('word_game_scores',{match:0,memory:0,snake:0});

  return `
    <!-- 进度条 -->
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">今日背诵进度</span>
        <span>
          <button class="btn btn-primary btn-xs" data-act="startTest" style="margin-right:8px">开始自测</button>
          <button class="btn btn-outline btn-xs" data-act="refreshWords">更新今日</button>
        </span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(doneToday/30*100)}%"></div></div>
        <span class="progress-pct">${doneToday}/30</span>
      </div>
      <div style="margin-top:8px">
        <span style="font-size:12px;color:var(--text-secondary)">总词汇完成率：</span>
        <div class="progress-bar-wrap" style="display:inline-block;width:200px;vertical-align:middle">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="progress-pct">${totalMastered}/${totalWords} (${pct}%)</span>
        </div>
      </div>
    </div>

    <!-- 单词列表 -->
    <div class="card">
      <div class="card-title">今日 30 个高频词</div>
      ${listHtml}
    </div>

    <!-- 复习乐园 -->
    <div class="card">
      <div class="card-title">🎮 复习乐园<span class="help-badge" data-help="ielts_words"></span></div>
      <div class="game-grid">
        <div class="game-card" data-act="playGame" data-game="match">
          <div class="game-icon">${HK.sheep(40)}</div>
          <div class="game-name">羊了个羊</div>
          <div class="game-score">最高分: ${scores.match}</div>
        </div>
        <div class="game-card" data-act="playGame" data-game="memory">
          <div class="game-icon">${HK.squirrel(40)}</div>
          <div class="game-name">记忆翻牌</div>
          <div class="game-score">最高分: ${scores.memory}</div>
        </div>
        <div class="game-card" data-act="playGame" data-game="snake">
          <div class="game-icon">${HK.snake(40)}</div>
          <div class="game-name">贪吃蛇拼词</div>
          <div class="game-score">最高分: ${scores.snake}</div>
        </div>
        <div class="game-card" data-act="playGame" data-game="flashcard">
          <div class="game-icon">${HK.heart(40)}</div>
          <div class="game-name">单词翻卡</div>
          <div class="game-score">最佳认识: ${scores.flashcard||0}</div>
        </div>
      </div>
    </div>
  `;
}

// --- 听力页面 ---
function renderListeningPage() {
  return `<div class="page">
    <div class="switch-tabs">
      <div class="switch-tab active" data-act="listenTab" data-tab="homework">听力作业</div>
      <div class="switch-tab" data-act="listenTab" data-tab="intensive">精听训练</div>
      <div class="switch-tab" data-act="listenTab" data-tab="mistakes">错题复盘</div>
    </div>
    <div id="listenContent">
      ${renderListeningHomework()}
    </div>
  </div>`;
}

// 听力作业：从每日任务中过滤出听力任务，支持拍照打卡
function renderListeningHomework() {
  const today = todayStr();
  const tasks = DB.get('tasks', []).filter(t => t.mod === 'ielts_listening' && (t.date === today || t.date <= today));
  const todayTasks = tasks.filter(t => t.date === today);
  const pending = tasks.filter(t => !t.done && t.date < today);

  const taskCard = (t) => `
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">${esc(t.text)}</span>
        <span class="tag tag-red">${t.date === today ? '今日' : '逾期 ' + t.date}</span>
      </div>
      ${t.photo ? `<div class="task-photo"><img src="${esc(t.photo)}" onclick="showPhotoPreview('${esc(t.photo)}')" alt="作业照片"></div>` : ''}
      <div class="task-actions">
        <label class="btn btn-outline btn-sm">📷 上传作业照片<input type="file" accept="image/*" style="display:none" onchange="uploadTaskPhoto(this,'${esc(t.id)}')"></label>
        <button class="btn btn-outline btn-sm" data-act="toggleTask" data-id="${esc(t.id)}">${t.done ? '取消完成' : '标记完成'}</button>
      </div>
    </div>`;

  return `
    <div class="card">
      <div class="card-title">🎧 今日听力作业</div>
      <div class="card-subtitle">来自你的雅思学习计划（黑眼睛听力 / 9988 听力 / 何琼听力课等），完成拍照上传打卡。</div>
    </div>
    ${todayTasks.length ? todayTasks.map(taskCard).join('') : `<div class="card" style="color:var(--text-secondary);text-align:center;padding:24px">今日暂无听力作业，去「打卡中心」查看全部任务吧。</div>`}
    ${pending.length ? `<div class="card"><div class="card-title">⏰ 待补作业</div>${pending.map(taskCard).join('')}</div>` : ''}
  `;
}

// 精听训练：每日自动推荐一个精听视频 + 跟练自检 + 错题记录
function renderListeningIntensive() {
  const data = BILI_VIDEOS;
  const pool = (data && data.intensive) ? data.intensive : [];
  const doy = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  const v = pool.length ? pool[doy % pool.length] : null;
  const embed = v ? videoHTML('https://www.bilibili.com/video/' + v.bvid) : '<div class="video-fallback"><span>暂无推荐视频</span></div>';
  const mistakes = DB.get('listening_mistakes', []);
  return `
    <div class="card">
      <div class="card-title-row"><span class="card-title">🎯 今日精听推荐</span><span class="tag tag-red">每日自动推荐</span></div>
      <div class="card-subtitle">${v ? esc(v.title) : '（无）'} · ${v ? esc(v.desc) : ''}</div>
      ${embed}
    </div>
    <div class="card">
      <div class="card-title">📝 精听练习自检</div>
      <div style="font-size:13px;line-height:2;margin-top:6px">
        <div>① 盲听 1-2 遍，写下大意</div>
        <div>② 逐句暂停听写关键句</div>
        <div>③ 对照原文，标出听错 / 漏听处</div>
        <div>④ 跟读 3 遍，模仿语音语调</div>
        <div>⑤ 1.25x / 1.5x 复听直至无卡顿</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">✍️ 记录我的精听错题</div>
      <textarea id="lm_text" class="v2-input" placeholder="写下听错 / 漏听的句子、生词或难点…" style="width:100%;min-height:64px;margin:8px 0"></textarea>
      <button class="btn btn-primary btn-sm" data-act="addListenMistake">保存错题</button>
    </div>
    ${mistakes.length ? `<div class="card"><div class="card-title">📕 已记录精听错题（${mistakes.length}）</div>${mistakes.map(m => `
      <div class="v2-vocab-row">
        <div class="v2-vocab-body"><div class="v2-vocab-word" style="font-size:13px">${esc(m.text)}</div><div class="v2-vocab-mean">${m.date}</div></div>
        <button class="btn btn-outline btn-xs" data-act="delListenMistake" data-id="${esc(m.id)}">删除</button>
      </div>`).join('')}</div>` : `<div class="card" style="color:var(--text-secondary);text-align:center;padding:18px">暂无精听错题，练完在上面记录吧。</div>`}
  `;
}

// 精听错题复盘
function renderListeningMistakes() {
  const mistakes = DB.get('listening_mistakes', []);
  if (!mistakes.length) {
    return `<div class="card" style="text-align:center;padding:28px;color:var(--text-secondary)">
      <div style="font-size:36px">📭</div>
      <p>还没有精听错题。</p>
      <p style="font-size:12px">在「精听训练」中记录的错题会汇总到这里复盘。</p>
    </div>`;
  }
  return mistakes.map(m => `
    <div class="card">
      <div class="card-subtitle">日期：${m.date}</div>
      <div style="font-size:14px;line-height:1.6;margin:6px 0">${esc(m.text)}</div>
      <button class="btn btn-outline btn-sm" data-act="delListenMistake" data-id="${esc(m.id)}">删除</button>
    </div>
  `).join('');
}

function uploadListenAudio(input, key) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) { toast('音频过大（>8MB），请压缩后上传'); return; }
  const reader = new FileReader();
  reader.onload = function () {
    const all = DB.get('v2_listen_audio', {});
    all[key] = reader.result;
    DB.set('v2_listen_audio', all);
    const aud = gid('aud_' + key);
    if (aud) aud.src = reader.result;
    toast('音频已上传，可播放');
  };
  reader.readAsDataURL(file);
}
function setListenSpeed(key, rate) {
  const aud = gid('aud_' + key);
  if (aud) aud.playbackRate = rate;
  toast('速度 ' + rate + 'x');
}
function loopListen(key) {
  const aud = gid('aud_' + key);
  if (!aud) return;
  aud.loop = !aud.loop;
  toast(aud.loop ? '已开启循环播放' : '已关闭循环');
}

// --- 口语页面 ---
function renderSpeakingPage() {
  return `<div class="page">
    <div class="switch-tabs">
      <div class="switch-tab active" data-act="speakTab" data-tab="shadow">影子跟读</div>
      <div class="switch-tab" data-act="speakTab" data-tab="follow">单句跟读</div>
      <div class="switch-tab" data-act="speakTab" data-tab="topics">话题素材</div>
    </div>
    <div id="speakContent">
      ${renderSpeakingShadow()}
    </div>
  </div>`;
}

function renderSpeakingShadow() {
  const data = BILI_VIDEOS;
  const pool = (data && data.shadow) ? data.shadow : [];
  const doy = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  const v = pool.length ? pool[doy % pool.length] : null;
  const embed = v ? videoHTML('https://www.bilibili.com/video/' + v.bvid) : '<div class="video-fallback"><span>暂无推荐视频</span></div>';
  const videos = DB.get('shadow_videos', []);
  return `
    <div class="card">
      <div class="card-title-row"><span class="card-title">🎬 今日影子跟读推荐</span><span class="tag tag-red">每日自动推荐</span></div>
      <div class="card-subtitle">${v ? esc(v.title) : '（无）'} · ${v ? esc(v.desc) : ''}</div>
      ${embed}
    </div>
    <div class="card">
      <div class="card-title">📤 上传我的跟读视频</div>
      <div class="card-subtitle">录完跟练视频后上传，便于回看对比进步（建议 ≤ 20MB）。</div>
      <input type="file" accept="video/*" onchange="uploadShadowVideo(this)" style="font-size:12px;width:100%;margin:8px 0">
      ${videos.length ? videos.map(vo => `
        <div class="card" style="margin-top:8px">
          <div class="card-subtitle">${vo.date}</div>
          <video src="${esc(vo.data)}" controls style="width:100%;border-radius:8px;margin-top:6px"></video>
          <button class="btn btn-outline btn-xs" data-act="delShadowVideo" data-id="${esc(vo.id)}" style="margin-top:6px">删除</button>
        </div>`).join('') : '<p style="font-size:12px;color:var(--text-light);margin-top:8px">还没有上传跟读视频。</p>'}
    </div>
    <div class="topic-card" style="margin-top:12px;background:var(--page-bg)">
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">
        <b>📌 影子跟读法要点：</b><br>
        1. 先通听 1-2 遍了解大意<br>
        2. 播放后延迟 1-2 秒开始跟读<br>
        3. 尽量模仿语调、重音和停顿<br>
        4. 跟读不上的地方标记下来反复练<br>
        5. 每天坚持 15-20 分钟
      </div>
    </div>
  `;
}

function uploadShadowVideo(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) { toast('视频过大（>20MB），请在手机上压缩后再上传'); return; }
  const reader = new FileReader();
  reader.onload = function () {
    const list = DB.get('shadow_videos', []);
    list.unshift({ id: genId(), date: todayStr(), data: reader.result });
    DB.set('shadow_videos', list);
    render();
    toast('跟读视频已上传 ✓');
  };
  reader.readAsDataURL(file);
}
function delShadowVideo(id) {
  let list = DB.get('shadow_videos', []);
  list = list.filter(v => v.id !== id);
  DB.set('shadow_videos', list);
  toast('已删除');
  const c = gid('speakContent');
  if (c) c.innerHTML = renderSpeakingShadow();
}

// --- 阅读页面 ---
function renderReadingPage() {
  return `<div class="page">
    <div class="switch-tabs">
      <div class="switch-tab active" data-act="readTab" data-tab="practice">阅读作业</div>
      <div class="switch-tab" data-act="readTab" data-tab="vocab">考点词库</div>
      <div class="switch-tab" data-act="readTab" data-tab="mistakes">错题本</div>
    </div>
    <div id="readContent">
      ${renderReadingPractice()}
    </div>
  </div>`;
}

// 阅读作业：从每日任务中过滤出阅读任务，支持拍照打卡+自评得分
function renderReadingPractice() {
  const today = todayStr();
  const tasks = DB.get('tasks', []).filter(t => t.mod === 'ielts_reading' && (t.date === today || t.date <= today));
  const todayTasks = tasks.filter(t => t.date === today);
  const pending = tasks.filter(t => !t.done && t.date < today);

  const taskCard = (t) => `
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">${esc(t.text)}</span>
        <span class="tag tag-red">${t.date === today ? '今日' : '已逾期 ' + t.date}</span>
      </div>
      <div class="read-score-row" style="display:flex;gap:10px;align-items:center;margin:10px 0;flex-wrap:wrap">
        <label style="font-size:13px;color:var(--text-secondary)">总分：<input type="number" id="rs_total_${t.id}" value="${t.scoreTotal||''}" placeholder="13" style="width:50px" class="v2-input"></label>
        <label style="font-size:13px;color:var(--text-secondary)">错几题：<input type="number" id="rs_wrong_${t.id}" value="${t.scoreWrong!==undefined?t.scoreWrong:''}" placeholder="0" style="width:50px" class="v2-input"></label>
        <button class="btn btn-primary btn-sm" data-act="saveReadScore" data-id="${esc(t.id)}">计算得分</button>
        ${t.score !== undefined ? `<span class="tag ${t.score>=60?'tag-green':'tag-red'}">得分 ${t.score}</span>` : ''}
      </div>
      ${t.photo ? `<div class="task-photo"><img src="${esc(t.photo)}" onclick="showPhotoPreview('${esc(t.photo)}')" alt="作业照片"></div>` : ''}
      <div class="task-actions">
        <label class="btn btn-outline btn-sm">📷 上传作业照片<input type="file" accept="image/*" style="display:none" onchange="uploadTaskPhoto(this,'${esc(t.id)}')"></label>
        <button class="btn btn-outline btn-sm" data-act="toggleTask" data-id="${esc(t.id)}">${t.done ? '取消完成' : '标记完成'}</button>
      </div>
    </div>`;

  return `
    <div class="card">
      <div class="card-title">📖 今日阅读作业</div>
      <div class="card-subtitle">完成作业后拍照上传并自评得分，低于 60 分会自动收录到错题本。</div>
    </div>
    ${todayTasks.length ? todayTasks.map(taskCard).join('') : `<div class="card" style="color:var(--text-secondary);text-align:center;padding:24px">今日暂无阅读作业，去「打卡中心」查看全部任务吧。</div>`}
    ${pending.length ? `<div class="card"><div class="card-title">⏰ 待补作业</div>${pending.map(taskCard).join('')}</div>` : ''}
  `;
}

// 考点词库：加载刘洪波 538 考点词
function renderReadingVocab() {
  const data = READING_538;
  const words = data ? data.words : [];
  const mastered = DB.get('reading538_mastered', {});
  const filter = DB.get('reading538_filter', 'all');
  const list = words.filter(w => filter === 'all' || String(w.category) === filter);

  const catLabel = {1:'第一类（超高频 20）',2:'第二类（高频 100）',3:'第三类（中高频 249）'};

  const rows = list.map(w => {
    const done = !!mastered[w.id];
    return `<div class="v2-vocab-row ${done?'done':''}" data-act="toggleReadWord" data-id="${w.id}">
      <div class="v2-vocab-check">${done?'✓':''}</div>
      <div class="v2-vocab-body">
        <div class="v2-vocab-word">${esc(w.word)}</div>
        <div class="v2-vocab-mean">${esc(w.meaning)}</div>
        ${w.synonyms ? `<div class="v2-vocab-syn">↔ ${esc(w.synonyms)}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">📚 雅思阅读考点词真经 538</span>
        <span class="tag tag-red">已掌握 ${Object.keys(mastered).length}/${words.length}</span>
      </div>
      <div class="card-subtitle">${data ? data.note : '数据加载中...'}</div>
      <div class="v2-filter-bar" style="display:flex;gap:8px;margin:12px 0;flex-wrap:wrap">
        <button class="btn btn-xs ${filter==='all'?'btn-primary':'btn-outline'}" data-act="filterReadWords" data-filter="all">全部</button>
        <button class="btn btn-xs ${filter==='1'?'btn-primary':'btn-outline'}" data-act="filterReadWords" data-filter="1">第一类</button>
        <button class="btn btn-xs ${filter==='2'?'btn-primary':'btn-outline'}" data-act="filterReadWords" data-filter="2">第二类</button>
        <button class="btn btn-xs ${filter==='3'?'btn-primary':'btn-outline'}" data-act="filterReadWords" data-filter="3">第三类</button>
      </div>
      ${rows || '<div style="color:var(--text-secondary)">暂无数据</div>'}
    </div>
  `;
}

function renderReadingMistakes() {
  const mistakes = DB.get('reading_mistakes', []);
  if (!mistakes.length) {
    return `<div class="card" style="text-align:center;padding:28px;color:var(--text-secondary)">
      <div style="font-size:36px">📭</div>
      <p>还没有错题记录。</p>
      <p style="font-size:12px">阅读作业自评低于 60 分会自动收录到这里。</p>
    </div>`;
  }
  return mistakes.map(m => `
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">${esc(m.text)}</span>
        <span class="tag tag-red">得分 ${m.score}</span>
      </div>
      <div class="card-subtitle">日期：${m.date}</div>
      ${m.photo ? `<div class="task-photo"><img src="${esc(m.photo)}" onclick="showPhotoPreview('${esc(m.photo)}')"></div>` : ''}
      <button class="btn btn-outline btn-sm" data-act="delReadMistake" data-id="${esc(m.id)}">删除</button>
    </div>
  `).join('');
}

// 阅读作业自评得分：总分/错题数 → 百分制，<60 自动收录错题本
function saveReadScore(id) {
  const totalEl = gid('rs_total_' + id);
  const wrongEl = gid('rs_wrong_' + id);
  if (!totalEl || !wrongEl) { toast('请输入总分与错题数'); return; }
  const total = parseFloat(totalEl.value);
  const wrong = parseFloat(wrongEl.value) || 0;
  if (isNaN(total) || total <= 0) { toast('请填写有效的满分总分'); return; }
  const score = Math.max(0, Math.round((1 - wrong / total) * 100));
  const tasks = DB.get('tasks', []);
  const t = tasks.find(x => x.id == id);
  if (!t) return;
  t.scoreTotal = total; t.scoreWrong = wrong; t.score = score;
  DB.set('tasks', tasks);
  if (score < 60) {
    const mistakes = DB.get('reading_mistakes', []);
    if (!mistakes.find(m => m.id === id)) {
      mistakes.unshift({ id, text: t.text, date: todayStr(), score, photo: t.photo || '' });
      DB.set('reading_mistakes', mistakes);
    }
    toast('得分 ' + score + '，已收录到错题本 📕');
  } else {
    toast('得分 ' + score + '，过关 ✓');
  }
  render();
}

// 考点词标记掌握 / 取消
function toggleReadWord(id) {
  const mastered = DB.get('reading538_mastered', {});
  if (mastered[id]) { delete mastered[id]; } else { mastered[id] = todayStr(); }
  DB.set('reading538_mastered', mastered);
  const c = gid('readContent');
  if (c) c.innerHTML = renderReadingVocab();
}

// 切换考点词筛选
function filterReadWords(filter) {
  DB.set('reading538_filter', filter);
  const c = gid('readContent');
  if (c) c.innerHTML = renderReadingVocab();
}

// 删除错题本记录
function delReadMistake(id) {
  let mistakes = DB.get('reading_mistakes', []);
  mistakes = mistakes.filter(m => m.id !== id);
  DB.set('reading_mistakes', mistakes);
  toast('已删除');
  const c = gid('readContent');
  if (c) c.innerHTML = renderReadingMistakes();
}

// 精听错题：保存 / 删除
function addListenMistake() {
  const ta = gid('lm_text');
  if (!ta || !ta.value.trim()) { toast('请先写下你的精听错题'); return; }
  const list = DB.get('listening_mistakes', []);
  list.unshift({ id: genId(), text: ta.value.trim(), date: todayStr() });
  DB.set('listening_mistakes', list);
  toast('已保存精听错题 ✓');
  const c = gid('listenContent');
  if (c) c.innerHTML = renderListeningIntensive();
}
function delListenMistake(id) {
  let list = DB.get('listening_mistakes', []);
  list = list.filter(m => m.id !== id);
  DB.set('listening_mistakes', list);
  toast('已删除');
  const c = gid('listenContent');
  if (c) c.innerHTML = renderListeningMistakes();
}

// --- 写作页面 ---
function renderWritingPage() {
  return `<div class="page">
    <div class="switch-tabs">
      <div class="switch-tab active" data-act="writeTab" data-tab="homework">写作作业</div>
      <div class="switch-tab" data-act="writeTab" data-tab="method">顾家北方法</div>
      <div class="switch-tab" data-act="writeTab" data-tab="essays">范文库</div>
      <div class="switch-tab" data-act="writeTab" data-tab="practice">练习</div>
    </div>
    <div id="writeContent">
      ${renderWritingHomework()}
    </div>
  </div>`;
}

// 写作作业：从每日任务中过滤出写作任务，支持拍照打卡
function renderWritingHomework() {
  const today = todayStr();
  const tasks = DB.get('tasks', []).filter(t => t.mod === 'ielts_writing' && (t.date === today || t.date <= today));
  const todayTasks = tasks.filter(t => t.date === today);
  const pending = tasks.filter(t => !t.done && t.date < today);

  const taskCard = (t) => `
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">${esc(t.text)}</span>
        <span class="tag tag-red">${t.date === today ? '今日' : '逾期 ' + t.date}</span>
      </div>
      ${t.photo ? `<div class="task-photo"><img src="${esc(t.photo)}" onclick="showPhotoPreview('${esc(t.photo)}')" alt="作业照片"></div>` : ''}
      <div class="task-actions">
        <label class="btn btn-outline btn-sm">📷 上传作业照片<input type="file" accept="image/*" style="display:none" onchange="uploadTaskPhoto(this,'${esc(t.id)}')"></label>
        <button class="btn btn-outline btn-sm" data-act="toggleTask" data-id="${esc(t.id)}">${t.done ? '取消完成' : '标记完成'}</button>
      </div>
    </div>`;

  return `
    <div class="card">
      <div class="card-title">✍️ 今日写作作业</div>
      <div class="card-subtitle">来自你的雅思学习计划（顾家北写作 / 杜仕名写作课 / 写作练习册等），完成拍照上传打卡。</div>
    </div>
    ${todayTasks.length ? todayTasks.map(taskCard).join('') : `<div class="card" style="color:var(--text-secondary);text-align:center;padding:24px">今日暂无写作作业，去「打卡中心」查看全部任务吧。</div>`}
    ${pending.length ? `<div class="card"><div class="card-title">⏰ 待补作业</div>${pending.map(taskCard).join('')}</div>` : ''}
  `;
}

// 顾家北写作真经方法拆解
function renderWritingMethod() {
  const cards = [
    { t:'翻译式写作法', d:'顾家北核心方法：先读中文句子 → 自己翻译成英文 → 对照书上的地道英文 → 标出差异反复背诵。每天精练 5-10 句，比盲目背模板更有效。' },
    { t:'语法知识点补漏', d:'重点突破：主谓一致、时态、被动语态、定语从句、非谓语动词、连接词。把常错语法点记到备忘录或错题本。' },
    { t:'观点库积累', d:'Task2 按话题（教育 / 环境 / 科技 / 社会）积累可用论点与素材，考试时直接调用，避免临场卡壳。' },
    { t:'高频词汇升级', d:'把基础词升级为学术词：important → crucial，good → beneficial，think → argue / maintain，show → demonstrate。' },
    { t:'段落结构模板', d:'四段式：引言（改写题目 + 立场）→ 主体段1（论点 + 解释 + 例子）→ 主体段2（递进 / 反方）→ 结论（总结 + 重申立场）。' },
  ];
  return cards.map(c => `<div class="card">
    <div class="card-title">📘 ${esc(c.t)}</div>
    <div class="card-subtitle" style="line-height:1.8">${esc(c.d)}</div>
  </div>`).join('');
}

function renderWritingEssays() {
  return `<div>
    ${WRITING_ESSAYS.map(e => `
      <div class="essay-card">
        <div class="essay-info">
          <span class="essay-type-badge">${e.type} · ${e.topic}</span>
          <div class="essay-title">${esc(e.title)}</div>
          <div class="essay-meta">来源：${esc(e.source)} · 结构：${esc(e.structure)}</div>
          <div style="font-size:12px;color:var(--hk-blue);margin-top:4px">📌 ${esc(e.phrases)}</div>
        </div>
        <button class="btn btn-outline btn-sm" data-act="viewEssay" data-title="${esc(e.title)}">查看详情 →</button>
      </div>
    `).join('')}

    <div class="card" style="margin-top:14px">
      <div class="card-title">✨ 万能句式库</div>
      ${USEFUL_PHRASES.map(p => `
        <div style="margin-bottom:10px">
          <span class="tag tag-red">${esc(p.cat)}</span>
          ${p.phrases.map(ph => `<div style="padding:3px 0;font-size:13px;color:var(--text-secondary)">· ${esc(ph)}</div>`).join('')}
        </div>
      `).join('')}
    </div>
  </div>`;
}

// --- 真题页面 ---
function renderExamPage() {
  return `<div class="page">
    ${renderExamHomework()}
  </div>`;
}

// 真题作业：你自备真题集，这里只汇总计划里的「整套真题 / 模考」学习任务
function renderExamHomework() {
  const today = todayStr();
  const tasks = DB.get('tasks', []).filter(t => t.mod === 'ielts_exam' && (t.date === today || t.date <= today));
  const todayTasks = tasks.filter(t => t.date === today);
  const pending = tasks.filter(t => !t.done && t.date < today);

  const taskCard = (t) => `
    <div class="card">
      <div class="card-title-row">
        <span class="card-title">${esc(t.text)}</span>
        <span class="tag tag-red">${t.date === today ? '今日' : '逾期 ' + t.date}</span>
      </div>
      ${t.photo ? `<div class="task-photo"><img src="${esc(t.photo)}" onclick="showPhotoPreview('${esc(t.photo)}')" alt="作业照片"></div>` : ''}
      <div class="task-actions">
        <label class="btn btn-outline btn-sm">📷 上传作业照片<input type="file" accept="image/*" style="display:none" onchange="uploadTaskPhoto(this,'${esc(t.id)}')"></label>
        <button class="btn btn-outline btn-sm" data-act="toggleTask" data-id="${esc(t.id)}">${t.done ? '取消完成' : '标记完成'}</button>
      </div>
    </div>`;

  return `
    <div class="card">
      <div class="card-title">📋 真题作业</div>
      <div class="card-subtitle">你自备真题集，这里只汇总计划里的「整套真题 / 模考」学习任务，完成拍照上传打卡即可（无内置题库与错题本）。</div>
    </div>
    ${todayTasks.length ? todayTasks.map(taskCard).join('') : `<div class="card" style="color:var(--text-secondary);text-align:center;padding:24px">今日暂无真题作业。</div>`}
    ${pending.length ? `<div class="card"><div class="card-title">⏰ 待补作业</div>${pending.map(taskCard).join('')}</div>` : ''}
  `;
}

// ===== 自媒体运营渲染 =====
function renderSelfmedia() {
  const tabs = [
    { key:'ideas', label:'选题灵感' },
    { key:'virals', label:'爆款二创' },
    { key:'materials', label:'素材库' },
    { key:'fav', label:'我的收藏' },
    { key:'data', label:'数据复盘' },
    { key:'tools', label:'运营工具' },
  ];
  // 默认显示第一个 tab
  let subTab = 'ideas';

  return `<div class="page">
    <div class="page-head">
      <div>
        <div class="page-title">📱 自媒体运营<span class="help-badge" data-help="selfmedia"></span></div>
        <div class="page-sub">选题·创作·复盘一站式管理</div>
      </div>
      <button class="btn btn-primary btn-sm" data-act="addIdea">+ 新建灵感</button>
    </div>
    <div class="tab-bar">
      ${tabs.map(t => `<button class="tab-btn ${t.key===subTab?'active':''}" data-act="smTab" data-tab="${t.key}">${t.label}</button>`).join('')}
    </div>
    <div id="smContent">
      ${subTab==='fav' ? renderSmFav() : renderSmIdeas()}
    </div>
  </div>`;
}

// 选题灵感种子库（每日确定性轮换，带参考视频，避免摆设）
const SELFMEDIA_IDEA_SEED = [
  { title:'普通人做自媒体第一个月怎么起号', cat:'搞钱干货', thought:'先定人设再选题，前 10 条测试不同方向，看哪类完播高就放大。', ref:'自媒体 起号 第一个月 实操' },
  { title:'闲鱼无货源怎么选品不踩坑', cat:'搞钱干货', thought:'跟热点+低售后品类，标题带「全新/包邮/急出」，每天擦亮一次。', ref:'闲鱼 无货源 选品 教程' },
  { title:'用 AI 批量生成短视频脚本', cat:'AI工具', thought:'一个选题让 AI 出 5 版脚本，挑最有钩子的拍，省一半时间。', ref:'AI 生成 短视频脚本 教程' },
  { title:'知识类账号怎么做不枯燥', cat:'知识科普', thought:'一个知识点配一个反常识开头，30 秒讲清一个概念。', ref:'知识类 短视频 怎么做 涨粉' },
  { title:'副业自媒体如何兼顾学业不塌房', cat:'搞钱干货', thought:'固定每周 3 更，用模板和素材库提前囤稿，考试周降频不断更。', ref:'学生 副业 自媒体 时间管理' },
  { title:'爆款开头 3 秒钩子怎么写', cat:'搞钱干货', thought:'痛点提问 / 反常识结论 / 利益前置，三种钩子轮流用。', ref:'短视频 开头 钩子 3秒 技巧' },
  { title:'AI 数字人带货视频怎么做', cat:'AI工具', thought:'用数字人+实拍混剪，降低出镜压力，适合测评/书单号。', ref:'AI 数字人 带货视频 制作' },
  { title:'水产养殖知识怎么做成爆款科普', cat:'知识科普', thought:'把专业知识讲成「养虾翻车/冷知识」，配实拍画面最有信任感。', ref:'农业 科普 短视频 养殖 知识' },
  { title:'剪映一键成片怎么用到自媒体', cat:'AI工具', thought:'素材丢进去自动出粗剪，再人工调节奏和字幕，效率翻倍。', ref:'剪映 一键成片 自媒体 教程' },
  { title:'评论区运营怎么引导互动涨粉', cat:'搞钱干货', thought:'每条视频置顶一个争议问题，主动回复前排，互动率拉满。', ref:'短视频 评论区 运营 互动 涨粉' }
];

function renderSmIdeas(cat) {
  const ideas = DB.get('ideas',[]);
  const categories = ['全部','搞钱干货','知识科普','AI工具'];
  let activeCat = cat || '全部';

  // 实时热点选题（联网快照 / data/douyin_hot.json 覆盖）
  const hot = DB.get('v2_sm_hot', []);
  const hotTime = DB.get('v2_sm_hot_time', '');
  const hotSource = DB.get('v2_sm_hot_source', '实时热点快照');
  const douyinUrl = t => 'https://www.douyin.com/search/' + encodeURIComponent(t);
  const hotBlock = hot.length ? `
    <div class="v2-section v2-hot-box">
      <div class="v2-section-title">🔥 实时热点选题 <span class="v2-hot-time">更新于 ${esc(hotTime)}</span></div>
      <div class="v2-hot-list">
        ${hot.slice(0,12).map((it,i)=>`
          <a class="v2-hot-item" href="${esc(douyinUrl(it.title))}" target="_blank" rel="noopener">
            <span class="v2-hot-rank">${i+1}</span>
            <span class="v2-hot-title">${esc(it.title)}</span>
            ${it.heat?`<span class="v2-hot-heat">${esc(it.heat)}</span>`:''}
          </a>`).join('')}
      </div>
      <div class="v2-hot-src">点击跳转抖音搜索 · 来源：${esc(hotSource)}</div>
    </div>` : '';

  // 每日灵感：从种子库按本地自然日确定性抽 3 条，每天自动更新（带参考视频）
  const dayIdx = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() / 86400000);
  const daily = [];
  for (let k = 0; k < 3; k++) { const idx = (dayIdx + k * 7) % SELFMEDIA_IDEA_SEED.length; daily.push({ s: SELFMEDIA_IDEA_SEED[idx], idx }); }

  const filtered = activeCat==='全部' ? ideas : ideas.filter(i => i.category===activeCat);

  return `
    ${hotBlock}
    <div class="sm-daily">
      <div class="sm-daily-head">🌟 今日灵感 · ${todayStr()}（每日自动更新）</div>
      ${daily.map(d => `
        <div class="sm-daily-item">
          <div class="sm-daily-row"><b>${esc(d.s.title)}</b> <span class="idea-category" style="margin-left:6px">${esc(d.s.cat)}</span> ${window.V2.readBtn('smidea_' + d.idx)}</div>
          <div class="sm-daily-thought">${esc(d.s.thought)}</div>
          <a class="btn btn-outline btn-xs" href="${window.V2.vidUrl('douyin', d.s.ref)}" target="_blank" rel="noopener">抖音 ↗</a><a class="btn btn-outline btn-xs" href="${window.V2.vidUrl('xhs', d.s.ref)}" target="_blank" rel="noopener">小红书 ↗</a>
        </div>`).join('')}
    </div>
    <div class="idea-tags">
      ${categories.map(c => `<span class="idea-tag ${c===activeCat?'active':''}" data-act="smFilter" data-cat="${esc(c)}">${esc(c)}</span>`).join('')}
      <span class="idea-tag" data-act="smTab" data-tab="fav">★ 我的收藏</span>
    </div>
    ${filtered.length === 0 ?
      `<div class="empty"><div class="empty-icon">💡</div><div class="empty-text">还没有选题灵感</div><button class="btn btn-primary btn-sm" data-act="addIdea" style="margin-top:10px">+ 记录第一个灵感</button></div>` :
      filtered.map(i => `
        <div class="idea-card" data-id="${i.id}">
          <span class="idea-category">${esc(i.category)}</span> ${window.V2.readBtn('smuser_' + i.id)}
          <div class="idea-title">${esc(i.title)}</div>
          <div class="idea-thought">${esc(i.thought)}</div>
          ${(i.tags||[]).map(t => `<span class="tag">#${esc(t)}</span>`).join('')}
          <div class="idea-actions">
            <button class="btn btn-xs ${i.fav?'btn-secondary':'btn-outline'}" data-act="toggleFav" data-id="${i.id}">${i.fav?'★ 已收藏':'☆ 收藏'}</button>
            <button class="btn btn-xs btn-outline" data-act="copyIdea" data-id="${i.id}">📋 复制</button>
            <button class="btn btn-xs btn-outline" data-act="useIdea" data-id="${i.id}">✅ 已使用</button>
            <a class="btn btn-xs btn-outline" href="${window.V2.vidUrl('douyin', i.title)}" target="_blank" rel="noopener">抖音 ↗</a><a class="btn btn-xs btn-outline" href="${window.V2.vidUrl('xhs', i.title)}" target="_blank" rel="noopener">小红书 ↗</a>
          </div>
        </div>
      `).join('')
    }
    <div class="card" style="margin-top:12px">
      <div class="card-title">💭 灵感速记</div>
      <textarea id="quickIdea" placeholder="突然想到的点子，随手记下来..." rows="2" style="width:100%;resize:none"></textarea>
      <button class="btn btn-primary btn-sm" style="margin-top:8px" data-act="saveQuickIdea">💾 保存到素材库</button>
    </div>
  `;
}

// 我的收藏（灵感 + 素材 + 爆款）
function renderSmFav() {
  const ideas = DB.get('ideas',[]).filter(i => i.fav);
  const mats = DB.get('materials',[]).filter(m => m.fav);
  const virals = DB.get('virals',[]).filter(v => v.fav);
  const sec = (title, list, renderFn) => list.length ? `<div class="card-title" style="margin-top:14px">${title}（${list.length}）</div>${list.map(renderFn).join('')}` : '';
  return `
    ${ideas.length || mats.length || virals.length ? '' : `<div class="empty"><div class="empty-icon">★</div><div class="empty-text">还没有收藏</div><div style="font-size:12px;color:var(--text-light);margin-top:6px">在「选题灵感 / 素材库 / 爆款二创」点 ☆ 即可收藏，这里统一查看</div></div>`}
    ${sec('收藏的灵感', ideas, i => `<div class="idea-card"><span class="idea-category">${esc(i.category)}</span><div class="idea-title">${esc(i.title)}</div><div class="idea-actions"><button class="btn btn-xs btn-outline" data-act="toggleFav" data-id="${i.id}">取消收藏</button></div></div>`)}
    ${sec('收藏的素材', mats, m => `<div class="list-item"><div class="li-body"><div class="li-title"><span class="tag tag-blue">${esc(m.type)}</span> ${esc(m.content)}</div></div><div class="li-actions"><button class="btn btn-xs btn-outline" data-act="matFav" data-id="${m.id}">取消</button></div></div>`)}
    ${sec('收藏的爆款', virals, v => `<div class="viral-card"><div class="viral-thumb">🔥</div><div class="viral-info"><div class="viral-title">${esc(v.title)}</div></div><div class="li-actions"><button class="btn btn-xs btn-outline" data-act="viralsFav" data-id="${v.id}">取消</button></div></div>`)}
  `;
}

// 爆款二创种子库（带原视频/二创参考，避免摆设）
const SELFMEDIA_VIRAL_SEED = [
  { formula:'反常识开头 + 过程快剪', title:'30 天从 0 到 1 万粉的副业账号', hotspot:'副业焦虑', analysis:'用「我试了所有人都不看好的方法」做钩子，全程快剪+字幕强调结果，结尾引导关注下期。', kw:'副业 起号 30天 复盘' },
  { formula:'痛点提问 + 对比演示', title:'同样是闲鱼，为什么他日入过千', hotspot:'搞钱', analysis:'开头抛痛点「你的闲鱼为什么没单」，中间前后对比，结尾给 3 个可复制动作，收藏率极高。', kw:'闲鱼 日入过千 玩法' },
  { formula:'知识切片 + 实拍佐证', title:'水产养殖冷知识为什么能火', hotspot:'知识科普', analysis:'一个冷知识配实拍画面，30 秒讲清，评论区自然引发讨论，适合专业人设。', kw:'水产 养殖 冷知识 短视频' },
  { formula:'AI 工具演示 + 利益前置', title:'用 AI 十分钟做出一条带货视频', hotspot:'AI工具', analysis:'开头直接放成片，「不用出镜也能做」，中间演示剪映+数字人，结尾留模板引导私信。', kw:'AI 带货视频 剪映 数字人 教程' },
  { formula:'情绪共鸣 + 清单体', title:'学生党副业避坑清单', hotspot:'学生副业', analysis:'用「别再被割韭菜」做情绪钩子，清单体信息密度高，适合做合集系列。', kw:'学生 副业 避坑 清单' }
];
function ensureSelfmediaSeeds() {
  if (!DB.get('v2_sm_viral_seeded')) {
    if (!DB.get('virals', []).length) {
      DB.set('virals', SELFMEDIA_VIRAL_SEED.map((v, i) => ({ id: 'vseed' + i, formula: v.formula, title: v.title, analysis: v.analysis, hotspot: v.hotspot, url: 'https://www.douyin.com/search/' + encodeURIComponent(v.title) })));
    }
    DB.set('v2_sm_viral_seeded', true);
  }
}
function renderSmVirals() {
  ensureSelfmediaSeeds();
  const virals = DB.get('virals',[]);
  return `
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">爆款案例参考 · 点「看原视频」看原片、「看二创」看别人怎么跟拍模仿</div>
    ${virals.map(v => `
      <div class="viral-card">
        <div class="viral-thumb">🔥</div>
        <div class="viral-info">
          <div class="viral-formula">📐 ${esc(v.formula)}</div>
          <div class="viral-title">${esc(v.title)}</div>
          <div class="viral-analysis">${esc(v.analysis)}</div>
          <div class="viral-meta"><span class="tag tag-red">${esc(v.hotspot)}</span></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <a class="btn btn-primary btn-xs" href="${window.V2.vidUrl('douyin', (v.title||'').replace(/爆款|二创/g,''))}" target="_blank" rel="noopener">抖音·原片 ↗</a>
          <a class="btn btn-outline btn-xs" href="${window.V2.vidUrl('douyin', (v.title||'') + ' 二创 跟拍')}" target="_blank" rel="noopener">抖音·二创 ↗</a>
          <a class="btn btn-outline btn-xs" href="${window.V2.vidUrl('xhs', (v.title||'') + ' 二创 跟拍')}" target="_blank" rel="noopener">小红书·二创 ↗</a>
          <button class="btn btn-xs ${v.fav?'btn-secondary':'btn-outline'}" data-act="viralsFav" data-id="${v.id}">${v.fav?'★ 已收藏':'☆ 收藏'}</button>
          <button class="btn btn-outline btn-xs" data-act="addViralsTask" data-title="${esc(v.title)}">+ 任务</button>
        </div>
      </div>
    `).join('')}
  `;
}

function renderSmMaterials() {
  const mats = DB.get('materials',[]);
  const types = ['全部','文案金句','封面参考','BGM合集'];
  return `
    <div class="idea-tags">
      ${types.map(t => `<span class="idea-tag active" data-act="matFilter">${esc(t)}</span>`).join('')}
    </div>
    ${mats.map(m => `
      <div class="list-item">
        <div class="li-body">
          <div class="li-title"><span class="tag tag-blue">${esc(m.type)}</span> ${esc(m.content)}</div>
          <div class="li-meta">${(m.tags||[]).map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>
        </div>
        <div class="li-actions">
          <button class="btn btn-xs ${m.fav?'btn-secondary':'btn-outline'}" data-act="matFav" data-id="${m.id}">${m.fav?'★':'☆'}</button>
          <button class="btn btn-xs btn-outline" data-act="matCopy" data-id="${m.id}">📋</button>
        </div>
      </div>
    `).join('')}
    <div class="card" style="margin-top:10px">
      <div class="card-title">+ 添加素材</div>
      <div class="form-group">
        <select id="matType"><option value="文案金句">文案金句</option><option value="封面参考">封面参考</option><option value="BGM合集">BGM合集</option></select>
      </div>
      <input id="matContent" placeholder="素材内容" style="width:100%">
      <input id="matTags" placeholder="标签（逗号分隔）" style="width:100%;margin-top:6px">
      <button class="btn btn-primary btn-sm" style="margin-top:8px" data-act="saveMat">保存素材</button>
    </div>
  `;
}

function fmtNum(n) {
  const v = Number(n) || 0;
  const a = Math.abs(v);
  if (a >= 100000000) return (v / 100000000).toFixed(2) + '亿';
  if (a >= 10000) return (v / 10000).toFixed(1) + 'w';
  return v.toLocaleString('zh-CN');
}
// 迷你折线图（播放/阅读趋势）
function svgSmTrend(dates, values) {
  const w = 320, h = 120, pad = 18;
  if (!values.length) return '<div class="chart-placeholder">暂无足够数据生成趋势</div>';
  const max = Math.max.apply(null, values.concat([1]));
  const n = values.length;
  const X = i => n === 1 ? w / 2 : pad + i * (w - 2 * pad) / (n - 1);
  const Y = v => h - pad - (v / (max || 1)) * (h - 2 * pad);
  const line = values.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ');
  const area = pad + ',' + (h - pad) + ' ' + line + ' ' + X(n - 1).toFixed(1) + ',' + (h - pad);
  const last = values[values.length - 1];
  const lbl = dates.length > 1 ? (dates[0].slice(5) + ' ~ ' + dates[dates.length - 1].slice(5)) : (dates[0] || '');
  return `<div class="v2-sm-chart-wrap"><svg viewBox="0 0 ${w} ${h}" class="v2-sm-chart" preserveAspectRatio="none">
    <polygon points="${area}" style="fill:var(--hk-red-soft);opacity:.55"/>
    <polyline points="${line}" fill="none" style="stroke:var(--hk-red);stroke-width:2"/>
    <circle cx="${X(n - 1).toFixed(1)}" cy="${Y(last).toFixed(1)}" r="3" style="fill:var(--hk-red)"/>
  </svg><div class="v2-sm-chart-lbl">${esc(lbl)} · 峰值 ${fmtNum(max)}</div></div>`;
}
// 平台对比条形图
function svgSmBars(items) {
  if (!items.length) return '';
  const w = 320, h = 150, pad = 22, gap = 10;
  const max = Math.max.apply(null, items.map(i => i.value).concat([1]));
  const bw = (w - 2 * pad - gap * (items.length - 1)) / items.length;
  let s = `<svg viewBox="0 0 ${w} ${h}" class="v2-sm-chart">`;
  items.forEach((it, i) => {
    const bh = (it.value / (max || 1)) * (h - pad - 18);
    const x = pad + i * (bw + gap), y = h - pad - bh;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" style="fill:var(--hk-red);opacity:.82"/>`;
    s += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" style="font-size:9px;fill:var(--text-light)">${it.value >= 10000 ? (it.value / 10000).toFixed(1) + 'w' : it.value}</text>`;
    s += `<text x="${(x + bw / 2).toFixed(1)}" y="${(h - 8).toFixed(1)}" text-anchor="middle" style="font-size:9px;fill:var(--text-light)">${esc(it.label)}</text>`;
  });
  return s + '</svg>';
}
function smAddFormHTML() {
  return `<div class="v2-sm-add">
    <div class="v2-sm-add-row">
      <input id="smAdd_date" class="v2-input" value="${todayStr()}" placeholder="日期" style="width:120px">
      <input id="smAdd_plat" class="v2-input" placeholder="平台（如 抖音）" style="flex:1">
    </div>
    <div class="v2-sm-add-row">
      <input id="smAdd_views" class="v2-input" placeholder="播放/阅读" type="number" style="flex:1">
      <input id="smAdd_likes" class="v2-input" placeholder="点赞" type="number" style="flex:1">
      <input id="smAdd_fans" class="v2-input" placeholder="涨粉" type="number" style="flex:1">
    </div>
    <div class="v2-sm-add-row">
      <input id="smAdd_link" class="v2-input" placeholder="作品链接（可选）" style="flex:1">
      <button class="btn btn-primary btn-sm" data-act="smDataSaveAdd">保存</button>
    </div>
  </div>`;
}
function smDataEmpty() {
  const tpl = '2026-08-01,抖音,12000,800,120,90,40,55,https://v.douyin.com/xxx';
  return `<div class="v2-section"><div class="v2-section-title">📥 导入你的自媒体数据</div>
    <div class="v2-tip-card">不用每天手填！从抖音 / 视频号 / 小红书 / 公众号后台<strong>导出数据</strong>（或把每日数字粘进来），这里自动帮你做趋势与对比图。<br>支持<strong>逗号 / 中文逗号 / 制表符</strong>分隔，第一行写表头也能自动识别。</div>
    <textarea id="smCsv" class="v2-input" rows="5" placeholder="日期,平台,播放,点赞,评论,收藏,转发,涨粉,链接"></textarea>
    <div class="v2-sm-tpl">示例（每行一条，列顺序：日期,平台,播放,赞,评论,收藏,转发,涨粉,链接）：<br><code>${esc(tpl)}</code></div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
      <button class="btn btn-primary btn-sm" data-act="smDataImport">解析并导入</button>
      <button class="btn btn-outline btn-sm" data-act="smDataShowAdd">+ 手动记一笔</button>
    </div>
    <div id="smDataForms"></div>
  </div>`;
}
function renderSmData() {
  const records = DB.get('v2_sm_data', []) || [];
  const platforms = Array.from(new Set(records.map(r => r.platform).filter(Boolean)));
  const active = DB.get('v2_sm_platform', '全部');
  const filtered = active === '全部' ? records : records.filter(r => r.platform === active);
  if (!records.length) return smDataEmpty();

  const sum = k => filtered.reduce((a, r) => a + (Number(r[k]) || 0), 0);
  const totViews = sum('views'), totLikes = sum('likes'), totComments = sum('comments'),
    totFans = sum('fans'), totCollects = sum('collects'), totShares = sum('shares');
  const interact = totViews ? ((totLikes + totComments) / totViews * 100).toFixed(1) : '0.0';

  const byDate = {};
  filtered.forEach(r => { byDate[r.date] = (byDate[r.date] || 0) + (Number(r.views) || 0); });
  const dates = Object.keys(byDate).sort();
  const trendVals = dates.map(d => byDate[d]);

  const byPlat = {};
  records.forEach(r => { byPlat[r.platform] = (byPlat[r.platform] || 0) + (Number(r.views) || 0); });
  const platItems = Object.keys(byPlat).map(p => ({ label: p, value: byPlat[p] })).sort((a, b) => b.value - a.value);

  const recent = filtered.slice().sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0).slice(0, 20);

  const chips = ['全部'].concat(platforms).map(p => `<span class="v2-chip${active === p ? ' on' : ''}" data-act="smDataPlatform" data-p="${esc(p)}">${esc(p)}</span>`).join('');

  let h = `<div class="v2-section"><div class="v2-section-title">📊 数据总览（${esc(active === '全部' ? '全部平台' : active)}）</div>
    <div class="overview-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="overview-card"><div class="overview-value">${fmtNum(totViews)}</div><div class="overview-label">总播放/阅读</div></div>
      <div class="overview-card"><div class="overview-value">${fmtNum(totLikes)}</div><div class="overview-label">总点赞</div></div>
      <div class="overview-card"><div class="overview-value">${fmtNum(totFans)}</div><div class="overview-label">总涨粉</div></div>
      <div class="overview-card"><div class="overview-value">${fmtNum(totCollects)}</div><div class="overview-label">总收藏</div></div>
      <div class="overview-card"><div class="overview-value">${fmtNum(totShares)}</div><div class="overview-label">总转发</div></div>
      <div class="overview-card"><div class="overview-value">${interact}%</div><div class="overview-label">平均互动率</div></div>
    </div></div>`;

  h += `<div class="v2-section"><div class="v2-section-title">平台筛选</div><div class="v2-cat-scroll">${chips}</div></div>`;
  h += `<div class="v2-section"><div class="v2-section-title">📈 播放/阅读趋势（按日期）</div>${svgSmTrend(dates, trendVals)}</div>`;
  if (active === '全部' && platItems.length > 1) {
    h += `<div class="v2-section"><div class="v2-section-title">📊 各平台总播放对比</div>${svgSmBars(platItems)}</div>`;
  }

  const note = DB.get('v2_sm_review', '');
  h += `<div class="v2-section"><div class="v2-section-title">📝 复盘笔记</div>
    <textarea id="smReview" class="v2-input" rows="3" placeholder="记录今日内容优缺点与优化方向…">${esc(note)}</textarea>
    <button class="btn btn-primary btn-sm" data-act="smDataSaveNote" style="margin-top:8px">保存笔记</button></div>`;

  h += `<div class="v2-section"><div class="v2-section-title">📋 数据明细（最近 ${Math.min(20, recent.length)} 条）
    <button class="btn btn-outline btn-xs" data-act="smDataExport" style="float:right">导出 CSV</button></div>
    <div class="v2-sm-table">
      <div class="v2-sm-tr v2-sm-th"><span>日期</span><span>平台</span><span>播放</span><span>赞</span><span>涨粉</span><span></span></div>`;
  recent.forEach(r => {
    h += `<div class="v2-sm-tr"><span>${esc(r.date)}</span><span>${esc(r.platform)}</span><span>${fmtNum(r.views)}</span><span>${fmtNum(r.likes)}</span><span>${fmtNum(r.fans)}</span><span><button class="btn btn-xs btn-outline" data-act="smDataDel" data-id="${esc(r.id)}">删</button></span></div>`;
  });
  h += `</div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" data-act="smDataShowAdd">+ 记一笔</button>
      <button class="btn btn-outline btn-sm" data-act="smDataShowImport">📥 粘贴/导入 CSV</button>
    </div>
    <div id="smDataForms"></div>
  </div>`;

  // AI 自动分析（需先在设置添加模型）
  const aiDef = window.AI.def();
  h += `<div class="v2-section"><div class="v2-section-title">🤖 AI 自动分析数据并提建议</div>`;
  if (!aiDef) {
    h += `<div class="v2-tip-card">未配置 AI 模型，无法自动分析。请到「设置与数据 → 多模型配置」添加 API Key 后使用本功能。</div>`;
  } else {
    const aiNote = DB.get('v2_sm_ai_note', '');
    h += `<div class="v2-tip-card">基于你导入的多平台数据（总播放/阅读 ${fmtNum(totViews)}、涨粉 ${fmtNum(totFans)}、平均互动率 ${interact}%），让 AI 给出下一步优化建议。同一作品发多个平台（抖音 / 视频号 / 小红书 / 快手 / B站）时，请分别记录平台数据，这里会自动做平台对比。</div>
      <button class="btn btn-primary btn-sm" data-act="smAiAnalyze">🤖 生成 AI 分析</button>
      <div id="smAiBox" class="v2-ai-note" style="margin-top:10px;white-space:pre-wrap;line-height:1.7">${esc(aiNote) || '点击上方按钮，AI 将分析你的数据并给出可执行的涨粉 / 选题 / 发布频率建议。'}</div>`;
  }
  h += `</div>`;
  return h;
}
async function smAiAnalyze() {
  const records = DB.get('v2_sm_data', []) || [];
  if (!records.length) { toast('请先导入或记录数据'); return; }
  const box = gid('smAiBox'); if (box) box.textContent = '🤖 AI 分析中…';
  const byPlat = {};
  records.forEach(r => { const k = r.platform || '未知'; byPlat[k] = byPlat[k] || { views: 0, likes: 0, fans: 0, n: 0 }; byPlat[k].views += Number(r.views) || 0; byPlat[k].likes += Number(r.likes) || 0; byPlat[k].fans += Number(r.fans) || 0; byPlat[k].n++; });
  const summ = Object.keys(byPlat).map(p => `${p}：${byPlat[p].n}条，播放${byPlat[p].views}，赞${byPlat[p].likes}，涨粉${byPlat[p].fans}`).join('\n');
  const prompt = `你是自媒体运营顾问。以下是我的多平台数据汇总：\n${summ}\n请从「哪类内容/平台表现最好、互动率偏低的可能原因、下一步该多拍什么选题、发布频率建议」四方面给出简短可执行的建议（中文，不超过300字）。`;
  try {
    const txt = await window.AI.call([{ role: 'user', content: prompt }], { temp: 0.5 });
    DB.set('v2_sm_ai_note', txt);
    if (box) box.textContent = txt;
    toast('✅ AI 分析完成');
  } catch (e) {
    if (box) box.textContent = '分析失败：' + e.message + '（多为浏览器 CORS 拦截，可改用支持 CORS 的代理 Base URL）';
    toast('❌ ' + e.message);
  }
}
function smDataShowImport() {
  const box = gid('smDataForms'); if (!box) return;
  const tpl = '2026-08-01,抖音,12000,800,120,90,40,55,https://v.douyin.com/xxx';
  box.innerHTML = `<textarea id="smCsv" class="v2-input" rows="5" placeholder="日期,平台,播放,点赞,评论,收藏,转发,涨粉,链接"></textarea>
    <div class="v2-sm-tpl">列顺序：日期,平台,播放,赞,评论,收藏,转发,涨粉,链接（链接可选）。<br><code>${esc(tpl)}</code></div>
    <button class="btn btn-primary btn-sm" data-act="smDataImport" style="margin-top:6px">解析并导入</button>`;
}
function smDataImport() {
  const box = gid('smCsv');
  if (!box) { smDataShowImport(); return; }
  const txt = box.value.trim();
  if (!txt) { toast('请先粘贴数据'); return; }
  const lines = txt.split(/\r?\n/).filter(l => l.trim());
  const hints = ['日期', '平台', '播放', '阅读', '点赞', '评论'];
  let start = 0;
  if (lines[0] && hints.some(h => lines[0].includes(h))) start = 1;
  const out = [];
  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(/[,，\t]+/).map(s => s.trim());
    if (cols.length < 3) continue;
    const date = cols[0], platform = cols[1];
    const nums = cols.slice(2).map(c => { const n = parseFloat(String(c).replace(/[^\d.\-]/g, '')); return isNaN(n) ? 0 : n; });
    const link = cols.find(c => /^https?:\/\//i.test(c)) || '';
    out.push({ id: genId(), date, platform, views: nums[0] || 0, likes: nums[1] || 0, comments: nums[2] || 0, collects: nums[3] || 0, shares: nums[4] || 0, fans: nums[5] || 0, link });
  }
  if (!out.length) { toast('没解析到有效数据，检查格式（至少 日期,平台,数值）'); return; }
  const cur = DB.get('v2_sm_data', []);
  DB.set('v2_sm_data', cur.concat(out));
  toast('✅ 已导入 ' + out.length + ' 条');
  switchSmTab('data');
}
function smDataShowAdd() {
  const box = gid('smDataForms'); if (!box) return;
  box.innerHTML = smAddFormHTML();
}
function smDataSaveAdd() {
  const dateEl = gid('smAdd_date'), platEl = gid('smAdd_plat'), viewsEl = gid('smAdd_views'), likesEl = gid('smAdd_likes'), fansEl = gid('smAdd_fans'), linkEl = gid('smAdd_link');
  const platform = (platEl && platEl.value || '').trim();
  if (!platform) { toast('请填写平台名称'); return; }
  const recs = DB.get('v2_sm_data', []);
  recs.push({
    id: genId(),
    date: (dateEl && dateEl.value || todayStr()).trim(),
    platform,
    views: Number(viewsEl && viewsEl.value) || 0,
    likes: Number(likesEl && likesEl.value) || 0,
    comments: 0, collects: 0, shares: 0,
    fans: Number(fansEl && fansEl.value) || 0,
    link: (linkEl && linkEl.value || '').trim()
  });
  DB.set('v2_sm_data', recs);
  toast('✅ 已记录');
  switchSmTab('data');
}
function smDataDel(el) {
  const id = el.dataset.id;
  if (!confirm('删除这条数据？')) return;
  DB.set('v2_sm_data', (DB.get('v2_sm_data', []) || []).filter(r => r.id !== id));
  switchSmTab('data');
}
function smDataExport() {
  const recs = DB.get('v2_sm_data', []);
  if (!recs.length) { toast('暂无可导出的数据'); return; }
  const head = ['日期', '平台', '播放/阅读', '点赞', '评论', '收藏', '转发', '涨粉', '链接'];
  const rows = recs.map(r => [r.date, r.platform, r.views, r.likes, r.comments, r.collects, r.shares, r.fans, r.link].join(','));
  const csv = '﻿' + head.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '自媒体数据_' + todayStr() + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('已导出 CSV');
}
function smDataPlatform(el) {
  DB.set('v2_sm_platform', el.dataset.p);
  switchSmTab('data');
}
function smDataSaveNote() {
  const b = gid('smReview');
  if (b) DB.set('v2_sm_review', b.value);
  toast('笔记已保存');
}

function renderSmTools() {
  const tools = [
    { name:'文案生成', desc:'豆包 AI 辅助生成标题和正文', icon:'✍️', free:true, url:'https://www.doubao.com', video:'https://search.bilibili.com/all?keyword=豆包AI文案生成教程' },
    { name:'封面制作', desc:'Canva 在线设计吸引眼球的封面', icon:'🎨', free:true, url:'https://www.canva.cn', video:'https://search.bilibili.com/all?keyword=Canva封面设计教程' },
    { name:'数据查询', desc:'飞瓜数据 查看各平台数据分析', icon:'📊', free:true, url:'https://www.feigua.cn', video:'https://search.bilibili.com/all?keyword=飞瓜数据使用教程' },
    { name:'违禁词检测', desc:'句易网 检测文案敏感词汇', icon:'🔍', free:true, url:'https://www.ju1.cn', video:'https://search.bilibili.com/all?keyword=短视频违禁词检测' },
  ];
  return tools.map(t => `
    <div class="list-item">
      <div style="font-size:24px">${t.icon}</div>
      <div class="li-body">
        <div class="li-title">${esc(t.name)}</div>
        <div class="li-sub">${esc(t.desc)}</div>
      </div>
      <span class="tag ${t.free?'tag-green':'tag-red'}">${t.free?'免费':'付费'}</span>
      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
        <a class="btn btn-primary btn-xs" href="${esc(t.url)}" target="_blank" rel="noopener">打开工具 ↗</a>
        ${t.video ? `<a class="btn btn-outline btn-xs" href="${esc(t.video)}" target="_blank" rel="noopener">📺 教程</a>` : ''}
      </div>
    </div>
  `).join('');
}

// ===== 备忘录渲染（分类 / 标签 / 搜索） =====
const MEMO_CATS = ['全部','工作学习','生活日常','灵感碎片','待办备忘'];
let memoState = { cat: '全部', q: '' };
function memoNoteCat(n) { return n.cat || n.tag || '工作学习'; }
function memoListHTML() {
  let notes = DB.get('notes', []);
  const q = (memoState.q || '').trim().toLowerCase();
  const cat = memoState.cat;
  notes = notes.filter(n => {
    const c = memoNoteCat(n);
    const tags = n.tags || [];
    if (cat !== '全部' && c !== cat) return false;
    if (q) {
      const hay = ((n.content || '') + ' ' + c + ' ' + tags.join(' ')).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
  notes.sort((a, b) => ((b.fav ? 1 : 0) - (a.fav ? 1 : 0)) || String(b.date || '').localeCompare(String(a.date || '')));
  if (notes.length === 0) return `<div class="empty"><div class="empty-icon">${HK.think(42)}</div><div class="empty-text">没有匹配的笔记</div><div class="empty-sub">换个关键词，或切换分类试试</div></div>`;
  return notes.map(n => {
    const c = memoNoteCat(n);
    const tags = (n.tags || []).map(t => `<span class="memo-chip" data-act="memoTag" data-tag="${esc(t)}">#${esc(t)}</span>`).join('');
    return `<div class="list-item${n.fav ? ' fav' : ''}">
      <div class="li-body">
        <div class="li-title">${n.fav ? '<span class="memo-star">★</span>' : ''}${esc(n.content.slice(0,140))}${n.content.length > 140 ? '…' : ''}</div>
        <div class="li-sub"><span class="memo-cat-badge">${esc(c)}</span>${tags ? ' ' + tags : ''}<span class="memo-date">${esc(n.date || '')}</span></div>
      </div>
      <div class="li-actions">
        <button class="btn btn-xs ${n.fav ? 'btn-primary' : 'btn-outline'}" data-act="memoFav" data-id="${n.id}" title="收藏">${n.fav ? '★' : '☆'}</button>
        <button class="btn btn-xs btn-outline" data-act="editNote" data-id="${n.id}">编辑</button>
        <button class="btn btn-xs btn-danger" data-act="delNote" data-id="${n.id}">删除</button>
      </div>
    </div>`;
  }).join('');
}
function renderMemo() {
  const all = DB.get('notes', []);
  const counts = {}; MEMO_CATS.forEach(c => counts[c] = 0);
  all.forEach(n => { const c = memoNoteCat(n); counts[c] = (counts[c] || 0) + 1; });
  counts['全部'] = all.length;
  return `<div class="page">
    <div class="page-head">
      <div>
        <div class="page-title">📒 备忘录<span class="help-badge" data-help="global"></span></div>
        <div class="page-sub">随时记录灵感与日常琐事 · 支持分类 / 标签 / 搜索</div>
      </div>
      <button class="btn btn-primary btn-sm" data-act="addNote">+ 新建笔记</button>
    </div>
    <div class="memo-toolbar">
      <div class="memo-search"><span class="memo-search-ico">🔍</span><input id="memoSearch" class="v2-search-input" placeholder="搜索笔记内容 / 标签…" value="${esc(memoState.q)}" oninput="memoLiveSearch(this.value)"></div>
      <div class="memo-tags-scroll">
        ${MEMO_CATS.map(t => `<span class="memo-tag${memoState.cat === t ? ' active' : ''}" data-act="memoCat" data-cat="${esc(t)}">${esc(t)} <b>${counts[t] || 0}</b></span>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="memo-quick-row">
        <select id="qn_cat" class="v2-input memo-qn-cat">${MEMO_CATS.slice(1).map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
        <input id="qn_tags" class="v2-input" placeholder="标签，用逗号分隔，如：雅思,灵感">
      </div>
      <textarea id="quickNote" placeholder="写下此刻的想法、待办或备忘～" rows="3" style="width:100%;margin-top:8px"></textarea>
      <button class="btn btn-primary btn-sm" style="margin-top:8px" data-act="saveQuickNote">📒 保存笔记</button>
    </div>
    <div id="memoList">${memoListHTML()}</div>
  </div>`;
}
// 实时搜索（input 事件，仅刷新列表，不重置输入框焦点）
function memoLiveSearch(val) { memoState.q = val; const el = gid('memoList'); if (el) el.innerHTML = memoListHTML(); }
function noteFormHTML(n) {
  n = n || {};
  const cat = memoNoteCat(n);
  const tags = (n.tags && n.tags.join(',')) || '';
  return `<div class="form-group"><label>内容</label><textarea id="nf_content" class="v2-input" rows="4" placeholder="写点什么…">${esc(n.content || '')}</textarea></div>
    <div class="memo-quick-row" style="gap:8px">
      <select id="nf_cat" class="v2-input memo-qn-cat">${MEMO_CATS.slice(1).map(c => `<option value="${esc(c)}"${c === cat ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
      <input id="nf_tags" class="v2-input" value="${esc(tags)}" placeholder="标签，逗号分隔，如：雅思,灵感">
    </div>
    <div style="text-align:right;margin-top:12px">
      <button class="btn btn-outline btn-sm" data-act="closeGeneric">取消</button>
      <button class="btn btn-primary btn-sm" data-act="saveNoteForm" data-id="${n.id || ''}">保存</button>
    </div>`;
}

// ===== 设置渲染 =====
// ===== 主题配色 & 头像 =====
const THEMES = {
  'hk-red': { name:'经典红', red:'#E60012', soft:'#FFE0E6', page:'#FFF9FA', card:'#FFFFFF', pink:'#FFCCD8', border:'#FFD6DD', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#4A90A4', green:'#2BA471', yellow:'#FFD100' },
  'peach':  { name:'蜜桃粉', red:'#FF6F91', soft:'#FFE3EC', page:'#FFF6F8', card:'#FFFFFF', pink:'#FFD0DD', border:'#FFD9E3', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#6FA8C7', green:'#3FAE79', yellow:'#FFC94D' },
  'blue':   { name:'雾霾蓝', red:'#3E8FB0', soft:'#DCEEF2', page:'#F4FBFC', card:'#FFFFFF', pink:'#CDE7EE', border:'#D6E9EF', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#3E8FB0', green:'#3FAE79', yellow:'#E0B341' },
  'matcha': { name:'抹茶绿', red:'#2E9E5B', soft:'#DDF3E4', page:'#F3FBF5', card:'#FFFFFF', pink:'#C9ECD4', border:'#D7EEDD', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#4A90A4', green:'#2E9E5B', yellow:'#E0B341' },
  'taro':   { name:'香芋紫', red:'#8A6FD1', soft:'#ECE6FA', page:'#F8F6FD', card:'#FFFFFF', pink:'#DDD2F2', border:'#E2D9F3', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#6F8FC7', green:'#3FAE79', yellow:'#E0B341' },
  'orange': { name:'暖橙', red:'#F56A1F', soft:'#FFE6D4', page:'#FFFAF5', card:'#FFFFFF', pink:'#FFD3B8', border:'#FFDFCB', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#4A90A4', green:'#3FAE79', yellow:'#F5B22E' },
  'sakura': { name:'樱花粉', red:'#FF8FAB', soft:'#FFE3EC', page:'#FFF6F9', card:'#FFFFFF', pink:'#FFD0DD', border:'#FFD9E3', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#6FA8C7', green:'#3FAE79', yellow:'#FFC94D' },
  'mint':   { name:'薄荷绿', red:'#3FB98C', soft:'#D6F3E8', page:'#F2FBF7', card:'#FFFFFF', pink:'#C2ECD6', border:'#D2EEDD', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#5AA9C7', green:'#3FB98C', yellow:'#E0B341' },
  'butter': { name:'奶黄', red:'#F2B705', soft:'#FFF1CC', page:'#FFFAF0', card:'#FFFFFF', pink:'#FFE3B0', border:'#FFE8C2', text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#5AA9C7', green:'#3FAE79', yellow:'#F2B705' }
};
function softOf(hex) {
  hex = (hex || '#E60012').replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const R = parseInt(hex.slice(0,2),16), G = parseInt(hex.slice(2,4),16), B = parseInt(hex.slice(4,6),16);
  const f = c => Math.round(c + (255 - c) * 0.86);
  return '#' + [f(R),f(G),f(B)].map(x => x.toString(16).padStart(2,'0')).join('');
}
function deriveTheme(hex) {
  hex = (hex || '#E60012').replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const R = parseInt(hex.slice(0,2),16), G = parseInt(hex.slice(2,4),16), B = parseInt(hex.slice(4,6),16);
  const mix = p => { const f = c => Math.round(c + (255 - c) * p); return '#' + [f(R),f(G),f(B)].map(x => x.toString(16).padStart(2,'0')).join(''); };
  return { red:'#'+hex, soft:mix(0.86), page:mix(0.95), card:'#FFFFFF', pink:mix(0.80), border:mix(0.83), text:'#333333', textSec:'#666666', textLight:'#999999', blue:'#4A90A4', green:'#2BA471', yellow:'#FFD100' };
}
function applyThemeVars(key, customPrimary) {
  let t = (key === 'custom') ? deriveTheme(customPrimary || DB.get('v2_theme_custom','#E60012')) : (THEMES[key] || THEMES['hk-red']);
  if (!t) t = THEMES['hk-red'];
  const r = document.documentElement.style, set = (k,v) => r.setProperty(k, v);
  set('--red', t.red); set('--sidebar-bg', t.soft); set('--topbar-bg', t.soft); set('--page-bg', t.page); set('--card-bg', t.card);
  set('--accent-pink', t.pink); set('--border-light', t.border);
  set('--text-primary', t.text); set('--text-secondary', t.textSec); set('--text-light', t.textLight);
  set('--hk-blue', t.blue); set('--income-green', t.green); set('--expense-red', '#E60012');
  set('--green-up', '#E60012'); set('--green-down', '#00AA4A'); // 涨红跌绿 固定
  set('--hk-red', t.red); set('--hk-red-soft', t.soft); set('--hk-bg', t.page); set('--hk-white', t.card);
  set('--hk-pink', t.pink); set('--hk-text', t.text); set('--hk-light', t.textLight); set('--hk-line', t.border);
  set('--hk-yellow', t.yellow); set('--hk-blue', t.blue); set('--hk-green', t.green);
  window.HK_COLOR = t.red; window.HK_SOFT = t.soft;
  // ===== 分区精细调色覆盖（用户在设置里单独调每块颜色） =====
  const blk = DB.get('v2_theme_blocks', null);
  if (blk && typeof blk === 'object') {
    if (blk.page)     set('--page-bg', blk.page);
    if (blk.sidebar) set('--sidebar-bg', blk.sidebar);
    if (blk.topbar)  set('--topbar-bg', blk.topbar);
    if (blk.card)   set('--card-bg', blk.card);
    if (blk.border) set('--border-light', blk.border);
    if (blk.accent) { set('--red', blk.accent); set('--hk-red', blk.accent); set('--hk-red-soft', softOf(blk.accent)); set('--expense-red', blk.accent); }
  }
  DB.set('v2_theme', key); if (key === 'custom') DB.set('v2_theme_custom', customPrimary || DB.get('v2_theme_custom','#E60012'));
}
function applyTheme(key, customPrimary) {
  applyThemeVars(key, customPrimary);
  refreshAvatars();
  if (typeof render === 'function') render();
}
function defaultAvatarHTML(size) {
  // 未上传头像时显示 Hello Kitty 脸
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--card-bg);display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,.12);border:2px solid var(--red)">${HK.face(size - 4)}</div>`;
}
function renderAvatarHTML(size) {
  const av = DB.get('v2_avatar', '');
  if (av) return `<img src="${av}" alt="头像" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;display:block;box-shadow:0 2px 6px rgba(0,0,0,.12)">`;
  return defaultAvatarHTML(size);
}
function refreshAvatars() {
  const sa = gid('sidebarAvatar'), ta = gid('topAvatar');
  if (sa) sa.innerHTML = renderAvatarHTML(36);
  if (ta) ta.innerHTML = renderAvatarHTML(30);
  const pv = gid('avatarPreview'); if (pv) pv.innerHTML = renderAvatarHTML(44);
  const sk = gid('sidebarKitty'); if (sk) sk.innerHTML = HK.full(52);
}
function compressAvatarFile(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 160; let w = img.width, h = img.height;
      if (w > h && w > max) { h = Math.round(h * max / w); w = max; } else if (h > max) { w = Math.round(w * max / h); h = max; }
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(c.toDataURL('image/jpeg', 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
function themeSelect(el) {
  const key = el.dataset.key;
  const box = gid('customThemeBox');
  if (key === 'custom') { if (box) box.style.display = 'flex'; applyTheme('custom', DB.get('v2_theme_custom','#E60012')); }
  else { if (box) box.style.display = 'none'; applyTheme(key); }
  document.querySelectorAll('#themePresets .theme-swatch').forEach(b => b.classList.toggle('on', b.dataset.key === key));
}
function themeCustomApply() {
  const c = gid('customColor'); if (c) applyTheme('custom', c.value);
  document.querySelectorAll('#themePresets .theme-swatch').forEach(b => b.classList.toggle('on', b.dataset.key === 'custom'));
}
function themeBlocksApply() {
  const g = id => (gid(id) ? gid(id).value : null);
  const blk = { page: g('blkPage'), sidebar: g('blkSidebar'), topbar: g('blkTopbar'), card: g('blkCard'), border: g('blkBorder'), accent: g('blkAccent') };
  DB.set('v2_theme_blocks', blk);
  applyThemeVars(DB.get('v2_theme','hk-red'));
  refreshAvatars();
  if (typeof render === 'function') render();
  toast('已应用分区调色');
}
function themeBlocksReset() {
  DB.set('v2_theme_blocks', null);
  applyThemeVars(DB.get('v2_theme','hk-red'));
  refreshAvatars();
  if (typeof render === 'function') render();
  toast('已恢复主题预设');
}
function avatarUpload() {
  const inp = gid('avatarInput'); if (!inp) return;
  inp.onchange = ev => {
    const f = ev.target.files[0]; if (!f) return;
    compressAvatarFile(f, data => { DB.set('v2_avatar', data); refreshAvatars(); toast('头像已更新'); });
  };
  inp.click();
}
function avatarReset() { DB.set('v2_avatar', ''); refreshAvatars(); toast('已恢复默认头像'); }

function loadHotData() {
  // 若每日真实热点已就位，不再用静态文件覆盖
  if (DB.get('v2_sm_hot_real') === '1') return;
  try {
    fetch('./data/douyin_hot.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j && Array.isArray(j.list) && j.list.length) {
          DB.set('v2_sm_hot', j.list);
          if (j.updated) DB.set('v2_sm_hot_time', j.updated);
          if (j.source) DB.set('v2_sm_hot_source', j.source);
          if (currentRoute === 'selfmedia') render();
        }
      })
      .catch(() => {});
  } catch (e) {}
}

function renderSettings() {
  const aiProv = DB.get('v2_ai_providers', []) || [];
  const aiDefault = DB.get('v2_ai_default', '');
  const aiDefaultObj = aiProv.find(p => p.id === aiDefault) || aiProv[0] || null;
  const changelogs = [
    { ver:'2.3.0', date:'2026-08-08', content:'Hello Kitty 姿势大换血：① 用用户新提供的 20 张素材，裁剪/去底/超分锐化生成 20 个不同姿势 Kitty（粉色坐姿/歪头思考/红衣招手/汉堡/举哑铃/洗澡/礼物盒/相机/爱心/四叶草等）；② 侧栏模块按语义重新配图，彻底替换原先自媒体/闲鱼/视频号/公众号等白底重复图标；③ 首页问候/金句/签到/成长/天气/倒计时、饮食/运动/护肤打卡完成态、返回顶部、浮动 Kitty 均换为不同姿势。', action:'无需操作' },
    { ver:'2.2.0', date:'2026-08-07', content:'Hello Kitty 主题再深化：① 侧栏导航图标全部换成真实 Kitty 脸+彩色圆底（hover 晃动、选中态白圆底弹跳）；② 签到日历去蓝改 Kitty 红主题、已签到日加 Kitty 脸印章、签到卡加 Kitty 插画；③ 新增樱花粉/薄荷绿/奶黄三套 Kitty 皮肤，主题预设加 Kitty 脸；④ 打卡与签到成功触发 Kitty 撒花弹跳动画、按钮 hover 轻晃、完成标记弹跳；⑤ 顶栏加今日未签到 Kitty 提醒角标；⑥ 侧栏品牌区与首页成长/天气卡统一 Kitty 插画。', action:'无需操作' },
    { ver:'2.1.0', date:'2026-08-07', content:'本轮精进修炼：① 备忘录升级分类/标签/实时搜索/收藏；② 每日复盘新增「今日评分(1-10)」+ 近7日柱状图 + 近30日折线图 + 心情分布；③ 首页天气新增未来7天预报；④ 习惯养成新增近35天打卡热力图；⑤ Hello Kitty 主题加浮动装饰；⑥ 设置新增「第三方账号」本地记录（抖音/小红书/微信/闲鱼）。', action:'无需操作：本地数据自动兼容，旧笔记会归入对应分类' },
    { ver:'2.0.0', date:'2026-08-05', content:'全新 v2 重构：Hello Kitty 红主题完整版。实现首页（7区域）、打卡中心（动态聚合）、雅思学习（6个子板块）、自媒体运营（5个标签）、备忘录、设置与数据。支持手机端汉堡抽屉导航、响应式布局、帮助系统、数据导入导出。', action:'需要操作：旧版数据需重新录入或通过导入恢复' },
    { ver:'1.0.0', date:'2026-08-04', content:'初版上线：基础骨架 + 6 类公共能力 + 示例数据 + CloudStudio 部署。', action:'无需操作' },
  ];

  // 分区精细调色：默认「米白底 + 红框 + 浅红侧栏/顶栏 + 红强调」
  const blkDefault = { page:'#FFFDF7', sidebar:'#FFE8EC', topbar:'#FFE8EC', card:'#FFFFFF', border:'#E60012', accent:'#E60012' };
  const blk = Object.assign({}, blkDefault, DB.get('v2_theme_blocks', null) || {});
  const blkRow = (id, label, val) => `<label class="blk-item"><span>${label}</span><input type="color" id="${id}" value="${val}"></label>`;

  return `<div class="page">
    <div class="page-head">
      <div class="page-title">⚙️ 设置与数据<span class="help-badge" data-help="settings"></span></div>
    </div>

    <!-- 使用说明 -->
    <div class="settings-section">
      <h3>📖 使用说明</h3>
      <div class="guide-content card">
        <h4>关于工作台</h4>
        <p>易欢工作台是一个基于 Hello Kitty 主题的个人工作台应用，运行在你的浏览器中，无需安装任何软件。</p>

        <h4>模块说明（v1 已实现）</h4>
        <ul>
          <li><b>首页</b>：问候、时钟、金句、日历签到、成长汇报、倒计时、天气 — 7 个区域聚合今日关键信息</li>
          <li><b>打卡中心</b>：自动汇总所有模块的打卡任务，双向同步，勾选即完成</li>
          <li><b>雅思学习</b>：单词（30个/天+发音+游戏）、听力（4 Section+播放器）、口语（影子跟读+录音+话题）、阅读（练习+考点词库）、写作（范文+练习+句式库）、真题（套卷+错题本）</li>
          <li><b>自媒体运营</b>：选题灵感、爆款二创（案例拆解+添加至任务）、素材库、数据复盘、运营工具</li>
          <li><b>备忘录</b>：分类笔记、快速记录、搜索、收藏</li>
        </ul>

        <h4>账号与登录</h4>
        <p>v1 无需账号和登录。所有数据存储在你当前使用的浏览器中。</p>
        <p class="disabled-note">（账号系统将在 v2 接入 Supabase 后提供）</p>

        <h4>数据保存方式</h4>
        <p>使用浏览器 <code>localStorage</code> 本地存储。数据按设备/浏览器隔离，同一设备不同浏览器不互通。</p>

        <h4>导出 / 备份 / 恢复</h4>
        <ul>
          <li><b>导出备份</b>：点击下方「导出数据」按钮，下载 JSON 文件。建议每周备份一次。</li>
          <li><b>恢复数据</b>：点击「导入数据」选择之前导出的 JSON 文件，将覆盖当前数据。</li>
          <li><b>清空数据</b>：点击「清空所有数据」将不可逆删除所有本地数据，请谨慎操作。</li>
        </ul>

        <h4>迁移</h4>
        <p>换设备/换浏览器：在旧设备导出 JSON → 传到新设备 → 导入即可完成迁移。</p>

        <h4>同步</h4>
        <p class="disabled-note">v1 不支持云端多端实时同步。数据仅存于本地浏览器。</p>
        <p>v2 将接入 Supabase 云数据库，实现多设备自动同步。（需要在设置中配置 Supabase URL 和 Anon Key）</p>

        <h4>服务器与数据库</h4>
        <p>当前版本为纯静态前端应用，部署在 CloudStudio 静态托管上。无后端服务器，数据库即浏览器 localStorage。</p>

        <h4>API 接口</h4>
        <p class="disabled-note">v1 无外部 API 调用。以下接口将在对应版本接入：</p>
        <ul>
          <li>天气 API（设置中配置后可用）</li>
          <li>金价/股市 API（黄金财经模块）</li>
          <li>LLM API（AI 帮手，需自备 Key）</li>
          <li>B站/抖音数据 API（需平台授权）</li>
        </ul>

        <h4>费用说明</h4>
        <p>v1 完全免费，无任何收费项目。</p>
        <p>可能产生费用的功能（均需用户自行配置）：</p>
        <ul>
          <li>LLM API 费用（根据你选择的服务商计费，如 OpenAI / 国内大模型）</li>
          <li>云存储费用（Supabase 免费额度内免费，超出按量付费）</li>
        </ul>
        <p><b>我不会替你注册账号或支付任何费用。</b></p>
      </div>
    </div>

    <!-- 外观与头像 -->
    <div class="settings-section">
      <h3>🎨 外观与头像</h3>
      <div class="card">
        <div class="settings-label">主题配色</div>
        <div class="settings-desc">选择一套配色，或自定义主色（全站即时生效）</div>
        <div id="themePresets" style="display:flex;flex-wrap:wrap;gap:10px;margin:12px 0">
          ${Object.keys(THEMES).map(k => `<button class="theme-swatch ${DB.get('v2_theme','hk-red')===k?'on':''}" data-act="themeSelect" data-key="${k}"><img src="img/hk_face.png" class="sw-kitty"><span class="sw-dot" style="background:${THEMES[k].red}"></span><span>${THEMES[k].name}</span></button>`).join('')}
          <button class="theme-swatch ${DB.get('v2_theme','hk-red')==='custom'?'on':''}" data-act="themeSelect" data-key="custom"><span class="sw-dot" style="background:conic-gradient(#E60012,#FF6F91,#3E8FB0,#2E9E5B,#8A6FD1,#F56A1F)"></span><span>自定义</span></button>
        </div>
        <div id="customThemeBox" style="${DB.get('v2_theme','hk-red')==='custom'?'':'display:none'};align-items:center;gap:12px;margin-bottom:6px">
          <label class="settings-label">主色</label>
          <input type="color" id="customColor" value="${esc(DB.get('v2_theme_custom','#E60012'))}" style="width:46px;height:32px;border:none;background:none;cursor:pointer">
          <button class="btn btn-primary btn-xs" data-act="themeCustomApply">应用自定义</button>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="settings-label">🎛 分区精细调色（覆盖上方预设）</div>
          <div class="settings-desc">每个区域独立设置，看腻了随时改。默认：米白底 + 红框 + 浅红侧栏/顶栏 + 红强调</div>
          <div class="blk-grid">
            ${blkRow('blkPage','工作台底色', blk.page)}
            ${blkRow('blkSidebar','侧边栏颜色', blk.sidebar)}
            ${blkRow('blkTopbar','顶栏颜色', blk.topbar)}
            ${blkRow('blkCard','卡片底色', blk.card)}
            ${blkRow('blkBorder','卡片边框', blk.border)}
            ${blkRow('blkAccent','强调/按钮', blk.accent)}
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="btn btn-primary btn-xs" data-act="themeBlocksApply">应用分区调色</button>
            <button class="btn btn-outline btn-xs" data-act="themeBlocksReset">恢复预设</button>
          </div>
        </div>
        <div class="settings-row" style="margin-top:14px">
          <div>
            <div class="settings-label">我的头像</div>
            <div class="settings-desc">上传一张图片作为头像（自动压缩为 160px）</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <div id="avatarPreview">${renderAvatarHTML(44)}</div>
            <button class="btn btn-outline btn-xs" data-act="avatarUpload">上传</button>
            <button class="btn btn-outline btn-xs" data-act="avatarReset">恢复默认</button>
            <input type="file" id="avatarInput" accept="image/*" style="display:none">
          </div>
        </div>
      </div>
    </div>

    <!-- AI 配置（多模型） -->
    <div class="settings-section">
      <h3>🤖 AI 模型配置</h3>
      <div class="card">
        <div class="settings-desc" style="margin-bottom:10px">可接入<b>多个</b>大模型（DeepSeek / OpenAI / 智谱 / 本地 Ollama 等），任选一个设为默认。密钥只存在你浏览器本地（localStorage），<b>不会写进网站代码</b>，公开网页也不会收集它。<b>例外</b>：如果你开启了「☁️ 云同步」，密钥会作为你的数据一起备份到你自己的私有同步空间（仅你能访问）。所有 AI 功能都从这里读取默认模型。</div>
        <div id="aiProvList">
          ${aiProv.length ? aiProv.map(p => `<div class="ai-prov-row">
            <span class="ai-prov-radio ${p.id===aiDefault?'on':''}" data-act="aiProvDefault" data-id="${p.id}" title="设为默认">${p.id===aiDefault?'★ 默认':'○ 设为默认'}</span>
            <span class="ai-prov-name">${esc(p.name || p.model)}</span>
            <span class="ai-prov-model">${esc(p.model||'')}</span>
            <span class="ai-prov-base">${esc(p.base||'')}</span>
            <span class="ai-prov-ops"><a data-act="aiProvEdit" data-id="${p.id}">编辑</a><a data-act="aiProvDel" data-id="${p.id}">删除</a></span>
          </div>`).join('') : '<div class="v2-book-empty">还没有配置任何模型，点下方「+ 添加模型」</div>'}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" data-act="aiProvAdd">+ 添加模型</button>
          <button class="btn btn-outline btn-sm" data-act="testAiConn">测试默认连接</button>
        </div>
        <p style="font-size:11.5px;color:var(--text-light);margin-top:8px">
          ${aiProv.length ? (aiDefaultObj ? '✅ 默认模型：' + esc(aiDefaultObj.name || aiDefaultObj.model) + ' — AI 功能可用' : '⚠ 请设一个默认模型') : '⚠ 未配置 — AI 功能不可用（不影响其他功能）'}
        </p>
        <p style="font-size:11px;color:var(--text-light);margin-top:6px;border-top:1px dashed var(--border-light);padding-top:8px">
          提示：浏览器直连大模型可能被跨域(CORS)拦截。若「测试连接」失败，可在 Base URL 前加 CORS 代理（如 <code>https://api.allorigins.win/raw?url=</code> 后接真实地址），或等后续私人后端 / 飞书中转。
        </p>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="settings-section">
      <h3>💾 数据管理</h3>
      <div class="card">
        <div class="settings-row">
          <div>
            <div class="settings-label">导出数据备份</div>
            <div class="settings-desc">下载全部数据为 JSON 文件</div>
          </div>
          <button class="btn btn-secondary btn-sm" data-act="exportData">📥 导出</button>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-label">导入数据恢复</div>
            <div class="settings-desc">从 JSON 文件恢复数据（将覆盖当前数据）</div>
          </div>
          <button class="btn btn-outline btn-sm" data-act="importDataTrigger">📤 导入</button>
          <input type="file" id="importFileInput" accept=".json" style="display:none">
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-label">导出 Markdown（Obsidian）</div>
            <div class="settings-desc">把备忘录 / 灵感 / 读书笔记导出成 .md 文件，直接丢进 Obsidian 库</div>
          </div>
          <button class="btn btn-secondary btn-sm" data-act="exportMarkdown">📝 导出</button>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-label" style="color:var(--expense-red)">⚠️ 清空所有数据</div>
            <div class="settings-desc">不可逆操作，请确认已备份</div>
          </div>
          <button class="btn btn-danger btn-sm" data-act="clearAllData">清空</button>
        </div>
      </div>
    </div>

    <!-- 外部数据（V3） -->
    <div class="settings-section">
      <h3>🌐 外部数据（V3 实时）</h3>
      <div class="card">
        <div class="settings-row">
          <div>
            <div class="settings-label">天气城市</div>
            <div class="settings-desc">首页天气定位城市</div>
          </div>
          <input value="${esc(DB.get('v3_city','北京'))}" id="v3City" style="width:160px" placeholder="北京">
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-label">美元 / 人民币汇率</div>
            <div class="settings-desc">黄金换算人民币/克使用</div>
          </div>
          <input value="${esc(DB.get('v3_usdcny','7.18'))}" id="v3Rate" style="width:120px" placeholder="7.18">
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-label">CORS 代理（可选）</div>
            <div class="settings-desc">留空用默认；A股 / 新闻经此跨域</div>
          </div>
          <input value="${esc(DB.get('v3_proxy',''))}" id="v3Proxy" style="width:280px" placeholder="https://api.allorigins.win/raw?url=">
        </div>
        <div style="margin-top:12px;text-align:right">
          <button class="btn btn-primary btn-sm" data-act="saveV3Config">保存配置</button>
          <button class="btn btn-outline btn-sm" data-act="testV3Conn">测试连接</button>
        </div>
        <p style="font-size:11.5px;color:var(--text-light);margin-top:8px">已接入真实数据：天气(Open-Meteo)、黄金(gold-api)、A股(腾讯财经)。新闻经 GDELT 实时拉取，受限时回退样例。</p>
      </div>
    </div>

    <!-- 第三方账号绑定（本地记录） -->
    <div class="settings-section">
      <h3>🔗 第三方账号（本地记录）</h3>
      <div class="card">
        <p style="font-size:11.5px;color:var(--text-light);margin:-4px 0 10px">纯静态站点无法直接做平台 OAuth 授权，这里仅<b>本地记录</b>你的账号昵称 / ID 以便对照；闲鱼 / 视频号 / 公众号另有专属管理模块。要接入真实平台数据需加后端服务。</p>
        ${(() => { const a = [['douyin','抖音',false],['xhs','小红书',false],['wechat','微信 / 公众号',true],['xianyu','闲鱼',true]]; const acc = DB.get('v2_accounts', {}) || {}; return a.map(([k,name,mod]) => `<div class="settings-row"><div><div class="settings-label">${name}</div><div class="settings-desc">${mod ? '已有专属管理模块' : '仅本地记录'}</div></div><input id="acc_${k}" class="v2-input" style="width:180px" placeholder="昵称 / ID" value="${esc(acc[k] || '')}"></div>`).join(''); })()}
        <div style="margin-top:12px;text-align:right">
          <button class="btn btn-primary btn-sm" data-act="saveAccounts">保存账号</button>
        </div>
      </div>
    </div>

    <!-- 更新日志 -->
    <div class="settings-section">
      <h3>📋 更新日志</h3>
      <div class="card">
        ${changelogs.map(cl => `
          <div class="changelog-entry">
            <span class="changelog-version">v${cl.ver}</span>
            <span class="changelog-date">${cl.date}</span>
            <div class="changelog-content">${cl.content}</div>
            <div style="font-size:11.5px;color:${cl.action.includes('需要')?'var(--red)':'var(--text-secondary)'};margin-top:4px">
              ${cl.action.includes('需要')?'⚠️ ':'✅ '} ${cl.action}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

// ===== 即将上线占位页 =====
function renderComingSoon(route) {
  const navItem = NAV_CONFIG.find(n => n.key === route);
  const label = navItem ? navItem.label : route;
  return `<div class="page">
    <div class="page-head">
      <div class="page-title">${esc(label)}<span class="help-badge" data-help="global"></span></div>
      <div class="page-sub">v2 迭代中，敬请期待</div>
    </div>
    <div class="empty">
      <div class="empty-icon">🚧</div>
      <div class="empty-text" style="font-size:16px">该模块正在建设中...</div>
      <p style="color:var(--text-light);margin-top:8px">v1 聚焦核心体验，此模块将在 v2 补齐到同等质量</p>
      <button class="btn btn-primary btn-sm" style="margin-top:16px" data-act="goHome">返回首页</button>
    </div>
  </div>`;
}

// ===== 导航栏构建 =====
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildSidebar() {
  const nav = gid('sidebarNav');
  let html = '';

  // 直接放置去背后的 Kitty 图（去掉彩色方框背景，按用户要求裸放）
  const kittyIc = key => `<span class="nav-kitty nav-kitty-clear">${HK.navPose(key, 24)}</span>`;
  NAV_CONFIG.forEach((item, idx) => {
    if (item.key.startsWith('_')) {
      // 分组标题
      if (item.group === 'more' && !nav.querySelector('[data-group-more]')) {
        html += `<div class="nav-group-title" data-group-more">更多模块</div>`;
      }
    }

    if (item.expandable && item.children) {
      // 可展开项
      html += `<div class="nav-item" data-nav="${item.key}" data-expandable>
        ${kittyIc(item.key)}
        <span class="nav-label">${item.label}</span>
      </div>`;
      // 子项网格
      html += `<div class="nav-sub-grid" id="subGrid_${item.key}" style="display:none">`;
      item.children.forEach((child, ci) => {
        html += `<div class="nav-sub-item" data-nav="${child.key}">
          ${kittyIc(child.key)}
          <span>${child.label}</span>
        </div>`;
      });
      html += `</div>`;
    } else {
      // 普通项 / V2 模块（_ 前缀均为已上线真实模块，正常高亮显示）
      html += `<div class="nav-item ${item.dot?'has-dot':''}" data-nav="${item.key}">
        ${kittyIc(item.key)}
        <span class="nav-label">${item.label}</span>
      </div>`;
    }
  });

  nav.innerHTML = html;
}

function updateNavActive() {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === currentRoute);
  });
  document.querySelectorAll('.nav-sub-item').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === currentRoute);
  });
}

// ===== 顶部栏更新 =====
function updateTopBar() {
  const titles = {
    home:'易欢工作台', checkin:'打卡中心',
    ielts_words:'雅思·单词', ielts_listening:'雅思·听力',
    ielts_speaking:'雅思·口语', ielts_reading:'雅思·阅读',
    ielts_writing:'雅思·写作', ielts_exam:'雅思·真题',
    selfmedia:'自媒体运营', memo:'备忘录', settings:'设置与数据'
  };
  gid('pageTitle').textContent = titles[currentRoute] || '易欢工作台';
  // 今日签到提醒（Kitty 角标）
  const rem = gid('checkinReminder');
  if (rem) {
    const checkedToday = (DB.get('checkins', [])).includes(todayStr());
    if (checkedToday) { rem.classList.add('hidden'); rem.innerHTML = ''; }
    else { rem.classList.remove('hidden'); rem.innerHTML = HK.wavePink(22); }
  }
}

// ===== 抽屉控制 =====
function toggleDrawer() {
  const sb = gid('sidebar');
  const ov = gid('drawerOverlay');
  const isOpen = sb.classList.contains('open');
  if (isOpen) {
    sb.classList.remove('open');
    ov.classList.remove('show');
  } else {
    sb.classList.add('open');
    ov.classList.add('show');
  }
}

function closeDrawer() {
  gid('sidebar').classList.remove('open');
  gid('drawerOverlay').classList.remove('show');
}

// ===== 帮助弹窗 =====
function showHelp(key) {
  const help = HELP_TEXT[key] || HELP_TEXT.global;
  gid('helpTitle').textContent = help.title;
  gid('helpBody').innerHTML = help.body;
  gid('helpModal').classList.remove('hidden');
}

function closeHelp() { gid('helpModal').classList.add('hidden'); }

function showGeneric(title, body) {
  gid('genericTitle').textContent = title;
  gid('genericBody').innerHTML = typeof body === 'string' ? body : body;
  gid('genericModal').classList.remove('hidden');
}

function closeGeneric() { gid('genericModal').classList.add('hidden'); }

// ===== 事件绑定 =====
function bindEvents() {
  // 监听挂到 document：侧边栏导航 / 帮助按钮 / 顶栏全局帮助都在 #app 之外，
  // 只有挂在 document 才能捕获全站点击（修复「只能看见首页、其他打不开」）。
  if (window.__wbClickBound) return;   // 防重复绑定：render() 每次调用，只挂一次
  window.__wbClickBound = true;

  // 导航点击
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      const key = nav.dataset.nav;
      if (nav.dataset.expandable) {
        // 展开/收起子项
        const grid = gid(`subGrid_${key}`);
        if (grid) grid.style.display = grid.style.display === 'none' ? '' : 'none';
        // 同时打开第一个子模块，避免点父项无内容
        const parent = NAV_CONFIG.find(n => n.key === key);
        if (parent && parent.children && parent.children[0]) navigate(parent.children[0].key);
        return;
      }
      navigate(key);
    }

    // 帮助按钮
    const helpBtn = e.target.closest('[data-help]');
    if (helpBtn) { showHelp(helpBtn.dataset.help); return; }

    // 全局帮助
    if (e.target.closest('#globalHelpBtn')) { showHelp('global'); return; }

    // 操作分发
    const actEl = e.target.closest('[data-act]');
    if (!actEl) return;
    const act = actEl.dataset.act;
    handleAction(act, actEl, e);
  });
}

function handleAction(act, el, e) {
  switch(act) {
    // ---- 首页操作 ----
    case 'doCheckin': doCheckin(); break;
    case 'refreshReport': refreshReport(); break;
    case 'addCountdown': addCountdown(); break;
    case 'editWeather': editWeather(); break;
    case 'refreshWeather': refreshWeatherV3(); break;

    // ---- 打卡中心操作 ----
    case 'toggleTask': toggleTask(el.dataset.id); break;
    case 'addTask': addTask(el.dataset.cat); break;
    case 'goToday': navigate('checkin'); break;
    case 'gotoMod': navigate(el.dataset.mod); break;

    // ---- 雅思 Tab 切换 ----
    case 'ieltsTab': navigate(el.dataset.tab); break;
    case 'refreshWords': refreshDailyWords(); break;
    case 'masterWord': masterWord(el.dataset.w); break;
    case 'speakWord': speakWord(el.dataset.w); break;
    case 'playGame': playGame(el.dataset.game); break;
    case 'startTest': startTest(); break;
    case 'testReveal': testReveal(); break;
    case 'testKnown': testResult('known'); break;
    case 'testUnknown': testResult('unknown'); break;
    case 'testExit': exitTest(); break;
    case 'listenTab': switchListenTab(el.dataset.tab); break;
    case 'speakTab': switchSpeakTab(el.dataset.tab); break;
    case 'readTab': switchReadTab(el.dataset.tab); break;
    case 'saveReadScore': saveReadScore(el.dataset.id); break;
    case 'toggleReadWord': toggleReadWord(el.dataset.id); break;
    case 'filterReadWords': filterReadWords(el.dataset.filter); break;
    case 'delReadMistake': delReadMistake(el.dataset.id); break;
    case 'addListenMistake': addListenMistake(); break;
    case 'delListenMistake': delListenMistake(el.dataset.id); break;
    case 'markSceneDone': markSceneDone(parseInt(el.dataset.idx,10)); break;
    case 'addTopicSummary': addTopicSummary(); break;
    case 'delTopicSummary': delTopicSummary(el.dataset.id); break;
    case 'delShadowVideo': delShadowVideo(el.dataset.id); break;
    case 'writeTab': switchWriteTab(el.dataset.tab); break;
    case 'loadShadowVideo': loadShadowVideo(); break;
    case 'viewEssay': viewEssay(el.dataset.title); break;

    // ---- 自媒体操作 ----
    case 'smTab': switchSmTab(el.dataset.tab); break;
    case 'smFilter': filterSmIdeas(el.dataset.cat); break;
    case 'smDataImport': smDataImport(); break;
    case 'smDataShowAdd': smDataShowAdd(); break;
    case 'smDataShowImport': smDataShowImport(); break;
    case 'smDataSaveAdd': smDataSaveAdd(); break;
    case 'smDataDel': smDataDel(el); break;
    case 'smDataExport': smDataExport(); break;
    case 'smDataPlatform': smDataPlatform(el); break;
    case 'smDataSaveNote': smDataSaveNote(); break;
    case 'smAiAnalyze': smAiAnalyze(); break;
    case 'addIdea': addIdea(); break;
    case 'toggleFav': toggleIdeaFav(el.dataset.id); break;
    case 'copyIdea': copyIdea(el.dataset.id); break;
    case 'useIdea': markIdeaUsed(el.dataset.id); break;
    case 'saveQuickIdea': saveQuickIdea(); break;
    case 'addViralsTask': addViralsTask(el.dataset.title); break;
    case 'matFav': toggleMatFav(el.dataset.id); break;
    case 'viralsFav': toggleViralsFav(el.dataset.id); break;
    case 'matCopy': copyMat(el.dataset.id); break;
    case 'saveMat': saveMaterial(); break;

    // ---- 备忘录操作 ----
    case 'addNote': addNote(); break;
    case 'saveQuickNote': saveQuickNote(); break;
    case 'editNote': editNote(el.dataset.id); break;
    case 'delNote': deleteNote(el.dataset.id); break;
    case 'memoCat': memoState.cat = el.dataset.cat; render(); break;
    case 'memoTag': memoState.q = el.dataset.tag; render(); break;
    case 'memoFav': { const it = DB.get('notes', []).find(n => n.id == el.dataset.id); if (it) { it.fav = !it.fav; DB.set('notes', DB.get('notes', [])); render(); } break; }
    case 'saveNoteForm': saveNoteForm(el); break;
    case 'closeGeneric': closeGeneric(); break;

    // ---- 设置操作 ----
    case 'saveAiConfig': saveAiConfig(); break;
    case 'testAiConn': testAiConnection(); break;
    case 'exportData': exportData(); break;
    case 'exportMarkdown': exportMarkdown(); break;
    case 'importDataTrigger': gid('importFileInput').click(); break;
    case 'clearAllData': confirmClearAll(); break;
    case 'themeSelect': themeSelect(el); break;
    case 'themeCustomApply': themeCustomApply(); break;
    case 'themeBlocksApply': themeBlocksApply(); break;
    case 'themeBlocksReset': themeBlocksReset(); break;
    case 'avatarUpload': avatarUpload(); break;
    case 'avatarReset': avatarReset(); break;

    // ---- AI 多模型配置 ----
    case 'aiProvAdd': aiProvAdd(); break;
    case 'aiProvEdit': aiProvEdit(el); break;
    case 'aiProvSave': aiProvSave(); break;
    case 'aiProvDel': aiProvDel(el); break;
    case 'aiProvDefault': aiProvDefault(el); break;

    // ---- V3 外部数据 ----
    case 'saveV3Config': saveV3Config(); break;
    case 'testV3Conn': testV3Conn(); break;
    case 'saveAccounts': {
      const acc = DB.get('v2_accounts', {}) || {};
      ['douyin','xhs','wechat','xianyu'].forEach(k => { const el = gid('acc_' + k); if (el) acc[k] = el.value.trim(); });
      DB.set('v2_accounts', acc);
      toast('✅ 账号信息已保存（本地）');
      break;
    }

    // ---- 通用 ----
    case 'goHome': navigate('home'); break;
  }

  // 文件导入监听
  if (act === 'importDataTrigger') {
    gid('importFileInput').onchange = function(ev) {
      const f = ev.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function() {
        if (DB.importAll(reader.result)) { toast('✅ 数据导入成功'); render(); }
        else { toast('❌ 导入失败，文件格式有误'); }
      };
      reader.readAsText(f);
    };
  }
}

// ---- Hello Kitty 撒花庆祝 ----
function kittyCelebrate() {
  if (document.getElementById('kittyBurst')) return;
  const layer = document.createElement('div');
  layer.id = 'kittyBurst';
  layer.className = 'kitty-burst';
  const faces = ['img/hk_face.png', 'img/hk_full.png', 'img/hk_pose_sit.png', 'img/hk_pose_wave.png', 'img/hk_pose_peek.png', 'img/hk_pose_hero.png'];
  let inner = '';
  for (let i = 0; i < 16; i++) {
    const left = Math.random() * 96;
    const dur = 1.6 + Math.random() * 1.6;
    const delay = Math.random() * 0.5;
    inner += `<img class="kb" src="${faces[i % faces.length]}" style="left:${left}%;animation-duration:${dur}s;animation-delay:${delay}s">`;
  }
  inner += `<img class="kb-center" src="img/hk_hero.png" alt="">`;
  layer.innerHTML = inner;
  document.body.appendChild(layer);
  setTimeout(() => { layer.remove(); }, 2400);
}

// ---- 首页操作实现 ----
function doCheckin() {
  const checkins = DB.get('checkins',[]);
  const today = todayStr();
  if (checkins.includes(today)) return;
  checkins.push(today);
  DB.set('checkins', checkins);
  toast('签到成功！连续签到 ' + calcConsecutive(checkins) + ' 天');
  kittyCelebrate();
  render();
}

// V3：实时天气（Open-Meteo），点击城市按钮可切换城市
async function refreshWeatherV3() {
  let city = prompt('输入城市（如 北京 / 上海 / 广州 / 杭州）：', DB.get('v3_city','北京') || '北京');
  if (city === null) return;
  city = (city || '').trim();
  if (!city) return;
  DB.set('v3_city', city);
  if (window.V3) { await window.V3.loadWeather(); }
  else { toast('实时天气模块未加载'); }
}

// V3：保存外部数据配置（城市 / 汇率 / 代理）
function saveV3Config() {
  const city = gid('v3City').value.trim(); if (city) DB.set('v3_city', city);
  const rate = parseFloat(gid('v3Rate').value);
  if (!isNaN(rate) && rate > 0) DB.set('v3_usdcny', String(rate));
  const proxy = gid('v3Proxy').value.trim(); DB.set('v3_proxy', proxy);
  toast('V3 配置已保存 ✓');
  if (window.V3) window.V3.loadWeather();
}

// V3：测试各实时数据源连通性
async function testV3Conn() {
  if (!window.V3) { toast('V3 模块未加载'); return; }
  toast('正在测试连接…');
  const r = [];
  try { await window.V3.fetchWeather(DB.get('v3_city', '北京')); r.push('天气 正常'); } catch (e) { r.push('天气 异常'); }
  try { await window.V3.fetchGold(); r.push('黄金 正常'); } catch (e) { r.push('黄金 异常'); }
  try { await window.V3.fetchMarket(); r.push('A股 正常'); } catch (e) { r.push('A股 异常'); }
  try { await window.V3.fetchGDELT('中国'); r.push('新闻 正常'); } catch (e) { try { await window.V3.fetchHN(); r.push('新闻 正常'); } catch (e2) { r.push('新闻 异常'); } }
  setTimeout(() => toast('连接测试：' + r.join('  '), 5000), 300);
}

function refreshReport() {
  const area = gid('reportArea');
  if (area) area.innerHTML = generateReport(todayStr());
  toast('汇报已刷新');
}

function addCountdown() {
  const title = prompt('倒计时事项名称：');
  if (!title) return;
  const date = prompt('日期（YYYY-MM-DD）：');
  if (!date) return;
  const cds = DB.get('countdowns',[]);
  cds.push({ id:genId(), title, date, repeat:true, desc:'' });
  DB.set('countdowns', cds);
  toast('✅ 倒计时已添加');
  render();
}

function editWeather() {
  const weather = DB.get('weather',{});
  const city = prompt('城市名称：', weather.city || '上海');
  if (city !== null) {
    weather.city = city;
    DB.set('weather', weather);
    toast('城市已更新');
    render();
  }
}

// ---- 打卡中心操作实现 ----
function toggleTask(id) {
  const tasks = DB.get('tasks',[]);
  const task = tasks.find(t => t.id == id);
  if (task) {
    task.done = !task.done;
    const justDone = task.done;
    DB.set('tasks', tasks);
    if (justDone) kittyCelebrate();
    render();
  }
}

function addTask(cat) {
  const input = document.querySelector(`input[data-cat="${cat}"]`);
  if (!input || !input.value.trim()) {
    toast('请先输入任务内容');
    return;
  }
  const tasks = DB.get('tasks',[]);
  const cls = classifyTask(input.value.trim());
  tasks.push({
    id:genId(),
    text:input.value.trim(),
    cat:cat,
    mod: cls.mod || 'manual',
    done:false,
    date:todayStr()
  });
  DB.set('tasks', tasks);
  input.value = '';
  toast('✅ 任务已添加');
  render();
}

function uploadTaskPhoto(input, id) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { toast('照片过大（>10MB），请压缩后上传'); return; }
  compressPhoto(file, 1280, function(base64) {
    const tasks = DB.get('tasks', []);
    const t = tasks.find(x => x.id == id);
    if (t) { t.photo = base64; DB.set('tasks', tasks); render(); toast('打卡照片已上传 ✓'); }
  });
}

function removeTaskPhoto(id) {
  const tasks = DB.get('tasks', []);
  const t = tasks.find(x => x.id == id);
  if (t) { delete t.photo; DB.set('tasks', tasks); render(); }
}

function showPhotoPreview(src) {
  showGeneric('打卡照片', `<div style="text-align:center"><img src="${esc(src)}" style="max-width:100%;border-radius:8px"></div>`);
}

// ---- 雅思操作实现 ----
function refreshDailyWords() {
  const today = todayStr();
  const dayKey = `day_${today}`;
  const shuffled = [...IELTS_WORDS].sort(() => Math.random()-0.5);
  DB.set(dayKey, shuffled.slice(0,30).map((w,i) => ({ ...w, uid:`${today}_${i}` })));
  toast('📝 已刷新今日单词');
  render();
}

function masterWord(w) {
  const mastered = DB.get('words_mastered',{});
  if (mastered[w]) { delete mastered[w]; toast('已取消掌握'); }
  else { mastered[w] = todayStr(); toast('✓ 已标记掌握'); }
  DB.set('words_mastered', mastered);
  render();
}

// 雅思单词自测：抽认卡主动回忆
function startTest() {
  const today = todayStr();
  const dayKey = `day_${today}`;
  let todayWords = DB.get(dayKey);
  if (!todayWords) {
    const shuffled = [...IELTS_WORDS].sort(() => Math.random()-0.5);
    todayWords = shuffled.slice(0,30).map((w,i) => ({ ...w, uid: `${today}_${i}` }));
    DB.set(dayKey, todayWords);
  }
  const queue = todayWords.map(w => w.w);
  for (let i = queue.length-1; i>0; i--){ const j=Math.floor(Math.random()*(i+1)); [queue[i],queue[j]]=[queue[j],queue[i]]; }
  DB.set('ielts_test', { queue, idx:0, known:[], unknown:[], revealed:false });
  DB.set('ielts_test_mode','on');
  render();
}
function testReveal() {
  const s = DB.get('ielts_test'); if(!s) return;
  s.revealed = true; DB.set('ielts_test', s); render();
}
function testResult(kind) {
  const s = DB.get('ielts_test'); if(!s) return;
  const w = s.queue[s.idx];
  if (kind==='known') s.known.push(w);
  else {
    s.unknown.push(w);
    const mastered = DB.get('words_mastered',{});
    if (mastered[w]) { delete mastered[w]; DB.set('words_mastered', mastered); }
  }
  s.idx++; s.revealed=false;
  DB.set('ielts_test', s); render();
}
function exitTest() {
  DB.set('ielts_test_mode','off'); DB.set('ielts_test', null); render();
}

function playGame(game) {
  let title='', content='';
  switch(game) {
    case 'match':
      title='羊了个羊 - 单词配对消除';
      content=`<div style="padding:16px">
        <p style="margin-bottom:12px;text-align:center">左列英文、右列中文，点选一对匹配即消除，全部消除即通关！</p>
        <div id="matchGameArea"></div>
        <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" onclick="startMatchGame()">开始游戏</button></div>
      </div>`;
      break;
    case 'memory':
      title='记忆翻牌 - 找配对单词';
      content=`<div style="padding:16px">
        <p style="margin-bottom:12px;text-align:center">翻开两张卡片，找到<strong>相同的单词</strong>配对消除，步数越少越好！</p>
        <div id="memoryGameArea"></div>
        <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" onclick="startMemoryGame()">开始游戏</button></div>
      </div>`;
      break;
    case 'snake':
      title='贪吃蛇拼词';
      content=`<div style="padding:16px">
        <p style="margin-bottom:12px;text-align:center">方向键或滑动控制小蛇，吃字母得分，撞墙或撞自己结束。</p>
        <div id="snakeGameArea"></div>
        <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" onclick="startSnakeGame()">开始游戏</button></div>
      </div>`;
      break;
    case 'flashcard':
      title='单词翻卡 - 真经词汇复习';
      content=`<div style="padding:16px">
        <p style="margin-bottom:12px;text-align:center">点卡片翻面看释义与搭配，再选「已记住 / 还没记住」自查。一轮 15 词，自动乱序。</p>
        <div id="flashcardGameArea"></div>
        <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" onclick="startFlashcardGame()">开始复习</button></div>
      </div>`;
      break;
  }
  showGeneric(title, content);
}

function startMatchGame() {
  const area = gid('matchGameArea'); if (!area) return;
  const pool = [...IELTS_WORDS].sort(() => Math.random() - 0.5).slice(0, 6);
  const en = pool.map(p => ({ pair: p.w, label: p.w }));
  const zh = pool.map(p => ({ pair: p.w, label: p.m })).sort(() => Math.random() - 0.5);
  let sel = null, found = 0;
  area.innerHTML = `<div style="text-align:center;margin-bottom:8px">已消除 <b id="mtFound">0</b>/6</div>
    <div style="display:flex;gap:10px;max-width:420px;margin:0 auto">
      <div style="flex:1;display:flex;flex-direction:column;gap:8px">${en.map(e => `<button class="match-card" data-pair="${esc(e.pair)}" onclick="mtPick(this,'en')" style="padding:9px 6px;border:1px solid var(--border-light);border-radius:8px;background:var(--card-bg);font-size:13px;cursor:pointer">${esc(e.label)}</button>`).join('')}</div>
      <div style="flex:1;display:flex;flex-direction:column;gap:8px">${zh.map(z => `<button class="match-card" data-pair="${esc(z.pair)}" onclick="mtPick(this,'zh')" style="padding:9px 6px;border:1px solid var(--border-light);border-radius:8px;background:var(--card-bg);font-size:13px;cursor:pointer">${esc(z.label)}</button>`).join('')}</div>
    </div>`;
  window.mtPick = function (btn, side) {
    if (btn.classList.contains('done')) return;
    if (!sel) { sel = { btn, side }; btn.classList.add('sel'); btn.style.borderColor = 'var(--red)'; return; }
    if (sel.side === side) { sel.btn.classList.remove('sel'); sel.btn.style.borderColor = ''; sel = { btn, side }; btn.classList.add('sel'); btn.style.borderColor = 'var(--red)'; return; }
    if (sel.btn.dataset.pair === btn.dataset.pair) {
      sel.btn.classList.add('done'); btn.classList.add('done');
      sel.btn.style.opacity = '0.35'; btn.style.opacity = '0.35';
      sel = null; found++; const f = gid('mtFound'); if (f) f.textContent = found;
      if (found === 6) {
        const sc = DB.get('word_game_scores', { match: 0, memory: 0, snake: 0 }); sc.match = Math.max(sc.match, 1); DB.set('word_game_scores', sc);
        area.insertAdjacentHTML('beforeend', '<p style="color:var(--green);text-align:center;margin-top:10px">🎉 全部消除，通关！</p>');
      }
    } else {
      sel.btn.classList.add('wrong'); btn.classList.add('wrong');
      sel.btn.style.background = '#ffe5e5'; btn.style.background = '#ffe5e5';
      const a = sel.btn, b = btn; sel = null;
      setTimeout(() => { a.classList.remove('wrong'); b.classList.remove('wrong'); a.style.background = ''; b.style.background = ''; }, 600);
    }
  };
}

function startMemoryGame() {
  const area = gid('memoryGameArea'); if (!area) return;
  const pool = [...IELTS_WORDS].sort(() => Math.random() - 0.5).slice(0, 6);
  let cards = [];
  pool.forEach((p, i) => { cards.push({ k: i, t: p.w, pair: i }); cards.push({ k: i + 100, t: p.m, pair: i }); });
  cards.sort(() => Math.random() - 0.5);
  let flipped = [], matched = 0, lock = false, moves = 0;
  area.innerHTML = `<div style="text-align:center;margin-bottom:8px">已配对 <b id="mgMatched">0</b>/6 · 步数 <b id="mgMoves">0</b></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:360px;margin:0 auto">${cards.map(c => `<button class="mem-card" data-pair="${c.pair}" data-k="${c.k}" onclick="memFlip(this)" style="padding:12px 4px;border:1px solid var(--border-light);border-radius:8px;background:var(--card-bg);font-size:12px;cursor:pointer">？</button>`).join('')}</div>`;
  window.memFlip = function (btn) {
    if (lock) return;
    if (btn.classList.contains('matched') || btn.classList.contains('open')) return;
    btn.classList.add('open'); btn.textContent = cards.find(c => c.k == btn.dataset.k).t;
    flipped.push(btn);
    if (flipped.length === 2) {
      moves++; const mm = gid('mgMoves'); if (mm) mm.textContent = moves;
      lock = true;
      const a = flipped[0], b = flipped[1];
      if (a.dataset.pair === b.dataset.pair) {
        a.classList.add('matched'); b.classList.add('matched');
        a.style.background = '#e8f8ee'; b.style.background = '#e8f8ee';
        a.style.color = 'var(--green)'; b.style.color = 'var(--green)';
        flipped = []; matched++; const m2 = gid('mgMatched'); if (m2) m2.textContent = matched; lock = false;
        if (matched === 6) {
          const sc = DB.get('word_game_scores', { match: 0, memory: 0, snake: 0 }); sc.memory = Math.max(sc.memory, moves); DB.set('word_game_scores', sc);
          area.insertAdjacentHTML('beforeend', '<p style="color:var(--green);text-align:center;margin-top:10px">🎉 通关！用时 ' + moves + ' 步</p>');
        }
      } else {
        const a2 = a, b2 = b; setTimeout(() => { a2.classList.remove('open'); b2.classList.remove('open'); a2.textContent = '？'; b2.textContent = '？'; flipped = []; lock = false; }, 800);
      }
    }
  };
}

function startSnakeGame() {
  const area = gid('snakeGameArea'); if (!area) return;
  area.innerHTML = `<div style="text-align:center;margin-bottom:6px">得分 <b id="snScore">0</b> · 长度 <b id="snLen">3</b></div>
    <canvas id="snCanvas" width="300" height="300" style="background:#fff;border-radius:10px;width:100%;max-width:300px;display:block;margin:6px auto;touch-action:none"></canvas>
    <p style="font-size:12px;color:var(--text-secondary);text-align:center">方向键 / 滑动控制方向，吃字母得分</p>`;
  const cv = gid('snCanvas'); if (!cv) return; const ctx = cv.getContext('2d');
  const N = 15, cell = cv.width / N;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let snake = [{ x: 7, y: 7 }], dir = { x: 1, y: 0 }, food = rnd(), score = 0, timer = null, dead = false;
  function rnd() { return { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
  function setDir(x, y) { if (dir.x === -x && dir.y === -y) return; dir = { x, y }; }
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    snake.forEach((s, i) => { ctx.fillStyle = i === 0 ? '#E60012' : '#ff8fa3'; ctx.fillRect(s.x * cell, s.y * cell, cell - 1, cell - 1); });
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(food.x * cell, food.y * cell, cell - 1, cell - 1);
    ctx.fillStyle = '#fff'; ctx.font = (cell - 2) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(letters[score % 26], food.x * cell + cell / 2, food.y * cell + cell / 2);
  }
  function step() {
    if (!gid('snCanvas')) { if (timer) clearInterval(timer); return; }
    if (dead) return;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some(s => s.x === head.x && s.y === head.y)) {
      dead = true; if (timer) clearInterval(timer);
      area.insertAdjacentHTML('beforeend', '<p style="color:var(--red);text-align:center;margin-top:8px">游戏结束，得分 ' + score + '</p>');
      const sc = DB.get('word_game_scores', { match: 0, memory: 0, snake: 0 }); sc.snake = Math.max(sc.snake, score); DB.set('word_game_scores', sc);
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score++; food = rnd(); const s = gid('snScore'); if (s) s.textContent = score; const l = gid('snLen'); if (l) l.textContent = snake.length; }
    else { snake.pop(); }
    draw();
  }
  document.onkeydown = function (e) {
    if (e.key === 'ArrowUp') setDir(0, -1); else if (e.key === 'ArrowDown') setDir(0, 1); else if (e.key === 'ArrowLeft') setDir(-1, 0); else if (e.key === 'ArrowRight') setDir(1, 0);
  };
  let ts = null;
  cv.addEventListener('touchstart', e => { const t = e.touches[0]; ts = { x: t.clientX, y: t.clientY }; }, { passive: true });
  cv.addEventListener('touchmove', e => {
    if (!ts) return; const t = e.touches[0]; const dx = t.clientX - ts.x, dy = t.clientY - ts.y;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0); else setDir(0, dy > 0 ? 1 : -1);
    ts = { x: t.clientX, y: t.clientY }; e.preventDefault();
  }, { passive: false });
  if (window._snakeTimer) clearInterval(window._snakeTimer);
  snake = [{ x: 7, y: 7 }]; dir = { x: 1, y: 0 }; food = rnd(); score = 0; dead = false;
  const s0 = gid('snScore'); if (s0) s0.textContent = 0; const l0 = gid('snLen'); if (l0) l0.textContent = 3;
  draw(); window._snakeTimer = setInterval(step, 180);
}

// --- 单词翻卡复习游戏（复习乐园）---
function startFlashcardGame() {
  const area = gid('flashcardGameArea'); if (!area) return;
  const deck = [...IELTS_WORDS].sort(() => Math.random() - 0.5).slice(0, 15);
  let idx = 0, known = 0, unknown = 0;
  window.fcFlip = function () { const c = gid('fcCard'); if (c) c.classList.toggle('flipped'); };
  window.fcSpeak = function (word) {
    if (typeof speakWord === 'function') { speakWord(word); return; }
    if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(word); speechSynthesis.cancel(); speechSynthesis.speak(u); }
  };
  window.fcAnswer = function (isKnown) {
    if (isKnown) known++; else unknown++;
    idx++; renderFc();
  };
  function renderFc() {
    if (idx >= deck.length) {
      const def = DB.get('word_game_scores', { match: 0, memory: 0, snake: 0, flashcard: 0 });
      const best = Math.max(def.flashcard || 0, known);
      def.flashcard = best; DB.set('word_game_scores', def);
      area.innerHTML = `<div class="fc-end">
        <div class="fc-end-title">🎉 本轮完成</div>
        <div class="fc-stat">已记住 <b>${known}</b> · 还没记住 <b>${unknown}</b> · 共 ${deck.length} 词</div>
        <div class="fc-stat">最佳认识数: <b>${best}</b></div>
        <button class="btn btn-primary" onclick="startFlashcardGame()">再练一轮</button>
      </div>`;
      return;
    }
    const w = deck[idx];
    area.innerHTML = `<div class="fc-progress">进度 ${idx + 1} / ${deck.length}</div>
      <div class="flip-card" id="fcCard" onclick="fcFlip()">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <div class="fc-word">${esc(w.w)}</div>
            <div class="fc-ph">${esc(w.ph)}</div>
            <button class="fc-spk" onclick="event.stopPropagation();fcSpeak('${esc(w.w)}')">🔊 听发音</button>
            <div class="fc-hint">点击卡片翻面看释义</div>
          </div>
          <div class="flip-card-back">
            <div class="fc-pos">${esc(w.pos)}</div>
            <div class="fc-mean">${esc(w.m)}</div>
            <div class="fc-col">💡 ${esc(w.col)}</div>
          </div>
        </div>
      </div>
      <div class="fc-actions">
        <button class="btn btn-outline" onclick="fcAnswer(false)">还没记住</button>
        <button class="btn btn-primary" onclick="fcAnswer(true)">已记住</button>
      </div>`;
  }
  renderFc();
}

function activateSwitchTabs(page, tab) {
  if (!page) return;
  page.querySelectorAll('.switch-tab').forEach(t => {
    if (t.dataset.tab === tab) t.classList.add('active'); else t.classList.remove('active');
  });
}

function switchListenTab(tab) {
  const cont = gid('listenContent');
  if (!cont) return;
  const parent = cont.closest('.page') || gid('app');
  activateSwitchTabs(parent, tab);
  switch(tab) {
    case 'homework': cont.innerHTML = renderListeningHomework(); break;
    case 'intensive':
      cont.innerHTML = renderListeningIntensive();
      break;
    case 'mistakes': cont.innerHTML = renderListeningMistakes(); break;
  }
}

function switchSpeakTab(tab) {
  const cont = gid('speakContent');
  if (!cont) return;
  activateSwitchTabs(cont.closest('.page'), tab);
  switch(tab) {
    case 'shadow': cont.innerHTML = renderSpeakingShadow(); break;
    case 'follow': cont.innerHTML = renderFollowPractice(); break;
    case 'topics': cont.innerHTML = renderTopicsLibrary(); break;
  }
}

function renderFollowPractice() {
  const done = DB.get('follow_scenes_done', {});
  return `
    <div class="card">
      <div class="card-title">🗣️ 场景跟读模式</div>
      <div class="card-subtitle">雅思口语考的是对话。进入一个完整场景，跟读理解后试着自己应答。</div>
    </div>
    ${SPEAKING_SCENES.map((s, idx) => `
      <div class="card">
        <div class="card-title-row"><span class="card-title">${esc(s.title)}</span>${done[idx] ? '<span class="tag tag-green">已掌握 ✓</span>' : ''}</div>
        <div class="card-subtitle">${esc(s.setting)}</div>
        ${s.lines.map(l => `
          <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px dashed var(--border-light)">
            <span class="topic-type" style="flex:0 0 auto">${esc(l.role)}</span>
            <span style="flex:1;font-size:13.5px;line-height:1.6">${esc(l.text)}</span>
            <button class="btn btn-xs btn-outline" onclick="speakWord('${esc(l.text.replace(/'/g,"\\'"))}')">🔊</button>
          </div>`).join('')}
        <div style="margin-top:10px;font-size:13px;background:var(--page-bg);padding:10px;border-radius:8px;line-height:1.7"><b>🎯 你的任务：</b>${esc(s.prompt)}</div>
        <button class="btn btn-primary btn-sm" style="margin-top:10px" data-act="markSceneDone" data-idx="${idx}">${done[idx] ? '取消标记' : '我已理解并能应答 ✓'}</button>
      </div>`).join('')}
  `;
}

function markSceneDone(idx) {
  const done = DB.get('follow_scenes_done', {});
  if (done[idx]) delete done[idx]; else done[idx] = todayStr();
  DB.set('follow_scenes_done', done);
  const c = gid('speakContent');
  if (c) c.innerHTML = renderFollowPractice();
}

function renderTopicsLibrary() {
  const data = BILI_VIDEOS;
  const pool = (data && data.topic) ? data.topic : [];
  const topicDoy = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const firstVid = pool.length ? pool[topicDoy % pool.length] : null;
  const embed = firstVid ? videoHTML('https://www.bilibili.com/video/' + firstVid.bvid) : '';
  const summary = DB.get('topic_summary', []);
  return `
    ${firstVid ? `<div class="card">
      <div class="card-title-row"><span class="card-title">📺 首推话题场景视频</span><span class="tag tag-red">仅推荐第一个话题</span></div>
      <div class="card-subtitle">${esc(firstVid.title)} · ${esc(firstVid.desc)}</div>
      ${embed}
    </div>` : ''}
    ${SPEAKING_TOPICS.map(t => `
      <div class="topic-card">
        <span class="topic-type">${t.type}</span>
        <div class="topic-title">${esc(t.title)}</div>
        <div class="topic-desc"><b>参考思路：</b>${t.points.map(p=>'·'+p).join('<br>')}</div>
        <div style="margin-top:6px;font-size:12.5px"><b>🔤 常用单词：</b><span style="color:var(--hk-blue)">${esc((t.words||[]).join('，'))}</span></div>
        <div style="margin-top:4px;font-size:12.5px"><b>🧩 常用词组：</b><span style="color:var(--hk-blue)">${esc((t.phrases||[]).join(' / '))}</span></div>
        <div style="margin-top:4px;font-size:12.5px"><b>💬 实用句子：</b><div style="margin-top:3px;line-height:1.8">${(t.sentences||[]).map(s=>`<div>· ${esc(s)}</div>`).join('')}</div></div>
        <div style="margin-top:6px;font-size:12px;color:var(--text-secondary)"><b>💡 ${esc(t.highScore)}</b></div>
      </div>`).join('')}
    <div class="card">
      <div class="card-title">📝 我的归纳（学到的新句子）</div>
      <div class="card-subtitle">把练习中积累的高分句子总结到这里，考前集中复习。</div>
      <textarea id="ts_text" class="v2-input" placeholder="写下你归纳的新句子…" style="width:100%;min-height:60px;margin:8px 0"></textarea>
      <button class="btn btn-primary btn-sm" data-act="addTopicSummary">保存归纳</button>
      ${summary.length ? `<div style="margin-top:10px">${summary.map(s => `
        <div class="v2-vocab-row">
          <div class="v2-vocab-body"><div class="v2-vocab-word" style="font-size:13px">${esc(s.text)}</div><div class="v2-vocab-mean">${s.date}</div></div>
          <button class="btn btn-outline btn-xs" data-act="delTopicSummary" data-id="${esc(s.id)}">删除</button>
        </div>`).join('')}</div>` : ''}
    </div>
  `;
}

function addTopicSummary() {
  const ta = gid('ts_text');
  if (!ta || !ta.value.trim()) { toast('请先写下你的归纳'); return; }
  const list = DB.get('topic_summary', []);
  list.unshift({ id: genId(), text: ta.value.trim(), date: todayStr() });
  DB.set('topic_summary', list);
  toast('已保存归纳 ✓');
  const c = gid('speakContent');
  if (c) c.innerHTML = renderTopicsLibrary();
}
function delTopicSummary(id) {
  let list = DB.get('topic_summary', []);
  list = list.filter(s => s.id !== id);
  DB.set('topic_summary', list);
  toast('已删除');
  const c = gid('speakContent');
  if (c) c.innerHTML = renderTopicsLibrary();
}

function switchReadTab(tab) {
  const cont = gid('readContent');
  if (!cont) return;
  activateSwitchTabs(cont.closest('.page'), tab);
  switch(tab) {
    case 'practice': cont.innerHTML = renderReadingPractice(); break;
    case 'vocab':
      cont.innerHTML = renderReadingVocab();
      break;
    case 'mistakes': cont.innerHTML = renderReadingMistakes(); break;
  }
}

function switchWriteTab(tab) {
  const cont = gid('writeContent');
  if (!cont) return;
  activateSwitchTabs(cont.closest('.page'), tab);
  switch(tab) {
    case 'homework': cont.innerHTML = renderWritingHomework(); break;
    case 'method': cont.innerHTML = renderWritingMethod(); break;
    case 'essays': cont.innerHTML = renderWritingEssays(); break;
    case 'practice': cont.innerHTML = renderWritingPractice(); break;
  }
}

function renderWritingPractice() {
  return `<div class="card">
    <div class="switch-tabs" style="max-width:280px">
      <div class="switch-tab active">Task 2</div>
      <div class="switch-tab">Task 1</div>
    </div>
    <div style="margin:12px 0">
      <button class="btn btn-outline btn-sm" data-act="randomTopic">🎲 随机题目</button>
    </div>
    <div class="practice-area">
      <div style="font-size:14px;font-weight:600;margin-bottom:8px">题目：</div>
      <div style="padding:10px;background:var(--page-bg);border-radius:8px;margin-bottom:10px;font-size:13.5px;line-height:1.7">
        Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer.<br><br>What, in your opinion, should be the main function of a university?
      </div>
      <textarea id="essayInput" placeholder="在这里写你的作文..." style="width:100%;min-height:200px" oninput="document.getElementById('wc').textContent=this.value.length+' 字'"></textarea>
      <div class="word-count" id="wc">0 字</div>
      <button class="btn btn-primary btn-sm">📖 查看范文</button>
    </div>
  </div>`;
}

function videoHTML(url) {
  if (!url) return '';
  url = ('' + url).trim();
  if (url.includes('douyin.com') || url.includes('iesdouyin.com')) {
    return `<div class="video-fallback"><span style="font-size:34px">🎵</span><span>抖音视频建议在 App 内打开</span><a href="${url}" target="_blank" rel="noreferrer" style="color:var(--red);font-weight:600">在抖音打开 →</a></div>`;
  }
  if (url.includes('bilibili.com') || url.includes('b23.tv')) {
    const m = url.match(/BV[\w]+/);
    if (m) {
      const embed = `https://player.bilibili.com/player.html?bvid=${m[0]}&high_quality=1&autoplay=0&danmaku=0`;
      return `<div class="video-embed"><iframe src="${embed}" allowfullscreen="true" loading="lazy" referrerpolicy="no-referrer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"></iframe></div>`;
    }
    return `<div class="video-fallback"><span style="font-size:34px">📺</span><span>B站链接需包含 BV 号</span><a href="${url}" target="_blank" rel="noreferrer" style="color:var(--red);font-weight:600">跳转 B站 →</a></div>`;
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const y = url.match(/[?&]v=([\w-]+)/) || url.match(/youtu\.be\/([\w-]+)/);
    if (y) return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${y[1]}" allowfullscreen loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups"></iframe></div>`;
  }
  return `<div class="video-fallback"><span style="font-size:34px">🎬</span><span>该链接不支持内嵌</span><a href="${url}" target="_blank" rel="noreferrer" style="color:var(--red);font-weight:600">点击跳转观看 →</a></div>`;
}

function loadShadowVideo() {
  const url = gid('shadowVideoUrl').value.trim();
  if (!url) { toast('请先输入视频链接'); return; }
  const container = gid('shadowVideoContainer');
  container.innerHTML = videoHTML(url) || '<div class="video-fallback"><span>链接无效</span></div>';
  toast('视频已加载');
}

function viewEssay(title) {
  const e = WRITING_ESSAYS.find(x => x.title === title) || {};
  showGeneric('📖 ' + (e.title || title), `<div style="line-height:1.8;font-size:13.5px">
    <div style="margin-bottom:8px"><span class="tag tag-red">${esc(e.type || '')}</span> <span style="color:var(--text-secondary)">${esc(e.topic || '')} · 来源：${esc(e.source || '')}</span></div>
    <div style="background:var(--page-bg);border-radius:8px;padding:10px;margin-bottom:10px;font-size:13px"><b>结构：</b>${esc(e.structure || '')}<br><b>📌 高分句式：</b><span style="color:var(--hk-blue)">${esc(e.phrases || '')}</span></div>
    <div style="font-weight:600;margin:10px 0 6px">范文正文</div>
    <p style="color:var(--text-primary)">${esc(e.body || '（暂无正文）')}</p>
  </div>`);
}

// ---- 自媒体操作实现 ----
function switchSmTab(tab) {
  const cont = gid('smContent');
  if (!cont) return;
  // 更新 tab 状态
  const page = cont.closest('.page');
  if (page) page.querySelectorAll('.tab-btn').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  switch(tab) {
    case 'ideas': cont.innerHTML = renderSmIdeas(); break;
    case 'virals': cont.innerHTML = renderSmVirals(); break;
    case 'materials': cont.innerHTML = renderSmMaterials(); break;
    case 'data': cont.innerHTML = renderSmData(); break;
    case 'tools': cont.innerHTML = renderSmTools(); break;
    case 'fav': cont.innerHTML = renderSmFav(); break;
  }
  bindEvents();
}

function filterSmIdeas(c) {
  const cont = gid('smContent');
  if (!cont) return;
  cont.querySelectorAll('.idea-tag[data-cat]').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === c);
  });
  cont.innerHTML = renderSmIdeas(c);
}

function addIdea() {
  const title = prompt('选题标题：');
  if (!title) return;
  const ideas = DB.get('ideas',[]);
  ideas.push({ id:genId(), title, thought:'', category:'灵感碎片', tags:[], status:'灵感', fav:false, createdAt:todayStr() });
  DB.set('ideas', ideas);
  toast('✅ 灵感已添加');
  render();
}

function toggleIdeaFav(id) {
  const ideas = DB.get('ideas',[]);
  const item = ideas.find(i => i.id == id);
  if (item) { item.fav = !item.fav; DB.set('ideas', ideas); render(); }
}

function copyIdea(id) {
  const ideas = DB.get('ideas',[]);
  const item = ideas.find(i => i.id == id);
  if (item) { navigator.clipboard?.writeText(item.title); toast('📋 已复制到剪贴板'); }
}

function markIdeaUsed(id) {
  const ideas = DB.get('ideas',[]);
  const item = ideas.find(i => i.id == id);
  if (item) { item.status = '已使用'; DB.set('ideas', ideas); toast('✅ 已标记为已使用'); render(); }
}

function saveQuickIdea() {
  const val = gid('quickIdea')?.value?.trim();
  if (!val) return;
  const mats = DB.get('materials',[]);
  mats.push({ id:genId(), type:'文案金句', content:val, tags:['速记'], fav:false });
  DB.set('materials', mats);
  gid('quickIdea').value = '';
  toast('💾 已保存到素材库');
  render();
}

function addViralsTask(title) {
  const tasks = DB.get('tasks',[]);
  tasks.push({
    id:genId(),
    text:`二创：${title}`,
    cat:'自媒体任务',
    mod:'selfmedia',
    done:false,
    date:todayStr()
  });
  DB.set('tasks', tasks);
  toast('✅ 已添加到打卡中心');
}

function toggleMatFav(id) {
  const mats = DB.get('materials',[]);
  const item = mats.find(m => m.id == id);
  if (item) { item.fav = !item.fav; DB.set('materials', mats); render(); }
}

function toggleViralsFav(id) {
  const virals = DB.get('virals',[]);
  const item = virals.find(v => v.id == id);
  if (item) { item.fav = !item.fav; DB.set('virals', virals); render(); }
}

function copyMat(id) {
  const mats = DB.get('materials',[]);
  const item = mats.find(m => m.id == id);
  if (item) { navigator.clipboard?.writeText(item.content); toast('📋 已复制'); }
}

function saveMaterial() {
  const type = gid('matType')?.value || '文案金句';
  const content = gid('matContent')?.value?.trim();
  const tagsStr = gid('matTags')?.value?.trim() || '';
  if (!content) { toast('请输入素材内容'); return; }
  const mats = DB.get('materials',[]);
  mats.push({ id:genId(), type, content, tags:tagsStr.split(/[,，]/).filter(Boolean), fav:false });
  DB.set('materials', mats);
  gid('matContent').value = ''; gid('matTags').value = '';
  toast('✅ 素材已保存');
  render();
}

// ---- 备忘录操作实现 ----
function addNote() { showGeneric('✏️ 新建笔记', noteFormHTML()); }
function saveQuickNote() {
  const val = gid('quickNote')?.value?.trim();
  if (!val) return;
  const cat = gid('qn_cat')?.value || '灵感碎片';
  const tags = (gid('qn_tags')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
  const notes = DB.get('notes', []);
  notes.push({ id: genId(), content: val, cat, tags, date: new Date().toLocaleString(), fav: false });
  DB.set('notes', notes);
  gid('quickNote').value = ''; if (gid('qn_tags')) gid('qn_tags').value = '';
  toast('📒 笔记已保存'); render();
}
function editNote(id) {
  const item = DB.get('notes', []).find(n => n.id == id); if (!item) return;
  showGeneric('✏️ 编辑笔记', noteFormHTML(item));
}
function saveNoteForm(el) {
  const id = el.dataset.id;
  const content = gid('nf_content')?.value?.trim();
  if (!content) { toast('笔记内容不能为空'); return; }
  const cat = gid('nf_cat')?.value || '工作学习';
  const tags = (gid('nf_tags')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
  const notes = DB.get('notes', []);
  if (id) { const it = notes.find(n => n.id == id); if (it) { it.content = content; it.cat = cat; it.tags = tags; } }
  else { notes.push({ id: genId(), content, cat, tags, date: new Date().toLocaleString(), fav: false }); }
  DB.set('notes', notes); closeGeneric(); toast('✅ 已保存'); render();
}
function deleteNote(id) {
  if (!confirm('确定删除这条笔记？')) return;
  let notes = DB.get('notes',[]);
  notes = notes.filter(n => n.id != id);
  DB.set('notes', notes);
  toast('🗑️ 已删除');
  render();
}

// ---- 设置操作实现 ----
// ===== AI 多模型配置（密钥仅存本地 localStorage，不写代码/不上传） =====
window.AI = {
  providers() { return DB.get('v2_ai_providers', []) || []; },
  def() {
    const ps = this.providers();
    const d = DB.get('v2_ai_default', '');
    return ps.find(p => p.id === d) || ps[0] || null;
  },
  // OpenAI 兼容调用；base 默认 OpenAI，DeepSeek/GLM 皆兼容该格式
  async call(messages, opts) {
    const p = this.def();
    if (!p || !p.key) throw new Error('未配置默认模型或缺少 Key');
    const url = (p.base || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
    const body = { model: p.model || 'gpt-4o-mini', messages, temperature: (opts && opts.temp) || 0.7 };
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + p.key },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      let msg = 'HTTP ' + r.status;
      try { const j = await r.json(); if (j && j.error && j.error.message) msg = j.error.message; } catch (e) {}
      throw new Error(msg);
    }
    const j = await r.json();
    return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
  }
};

let _aiProvEdit = null;
function provForm(p) {
  p = p || {};
  return `<div class="v2-form">
    <div class="form-group"><label>名称</label><input id="pf_name" class="v2-input" value="${esc(p.name || '')}" placeholder="如 DeepSeek / 我的Ollama"></div>
    <div class="form-group"><label>Base URL</label><input id="pf_base" class="v2-input" value="${esc(p.base || '')}" placeholder="https://api.deepseek.com/v1"></div>
    <div class="form-group"><label>API Key</label><input id="pf_key" type="password" class="v2-input" value="${esc(p.key || '')}" placeholder="sk-..."></div>
    <div class="form-group"><label>模型名</label><input id="pf_model" class="v2-input" value="${esc(p.model || '')}" placeholder="deepseek-chat"></div>
    <div class="v2-form-actions"><button class="btn btn-primary" data-act="aiProvSave">保存</button><button class="btn btn-outline" onclick="closeGeneric()">取消</button></div>
  </div>`;
}
function aiProvAdd() { _aiProvEdit = null; window.V2.openForm('添加模型', provForm()); }
function aiProvEdit(el) {
  const p = (DB.get('v2_ai_providers', []) || []).find(x => x.id === el.dataset.id);
  _aiProvEdit = el.dataset.id; window.V2.openForm('编辑模型', provForm(p));
}
function aiProvSave() {
  const name = gid('pf_name').value.trim();
  const base = gid('pf_base').value.trim();
  const key = gid('pf_key').value.trim();
  const model = gid('pf_model').value.trim();
  if (!model) { toast('请填写模型名'); return; }
  let ps = DB.get('v2_ai_providers', []) || [];
  if (_aiProvEdit) {
    const t = ps.find(x => x.id === _aiProvEdit);
    if (t) Object.assign(t, { name, base, key, model });
  } else {
    const id = 'p' + Date.now().toString(36);
    ps.push({ id, name: name || model, base, key, model });
    if (!DB.get('v2_ai_default', '')) DB.set('v2_ai_default', id);
  }
  DB.set('v2_ai_providers', ps);
  _aiProvEdit = null; if (typeof closeGeneric === 'function') closeGeneric();
  toast('已保存'); render();
}
function aiProvDel(el) {
  if (!confirm('删除该模型？')) return;
  const ps = (DB.get('v2_ai_providers', []) || []).filter(x => x.id !== el.dataset.id);
  DB.set('v2_ai_providers', ps);
  if (DB.get('v2_ai_default', '') === el.dataset.id) DB.set('v2_ai_default', ps.length ? ps[0].id : '');
  render();
}
function aiProvDefault(el) { DB.set('v2_ai_default', el.dataset.id); render(); }

async function testAiConnection() {
  const p = window.AI.def();
  if (!p) { toast('请先添加并设置一个默认模型'); return; }
  if (!p.key) { toast('该模型缺少 API Key'); return; }
  toast('测试连接中...');
  try {
    const txt = await window.AI.call([{ role: 'user', content: '只回复 ok 两个字' }], { temp: 0 });
    toast('✅ 连接成功：' + txt.slice(0, 24));
  } catch (e) {
    toast('❌ 连接失败：' + e.message + '（可能 CORS 拦截，见卡片提示加代理）');
  }
}

function exportData() {
  const data = DB.exportAll();
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `易欢工作台备份_${todayStr()}.json`;
  a.click(); URL.revokeObjectURL(url);
  toast('📥 数据已导出');
}

// 导出 Markdown（给 Obsidian 用）：把备忘录 / 灵感 / 读书笔记拼成可读 .md
function exportMarkdown() {
  const lines = ['---', 'title: 易欢工作台导出', 'date: ' + todayStr(), '---', ''];
  const sections = [
    { key: 'notes', title: '📒 备忘录', fields: ['title','content','body','text'] },
    { key: 'ideas', title: '💡 灵感', fields: ['title','content','body','text'] },
    { key: 'book_logs', title: '📚 读书笔记', fields: ['title','book','content','note','body'] },
  ];
  let any = false;
  sections.forEach((s) => {
    const arr = DB.get(s.key, []);
    if (!arr || !arr.length) return;
    any = true;
    lines.push('## ' + s.title, '');
    arr.forEach((it) => {
      const title = (s.fields.map((f) => it[f]).find((v) => v && String(v).trim()) || '（无标题）').toString().slice(0, 80);
      const body = (s.fields.map((f) => it[f]).filter((v, i) => v && i > 0).join('\n\n') || '').toString().trim();
      const date = it.date || it.createdAt || it.time || '';
      lines.push('### ' + title + (date ? '  _(' + date + ')_' : ''), '');
      if (body) lines.push(body, '');
      lines.push('');
    });
  });
  if (!any) { toast('没有可导出的笔记/灵感/读书记录'); return; }
  const md = lines.join('\n');
  const blob = new Blob([md], {type:'text/markdown;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `易欢工作台_笔记_${todayStr()}.md`;
  a.click(); URL.revokeObjectURL(url);
  toast('📝 已导出 Markdown，丢进 Obsidian 即可');
}

function confirmClearAll() {
  if (!confirm('⚠️ 确定要清空所有数据吗？此操作不可逆！\n\n建议先导出备份。')) return;
  if (!confirm('再次确认：真的要清空全部数据吗？')) return;
  DB.clearAll();
  DB.init(); // 重新初始化
  toast('🗑️ 所有数据已清空');
  navigate('home');
}

// ===== 时钟更新 =====
function updateClock() {
  const el = gid('clockTime');
  if (el) {
    const now = new Date();
    el.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  }
}

// ===== 初始化 =====
async function init() {
  DB.init();

  // 同步 Excel 中的雅思每日任务到打卡中心
  await syncIeltsTasks();

  // 预加载考点词库与 B站 推荐视频池（供各模块同步渲染，失败则回退为空）
  try { await loadReading538(); } catch (e) {}
  try { await loadBiliVideos(); } catch (e) {}

  buildSidebar();

  // 先应用主题变量（不触发 render，下方统一 render 一次）
  applyThemeVars(DB.get('v2_theme', 'hk-red'));

  // 注入头像（侧栏 + 顶栏），用户已上传则显示上传图，否则默认
  refreshAvatars();

  // 浮动 Hello Kitty 装饰
  const hkf = gid('hkFloat');
  if (hkf) hkf.innerHTML = HK.love(54);

  // 解析 hash 路由
  const { route, sub } = parseHash();
  if (route) { currentRoute = route; currentSubRoute = sub; }

  render();
  updateNavActive();
  updateTopBar();
  loadHotData();

  // 时钟每分钟更新
  setInterval(updateClock, 60000);
  updateClock();

  // 监听 hash 变化
  window.addEventListener('hashchange', () => {
    const { route, sub } = parseHash();
    currentRoute = route;
    currentSubRoute = sub;
    render();
    updateNavActive();
    updateTopBar();
  });

  // 返回顶部 Kitty 显隐
  const btt = gid('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('hidden', window.scrollY < 260);
    }, { passive: true });
  }

  // 注册 Service Worker（PWA：可安装 + 离线可用，network-first 保证在线永远最新）
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // 顶部 ☁️ 同步按钮
  const sb = gid('syncBtn');
  if (sb && typeof window.openSyncPanel === 'function') sb.onclick = window.openSyncPanel;

  // 自动同步（若用户在同步面板开启）
  if (typeof window.initAutoSync === 'function') window.initAutoSync();

  console.log(`${APP_NAME} v${APP_VERSION} loaded ✨`);
}

// 启动
init();
