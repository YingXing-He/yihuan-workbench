/* ============================================
   易欢工作台 - Hello Kitty 装饰素材库
   真实 Hello Kitty 图片来自用户提供的素材截图，
   经裁剪/清底后作为站点装饰使用。
   ============================================ */
const HK = (function () {

  // 主题主色（由设置版块 applyTheme 写入 window.HK_COLOR）
  function HKC() { return window.HK_COLOR || '#E60012'; }

  // ===== 多姿势素材注册表 =====
  // 不同模块 / 场景使用不同姿势，避免全站都是一个头像
  const POSE_FILES = {
    face:   'img/hk_face.png',      // 经典脸（默认）
    full:   'img/hk_full.png',      // 全身站姿
    wave:   'img/hk_wave.png',      // 挥手全身
    hero:   'img/hk_wave.png',      // 挥手（首页问候）
    sit:    'img/hk_pose_sit.png',  // 坐姿抱心
    peek:   'img/hk_pose_peek.png', // 探头/爬爬
    wave2:  'img/hk_pose_wave.png', // 招手全身
    celebrate: 'img/hk_pose_hero.png', // 50周年抱心+牛奶饼干（庆祝/设置）
    // ===== 新素材（2026-08-08）已做去底+超分+锐化 =====
    classic_sit: 'img/hk_new_classic_sit.png',  // 粉色坐姿经典
    think:       'img/hk_new_think.png',        // 歪头思考
    wave_pink:   'img/hk_new_wave_pink.png',    // 粉色招手
    bear:        'img/hk_new_bear.png',         // 头顶小熊
    wave_red:    'img/hk_new_wave_red.png',     // 红衣招手
    burger:      'img/hk_new_burger.png',       // 汉堡（饮食）
    flower:      'img/hk_new_flower.png',       // 黄裙拿花
    cake:        'img/hk_new_cake.png',         // 端蛋糕
    camera:      'img/hk_new_camera.png',       // 拿相机（自媒体）
    love:        'img/hk_new_love.png',         // 爱心环绕
    bike:        'img/hk_new_bike.png',         // 骑三轮车
    bear_hug:    'img/hk_new_bear_hug.png',     // 抱小熊
    halloween:   'img/hk_new_halloween.png',    // 万圣节（热点/节日）
    dumbbell:    'img/hk_new_dumbbell.png',     // 举哑铃（运动）
    bath:        'img/hk_new_bath.png',         // 洗澡（护肤）
    bows:        'img/hk_new_bows.png',         // 蝴蝶结堆（装饰/设置）
    clover:      'img/hk_new_clover.png',       // 四叶草（幸运/财富）
    gift:        'img/hk_new_gift.png',         // 礼物盒（交易/礼物）
    trumpet:     'img/hk_new_trumpet.png',      // 吹喇叭（播客/听力）
    sit_blue:    'img/hk_new_sit_blue.png',     // 蓝黄坐姿
    // ===== 用户指定素材（2026-08-08 逐一指定图，已去背+超分，替换侧栏与各模块装饰） =====
    homecover:   'img/hk2_home.png',      // 彩色T恤（首页封面/侧栏首页）
    diet_img:    'img/hk2_diet.png',      // 薯条（饮食）
    gold_img:    'img/hk2_gold.png',      // 财神（黄金财经）
    financelife: 'img/hk2_financelife.png', // 发财树（理财学习，新增模块备用）
    research_img:'img/hk2_research.png',  // 科学家（科研助手）
    xianyu_img:  'img/hk2_xianyu.png',    // 摸鱼（闲鱼）
    skincare_img:'img/hk2_skincare.png',  // 洗澡（护肤）
    beauty:      'img/hk2_beauty.png',    // 眨眼贝壳领（美妆穿搭，新增模块备用）
    sport_img:   'img/hk2_sport.png',     // 哑铃（运动）
    express_img: 'img/hk2_express.png',   // 打电话（表达）
    wechat_img:  'img/hk2_wechat.png',    // 四叶草（公众号）
    news_img:    'img/hk2_news.png',      // 拿报纸（新闻）
    podcast_img: 'img/hk2_podcast.png',   // 喇叭报纸（播客）
    selfmedia_img:'img/hk2_selfmedia.png',// 相机（自媒体）
    channels_img:'img/hk2_channels.png',  // 拍照（视频号）
    ielts_img:   'img/hk2_ielts.png',     // 看书（雅思）
    books_img:   'img/hk2_books.png',     // 写字（读书）
    habit_img:   'img/hk2_habit.png',     // 开心跳（习惯）
    study_img:   'img/hk2_study.png',     // 拿笔本子（学习管理）
    ai_img:      'img/hk2_ai.png',        // 弹吉他（AI学习）
    finance_img: 'img/hk2_finance.png',   // 金元宝（小账本）
    aihelp_img:  'img/hk2_aihelp.png',    // 放大镜（AI帮手）
    search_img:  'img/hk2_search.png',    // 工人扳手（搜索）
    settings_img:'img/hk2_settings.png',  // 比耶（设置）
    sanrio_banner:'img/sanrio_banner.png', // 三丽鸥合照（首页横幅）
    // 保留旧网格姿势作为 fallback
    p1: 'img/hk_pose_01.png', p2: 'img/hk_pose_02.png', p3: 'img/hk_pose_03.png',
    p4: 'img/hk_pose_04.png', p5: 'img/hk_pose_05.png', p6: 'img/hk_pose_06.png',
    p7: 'img/hk_pose_07.png', p8: 'img/hk_pose_08.png', p9: 'img/hk_pose_09.png',
    p10: 'img/hk_pose_10.png', p11: 'img/hk_pose_11.png', p12: 'img/hk_pose_12.png',
    p13: 'img/hk_pose_13.png', p14: 'img/hk_pose_14.png', p15: 'img/hk_pose_15.png'
  };

  // 侧栏 / 顶栏按模块键分配不同姿势
  // 关键：键名必须与 NAV_CONFIG 完全一致，否则会回退成默认脸（之前 _study/_gold 等带下划线导致大面积回退成同一张脸）
  // 此处全部唯一分配，消除"侧栏全是同一张脸"的重复问题；语义对得上的用对应姿势，对不上的用网格姿势兜底
  const NAV_POSE = {
    home:'homecover', checkin:'classic_sit', _ielts:'ielts_img',
    ielts_words:'ielts_img', ielts_listening:'ielts_img', ielts_speaking:'ielts_img', ielts_reading:'ielts_img', ielts_writing:'ielts_img', ielts_exam:'ielts_img',
    selfmedia:'selfmedia_img', memo:'peek', settings:'settings_img',
    study:'study_img', gold:'gold_img', review:'full', sport:'sport_img',
    xianyu:'xianyu_img', channels:'channels_img', wechat:'wechat_img',
    diet:'diet_img', skincare:'skincare_img', habit:'habit_img', ai:'ai_img', podcast:'podcast_img', news:'news_img',
    research:'research_img', books:'books_img', express:'express_img', financelife:'financelife', finance:'finance_img',
    fortune:'clover',
    search:'search_img', aihelp:'aihelp_img'
  };

  // 通用：按素材名渲染 img
  function pic(name, size, h) {
    const f = POSE_FILES[name] || POSE_FILES.face;
    const hh = (h == null ? size : h);
    return `<img src="${f}" alt="Hello Kitty" class="hk-img" style="width:${size}px;height:${hh}px;object-fit:contain;">`;
  }

  // 小尺寸完成标记 / 装饰：主题色星形
  function bow(size, color) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="hk-bow" aria-hidden="true" fill="var(--hk-red)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
  }

  // 仅脸（头像 / 空状态用）
  function face(size) {
    return pic('face', size);
  }

  // 全身（日历今日高亮 / 空状态用）
  function full(size) {
    return pic('full', size, Math.round(size * 277 / 285));
  }

  // 抱心（游戏图标 / 装饰用）
  function heart(size) {
    return pic('sit', size, Math.round(size * 277 / 285));
  }

  // 首页问候 / hero 装饰：挥手 Kitty
  function hero(size) {
    return pic('hero', size, Math.round(size * 277 / 295));
  }

  // 坐姿抱心
  function sit(size) { return pic('sit', size); }
  // 探头 / 爬爬
  function peek(size) { return pic('peek', size); }
  // 招手全身
  function wave2(size) { return pic('wave2', size); }
  // 50周年庆祝（牛奶饼干抱心）
  function celebrate(size) { return pic('celebrate', size); }
  // 网格姿势（n = 1..15）
  function pose(n, size) { return pic('p' + n, size); }
  // 按模块键返回对应姿势（侧栏 / 顶栏用）
  function navPose(key, size) { return pic(NAV_POSE[key] || 'face', size); }

  // ===== 新姿势便捷函数（语义化） =====
  function classicSit(size) { return pic('classic_sit', size); }
  function think(size)     { return pic('think', size); }
  function wavePink(size)  { return pic('wave_pink', size); }
  function bear(size)      { return pic('bear', size); }
  function waveRed(size)   { return pic('wave_red', size); }
  function burger(size)    { return pic('burger', size); }
  function flower(size)    { return pic('flower', size); }
  function cake(size)      { return pic('cake', size); }
  function camera(size)    { return pic('camera', size); }
  function love(size)      { return pic('love', size); }
  function bike(size)      { return pic('bike', size); }
  function bearHug(size)   { return pic('bear_hug', size); }
  function halloween(size) { return pic('halloween', size); }
  function dumbbell(size)  { return pic('dumbbell', size); }
  function bath(size)      { return pic('bath', size); }
  function bows(size)      { return pic('bows', size); }
  function clover(size)    { return pic('clover', size); }
  function gift(size)      { return pic('gift', size); }
  function trumpet(size)   { return pic('trumpet', size); }
  function sitBlue(size)   { return pic('sit_blue', size); }

  // 空状态大图
  function empty(size) {
    return hero(size);
  }

  // 游戏图标：羊（羊了个羊）
  function sheep(size) {
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="hk-game" aria-hidden="true">
      <g fill="#FFFFFF" stroke="#000000" stroke-width="2.4">
        <circle cx="24" cy="22" r="9"/><circle cx="40" cy="22" r="9"/>
        <circle cx="18" cy="34" r="9"/><circle cx="46" cy="34" r="9"/>
        <circle cx="32" cy="30" r="11"/>
      </g>
      <ellipse cx="32" cy="44" rx="15" ry="12" fill="#FFFFFF" stroke="#000000" stroke-width="2.4"/>
      <circle cx="32" cy="44" r="8" fill="#FBE3EC" stroke="#000000" stroke-width="2"/>
      <circle cx="32" cy="42" r="1.6" fill="#000000"/>
    </svg>`;
  }
  // 游戏图标：松鼠（记忆翻牌）
  function squirrel(size) {
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="hk-game" aria-hidden="true">
      <path d="M44 14 q14 -4 12 16 q-2 14 -16 10 q6 -10 -2 -18 Z" fill="${HKC()}" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="30" cy="34" r="16" fill="#FFFFFF" stroke="#000000" stroke-width="2.4"/>
      <circle cx="24" cy="30" r="2.4" fill="#000000"/>
      <circle cx="36" cy="30" r="2.4" fill="#000000"/>
      <ellipse cx="30" cy="40" rx="3" ry="2.2" fill="#FFD100" stroke="#000000" stroke-width="1"/>
    </svg>`;
  }
  // 游戏图标：蛇（贪吃蛇拼词）
  function snake(size) {
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="hk-game" aria-hidden="true">
      <path d="M12 48 q10 0 10 -10 q0 -10 10 -10 q10 0 10 10 q0 10 10 10 q6 0 6 -6"
        fill="none" stroke="#4A90A4" stroke-width="6" stroke-linecap="round"/>
      <circle cx="14" cy="48" r="7" fill="#4A90A4" stroke="#000000" stroke-width="2"/>
      <circle cx="11" cy="46" r="1.8" fill="#000000"/>
      <circle cx="17" cy="46" r="1.8" fill="#000000"/>
      <circle cx="50" cy="36" r="4" fill="#E60012" stroke="#000000" stroke-width="1.6"/>
    </svg>`;
  }

  return {
    face, full, heart, bow, hero, sit, peek, wave2, celebrate, pose, navPose, empty, sheep, squirrel, snake,
    classicSit, think, wavePink, bear, waveRed, burger, flower, cake, camera, love, bike,
    bearHug, halloween, dumbbell, bath, bows, clover, gift, trumpet, sitBlue, pic
  };
})();
