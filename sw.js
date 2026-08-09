/* 易欢工作台 · Service Worker
 * 策略：network-first（在线永远拉最新，离线回退缓存）。
 * 这样日常使用永远是最新文件，断网时仍能打开已访问过的页面。
 * 静态资源在 fetch 成功后悄悄写入缓存；新版本 SW 安装即 skipWaiting 接管。
 */
const CACHE = 'yh-wb-v1';
const CORE = [
  './', './index.html',
  './style.css', './v2.css',
  './hk.js', './lunar.js', './app.js',
  './v2-core.js', './v2-a.js', './v2-b.js', './v2-c.js', './v2-d.js', './v2-e.js', './v2-f.js',
  './data/ncbi_seed.js', './v3.js',
  './manifest.webmanifest', './icon.png', './favicon-32.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})).catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .catch(() => {})
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // 只缓存 GET
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // 跨域（API：GitHub/V3）直连，不缓存
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
