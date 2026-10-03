// オフラインでも開けるように、アプリ本体をキャッシュする
// ファイルを更新したら CACHE の番号を上げると、利用者側も新しい版に切り替わる
const CACHE = 'habit-app-v3';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './fonts/zen-kaku-gothic-new.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// キャッシュにあればそれを返す。なければ取りに行って保存する
// （フォントは使った文字の分だけ、初回表示時に保存される）
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }))
  );
});
