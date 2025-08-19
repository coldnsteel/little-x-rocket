const CACHE_NAME = 'little-x-fortress-v1';
const urlsToCache = [
    '/',
    '/index.html',
    // Add future assets here as we create them
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('🛡️ Fortress Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('🦖 Raaarrr caching cosmic resources!');
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Return cached version or fetch from network
            if (response) {
                console.log('🌟 Serving from Fortress cache:', event.request.url);
                return response;
            }
            return fetch(event.request);
        }).catch(() => {
            // Offline fallback
            if (event.request.destination === 'document') {
                return caches.match('/index.html');
            }
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 Fortress Service Worker activated!');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🧹 Cleaning old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for future features
self.addEventListener('sync', event => {
    if (event.tag === 'fortress-sync') {
        console.log('🔄 Fortress background sync triggered!');
        // Future: sync fortress passes, compositions, etc.
    }
});
