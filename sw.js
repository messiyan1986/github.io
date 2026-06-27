const CACHE_NAME = 'vocal-metronome-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.svg'
];

// 安装：缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，网络回退
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      
      return fetch(event.request).then(response => {
        // 缓存成功的响应
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // 离线回退
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
