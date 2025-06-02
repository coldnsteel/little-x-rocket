// Little X Purple Rocket - Service Worker
// Enables offline functionality and caching

const CACHE_NAME = 'little-x-rocket-v1';
const urlsToCache = [
  '/little-x-rocket/',
  '/little-x-rocket/index.html',
  '/little-x-rocket/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          if (response) {
            console.log('📱 Serving from cache:', event.request.url);
            return response;
          }
          
          console.log('🌐 Fetching from network:', event.request.url);
          return fetch(event.request).then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === 'document') {
            return caches.match('/little-x-rocket/index.html');
          }
        })
    );
  }
});

// Background sync for when connection returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    // Could sync user progress, analytics, etc.
  }
});

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received');
  
  const options = {
    body: 'ARIA has discovered a new cosmic destination!',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE5MiIgaGVpZ2h0PSIxOTIiIGZpbGw9IiM4YTJiZTIiIHJ4PSIyNCIvPjwvc3ZnPg==',
    badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzNiIgY3k9IjM2IiByPSIzNiIgZmlsbD0iIzhhMmJlMiIvPjwvc3ZnPg==',
    tag: 'little-x-rocket',
    actions: [
      {
        action: 'explore',
        title: 'Start Adventure!',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmw3IDdoLTR2OGgtNnYtOGgtNGw3LTd6IiBmaWxsPSIjOGEyYmUyIi8+PC9zdmc+'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Little X Purple Rocket', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🚀 Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/little-x-rocket/')
    );
  }
});

// Message handling from main app
self.addEventListener('message', (event) => {
  console.log('📬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});

console.log('🚀 Little X Purple Rocket Service Worker loaded!');
